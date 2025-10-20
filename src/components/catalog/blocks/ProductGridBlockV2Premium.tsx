import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, ProductCardSkeleton } from "../ProductCard";
import { SectionHeader } from "../Section";
import { Button } from "@/components/ui/button";
import { Package, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGridBlockProps {
  data: any;
  className?: string;
  preview?: boolean;
  userId?: string;
  userSlug?: string;
  catalogSlug?: string;
}

export function ProductGridBlockV2Premium({ 
  data, 
  className = "", 
  preview = false, 
  userId,
  userSlug,
  catalogSlug
}: ProductGridBlockProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [data, userId]);

  // Initialize scroll state after products load
  useEffect(() => {
    if (!loading && scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, [loading, products]);

  const loadProducts = async () => {
    setLoading(true);

    if (!data) {
      setLoading(false);
      return;
    }

    // Get current user
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

    let query = supabase
      .from("products")
      .select("*")
      .eq("user_id", currentUserId);

    // Handle different source types
    if (data.source_type === "manual" && data.selected_product_ids?.length) {
      query = query.in("id", data.selected_product_ids);
    }
    else if (data.source_type === "category" && data.selected_categories?.length) {
      // Client-side filtering for categories
    } 
    else if (data.source_type === "tag" && data.selected_tags?.length) {
      // Client-side filtering for tags
    }
    else if (data.source_type === "combined") {
      // Client-side filtering for combined
    }

    // Filter by status
    if (data.status_filter) {
      if (data.status_filter === "disponivel") {
        query = query.eq("status", "Disponível");
      } else if (data.status_filter === "sob_encomenda") {
        query = query.eq("status", "Sob encomenda");
      }
    }

    // Apply sorting
    switch (data.sort_order) {
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

    query = query.limit(data.limit || 100);

    try {
      const { data: productsData, error } = await query;
      
      if (error) {
        console.error("Error loading products:", error);
        setLoading(false);
        return;
      }

      let filteredProducts = productsData || [];
      
      // Load variant prices for all products
      if (filteredProducts.length > 0) {
        const productIds = filteredProducts.map(p => p.id);
        const { data: variantsData } = await supabase
          .from("product_variants")
          .select("product_id, price")
          .in("product_id", productIds)
          .eq("is_available", true)
          .not("price", "is", null);

        if (variantsData) {
          // Group variant prices by product_id
          const variantPricesByProduct = variantsData.reduce((acc, v) => {
            if (!acc[v.product_id]) acc[v.product_id] = [];
            acc[v.product_id].push(Number(v.price));
            return acc;
          }, {} as Record<string, number[]>);

          // Add variantPrices to each product
          filteredProducts = filteredProducts.map(product => ({
            ...product,
            variantPrices: variantPricesByProduct[product.id] || [],
          }));
        }
      }
      
      // Client-side filtering for categories and tags
      if (data.source_type === "category" && data.selected_categories?.length) {
        filteredProducts = filteredProducts.filter(product => {
          if (!product.categories) return false;
          return data.selected_categories.some((category: string) => 
            product.categories.includes(category)
          );
        });
      }
      
      if (data.source_type === "tag" && data.selected_tags?.length) {
        filteredProducts = filteredProducts.filter(product => {
          if (!product.quality_tags) return false;
          
          if (data.combine_logic === "and" && data.selected_tags.length > 1) {
            return data.selected_tags.every((tag: string) => 
              product.quality_tags.includes(tag)
            );
          } else {
            return data.selected_tags.some((tag: string) => 
              product.quality_tags.includes(tag)
            );
          }
        });
      }
      
      if (data.source_type === "combined") {
        if (data.selected_categories?.length && data.selected_tags?.length) {
          if (data.combine_logic === "and") {
            filteredProducts = filteredProducts.filter(product => {
              const matchesCategory = data.selected_categories.some((category: string) => 
                product.categories?.includes(category)
              );
              
              const matchesTags = data.selected_tags.length > 1 
                ? data.selected_tags.every((tag: string) => product.quality_tags?.includes(tag))
                : data.selected_tags.some((tag: string) => product.quality_tags?.includes(tag));
                
              return matchesCategory && matchesTags;
            });
          } else {
            filteredProducts = filteredProducts.filter(product => {
              const matchesCategory = data.selected_categories.some((category: string) => 
                product.categories?.includes(category)
              );
              
              const matchesTags = data.selected_tags.some((tag: string) => 
                product.quality_tags?.includes(tag)
              );
              
              return matchesCategory || matchesTags;
            });
          }
        }
        else if (data.selected_categories?.length) {
          filteredProducts = filteredProducts.filter(product => {
            if (!product.categories) return false;
            return data.selected_categories.some((category: string) => 
              product.categories.includes(category)
            );
          });
        }
        else if (data.selected_tags?.length) {
          filteredProducts = filteredProducts.filter(product => {
            if (!product.quality_tags) return false;
            
            if (data.combine_logic === "and" && data.selected_tags.length > 1) {
              return data.selected_tags.every((tag: string) => 
                product.quality_tags.includes(tag)
              );
            } else {
              return data.selected_tags.some((tag: string) => 
                product.quality_tags.includes(tag)
              );
            }
          });
        }
      }

      // If manual, preserve order
      if (data.source_type === "manual" && data.selected_product_ids?.length) {
        const ordered = data.selected_product_ids
          .map(id => filteredProducts.find(p => p.id === id))
          .filter(Boolean);
        setProducts(ordered);
      } else {
        setProducts(filteredProducts.slice(0, data.limit || 12));
      }
    } catch (error) {
      console.error("Error in query execution:", error);
    } finally {
      setLoading(false);
    }
  };

  // Loading skeleton
  const renderSkeleton = () => {
    const layout = data?.layout || "grid";
    const skeletonCount = layout === "list" ? 3 : 8;
    
    if (layout === "list") {
      return (
        <div className="space-y-4">
          {[...Array(skeletonCount)].map((_, i) => (
            <ProductCardSkeleton key={i} layout={layout} />
          ))}
        </div>
      );
    }
    
    // Grade mode - horizontal swipe skeleton
    return (
      <div className="flex overflow-x-auto pb-8 pl-4 pr-4 gap-4">
        {[...Array(skeletonCount)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[280px] sm:w-[320px]">
            <ProductCardSkeleton layout="grid" />
          </div>
        ))}
      </div>
    );
  };

  // Empty state
  const renderEmpty = () => (
    <div className="text-center py-16 border-2 border-dashed rounded-2xl">
      <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
      <h3 className="text-lg font-medium mb-2">Nenhum produto encontrado</h3>
      <p className="text-muted-foreground max-w-md mx-auto mb-6">
        Não há produtos disponíveis com os filtros selecionados.
      </p>
      {preview && (
        <Button variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          Adicionar produtos
        </Button>
      )}
    </div>
  );

  const layout = data?.layout || "grid";

  return (
    <div className={className}>
      <SectionHeader 
        title={data?.title} 
        subtitle={data?.subtitle}
      />
      
      {loading ? (
        renderSkeleton()
      ) : products.length === 0 ? (
        renderEmpty()
      ) : layout === "grid_cinematic" ? (
        // Grade Cinematic - Premium visual grid
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {products.map((product) => {
            const imageUrl = product.photos?.[0]?.url || product.photos?.[0]?.image_url;
            const productUrl = catalogSlug 
              ? `/u/${userSlug}/${catalogSlug}/p/${product.slug}`
              : `/u/${userSlug}/p/${product.slug}`;
            
            return (
              <a
                key={product.id}
                href={productUrl}
                className="group relative aspect-square overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900"
              >
                {imageUrl ? (
                  <>
                    <img
                      src={imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    {/* Hover overlay with title */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 
                          className="text-white font-semibold text-sm md:text-base line-clamp-2"
                          style={{ fontFamily: 'var(--font-heading, inherit)' }}
                        >
                          {product.title}
                        </h3>
                        {!product.price_hidden && product.price && (
                          <p className="text-white/90 text-xs md:text-sm mt-1">
                            R$ {product.price}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                  </div>
                )}
              </a>
            );
          })}
        </div>
      ) : layout === "list" ? (
        // Lista mode - vertical stack
        <div className="space-y-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              layout={layout}
              showPrice={data.show_price !== false}
              showTags={data.show_tags !== false}
              showButton={data.show_button !== false}
              userSlug={userSlug}
              catalogSlug={catalogSlug}
            />
          ))}
        </div>
      ) : (
        // Grade mode - horizontal swipe
        <div className="relative">
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory scroll-pt-4 pl-4 pr-4 cursor-grab active:cursor-grabbing"
            onScroll={() => {
              if (scrollContainerRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
                setCanScrollLeft(scrollLeft > 0);
                setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
              }
            }}
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
            onMouseDown={(e) => {
              const ele = e.currentTarget;
              const startX = e.pageX - ele.offsetLeft;
              const scrollLeft = ele.scrollLeft;
              
              const handleMouseMove = (e: MouseEvent) => {
                const x = e.pageX - ele.offsetLeft;
                const walk = (x - startX) * 2;
                ele.scrollLeft = scrollLeft - walk;
              };
              
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          >
            <div className="flex gap-4">
              {products.map((product) => (
                <div key={product.id} className="flex-shrink-0 w-[280px] sm:w-[320px] snap-start">
                  <ProductCard
                    product={product}
                    layout="grid"
                    showPrice={data.show_price !== false}
                    showTags={data.show_tags !== false}
                    showButton={data.show_button !== false}
                    userSlug={userSlug}
                    catalogSlug={catalogSlug}
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Desktop Navigation Arrows */}
          {products.length > 2 && (
            <>
              {canScrollLeft && (
                <button
                  onClick={() => {
                    if (scrollContainerRef.current) {
                      scrollContainerRef.current.scrollBy({ left: -340, behavior: 'smooth' });
                    }
                  }}
                  className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  style={{ color: 'var(--accent-color, #8B5CF6)' }}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              {canScrollRight && (
                <button
                  onClick={() => {
                    if (scrollContainerRef.current) {
                      scrollContainerRef.current.scrollBy({ left: 340, behavior: 'smooth' });
                    }
                  }}
                  className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  style={{ color: 'var(--accent-color, #8B5CF6)' }}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </>
          )}
          
          {/* Scroll hint */}
          {products.length > 1 && (
            <p className="text-center text-xs text-slate-500 dark:text-slate-500 mt-2 md:hidden">
              ← Deslize para ver mais →
            </p>
          )}
        </div>
      )}
    </div>
  );
}
