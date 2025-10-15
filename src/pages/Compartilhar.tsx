import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Search, ArrowRight, Plus } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  title: string;
  price: number;
  photos: any[];
  category: string | null;
  categories?: any; // JSONB
  quality_tags?: any; // Could be text or array
}

export default function Compartilhar() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
    // Load last used filters from localStorage
    const lastCategory = localStorage.getItem('compartilhar_last_category');
    const lastTag = localStorage.getItem('compartilhar_last_tag');
    if (lastCategory) setSelectedCategory(lastCategory);
    if (lastTag) setSelectedTag(lastTag);
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, selectedTag, products]);

  const loadProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/entrar");
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProducts((data || []) as Product[]);

      // Extract unique categories - handle both 'category' (text) and 'categories' (jsonb)
      const allCategories: string[] = [];
      data?.forEach(p => {
        // Check 'category' field (text)
        if (p.category && typeof p.category === 'string' && p.category.trim() !== '') {
          allCategories.push(p.category);
        }
        // Check 'categories' field (jsonb - could be array or object)
        const cats = (p as any).categories;
        if (Array.isArray(cats)) {
          allCategories.push(...cats.filter(c => c && typeof c === 'string'));
        } else if (cats && typeof cats === 'object') {
          // If it's an object, try to extract values
          Object.values(cats).forEach(val => {
            if (val && typeof val === 'string') allCategories.push(val);
          });
        }
      });
      const uniqueCategories = [...new Set(allCategories)];
      
      // Extract unique tags - handle both text and array
      const allTags: string[] = [];
      data?.forEach(p => {
        const tags = (p as any).quality_tags;
        if (typeof tags === 'string' && tags.trim() !== '') {
          // If it's a comma-separated string
          allTags.push(...tags.split(',').map(t => t.trim()).filter(Boolean));
        } else if (Array.isArray(tags)) {
          allTags.push(...tags.filter(t => t && typeof t === 'string'));
        }
      });
      const uniqueTags = [...new Set(allTags)];
      
      console.log('Categories found:', uniqueCategories);
      console.log('Tags found:', uniqueTags);
      console.log('Sample product:', data?.[0]);
      
      setCategories(uniqueCategories);
      setTags(uniqueTags);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(p => {
        // Check 'category' field (text)
        if (p.category === selectedCategory) return true;
        // Check 'categories' field (jsonb)
        const cats = (p as any).categories;
        if (Array.isArray(cats) && cats.includes(selectedCategory)) return true;
        if (cats && typeof cats === 'object' && Object.values(cats).includes(selectedCategory)) return true;
        return false;
      });
    }

    // Tag filter
    if (selectedTag) {
      filtered = filtered.filter(p => {
        const tags = (p as any).quality_tags;
        // If it's a string, split by comma
        if (typeof tags === 'string') {
          return tags.split(',').map(t => t.trim()).includes(selectedTag);
        }
        // If it's an array
        if (Array.isArray(tags)) {
          return tags.includes(selectedTag);
        }
        return false;
      });
    }

    setFilteredProducts(filtered);
  };

  const toggleProduct = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredProducts.map(p => p.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleCreateCatalog = () => {
    if (selectedIds.size === 0) {
      toast.error("Selecione pelo menos um produto");
      return;
    }
    
    // Save filters to localStorage
    if (selectedCategory) {
      localStorage.setItem('compartilhar_last_category', selectedCategory);
    }
    if (selectedTag) {
      localStorage.setItem('compartilhar_last_tag', selectedTag);
    }
    
    // Navigate to modal or next step with selected products
    const selectedProducts = products.filter(p => selectedIds.has(p.id));
    // Store in sessionStorage for the modal
    sessionStorage.setItem('quickCatalogProducts', JSON.stringify(selectedProducts));
    navigate("/compartilhar/criar");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-24">
      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/catalogos")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Criar Catálogo Rápido</h1>
            <p className="text-muted-foreground">
              Selecione os produtos que deseja enviar por WhatsApp
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl border border-border p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar produtos..."
              className="pl-10"
            />
          </div>

          {/* Category and Tag filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 px-3 rounded-lg border border-border bg-background"
            >
              <option value="">Todas as categorias</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="h-10 px-3 rounded-lg border border-border bg-background"
            >
              <option value="">Todas as tags</option>
              {tags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          {/* Quick actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAll}
              disabled={filteredProducts.length === 0}
            >
              Selecionar todos
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
              disabled={selectedIds.size === 0}
            >
              Limpar seleção
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border-2 border-dashed border-border">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery || selectedCategory || selectedTag
                ? "Nenhum produto encontrado"
                : "Nenhum produto cadastrado"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || selectedCategory || selectedTag
                ? "Tente ajustar os filtros para encontrar produtos"
                : "Cadastre seus produtos para começar a criar catálogos"}
            </p>
            {!searchQuery && !selectedCategory && !selectedTag && (
              <Button
                onClick={() => navigate("/produtos")}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Cadastrar primeiro produto
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredProducts.map((product) => {
              const isSelected = selectedIds.has(product.id);
              const thumbnail = product.photos?.[0]?.url || product.photos?.[0]?.image_url;

              return (
                <div
                  key={product.id}
                  onClick={() => toggleProduct(product.id)}
                  className={`bg-card rounded-xl border-2 transition-all duration-200 cursor-pointer transform hover:scale-[1.02] ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-lg"
                      : "border-border hover:border-primary/50 hover:shadow-md"
                  }`}
                >
                  <div className="p-4 flex gap-3">
                    {/* Checkbox */}
                    <div className="flex-shrink-0 pt-1">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleProduct(product.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Thumbnail */}
                    <div className="w-20 h-20 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          📦
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold line-clamp-2 mb-1">
                        {product.title}
                      </h3>
                      <p className="text-lg font-bold text-primary">
                        R$ {product.price.toFixed(2)}
                      </p>
                      {product.category && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {product.category}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fixed Bottom Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg animate-in slide-in-from-bottom duration-300">
          <div className="container max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">
                  {selectedIds.size} produto{selectedIds.size !== 1 ? "s" : ""} selecionado{selectedIds.size !== 1 ? "s" : ""}
                </p>
                <p className="text-sm text-muted-foreground">
                  Pronto para criar seu catálogo
                </p>
              </div>
              <Button
                onClick={handleCreateCatalog}
                size="lg"
                className="gap-2"
              >
                Criar Catálogo
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
