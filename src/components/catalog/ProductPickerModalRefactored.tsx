import { useState, useEffect, useCallback, memo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { debounce } from "lodash";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onSave: (ids: string[]) => void;
  userId?: string;
  defaultFilters?: {
    categories?: string[];
    tags?: string[];
    status?: "disponivel" | "sob_encomenda" | "ambos";
  };
}

// Helper function to safely get image URL without transformations
const getImageUrl = (product: any): string | null => {
  if (!product.photos || !Array.isArray(product.photos) || product.photos.length === 0) {
    return null;
  }
  return product.photos[0]?.url || null;
};

// Compact product card component
const ProductPickCard = memo(({ 
  product, 
  selected, 
  onToggle 
}: { 
  product: any; 
  selected: boolean; 
  onToggle: () => void 
}) => {
  const imageUrl = getImageUrl(product);
  
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "group relative w-full rounded-xl border bg-white/80 dark:bg-zinc-900/60",
        "p-3 text-left shadow-sm hover:shadow-md transition",
        selected ? "ring-2 ring-primary border-transparent" : "border-zinc-200 dark:border-zinc-800"
      )}
    >
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-zinc-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><line x1="12" y1="22" x2="12" y2="12"></line></svg>
          </div>
        )}
      </div>

      <div className="mt-2 space-y-0.5">
        <div className="text-[13px] font-medium line-clamp-1">{product.title}</div>
        {product.price_on_request ? (
          <div className="text-xs text-zinc-500">Sob consulta</div>
        ) : product.price ? (
          <div className="text-xs text-zinc-500">
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.price)}
          </div>
        ) : (
          <div className="text-xs text-zinc-500">Sem preço</div>
        )}
      </div>

      {/* Check overlay */}
      <div className="
        absolute right-2 top-2 h-5 w-5 rounded-full
        grid place-items-center
        bg-white/90 dark:bg-zinc-900/80 border
        border-zinc-200 dark:border-zinc-700
      ">
        {selected ? (
          <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-primary">
            <path fill="currentColor" d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.2 7.2a1 1 0 0 1-1.4 0L3.3 9.9a1 1 0 1 1 1.4-1.4l3.1 3.1 6.5-6.5a1 1 0 0 1 1.4 0z"/>
          </svg>
        ) : null}
      </div>
    </button>
  );
});

ProductPickCard.displayName = "ProductPickCard";

// Skeleton card for loading state
const SkeletonCard = () => (
  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 bg-white/80 dark:bg-zinc-900/60">
    <div className="aspect-square w-full rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
    <div className="mt-2 space-y-1">
      <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
      <div className="h-3 w-1/2 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
    </div>
  </div>
);

// Selected product chip for the "Selected" tab
const SelectedProductChip = memo(({ 
  product, 
  onRemove 
}: { 
  product: any; 
  onRemove: () => void 
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
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><line x1="12" y1="22" x2="12" y2="12"></line></svg>
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
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        <span className="sr-only">Remover</span>
      </Button>
    </div>
  );
});

SelectedProductChip.displayName = "SelectedProductChip";

export function ProductPickerModalRefactored({
  open,
  onOpenChange,
  selectedIds,
  onSave,
  userId,
  defaultFilters,
}: ProductPickerModalProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(defaultFilters?.categories || []);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(defaultFilters?.tags || []);
  const [status, setStatus] = useState<string>(defaultFilters?.status || "all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("browse");

  const ITEMS_PER_PAGE = 24;

  useEffect(() => {
    if (open) {
      setTempSelectedIds(selectedIds);
      loadCategories();
      loadTags();
      setPage(1);
      loadProducts(1, true);
    }
  }, [open, selectedIds]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearch(value);
      setPage(1);
      loadProducts(1, true);
    }, 300),
    []
  );

  const loadCategories = async () => {
    let currentUserId = userId;
    
    if (!currentUserId) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          currentUserId = user.id;
        }
      } catch (error) {
        console.error("Error getting user:", error);
        return;
      }
    }
    
    if (!currentUserId) return;

    const { data, error } = await supabase
      .from("products")
      .select("categories")
      .eq("user_id", currentUserId);

    if (error || !data) {
      console.error("Error loading categories:", error);
      return;
    }

    const allCategories = data
      .flatMap(product => product.categories || [])
      .filter(Boolean);

    const uniqueCategories = [...new Set(allCategories)].sort();
    setCategories(uniqueCategories);
  };

  const loadTags = async () => {
    let currentUserId = userId;
    
    if (!currentUserId) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          currentUserId = user.id;
        }
      } catch (error) {
        console.error("Error getting user:", error);
        return;
      }
    }
    
    if (!currentUserId) return;

    const { data, error } = await supabase
      .from("products")
      .select("quality_tags")
      .eq("user_id", currentUserId);

    if (error || !data) {
      console.error("Error loading tags:", error);
      return;
    }

    const allTags = data
      .flatMap(product => product.quality_tags || [])
      .filter(Boolean);

    const uniqueTags = [...new Set(allTags)].sort();
    setTags(uniqueTags);
  };

  const loadProducts = async (pageToLoad = page, reset = false) => {
    let currentUserId = userId;
    
    if (!currentUserId) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          currentUserId = user.id;
        }
      } catch (error) {
        console.error("Error getting user:", error);
      }
    }
    
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const from = (pageToLoad - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query = supabase
      .from("products")
      .select("id, title, photos, price, status, created_at, price_on_request, price_hidden, price_on_request_label, categories, quality_tags", { count: "exact" })
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
    if (status !== "all") {
      query = query.eq("status", status === "disponivel" ? "Disponível" : "Sob encomenda");
    }
    
    // Apply sorting - default to most recent
    query = query.order("created_at", { ascending: false });

    // Apply pagination
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error loading products:", error);
      setLoading(false);
      return;
    }

    // Update products
    if (reset) {
      setProducts(data || []);
    } else {
      setProducts(prev => [...prev, ...(data || [])]);
    }

    // Check if there are more products to load
    setHasMore(count ? from + data.length < count : false);
    setLoading(false);

    // Load selected products details if needed
    if (tempSelectedIds.length > 0 && selectedProducts.length === 0) {
      loadSelectedProducts();
    }
  };

  const loadSelectedProducts = async () => {
    if (tempSelectedIds.length === 0) return;
    
    let currentUserId = userId;
    
    if (!currentUserId) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          currentUserId = user.id;
        }
      } catch (error) {
        console.error("Error getting user:", error);
        return;
      }
    }
    
    if (!currentUserId) return;
    
    const { data } = await supabase
      .from("products")
      .select("id, title, photos, price, price_on_request, price_hidden, price_on_request_label")
      .eq("user_id", currentUserId)
      .in("id", tempSelectedIds);
      
    if (data) {
      // Sort according to the order in tempSelectedIds
      const orderedProducts = tempSelectedIds
        .map(id => data.find(p => p.id === id))
        .filter(Boolean);
      setSelectedProducts(orderedProducts as any[]);
    }
  };

  const handleToggleProduct = (productId: string) => {
    setTempSelectedIds(prev => {
      if (prev.includes(productId)) {
        // Remove product
        const newIds = prev.filter(id => id !== productId);
        setSelectedProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
        return newIds;
      } else {
        // Add product
        const product = products.find(p => p.id === productId);
        if (product) {
          setSelectedProducts(prevProducts => [...prevProducts, product]);
        }
        return [...prev, productId];
      }
    });
  };

  const handleRemoveProduct = (productId: string) => {
    setTempSelectedIds(prev => prev.filter(id => id !== productId));
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleRemoveAll = () => {
    setTempSelectedIds([]);
    setSelectedProducts([]);
  };

  const handleSave = () => {
    onSave(tempSelectedIds);
    onOpenChange(false);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Load more when user scrolls to bottom (with a buffer of 200px)
    if (scrollHeight - scrollTop - clientHeight < 200 && !loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadProducts(nextPage);
    }
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedTags([]);
    setStatus("all");
    setPage(1);
    loadProducts(1, true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle>Selecionar Produtos</DialogTitle>
        </DialogHeader>

        <Tabs 
          defaultValue="browse" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full flex-1 flex flex-col overflow-hidden"
        >
          {/* Header with search, filters and tabs */}
          <div className="px-4 pt-3 pb-2 sticky top-0 bg-white/95 dark:bg-zinc-900/90 backdrop-blur z-10">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produtos..."
                  className="pl-9"
                  onChange={(e) => debouncedSearch(e.target.value)}
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className={cn(
                      selectedCategories.length > 0 || selectedTags.length > 0 || status !== "all" 
                        ? "bg-primary/10 border-primary/50" 
                        : ""
                    )}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="end">
                  <div className="space-y-4">
                    {/* Categories */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Categorias</h4>
                      <ScrollArea className="h-24 rounded-md border p-2">
                        <div className="space-y-1">
                          {categories.map(category => (
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
                                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {category}
                              </label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Tags</h4>
                      <ScrollArea className="h-24 rounded-md border p-2">
                        <div className="space-y-1">
                          {tags.map(tag => (
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
                                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {tag}
                              </label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Status</h4>
                      <Select
                        value={status}
                        onValueChange={setStatus}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Todos os status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Ambos</SelectItem>
                          <SelectItem value="disponivel">Disponível</SelectItem>
                          <SelectItem value="sob_encomenda">Sob encomenda</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Clear filters button */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={handleClearFilters}
                    >
                      Limpar filtros
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <TabsList className="mt-2 w-full grid grid-cols-2">
              <TabsTrigger value="browse">Navegar</TabsTrigger>
              <TabsTrigger value="selected" disabled={tempSelectedIds.length === 0}>
                Selecionados ({tempSelectedIds.length})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Browse tab content */}
          <TabsContent value="browse" className="flex-1 overflow-hidden">
            {/* Products grid with infinite scroll */}
            <div 
              className="h-[60vh] sm:h-[70vh] overflow-y-auto px-3 pb-3"
              onScroll={handleScroll}
            >
              {loading && page === 1 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 pt-3">
                  {[...Array(24)].map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground mb-4"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><line x1="12" y1="22" x2="12" y2="12"></line></svg>
                  <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    {search || selectedCategories.length > 0 || selectedTags.length > 0 || status !== "all"
                      ? "Tente ajustar os filtros"
                      : "Adicione produtos para poder selecioná-los"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 pt-3">
                  {products.map(product => (
                    <ProductPickCard
                      key={product.id}
                      product={product}
                      selected={tempSelectedIds.includes(product.id)}
                      onToggle={() => handleToggleProduct(product.id)}
                    />
                  ))}
                  
                  {/* Loading indicator at the bottom when loading more */}
                  {loading && page > 1 && (
                    <div className="col-span-full flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Selected tab content */}
          <TabsContent value="selected" className="flex-1 overflow-hidden">
            <div className="flex justify-between items-center px-4 py-2 border-b">
              <h3 className="font-medium">
                {tempSelectedIds.length} produto(s) selecionado(s)
              </h3>
              {tempSelectedIds.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRemoveAll}
                >
                  Remover todos
                </Button>
              )}
            </div>
            
            <div className="h-[60vh] sm:h-[70vh] overflow-y-auto p-3">
              <div className="space-y-2">
                {selectedProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[200px] text-center">
                    <p className="text-muted-foreground">
                      Nenhum produto selecionado
                    </p>
                  </div>
                ) : (
                  selectedProducts.map(product => (
                    <SelectedProductChip
                      key={product.id}
                      product={product}
                      onRemove={() => handleRemoveProduct(product.id)}
                    />
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="p-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={tempSelectedIds.length === 0}
          >
            Salvar seleção ({tempSelectedIds.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
