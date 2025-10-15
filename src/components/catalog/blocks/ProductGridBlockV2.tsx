import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Package } from "lucide-react";
import { Link } from "react-router-dom";

interface ProductGridBlockProps {
  data: any;
  className?: string;
  preview?: boolean;
}

export function ProductGridBlockV2({ data, className = "", preview = false }: ProductGridBlockProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [data]);

  const loadProducts = async () => {
    setLoading(true);

    if (!data) {
      setLoading(false);
      return;
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    let query = supabase
      .from("products")
      .select("*")
      .eq("user_id", user.id);

    // Handle different source types
    if (data.source_type === "manual" && data.selected_product_ids?.length) {
      query = query.in("id", data.selected_product_ids);
    }
    else if (data.source_type === "combined") {
      if (data.selected_categories?.length && data.selected_tags?.length) {
        // Both categories and tags selected
        if (data.combine_logic === "and") {
          // "AND" logic - must match both categories AND tags
          query = query.overlaps("categories", data.selected_categories);
          
          if (data.selected_tags.length > 1) {
            // For multiple tags with AND logic, each tag must be present
            data.selected_tags.forEach((tag: string) => {
              query = query.contains("quality_tags", [tag]);
            });
          } else {
            // For single tag, simple contains is enough
            query = query.contains("quality_tags", data.selected_tags);
          }
        } else {
          // "OR" logic - match either categories OR tags
          const categoryIds = data.selected_categories.map((c: string) => c);
          const tagIds = data.selected_tags.map((t: string) => t);
          
          // Use or() for OR logic between categories and tags
          query = query.or(`categories.ov.{${categoryIds.join(',')}},quality_tags.ov.{${tagIds.join(',')}}`);
        }
      }
      else if (data.selected_categories?.length) {
        // Only categories selected
        query = query.contains("categories", data.selected_categories);
      }
      else if (data.selected_tags?.length) {
        // Only tags selected
        if (data.combine_logic === "and" && data.selected_tags.length > 1) {
          // For "and" logic with multiple tags
          data.selected_tags.forEach((tag: string) => {
            query = query.contains("quality_tags", [tag]);
          });
        } else {
          // For "or" logic or single tag
          query = query.contains("quality_tags", data.selected_tags);
        }
      }
    }
    else if (data.source_type === "category" && data.selected_categories?.length) {
      query = query.contains("categories", data.selected_categories);
    } 
    else if (data.source_type === "tag" && data.selected_tags?.length) {
      // Handle tag filtering based on match type
      if (data.combine_logic === "and" && data.selected_tags.length > 1) {
        // For "all" match type, we need to check that each tag is present
        data.selected_tags.forEach((tag: string) => {
          query = query.contains("quality_tags", [tag]);
        });
      } else {
        // For "any" match type (default), any of the selected tags will match
        query = query.contains("quality_tags", data.selected_tags);
      }
    }

    // Filter by status
    if (data.status_filter) {
      if (data.status_filter === "disponivel") {
        query = query.eq("status", "Disponível");
      } else if (data.status_filter === "sob_encomenda") {
        query = query.eq("status", "Sob encomenda");
      }
      // If "ambos" or undefined, don't filter by status
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

    query = query.limit(data.limit || 12);

    const { data: productsData, error } = await query;
    
    if (error) {
      console.error("Error loading products:", error);
      setLoading(false);
      return;
    }

    // If manual, preserve order
    if (data.source_type === "manual" && data.selected_product_ids?.length) {
      const ordered = data.selected_product_ids
        .map(id => productsData?.find(p => p.id === id))
        .filter(Boolean);
      setProducts(ordered as any[]);
    } else {
      setProducts(productsData || []);
    }

    setLoading(false);
  };

  // Render functions for different layouts
  const renderGridLayout = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <div key={product.id} className="group">
          <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
            <div className="aspect-square bg-muted relative overflow-hidden">
              {product.photos?.[0]?.url ? (
                <img
                  src={product.photos[0].url}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-12 w-12 text-muted-foreground opacity-50" />
                </div>
              )}
            </div>
            <CardContent className="p-4 flex-1">
              <h3 className="font-medium text-base line-clamp-2">{product.title}</h3>
              
              {data.show_tags && product.quality_tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {product.quality_tags.slice(0, 3).map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="p-4 pt-0 flex items-center justify-between">
              {data.show_price !== false && (
                <div className="text-sm">
                  {product.price_on_request ? (
                    <span className="text-muted-foreground">
                      {product.price_on_request_label || "Sob consulta"}
                    </span>
                  ) : product.price_hidden ? (
                    <span className="text-muted-foreground">Preço sob consulta</span>
                  ) : product.price ? (
                    <span className="font-medium">
                      R$ {product.price.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Sem preço</span>
                  )}
                </div>
              )}
              
              {data.show_button !== false && (
                <Button 
                  size="sm" 
                  variant="outline"
                  asChild={!preview}
                  className="ml-auto"
                >
                  {preview ? (
                    <span>Ver produto</span>
                  ) : (
                    <Link to={`/p/${product.slug || product.id}`}>
                      Ver produto
                    </Link>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      ))}
    </div>
  );

  const renderListLayout = () => (
    <div className="space-y-4">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-48 h-48 bg-muted relative overflow-hidden">
              {product.photos?.[0]?.url ? (
                <img
                  src={product.photos[0].url}
                  alt={product.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-12 w-12 text-muted-foreground opacity-50" />
                </div>
              )}
            </div>
            <div className="flex-1 p-4 flex flex-col">
              <h3 className="font-medium text-lg">{product.title}</h3>
              
              {data.show_tags && product.quality_tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {product.quality_tags.slice(0, 5).map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="mt-auto flex items-center justify-between pt-4">
                {data.show_price !== false && (
                  <div>
                    {product.price_on_request ? (
                      <span className="text-muted-foreground">
                        {product.price_on_request_label || "Sob consulta"}
                      </span>
                    ) : product.price_hidden ? (
                      <span className="text-muted-foreground">Preço sob consulta</span>
                    ) : product.price ? (
                      <span className="font-medium text-lg">
                        R$ {product.price.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Sem preço</span>
                    )}
                  </div>
                )}
                
                {data.show_button !== false && (
                  <Button 
                    variant="outline"
                    asChild={!preview}
                    className="ml-auto"
                  >
                    {preview ? (
                      <span>Ver produto</span>
                    ) : (
                      <Link to={`/p/${product.slug || product.id}`}>
                        Ver produto
                      </Link>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  // Loading skeleton
  const renderSkeleton = () => {
    const layout = data?.layout || "grid";
    
    if (layout === "list") {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex flex-col sm:flex-row border rounded-lg overflow-hidden">
              <Skeleton className="w-full sm:w-48 h-48" />
              <div className="flex-1 p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <div className="flex justify-between items-center mt-auto">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-10 w-28" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <Skeleton className="aspect-square" />
            <div className="p-4">
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex justify-between items-center mt-4">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Empty state
  const renderEmpty = () => (
    <div className="text-center py-12 border rounded-lg">
      <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
      <h3 className="text-lg font-medium mb-2">Nenhum produto encontrado</h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        Não há produtos disponíveis com os filtros selecionados.
      </p>
    </div>
  );

  // Main render
  return (
    <div className={className}>
      {data?.title && (
        <h2 className="text-2xl font-bold mb-6">{data.title}</h2>
      )}
      
      {loading ? (
        renderSkeleton()
      ) : products.length === 0 ? (
        renderEmpty()
      ) : data?.layout === "list" ? (
        renderListLayout()
      ) : (
        renderGridLayout()
      )}
    </div>
  );
}
