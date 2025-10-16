import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, ArrowLeft, Filter, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductDrawer } from "@/components/products/ProductDrawer";
import { ProductShareModal } from "@/components/product/ProductShareModal";
import { generateUniqueSlug } from "@/lib/slugify";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface Product {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number;
  price_unit: string;
  price_unit_custom: string | null;
  price_note: string | null;
  min_qty: number | null;
  price_on_request: boolean;
  price_on_request_label: string;
  price_hidden: boolean;
  sku: string | null;
  status: string;
  production_days: number | null;
  accepts_customization: boolean;
  customization_instructions: string | null;
  ingredients: string | null;
  allergens: string | null;
  conservation: string | null;
  category: string | null;
  categories: string[] | null;
  quality_tags: string[] | null;
  variants: string[] | null;
  photos: any;
  external_media: any;
  created_at: string;
  updated_at: string;
}

export default function Produtos() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [productToShare, setProductToShare] = useState<Product | null>(null);
  const [userSlug, setUserSlug] = useState<string>("");

  useEffect(() => {
    checkAuth();
    fetchProducts();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/entrar");
      return;
    }

    // Load user slug for sharing
    const { data: profile } = await supabase
      .from("profiles")
      .select("slug")
      .eq("id", user.id)
      .single();
    
    if (profile?.slug) {
      setUserSlug(profile.slug);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Fetch variant prices for each product
      const productsWithVariants = await Promise.all(
        (data || []).map(async (product) => {
          const { data: variants } = await supabase
            .from("product_variants")
            .select("price")
            .eq("product_id", product.id);
          
          return {
            ...product,
            variantPrices: variants?.map(v => v.price).filter(Boolean) || [],
          };
        })
      );
      
      setProducts(productsWithVariants || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar produtos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewProduct = () => {
    setSelectedProduct(null);
    setDrawerOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setDrawerOpen(true);
  };

  const handleProductSaved = async () => {
    await fetchProducts();
    setDrawerOpen(false);
  };

  const handleShareProduct = async (product: Product) => {
    // Ensure product has a slug
    let productSlug = (product as any).slug;
    
    if (!productSlug) {
      // Generate and save slug
      productSlug = generateUniqueSlug(product.title);
      
      const { error } = await supabase
        .from("products")
        .update({ slug: productSlug })
        .eq("id", product.id);
      
      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível gerar o link do produto",
          variant: "destructive",
        });
        return;
      }
      
      // Update local state
      setProducts(products.map(p => 
        p.id === product.id ? { ...p, slug: productSlug } as any : p
      ));
    }
    
    setProductToShare({ ...product, slug: productSlug } as any);
    setShareModalOpen(true);
  };

  const handleActivateProductLink = async () => {
    if (!productToShare) return;
    
    const { error } = await supabase
      .from("products")
      .update({ public_link: true })
      .eq("id", productToShare.id);
    
    if (error) throw error;
    
    // Update local state
    setProducts(products.map(p => 
      p.id === productToShare.id ? { ...p, public_link: true } as any : p
    ));
    setProductToShare({ ...productToShare, public_link: true } as any);
  };

  const handleDuplicateProduct = async (product: Product) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("products")
        .insert({
          ...product,
          id: undefined,
          user_id: user.id,
          title: `${product.title} (cópia)`,
          created_at: undefined,
          updated_at: undefined,
        });

      if (error) throw error;

      toast({
        title: "Produto duplicado!",
        description: "O produto foi duplicado com sucesso.",
      });

      await fetchProducts();
    } catch (error: any) {
      toast({
        title: "Erro ao duplicar produto",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productToDelete.id);

      if (error) throw error;

      toast({
        title: "Produto excluído!",
        description: "O produto foi excluído com sucesso.",
      });

      await fetchProducts();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir produto",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  // Get unique values for filters
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => {
      if (p.categories && Array.isArray(p.categories)) {
        p.categories.forEach(c => cats.add(c));
      } else if (p.category) {
        cats.add(p.category);
      }
    });
    return Array.from(cats).sort();
  }, [products]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    products.forEach(p => {
      if (p.quality_tags && Array.isArray(p.quality_tags)) {
        p.quality_tags.forEach(t => tags.add(t));
      }
    });
    return Array.from(tags).sort();
  }, [products]);

  const statuses = ["Disponível", "Sob encomenda", "Indisponível"];

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search filter
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = selectedCategories.length === 0 || 
        (product.categories && product.categories.some(c => selectedCategories.includes(c))) ||
        (product.category && selectedCategories.includes(product.category));

      // Tag filter
      const matchesTag = selectedTags.length === 0 ||
        (product.quality_tags && product.quality_tags.some(t => selectedTags.includes(t)));

      // Status filter
      const matchesStatus = selectedStatuses.length === 0 ||
        selectedStatuses.includes(product.status);

      return matchesSearch && matchesCategory && matchesTag && matchesStatus;
    });
  }, [products, searchQuery, selectedCategories, selectedTags, selectedStatuses]);

  // Summary stats
  const stats = useMemo(() => {
    return {
      total: filteredProducts.length,
      disponivel: filteredProducts.filter(p => p.status === "Disponível").length,
      sobEncomenda: filteredProducts.filter(p => p.status === "Sob encomenda").length,
      indisponivel: filteredProducts.filter(p => p.status === "Indisponível").length,
    };
  }, [filteredProducts]);

  const hasActiveFilters = selectedCategories.length > 0 || selectedTags.length > 0 || selectedStatuses.length > 0;

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedTags([]);
    setSelectedStatuses([]);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Voltar ao Painel</span>
            </Button>
          </div>

          <div className="flex flex-col gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Produtos</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie o catálogo de produtos da sua marca
              </p>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {isMobile ? (
                <>
                  {/* Mobile: Filters Sheet */}
                  <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="gap-2 relative">
                        <Filter className="h-4 w-4" />
                        {hasActiveFilters && (
                          <div className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-[10px] text-primary-foreground font-medium">
                              {selectedCategories.length + selectedTags.length + selectedStatuses.length}
                            </span>
                          </div>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[80vh]">
                      <SheetHeader>
                        <SheetTitle>Filtros</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6 space-y-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                        {/* Category Filter */}
                        {allCategories.length > 0 && (
                          <div>
                            <h3 className="font-medium mb-3">Categoria</h3>
                            <div className="flex flex-wrap gap-2">
                              {allCategories.map((category) => (
                                <Badge
                                  key={category}
                                  variant={selectedCategories.includes(category) ? "default" : "outline"}
                                  className="cursor-pointer"
                                  onClick={() => {
                                    setSelectedCategories(
                                      selectedCategories.includes(category)
                                        ? selectedCategories.filter((c) => c !== category)
                                        : [...selectedCategories, category]
                                    );
                                  }}
                                >
                                  {category}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tag Filter */}
                        {allTags.length > 0 && (
                          <div>
                            <h3 className="font-medium mb-3">Tag</h3>
                            <div className="flex flex-wrap gap-2">
                              {allTags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                                  className="cursor-pointer"
                                  onClick={() => {
                                    setSelectedTags(
                                      selectedTags.includes(tag)
                                        ? selectedTags.filter((t) => t !== tag)
                                        : [...selectedTags, tag]
                                    );
                                  }}
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Status Filter */}
                        <div>
                          <h3 className="font-medium mb-3">Status</h3>
                          <div className="flex flex-wrap gap-2">
                            {statuses.map((status) => (
                              <Badge
                                key={status}
                                variant={selectedStatuses.includes(status) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => {
                                  setSelectedStatuses(
                                    selectedStatuses.includes(status)
                                      ? selectedStatuses.filter((s) => s !== status)
                                      : [...selectedStatuses, status]
                                  );
                                }}
                              >
                                {status}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background flex gap-2">
                        <Button variant="outline" onClick={clearFilters} className="flex-1">
                          Limpar
                        </Button>
                        <Button onClick={() => setFiltersOpen(false)} className="flex-1">
                          Aplicar
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>
                </>
              ) : (
                <>
                  {/* Desktop: Inline Filters */}
                  {allCategories.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <Filter className="h-4 w-4" />
                          Categoria
                          {selectedCategories.length > 0 && (
                            <Badge variant="secondary" className="ml-1">
                              {selectedCategories.length}
                            </Badge>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Filtrar por categoria</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {allCategories.map((category) => (
                          <DropdownMenuCheckboxItem
                            key={category}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={(checked) => {
                              setSelectedCategories(
                                checked
                                  ? [...selectedCategories, category]
                                  : selectedCategories.filter((c) => c !== category)
                              );
                            }}
                          >
                            {category}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {allTags.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <Filter className="h-4 w-4" />
                          Tag
                          {selectedTags.length > 0 && (
                            <Badge variant="secondary" className="ml-1">
                              {selectedTags.length}
                            </Badge>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Filtrar por tag</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {allTags.map((tag) => (
                          <DropdownMenuCheckboxItem
                            key={tag}
                            checked={selectedTags.includes(tag)}
                            onCheckedChange={(checked) => {
                              setSelectedTags(
                                checked
                                  ? [...selectedTags, tag]
                                  : selectedTags.filter((t) => t !== tag)
                              );
                            }}
                          >
                            {tag}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Status
                        {selectedStatuses.length > 0 && (
                          <Badge variant="secondary" className="ml-1">
                            {selectedStatuses.length}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Filtrar por status</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {statuses.map((status) => (
                        <DropdownMenuCheckboxItem
                          key={status}
                          checked={selectedStatuses.includes(status)}
                          onCheckedChange={(checked) => {
                            setSelectedStatuses(
                              checked
                                ? [...selectedStatuses, status]
                                : selectedStatuses.filter((s) => s !== status)
                            );
                          }}
                        >
                          {status}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button onClick={handleNewProduct} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Novo produto
                  </Button>
                </>
              )}
            </div>

            {/* Summary Bar */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <Badge variant="outline" className="px-3 py-1.5 whitespace-nowrap">
                Total: {stats.total}
              </Badge>
              <Badge variant="outline" className="px-3 py-1.5 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 whitespace-nowrap">
                Disponíveis: {stats.disponivel}
              </Badge>
              <Badge variant="outline" className="px-3 py-1.5 bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800 whitespace-nowrap">
                Sob encomenda: {stats.sobEncomenda}
              </Badge>
              <Badge variant="outline" className="px-3 py-1.5 bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 whitespace-nowrap">
                Indisponíveis: {stats.indisponivel}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando produtos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 max-w-md mx-auto">
            <div className="mb-6">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery || hasActiveFilters
                  ? "Nenhum produto encontrado"
                  : "Você ainda não adicionou produtos"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || hasActiveFilters
                  ? "Tente ajustar os filtros ou buscar por outro termo"
                  : "Comece criando seu primeiro produto para compartilhar com seus clientes"}
              </p>
            </div>
            {!searchQuery && !hasActiveFilters && (
              <Button onClick={handleNewProduct} size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Criar primeiro produto
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEditProduct}
                onDuplicate={handleDuplicateProduct}
                onDelete={openDeleteDialog}
                onShare={handleShareProduct}
              />
            ))}
          </div>
        )}
      </main>

      {/* Mobile FAB */}
      {isMobile && (
        <Button
          onClick={handleNewProduct}
          size="lg"
          className="fixed bottom-20 right-6 h-14 w-14 rounded-full shadow-lg z-10 p-0"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      {/* Product Drawer */}
      <ProductDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        product={selectedProduct}
        onSaved={handleProductSaved}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O produto será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Product Share Modal */}
      {productToShare && (
        <ProductShareModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          productTitle={productToShare.title}
          productSlug={(productToShare as any).slug || ""}
          userSlug={userSlug}
          publicLink={(productToShare as any).public_link !== false}
          onActivateLink={handleActivateProductLink}
        />
      )}
    </div>
  );
}
