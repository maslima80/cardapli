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
  userId?: string;
}

export function ProductGridBlockV2({ data, className = "", preview = false, userId }: ProductGridBlockProps) {
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

    console.log("ProductGridBlock data:", data);
    console.log("Selected categories:", data.selected_categories);
    console.log("Selected tags:", data.selected_tags);
    console.log("Source type:", data.source_type);

    let query = supabase
      .from("products")
      .select("*")
      .eq("user_id", currentUserId);

    // Handle different source types
    if (data.source_type === "manual" && data.selected_product_ids?.length) {
      console.log("Using manual selection with IDs:", data.selected_product_ids);
      query = query.in("id", data.selected_product_ids);
    }
    else if (data.source_type === "combined") {
      console.log("Using combined filtering");
      if (data.selected_categories?.length && data.selected_tags?.length) {
        // Both categories and tags selected
        console.log("Both categories and tags selected");
        if (data.combine_logic === "and") {
          // "AND" logic - must match both categories AND tags
          console.log("Using AND logic for categories and tags");
          
          // For categories, we need to check if any of the product's categories match any of the selected categories
          // We can't use contains() directly with an array on both sides
          if (data.selected_categories.length === 1) {
            // If only one category, we can use a simpler approach
            query = query.contains("categories", [data.selected_categories[0]]);
            console.log("Single category filter:", data.selected_categories[0]);
          } else {
            // For multiple categories, we need to check if any of them are in the product's categories
            // This is a bit tricky with Supabase, we'll use a raw SQL filter
            const categoryFilter = data.selected_categories.map((c: string) => `'${c}' = ANY(categories)`).join(" OR ");
            query = query.or(categoryFilter);
            console.log("Multiple categories filter:", categoryFilter);
          }
          
          // For tags with AND logic
          if (data.selected_tags.length > 1) {
            // For multiple tags with AND logic, each tag must be present
            data.selected_tags.forEach((tag: string) => {
              query = query.contains("quality_tags", [tag]);
              console.log("Adding tag filter (AND):", tag);
            });
          } else {
            // For single tag
            query = query.contains("quality_tags", [data.selected_tags[0]]);
            console.log("Single tag filter:", data.selected_tags[0]);
          }
        } else {
          // "OR" logic - match either categories OR tags
          console.log("Using OR logic for categories and tags");
          
          // Build an array of conditions for the OR clause
          const conditions = [];
          
          // Add category conditions
          if (data.selected_categories.length > 0) {
            data.selected_categories.forEach((category: string) => {
              conditions.push(`categories.cs.{${category}}`);
            });
          }
          
          // Add tag conditions
          if (data.selected_tags.length > 0) {
            data.selected_tags.forEach((tag: string) => {
              conditions.push(`quality_tags.cs.{${tag}}`);
            });
          }
          
          // Join all conditions with OR
          if (conditions.length > 0) {
            const filterString = conditions.join(',');
            query = query.or(filterString);
            console.log("OR filter string:", filterString);
          }
        }
      }
      else if (data.selected_categories?.length) {
        // Only categories selected
        console.log("Only categories selected:", data.selected_categories);
        
        if (data.selected_categories.length === 1) {
          // If only one category, use simple contains
          query = query.contains("categories", [data.selected_categories[0]]);
          console.log("Using single category filter");
        } else {
          // For multiple categories with OR logic (default)
          const categoryConditions = data.selected_categories.map((category: string) => 
            `categories.cs.{${category}}`
          ).join(',');
          query = query.or(categoryConditions);
          console.log("Using multiple categories OR filter:", categoryConditions);
        }
      }
      else if (data.selected_tags?.length) {
        // Only tags selected
        console.log("Only tags selected:", data.selected_tags);
        
        if (data.combine_logic === "and" && data.selected_tags.length > 1) {
          // For "and" logic with multiple tags
          console.log("Using AND logic for multiple tags");
          data.selected_tags.forEach((tag: string) => {
            query = query.contains("quality_tags", [tag]);
            console.log("Adding tag filter (AND):", tag);
          });
        } else {
          // For "or" logic or single tag
          if (data.selected_tags.length === 1) {
            query = query.contains("quality_tags", [data.selected_tags[0]]);
            console.log("Using single tag filter");
          } else {
            // For multiple tags with OR logic
            const tagConditions = data.selected_tags.map((tag: string) => 
              `quality_tags.cs.{${tag}}`
            ).join(',');
            query = query.or(tagConditions);
            console.log("Using multiple tags OR filter:", tagConditions);
          }
        }
      }
    }
    else if (data.source_type === "category" && data.selected_categories?.length) {
      console.log("Category source type with categories:", data.selected_categories);
      
      if (data.selected_categories.length === 1) {
        // If only one category, use simple contains
        query = query.contains("categories", [data.selected_categories[0]]);
        console.log("Using single category filter");
      } else {
        // For multiple categories with OR logic (default)
        const categoryConditions = data.selected_categories.map((category: string) => 
          `categories.cs.{${category}}`
        ).join(',');
        query = query.or(categoryConditions);
        console.log("Using multiple categories OR filter:", categoryConditions);
      }
    } 
    else if (data.source_type === "tag" && data.selected_tags?.length) {
      console.log("Tag source type with tags:", data.selected_tags);
      
      // Handle tag filtering based on match type
      if (data.combine_logic === "and" && data.selected_tags.length > 1) {
        // For "all" match type, we need to check that each tag is present
        console.log("Using AND logic for multiple tags");
        data.selected_tags.forEach((tag: string) => {
          query = query.contains("quality_tags", [tag]);
          console.log("Adding tag filter (AND):", tag);
        });
      } else {
        // For "any" match type (default), any of the selected tags will match
        if (data.selected_tags.length === 1) {
          query = query.contains("quality_tags", [data.selected_tags[0]]);
          console.log("Using single tag filter");
        } else {
          // For multiple tags with OR logic
          const tagConditions = data.selected_tags.map((tag: string) => 
            `quality_tags.cs.{${tag}}`
          ).join(',');
          query = query.or(tagConditions);
          console.log("Using multiple tags OR filter:", tagConditions);
        }
      }
    }

    // Filter by status
    if (data.status_filter) {
      if (data.status_filter === "disponivel") {
        query = query.eq("status", "Disponível");
        console.log("Filtering by status: Disponível");
      } else if (data.status_filter === "sob_encomenda") {
        query = query.eq("status", "Sob encomenda");
        console.log("Filtering by status: Sob encomenda");
      }
      // If "ambos" or undefined, don't filter by status
    }

    // Apply sorting
    switch (data.sort_order) {
      case "preco_asc":
        query = query.order("price", { ascending: true, nullsFirst: false });
        console.log("Sorting by price ascending");
        break;
      case "preco_desc":
        query = query.order("price", { ascending: false, nullsFirst: false });
        console.log("Sorting by price descending");
        break;
      case "nome_az":
        query = query.order("title", { ascending: true });
        console.log("Sorting by title ascending");
        break;
      case "antigos":
        query = query.order("created_at", { ascending: true });
        console.log("Sorting by created_at ascending");
        break;
      case "recentes":
      default:
        query = query.order("created_at", { ascending: false });
        console.log("Sorting by created_at descending");
        break;
    }

    query = query.limit(data.limit || 12);

    try {
      const { data: productsData, error, count } = await query;
      
      if (error) {
        console.error("Error loading products:", error);
        setLoading(false);
        return;
      }

      console.log("Products loaded:", productsData?.length || 0);
      console.log("First few products:", productsData?.slice(0, 3));

      // If manual, preserve order
      if (data.source_type === "manual" && data.selected_product_ids?.length) {
        const ordered = data.selected_product_ids
          .map(id => productsData?.find(p => p.id === id))
          .filter(Boolean);
        setProducts(ordered as any[]);
      } else {
        setProducts(productsData || []);
      }
    } catch (error) {
      console.error("Error in query execution:", error);
    } finally {
      setLoading(false);
    }
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
