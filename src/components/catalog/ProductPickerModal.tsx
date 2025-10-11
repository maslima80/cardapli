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
import { Loader2, Search, Package, X, Filter } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProductPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onSave: (ids: string[]) => void;
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

  const ITEMS_PER_PAGE = 24;

  useEffect(() => {
    if (open) {
      setTempSelectedIds(selectedIds);
      loadCategories();
      loadProducts();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      loadProducts();
    }
  }, [search, category, status, sortOrder, page]);

  const loadCategories = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("products")
      .select("category")
      .eq("user_id", user.id)
      .not("category", "is", null);

    if (data) {
      const uniqueCategories = [...new Set(data.map((p) => p.category).filter(Boolean))];
      setCategories(uniqueCategories as string[]);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase
      .from("products")
      .select("id, title, photos, category, price, status, created_at", { count: "exact" })
      .eq("user_id", user.id);

    // Apply search filter
    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    // Apply category filter
    if (category && category !== "all") {
      query = query.eq("category", category);
    }
    
    // Apply status filter
    if (status && status !== "all") {
      query = query.eq("status", status === "disponivel" ? "Disponível" : "Sob encomenda");
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

    const { data, error, count } = await query.range(
      (page - 1) * ITEMS_PER_PAGE,
      page * ITEMS_PER_PAGE - 1
    );

    if (error) {
      toast.error("Erro ao carregar produtos");
      console.error(error);
    } else {
      setProducts(data || []);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
      
      // Load selected products details if we have IDs but not the full product data
      if (tempSelectedIds.length > 0 && selectedProducts.length === 0) {
        loadSelectedProducts();
      }
    }

    setLoading(false);
  };
  
  const loadSelectedProducts = async () => {
    if (tempSelectedIds.length === 0) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data } = await supabase
      .from("products")
      .select("id, title, photos, price")
      .eq("user_id", user.id)
      .in("id", tempSelectedIds);
      
    if (data) {
      // Sort according to the order in tempSelectedIds
      const orderedProducts = tempSelectedIds
        .map(id => data.find(p => p.id === id))
        .filter(Boolean);
      setSelectedProducts(orderedProducts as any[]);
    }
  };

  const toggleProduct = (productId: string) => {
    setTempSelectedIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSave = () => {
    onSave(tempSelectedIds);
    onOpenChange(false);
  };

  const getFirstImage = (photos: any) => {
    if (!photos || !Array.isArray(photos) || photos.length === 0) return null;
    return photos[0]?.url || null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Selecionar Produtos</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="browse">Navegar produtos</TabsTrigger>
            <TabsTrigger value="selected" disabled={tempSelectedIds.length === 0}>
              Selecionados ({tempSelectedIds.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse" className="space-y-4">
            {/* Filters */}
            <div className="flex gap-2 flex-wrap items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar produtos..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="pl-9"
                  />
                </div>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/30">
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
              </div>
            )}

            {/* Products List */}
            <div className="min-h-[400px] max-h-[500px] overflow-y-auto border rounded-lg p-1">
              {loading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-center">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    {search || category !== "all" || status !== "all"
                      ? "Tente ajustar os filtros"
                      : "Adicione produtos para poder selecioná-los"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {products.map((product) => {
                    const imageUrl = getFirstImage(product.photos);
                    const isSelected = tempSelectedIds.includes(product.id);

                    return (
                      <div
                        key={product.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors ${isSelected ? "bg-primary/5 border-primary/20" : ""}`}
                        onClick={() => toggleProduct(product.id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleProduct(product.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{product.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {product.category && (
                              <Badge variant="outline" className="text-xs">
                                {product.category}
                              </Badge>
                            )}
                            {product.status && (
                              <Badge 
                                variant={product.status === "Sob encomenda" ? "secondary" : "outline"}
                                className="text-xs"
                              >
                                {product.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {product.price && (
                          <p className="font-semibold text-right whitespace-nowrap">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(product.price)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
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
          
          <TabsContent value="selected">
            <div className="min-h-[400px] max-h-[500px] overflow-y-auto border rounded-lg p-1">
              {selectedProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-center">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum produto selecionado</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Selecione produtos na aba "Navegar produtos"
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedProducts.map((product, index) => {
                    const imageUrl = getFirstImage(product.photos);
                    
                    return (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-primary/5 border-primary/20"
                      >
                        <div className="text-sm font-medium w-6 text-center text-muted-foreground">
                          {index + 1}
                        </div>
                        <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{product.title}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleProduct(product.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar ({tempSelectedIds.length} selecionados)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
