import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, ProductCardSkeleton } from "../ProductCard";
import { SectionHeader } from "../Section";
import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGridBlockProps {
  data: any;
  className?: string;
  preview?: boolean;
  userId?: string;
  userSlug?: string;
}

export function ProductGridBlockV2Premium({ 
  data, 
  className = "", 
  preview = false, 
  userId,
  userSlug 
}: ProductGridBlockProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [data, userId]);

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
    
    return (
      <div className={cn(
        layout === "list" 
          ? "space-y-4"
          : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
      )}>
        {[...Array(skeletonCount)].map((_, i) => (
          <ProductCardSkeleton key={i} layout={layout} />
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
      ) : (
        <div className={cn(
          layout === "list" 
            ? "space-y-4"
            : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
        )}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              layout={layout}
              showPrice={data.show_price !== false}
              showTags={data.show_tags || false}
              showButton={data.show_button !== false}
              userSlug={userSlug}
            />
          ))}
        </div>
      )}
    </div>
  );
}
