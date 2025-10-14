import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface ProductGridBlockProps {
  data: {
    title?: string;
    // Source configuration
    source_type?: "manual" | "category" | "tag" | "combined";
    selected_product_ids?: string[];
    selected_categories?: string[];
    selected_tags?: string[];
    
    // Advanced filters
    combine_logic?: "and" | "or";
    status_filter?: "disponivel" | "sob_encomenda" | "ambos";
    sort_order?: "recentes" | "antigos" | "nome_az" | "preco_asc" | "preco_desc";
    
    // Variant filter (optional)
    variant_value_ids?: string[];
    
    // Display options
    layout?: "grid" | "list" | "carousel";
    show_price?: boolean;
    show_tags?: boolean;
    show_button?: boolean;
    limit?: number;
  };
  userId?: string;
  profile?: any;
}

export const ProductGridBlock = ({ data, userId }: ProductGridBlockProps) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [data]);

  const loadProducts = async () => {
    if (!userId) return;

    let query = supabase
      .from("products")
      .select("*")
      .eq("user_id", userId);

    // Filter by source type
    if (data.source_type === "manual" && data.selected_product_ids?.length) {
      query = query.in("id", data.selected_product_ids);
    } 
    else if (data.source_type === "combined") {
      // Combined filtering with categories and tags
      if (data.selected_categories?.length && data.selected_tags?.length) {
        if (data.combine_logic === "and") {
          // AND logic: must match both categories AND tags
          query = query.overlaps("categories", data.selected_categories);
          
          // For tags, we need to ensure ALL selected tags are present
          data.selected_tags.forEach(tag => {
            query = query.contains("quality_tags", [tag]);
          });
        } else {
          // OR logic: match either categories OR tags
          query = query.or(`categories.overlaps.{${data.selected_categories.join(',')}},quality_tags.overlaps.{${data.selected_tags.join(',')}}`);
        }
      }
      else if (data.selected_categories?.length) {
        // Only categories selected
        query = query.overlaps("categories", data.selected_categories);
      }
      else if (data.selected_tags?.length) {
        // Only tags selected
        if (data.combine_logic === "and" && data.selected_tags.length > 1) {
          // For "and" logic with multiple tags
          data.selected_tags.forEach(tag => {
            query = query.contains("quality_tags", [tag]);
          });
        } else {
          // For "or" logic or single tag
          query = query.overlaps("quality_tags", data.selected_tags);
        }
      }
    }
    else if (data.source_type === "category" && data.selected_categories?.length) {
      query = query.overlaps("categories", data.selected_categories);
    } 
    else if (data.source_type === "tag" && data.selected_tags?.length) {
      // Handle tag filtering based on match type
      if (data.combine_logic === "and" && data.selected_tags.length > 1) {
        // For "all" match type, we need to check that each tag is present
        data.selected_tags.forEach(tag => {
          query = query.contains("quality_tags", [tag]);
        });
      } else {
        // For "any" match type (default), any of the selected tags will match
        query = query.overlaps("quality_tags", data.selected_tags);
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

    // Apply limit
    query = query.limit(data.limit || 12);

    // Execute the query
    const { data: productsData, error } = await query;
    
    if (error) {
      console.error("Error loading products:", error);
      setLoading(false);
      return;
    }

    // Filter by variant if variant_value_ids is provided
    let filteredProducts = productsData || [];
    
    if (data.variant_value_ids?.length) {
      // Get product IDs that have variants with the specified value IDs
      const { data: variantData, error: variantError } = await supabase
        .from("product_variant_options")
        .select("variant_id, product_variants!inner(product_id)")
        .in("value_id", data.variant_value_ids)
        .eq("product_variants.is_available", true);
      
      if (variantError) {
        console.error("Error loading variants:", variantError);
      } else if (variantData) {
        // Extract unique product IDs from the variant data
        const productIds = [...new Set(variantData.map(v => v.product_variants.product_id))];
        
        // Filter products to only include those with matching variants
        filteredProducts = filteredProducts.filter(p => productIds.includes(p.id));
      }
    }

    // If manual, preserve order
    if (data.source_type === "manual" && data.selected_product_ids?.length) {
      const ordered = data.selected_product_ids
        .map(id => filteredProducts.find(p => p.id === id))
        .filter(Boolean);
      setProducts(ordered as any[]);
    } else {
      setProducts(filteredProducts);
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
                  <span className="text-muted-foreground text-sm">Sem imagem</span>
                </div>
              )}
              {product.status === "Sob encomenda" && (
                <Badge className="absolute top-2 right-2 bg-primary text-white">
                  Sob encomenda
                </Badge>
              )}
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-semibold line-clamp-2 mb-2">{product.title}</h3>
              
              {data.show_price && !product.price_hidden && (
                <p className="text-primary font-bold">
                  {product.price_on_request
                    ? product.price_on_request_label || "Sob consulta"
                    : `R$ ${product.price?.toFixed(2)}`}
                </p>
              )}
              
              {data.show_tags && product.quality_tags && product.quality_tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {product.quality_tags.slice(0, 2).map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {product.quality_tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{product.quality_tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}
              
              {data.show_button !== false && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-auto pt-2 w-full gap-1.5 mt-3"
                  onClick={() => window.open(`/p/${product.id}`, "_blank")}
                >
                  Ver produto
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </Card>
        </div>
      ))}
    </div>
  );

  const renderListLayout = () => (
    <div className="space-y-4">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-48 h-48 bg-muted relative">
              {product.photos?.[0]?.url ? (
                <img
                  src={product.photos[0].url}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">Sem imagem</span>
                </div>
              )}
              {product.status === "Sob encomenda" && (
                <Badge className="absolute top-2 right-2 bg-primary text-white">
                  Sob encomenda
                </Badge>
              )}
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-semibold mb-2">{product.title}</h3>
              
              {data.show_price && !product.price_hidden && (
                <p className="text-primary font-bold">
                  {product.price_on_request
                    ? product.price_on_request_label || "Sob consulta"
                    : `R$ ${product.price?.toFixed(2)}`}
                </p>
              )}
              
              {data.show_tags && product.quality_tags && product.quality_tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {product.quality_tags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              {data.show_button !== false && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-auto w-full sm:w-auto gap-1.5 mt-3"
                  onClick={() => window.open(`/p/${product.id}`, "_blank")}
                >
                  Ver produto
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="container max-w-6xl mx-auto px-4">
          {data.title && (
            <h2 id={`title-${data.title.toLowerCase().replace(/\s+/g, '-')}`} className="text-3xl font-bold text-center mb-8">
              {data.title}
            </h2>
          )}
          <div className="py-8 text-muted-foreground border border-dashed rounded-xl p-8">
            <p className="text-lg mb-2">Nenhum produto encontrado</p>
            <p className="text-sm max-w-md mx-auto">
              {data.source_type === "manual" 
                ? "Selecione produtos manualmente nas configurações do bloco."
                : data.source_type === "category" 
                  ? "Verifique se existem produtos nas categorias selecionadas."
                  : data.source_type === "tag"
                    ? "Verifique se existem produtos com as tags selecionadas."
                    : "Verifique os filtros aplicados e tente novamente."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container max-w-6xl mx-auto px-4">
        {data.title && (
          <h2 id={`title-${data.title.toLowerCase().replace(/\s+/g, '-')}`} className="text-3xl font-bold text-center mb-8">
            {data.title}
          </h2>
        )}
        
        {data.layout === "list" ? renderListLayout() : renderGridLayout()}
      </div>
    </div>
  );
};
