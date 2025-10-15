import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { debounce } from "lodash";
import { cn } from "@/lib/utils";

// Icons
import { Search, X, Filter, Package, Check, Loader2 } from "lucide-react";

type ProductPickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string[];
  onConfirm: (ids: string[]) => void;
  initialFilters?: {
    categories?: string[];
    tags?: string[];
    status?: "disponivel" | "sob_encomenda" | "ambos";
  };
  userId?: string;
};

type Product = {
  id: string;
  title: string;
  price?: number;
  price_on_request?: boolean;
  photos?: Array<{ url: string }>;
  categories?: string[];
  quality_tags?: string[];
  status?: string;
};

/**
 * A clean, mobile-first product picker with simplified UX
 */
export default function ProductPickerClean({
  open,
  onOpenChange,
  value = [],
  onConfirm,
  initialFilters,
  userId,
}: ProductPickerProps) {
  // Core state
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"browse" | "filters" | "selected">("browse");
  
  // Search and pagination
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Filter state
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialFilters?.categories || []);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialFilters?.tags || []);
  const [statusFilter, setStatusFilter] = useState<string>(initialFilters?.status || "ambos");
  
  // Selected products cache
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  // Constants
  const PAGE_SIZE = 24;

  // Initialize when modal opens
  useEffect(() => {
    if (open) {
      setSelectedIds(new Set(value));
      setPage(1);
      loadFiltersData();
      loadProducts(true);
      
      if (value.length > 0) {
        loadSelectedProducts(value);
      }
    }
  }, [open, value]);

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearch(query);
      setPage(1);
      loadProducts(true);
    }, 300),
    []
  );

  // Load filter options (categories and tags)
  const loadFiltersData = async () => {
    let currentUserId = userId;
    
    if (!currentUserId) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        currentUserId = user?.id;
      } catch (error) {
        console.error("Error getting user:", error);
      }
    }
    
    if (!currentUserId) return;

    // Load categories
    const { data: categoriesData } = await supabase
      .from("products")
      .select("categories")
      .eq("user_id", currentUserId)
      .not("categories", "is", null);

    if (categoriesData) {
      const allCategories = categoriesData
        .flatMap(product => product.categories || [])
        .filter(Boolean);
      
      setAvailableCategories([...new Set(allCategories)].sort());
    }

    // Load tags
    const { data: tagsData } = await supabase
      .from("products")
      .select("quality_tags")
      .eq("user_id", currentUserId)
      .not("quality_tags", "is", null);

    if (tagsData) {
      const allTags = tagsData
        .flatMap(product => product.quality_tags || [])
        .filter(Boolean);
      
      setAvailableTags([...new Set(allTags)].sort());
    }
  };

  // Load products based on current filters and pagination
  const loadProducts = async (reset = false) => {
    setLoading(true);
    
    let currentUserId = userId;
    
    if (!currentUserId) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        currentUserId = user?.id;
      } catch (error) {
        console.error("Error getting user:", error);
      }
    }
    
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    const from = reset ? 0 : products.length;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("products")
      .select("id, title, photos, price, status, price_on_request, categories, quality_tags", { count: "exact" })
      .eq("user_id", currentUserId);

    // Apply search filter
    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      query = query.overlaps("categories", selectedCategories);
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      query = query.overlaps("quality_tags", selectedTags);
    }

    // Apply status filter
    if (statusFilter !== "ambos") {
      query = query.eq("status", statusFilter === "disponivel" ? "Disponível" : "Sob encomenda");
    }
    
    // Apply sorting - default to most recent
    query = query.order("created_at", { ascending: false });

    // Apply pagination
    query = query.range(from, to);

    try {
      const { data, error, count } = await query;

      if (error) throw error;

      // Update products
      if (reset) {
        setProducts(data || []);
      } else {
        setProducts(prev => [...prev, ...(data || [])]);
      }

      // Check if there are more products to load
      setHasMore(count ? from + data.length < count : false);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load details for selected products
  const loadSelectedProducts = async (ids: string[]) => {
    if (ids.length === 0) {
      setSelectedProducts([]);
      return;
    }
    
    let currentUserId = userId;
    
    if (!currentUserId) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        currentUserId = user?.id;
      } catch (error) {
        console.error("Error getting user:", error);
      }
    }
    
    if (!currentUserId) return;
    
    try {
      const { data } = await supabase
        .from("products")
        .select("id, title, photos, price, price_on_request")
        .eq("user_id", currentUserId)
        .in("id", ids);
        
      if (data) {
        // Sort according to the order in ids
        const orderedProducts = ids
          .map(id => data.find(p => p.id === id))
          .filter(Boolean) as Product[];
          
        setSelectedProducts(orderedProducts);
      }
    } catch (error) {
      console.error("Error loading selected products:", error);
    }
  };

  // Toggle product selection
  const toggleProduct = (productId: string, product?: Product) => {
    const newSelectedIds = new Set(selectedIds);
    
    if (newSelectedIds.has(productId)) {
      newSelectedIds.delete(productId);
      setSelectedProducts(prev => prev.filter(p => p.id !== productId));
    } else {
      newSelectedIds.add(productId);
      if (product) {
        setSelectedProducts(prev => [...prev, product]);
      }
    }
    
    setSelectedIds(newSelectedIds);
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedIds(new Set());
    setSelectedProducts([]);
  };

  // Apply filters and return to browse
  const applyFilters = () => {
    setPage(1);
    loadProducts(true);
    setActiveTab("browse");
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedTags([]);
    setStatusFilter("ambos");
  };

  // Handle infinite scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (loading || !hasMore) return;
    
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 200) {
      setPage(p => p + 1);
      loadProducts();
    }
  };

  // Save selection and close modal
  const handleSave = () => {
    onConfirm(Array.from(selectedIds));
    onOpenChange(false);
  };

  // Get image URL from product
  const getImageUrl = (product: Product): string | null => {
    if (!product.photos || !Array.isArray(product.photos) || product.photos.length === 0) {
      return null;
    }
    return product.photos[0]?.url || null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 sm:max-w-[600px] max-h-[85vh] flex flex-col">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle>Selecionar Produtos</DialogTitle>
        </DialogHeader>
        
        {/* Main content area - full height, single scroll container */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Top bar with search and tabs */}
          <div className="px-4 pt-3 pb-2 border-b">
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produtos..."
                  className="pl-9"
                  onChange={(e) => debouncedSearch(e.target.value)}
                />
              </div>
            </div>
            
            {/* Properly nested Tabs component */}
            <Tabs 
              value={activeTab} 
              onValueChange={(value) => setActiveTab(value as "browse" | "filters" | "selected")}
              className="w-full"
            >
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="browse">
                  Produtos
                </TabsTrigger>
                <TabsTrigger value="filters">
                  <Filter className="h-4 w-4 mr-1" />
                  Filtros
                  {(selectedCategories.length > 0 || selectedTags.length > 0 || statusFilter !== "ambos") && (
                    <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                      {selectedCategories.length + selectedTags.length + (statusFilter !== "ambos" ? 1 : 0)}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="selected" disabled={selectedIds.size === 0}>
                  Selecionados
                  <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                    {selectedIds.size}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Content area - changes based on active tab */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "browse" && (
              <div 
                className="h-full overflow-y-auto px-4 py-3"
                onScroll={handleScroll}
              >
                {products.length === 0 && !loading ? (
                  <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                    <Package className="h-12 w-12 text-muted-foreground mb-3 opacity-40" />
                    <h3 className="text-lg font-medium mb-1">Nenhum produto encontrado</h3>
                    <p className="text-sm text-muted-foreground">
                      {search || selectedCategories.length > 0 || selectedTags.length > 0 || statusFilter !== "ambos"
                        ? "Tente ajustar os filtros para encontrar produtos"
                        : "Adicione produtos para poder selecioná-los"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-4">
                    {products.map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        selected={selectedIds.has(product.id)}
                        onToggle={() => toggleProduct(product.id, product)}
                        getImageUrl={getImageUrl}
                      />
                    ))}
                    
                    {loading && (
                      <div className="col-span-full flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === "filters" && (
              <div className="h-full overflow-y-auto p-4">
                <div className="space-y-6">
                  {/* Status filter */}
                  <div className="space-y-3">
                    <h3 className="font-medium">Status</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {["ambos", "disponivel", "sob_encomenda"].map((status) => (
                        <Button
                          key={status}
                          type="button"
                          variant={statusFilter === status ? "default" : "outline"}
                          className="justify-start"
                          onClick={() => setStatusFilter(status)}
                        >
                          {status === "ambos" ? "Todos" : 
                           status === "disponivel" ? "Disponível" : 
                           "Sob encomenda"}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Categories filter */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Categorias</h3>
                      {selectedCategories.length > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedCategories([])}
                        >
                          Limpar
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      {availableCategories.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhuma categoria disponível</p>
                      ) : (
                        availableCategories.map(category => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`category-${category}`}
                              checked={selectedCategories.includes(category)}
                              onCheckedChange={(checked) => {
                                setSelectedCategories(prev => 
                                  checked 
                                    ? [...prev, category] 
                                    : prev.filter(c => c !== category)
                                );
                              }}
                            />
                            <label 
                              htmlFor={`category-${category}`}
                              className="text-sm leading-none"
                            >
                              {category}
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  
                  {/* Tags filter */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Tags</h3>
                      {selectedTags.length > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedTags([])}
                        >
                          Limpar
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-1 max-h-[200px] overflow-y-auto">
                      {availableTags.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhuma tag disponível</p>
                      ) : (
                        availableTags.map(tag => (
                          <div key={tag} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`tag-${tag}`}
                              checked={selectedTags.includes(tag)}
                              onCheckedChange={(checked) => {
                                setSelectedTags(prev => 
                                  checked 
                                    ? [...prev, tag] 
                                    : prev.filter(t => t !== tag)
                                );
                              }}
                            />
                            <label 
                              htmlFor={`tag-${tag}`}
                              className="text-sm leading-none"
                            >
                              {tag}
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex flex-col gap-2 pt-4">
                    <Button 
                      onClick={applyFilters}
                      className="w-full"
                    >
                      Aplicar filtros
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={clearFilters}
                      className="w-full"
                      disabled={selectedCategories.length === 0 && selectedTags.length === 0 && statusFilter === "ambos"}
                    >
                      Limpar todos os filtros
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === "selected" && (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between px-4 py-2 border-b">
                  <p className="text-sm font-medium">
                    {selectedIds.size} produto(s) selecionado(s)
                  </p>
                  {selectedIds.size > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={clearSelection}
                    >
                      Limpar seleção
                    </Button>
                  )}
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-2">
                    {selectedProducts.map(product => (
                      <SelectedProductItem
                        key={product.id}
                        product={product}
                        onRemove={() => toggleProduct(product.id)}
                        getImageUrl={getImageUrl}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer with action buttons */}
        <DialogFooter className="p-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={selectedIds.size === 0}
          >
            Salvar seleção ({selectedIds.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Compact product card component
const ProductCard = ({ 
  product, 
  selected, 
  onToggle,
  getImageUrl 
}: { 
  product: Product; 
  selected: boolean; 
  onToggle: () => void;
  getImageUrl: (product: Product) => string | null;
}) => {
  const imageUrl = getImageUrl(product);
  
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "group relative w-full rounded-lg border bg-white/80 dark:bg-zinc-900/60",
        "p-2 text-left transition-all",
        selected ? "ring-2 ring-primary border-transparent" : "border-zinc-200 dark:border-zinc-800"
      )}
    >
      <div className="aspect-square w-full overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-zinc-400">
            <Package className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="mt-2">
        <div className="text-xs font-medium line-clamp-1">{product.title}</div>
        <div className="text-xs text-muted-foreground">
          {product.price_on_request
            ? "Sob consulta"
            : product.price
            ? `R$ ${product.price.toFixed(2)}`
            : "Sem preço"}
        </div>
      </div>

      {/* Check indicator */}
      <div className={cn(
        "absolute right-2 top-2 h-5 w-5 rounded-full flex items-center justify-center",
        "bg-white/90 dark:bg-zinc-900/80 border",
        selected ? "border-primary" : "border-zinc-200 dark:border-zinc-700"
      )}>
        {selected && <Check className="h-3 w-3 text-primary" />}
      </div>
    </button>
  );
};

// Selected product item component
const SelectedProductItem = ({ 
  product, 
  onRemove,
  getImageUrl
}: { 
  product: Product; 
  onRemove: () => void;
  getImageUrl: (product: Product) => string | null;
}) => {
  const imageUrl = getImageUrl(product);
  
  return (
    <div className="flex items-center gap-2 p-2 border rounded-lg bg-white dark:bg-zinc-900">
      <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded overflow-hidden flex-shrink-0">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={product.title} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400">
            <Package className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{product.title}</p>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 w-8 p-0 rounded-full" 
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Remover</span>
      </Button>
    </div>
  );
};
