import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, Package } from "lucide-react";
import { Link } from "react-router-dom";

interface CategoryGridBlockProps {
  data: {
    title?: string;
    description?: string;
    selected_categories?: string[];
    columns?: number;
    show_count?: boolean;
    show_button?: boolean;
    button_text?: string;
  };
  userId?: string;
  preview?: boolean;
}

export function CategoryGridBlock({ data, userId, preview = false }: CategoryGridBlockProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});

  // Default values
  const title = data?.title || "Categorias";
  const description = data?.description || "";
  const columns = data?.columns || 3;
  const showCount = data?.show_count !== false;
  const showButton = data?.show_button !== false;
  const buttonText = data?.button_text || "Ver produtos";

  useEffect(() => {
    loadCategories();
  }, [data, userId]);

  const loadCategories = async () => {
    setLoading(true);

    try {
      // Get current user if not provided
      let currentUserId = userId;
      if (!currentUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        currentUserId = user?.id;
      }

      if (!currentUserId) {
        setLoading(false);
        return;
      }

      // Get all products to extract unique categories
      const { data: productsData } = await supabase
        .from("products")
        .select("categories")
        .eq("user_id", currentUserId);

      if (!productsData) {
        setLoading(false);
        return;
      }

      // Extract all categories and count products per category
      const categoryMap = new Map<string, { count: number }>();
      
      productsData.forEach(product => {
        if (product.categories && Array.isArray(product.categories)) {
          product.categories.forEach((category: string) => {
            if (category) {
              const existing = categoryMap.get(category);
              if (existing) {
                existing.count += 1;
              } else {
                categoryMap.set(category, { count: 1 });
              }
            }
          });
        }
      });

      // Convert to array and sort by count
      let categoriesArray = Array.from(categoryMap.entries()).map(([name, data]) => ({
        name,
        count: data.count
      }));

      // Sort by count (descending)
      categoriesArray.sort((a, b) => b.count - a.count);

      // Filter by selected categories if specified
      if (data?.selected_categories?.length) {
        categoriesArray = categoriesArray.filter(cat => 
          data.selected_categories?.includes(cat.name)
        );
      }

      // Create counts object for rendering
      const counts: Record<string, number> = {};
      categoriesArray.forEach(cat => {
        counts[cat.name] = cat.count;
      });

      setCategories(categoriesArray);
      setProductCounts(counts);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate URL for category
  const getCategoryUrl = (category: string) => {
    return `/categoria/${encodeURIComponent(category)}`;
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Carregando categorias...</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="py-8 text-center">
        <Layers className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhuma categoria encontrada</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Adicione produtos com categorias para exibi-las aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {title && (
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          {description && (
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>
      )}

      <div className={`grid grid-cols-2 md:grid-cols-${columns} gap-4`}>
        {categories.map((category) => (
          <Card 
            key={category.name} 
            className="overflow-hidden hover:shadow-lg transition-shadow group"
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="bg-primary/10 rounded-full p-4 mb-4 group-hover:bg-primary/20 transition-colors">
                <Layers className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-medium text-lg mb-1">{category.name}</h3>
              
              {showCount && (
                <p className="text-sm text-muted-foreground mb-4">
                  {category.count} {category.count === 1 ? 'produto' : 'produtos'}
                </p>
              )}
              
              {showButton && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  asChild={!preview}
                >
                  {preview ? (
                    <span>{buttonText}</span>
                  ) : (
                    <Link to={getCategoryUrl(category.name)}>
                      {buttonText}
                    </Link>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
