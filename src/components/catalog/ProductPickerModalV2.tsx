import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Package, X, Filter, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// DND Kit imports for reordering
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ProductPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onSave: (ids: string[]) => void;
}

// Sortable product item component
function SortableProductItem({ product, onRemove, id }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="flex items-center gap-2 p-2 border rounded-md bg-background mb-2"
    >
      <div 
        {...attributes} 
        {...listeners}
        className="cursor-grab p-1 hover:bg-muted rounded"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      
      {product.photos?.[0]?.url ? (
        <img 
          src={product.photos[0].url} 
          alt={product.title} 
          className="w-10 h-10 object-cover rounded"
        />
      ) : (
        <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
          <Package className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{product.title}</p>
        <p className="text-xs text-muted-foreground">
          {product.price_on_request
            ? "Sob consulta"
            : product.price ? `R$ ${product.price.toFixed(2)}` : "Sem preço"}
        </p>
      </div>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 w-8 p-0" 
        onClick={() => onRemove(product.id)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function ProductPickerModal({
  open,
  onOpenChange,
  selectedIds,
  onSave,
}: ProductPickerModalProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("recentes");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [variations, setVariations] = useState<string[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<string>("all");

  // DnD sensors for reordering
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (open) {
      setTempSelectedIds(selectedIds);
      loadProducts();
      loadCategories();
      loadVariations();
    }
  }, [open, selectedIds]);

  useEffect(() => {
    if (open) {
      loadProducts();
    }
  }, [search, category, status, sortOrder, selectedVariation, page]);

  const loadCategories = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get all unique categories from products
    const { data, error } = await supabase
      .from("products")
      .select("categories")
      .eq("user_id", user.id);

    if (error || !data) {
      console.error("Error loading categories:", error);
      return;
    }

    // Extract and flatten all categories
    const allCategories = data
      .flatMap(product => product.categories || [])
      .filter(Boolean);

    // Remove duplicates
    const uniqueCategories = [...new Set(allCategories)].sort();
    setCategories(uniqueCategories);
  };

  const loadVariations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Get all unique variation names from products
      const { data } = await supabase
        .from("products")
        .select("variations")
        .eq("user_id", user.id)
        .not("variations", "is", null);

      if (data && Array.isArray(data)) {
        // Extract all variation names
        const allVariations = data
          .flatMap(product => {
            // Check if product has variations and it's an array
            if (product && typeof product === 'object' && 'variations' in product && Array.isArray(product.variations)) {
              return product.variations
                .filter(v => v && typeof v === 'object' && 'name' in v)
                .map(v => v.name)
                .filter(Boolean);
            }
            return [];
          });

        // Remove duplicates
        const uniqueVariations = [...new Set(allVariations)].sort();
        setVariations(uniqueVariations);
      }
    } catch (error) {
      console.error("Error loading variations:", error);
      setVariations([]);
    }
  };

  const loadProducts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setLoading(true);

    // Calculate pagination
    const perPage = 12;
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let query = supabase
      .from("products")
      .select("id, title, photos, category, price, status, created_at, price_on_request, price_hidden, price_on_request_label, categories, quality_tags, variations", { count: "exact" })
      .eq("user_id", user.id);

    // Apply search filter
    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    // Apply category filter
    if (category && category !== "all") {
      query = query.contains("categories", [category]);
    }

    // Apply status filter
    if (status && status !== "all") {
      query = query.eq("status", status === "disponivel" ? "Disponível" : "Sob encomenda");
    }

    // Apply variation filter
    if (selectedVariation && selectedVariation !== "all") {
      query = query.contains("variations", [{ name: selectedVariation }]);
    }
    
    // Apply sorting
    switch (sortOrder) {
      case "preco_asc":
        query = query.order("price", { ascending: true, nullsFirst: false });
        break;
      case "preco_desc":
        query = query.order("price", { ascending: false, nullsFirst: false });
        break;
      case "nome_az":
        query = query.order("title", { ascending: true });
        break;
      case "antigos":
        query = query.order("created_at", { ascending: true });
        break;
      case "recentes":
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    // Apply pagination
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error loading products:", error);
      setLoading(false);
      return;
    }

    setProducts(data || []);
    setTotalPages(Math.ceil((count || 0) / perPage));
    setLoading(false);

    // Load selected products details
    if (tempSelectedIds.length > 0) {
      const { data: selectedData } = await supabase
        .from("products")
        .select("id, title, photos, price, price_on_request, price_hidden, price_on_request_label")
        .in("id", tempSelectedIds);

      if (selectedData) {
        // Sort according to the order in tempSelectedIds
        const orderedProducts = tempSelectedIds
          .map(id => selectedData.find(p => p.id === id))
          .filter(Boolean);
        setSelectedProducts(orderedProducts as any[]);
      }
    } else {
      setSelectedProducts([]);
    }
  };

  const handleToggleProduct = (product) => {
    if (tempSelectedIds.includes(product.id)) {
      // Remove product
      setTempSelectedIds(prev => prev.filter(id => id !== product.id));
      setSelectedProducts(prev => prev.filter(p => p.id !== product.id));
    } else {
      // Add product
      setTempSelectedIds(prev => [...prev, product.id]);
      setSelectedProducts(prev => [...prev, product]);
    }
  };

  const handleRemoveProduct = (productId) => {
    setTempSelectedIds(prev => prev.filter(id => id !== productId));
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleSave = () => {
    onSave(tempSelectedIds);
    onOpenChange(false);
    toast.success(`${tempSelectedIds.length} produtos selecionados`);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setSelectedProducts((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        const reordered = arrayMove(items, oldIndex, newIndex);
        setTempSelectedIds(reordered.map(item => item.id));
        return reordered;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Selecionar Produtos</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="browse" className="w-full flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="browse">Navegar produtos</TabsTrigger>
            <TabsTrigger value="selected" disabled={tempSelectedIds.length === 0}>
              Selecionados ({tempSelectedIds.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="flex-1 flex flex-col min-h-0">
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produtos..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? "bg-muted" : ""}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/30 mb-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Categoria</label>
                  <Select
                    value={category}
                    onValueChange={(value) => {
                      setCategory(value);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Status</label>
                  <Select
                    value={status}
                    onValueChange={(value) => {
                      setStatus(value);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="disponivel">Disponível</SelectItem>
                      <SelectItem value="sob_encomenda">Sob encomenda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Ordenar por</label>
                  <Select
                    value={sortOrder}
                    onValueChange={(value) => {
                      setSortOrder(value);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recentes">Mais recentes</SelectItem>
                      <SelectItem value="antigos">Mais antigos</SelectItem>
                      <SelectItem value="nome_az">Nome (A-Z)</SelectItem>
                      <SelectItem value="preco_asc">Preço (menor para maior)</SelectItem>
                      <SelectItem value="preco_desc">Preço (maior para menor)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {variations.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">Variação</label>
                    <Select
                      value={selectedVariation}
                      onValueChange={(value) => {
                        setSelectedVariation(value);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as variações" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as variações</SelectItem>
                        {variations.map((variation) => (
                          <SelectItem key={variation} value={variation}>
                            {variation}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            <ScrollArea className="flex-1 pr-4">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>Nenhum produto encontrado</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className={cn(
                        "border rounded-lg p-3 cursor-pointer transition-colors",
                        tempSelectedIds.includes(product.id)
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => handleToggleProduct(product)}
                    >
                      <div className="flex gap-3">
                        <div className="w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                          {product.photos?.[0]?.url ? (
                            <img
                              src={product.photos[0].url}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h3 className="font-medium text-sm line-clamp-2">
                              {product.title}
                            </h3>
                            <Checkbox
                              checked={tempSelectedIds.includes(product.id)}
                              className="ml-2 mt-0.5 flex-shrink-0"
                              onCheckedChange={() => handleToggleProduct(product)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="mt-1 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                              {product.price_on_request
                                ? "Sob consulta"
                                : product.price
                                ? `R$ ${product.price.toFixed(2)}`
                                : "Sem preço"}
                            </p>
                            {product.status === "Sob encomenda" && (
                              <Badge variant="outline" className="text-xs">
                                Sob encomenda
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Próxima
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="selected" className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-1">
              {selectedProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum produto selecionado</p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={selectedProducts.map(p => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {selectedProducts.map((product) => (
                        <SortableProductItem
                          key={product.id}
                          id={product.id}
                          product={product}
                          onRemove={handleRemoveProduct}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            Salvar seleção
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
