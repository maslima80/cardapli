import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProductGridBlockProps {
  data: {
    title?: string;
    source?: "manual" | "category" | "tag";
    product_ids?: string[];
    categories?: string[];
    tags?: string[];
    status_filter?: string[];
    sort?: "newest" | "price_asc" | "price_desc" | "name_asc";
    layout?: "grid";
    show_price?: boolean;
    show_tags?: boolean;
    limit?: number;
  };
  userId?: string;
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

    // Filter by source
    if (data.source === "manual" && data.product_ids?.length) {
      query = query.in("id", data.product_ids);
    } else if (data.source === "category" && data.categories?.length) {
      query = query.overlaps("categories", data.categories);
    } else if (data.source === "tag" && data.tags?.length) {
      query = query.overlaps("quality_tags", data.tags);
    }

    // Filter by status
    if (data.status_filter?.length) {
      query = query.in("status", data.status_filter);
    }

    // Apply sorting
    switch (data.sort) {
      case "price_asc":
        query = query.order("price", { ascending: true, nullsFirst: false });
        break;
      case "price_desc":
        query = query.order("price", { ascending: false, nullsFirst: false });
        break;
      case "name_asc":
        query = query.order("title", { ascending: true });
        break;
      case "newest":
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    query = query.limit(data.limit || 12);

    const { data: productsData } = await query;

    // If manual, preserve order
    if (data.source === "manual" && data.product_ids?.length) {
      const ordered = data.product_ids
        .map(id => productsData?.find(p => p.id === id))
        .filter(Boolean);
      setProducts(ordered as any[]);
    } else {
      setProducts(productsData || []);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Nenhum produto selecionado
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((product) => (
          <div key={product.id} className="group cursor-pointer">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-muted relative">
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
              </div>
              <div className="p-4">
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
                  </div>
                )}
              </div>
            </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
