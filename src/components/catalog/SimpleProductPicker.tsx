import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, ChevronDown, ChevronUp, Filter, Loader2, Package, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

type SimpleProductPickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string[];
  onConfirm: (ids: string[]) => void;
  userId?: string;
  initialFilters?: {
    categories?: string[];
    tags?: string[];
    status?: "disponivel" | "sob_encomenda" | "ambos";
  };
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
 * A simple product picker with effective filtering
 */
export default function SimpleProductPicker({
  open,
  onOpenChange,
  value = [],
  onConfirm,
  userId,
  initialFilters,
}: SimpleProductPickerProps) {
  // Core state
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  
  // Search and filters
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialFilters?.categories || []);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialFilters?.tags || []);
  const [statusFilter, setStatusFilter] = useState<string>(initialFilters?.status || "ambos");
  
  // Initialize when modal opens
  useEffect(() => {
    if (open) {
      setSelectedIds(new Set(value));
      loadProducts();
      loadFiltersData();
    }
  }, [open, value]);

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

  // Load all products with server-side filtering
  const loadProducts = async () => {
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

    try {
      let query = supabase
        .from("products")
        .select("id, title, photos, price, price_on_request, status, categories, quality_tags")
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

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle product selection
  const toggleProduct = (productId: string) => {
    const newSelectedIds = new Set(selectedIds);
    
    if (newSelectedIds.has(productId)) {
      newSelectedIds.delete(productId);
    } else {
      newSelectedIds.add(productId);
    }
    
    setSelectedIds(newSelectedIds);
  };

  // Save selection and close modal
  const handleSave = () => {
    onConfirm(Array.from(selectedIds));
    onOpenChange(false);
  };

  // Apply filters
  const applyFilters = () => {
    loadProducts();
    setShowFilters(false);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedTags([]);
    setStatusFilter("ambos");
    setSearch("");
  };

  // Count active filters
  const activeFilterCount = 
    (search ? 1 : 0) + 
    selectedCategories.length + 
    selectedTags.length + 
    (statusFilter !== "ambos" ? 1 : 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle>Selecionar Produtos</DialogTitle>
        </DialogHeader>
        
        {/* Search and filter bar */}
        <div className="px-4 pt-3 pb-2 border-b">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button 
              variant={activeFilterCount > 0 ? "default" : "outline"}
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <Filter className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <div className="text-sm">
              {selectedIds.size} produto(s) selecionado(s)
            </div>
            {selectedIds.size > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedIds(new Set())}
              >
                Limpar seleção
              </Button>
            )}
          </div>
          
          {/* Filters panel */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t space-y-4">
              {/* Status filter */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Status</h3>
                <div className="flex gap-2">
                  {[
                    { value: "ambos", label: "Todos" },
                    { value: "disponivel", label: "Disponível" },
                    { value: "sob_encomenda", label: "Sob encomenda" }
                  ].map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      size="sm"
                      variant={statusFilter === option.value ? "default" : "outline"}
                      onClick={() => setStatusFilter(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Categories filter */}
              {availableCategories.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Categorias</h3>
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
                  <div className="max-h-[120px] overflow-y-auto space-y-1 pr-1">
                    {availableCategories.map(category => (
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
                    ))}
                  </div>
                </div>
              )}
              
              {/* Tags filter */}
              {availableTags.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Tags</h3>
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
                  <div className="max-h-[120px] overflow-y-auto space-y-1 pr-1">
                    {availableTags.map(tag => (
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
                    ))}
                  </div>
                </div>
              )}
              
              {/* Filter actions */}
              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={applyFilters}
                  className="flex-1"
                >
                  Aplicar filtros
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    clearFilters();
                    loadProducts();
                  }}
                  disabled={activeFilterCount === 0}
                >
                  Limpar filtros
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Product grid - simple and scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-3 opacity-40" />
              <h3 className="text-lg font-medium mb-1">Nenhum produto encontrado</h3>
              <p className="text-sm text-muted-foreground">
                {activeFilterCount > 0 
                  ? "Tente ajustar os filtros para encontrar produtos" 
                  : "Adicione produtos para poder selecioná-los"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  selected={selectedIds.has(product.id)}
                  onToggle={() => toggleProduct(product.id)}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
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

// Simple product card component
const ProductCard = ({ 
  product, 
  selected, 
  onToggle 
}: { 
  product: Product; 
  selected: boolean; 
  onToggle: () => void;
}) => {
  const imageUrl = product.photos?.[0]?.url;
  
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
