import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tag, Package } from "lucide-react";
import { Link } from "react-router-dom";

interface TagGridBlockProps {
  data: {
    title?: string;
    description?: string;
    selected_tags?: string[];
    columns?: number;
    show_count?: boolean;
    show_button?: boolean;
    button_text?: string;
    style?: "card" | "badge";
  };
  userId?: string;
  preview?: boolean;
}

export function TagGridBlock({ data, userId, preview = false }: TagGridBlockProps) {
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});

  // Default values
  const title = data?.title || "Tags";
  const description = data?.description || "";
  const columns = data?.columns || 3;
  const showCount = data?.show_count !== false;
  const showButton = data?.show_button !== false;
  const buttonText = data?.button_text || "Ver produtos";
  const style = data?.style || "card";

  useEffect(() => {
    loadTags();
  }, [data, userId]);

  const loadTags = async () => {
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

      // Get all products to extract unique tags
      const { data: productsData } = await supabase
        .from("products")
        .select("quality_tags")
        .eq("user_id", currentUserId);

      if (!productsData) {
        setLoading(false);
        return;
      }

      // Extract all tags and count products per tag
      const tagMap = new Map<string, { count: number }>();
      
      productsData.forEach(product => {
        if (product.quality_tags && Array.isArray(product.quality_tags)) {
          product.quality_tags.forEach((tag: string) => {
            if (tag) {
              const existing = tagMap.get(tag);
              if (existing) {
                existing.count += 1;
              } else {
                tagMap.set(tag, { count: 1 });
              }
            }
          });
        }
      });

      // Convert to array and sort by count
      let tagsArray = Array.from(tagMap.entries()).map(([name, data]) => ({
        name,
        count: data.count
      }));

      // Sort by count (descending)
      tagsArray.sort((a, b) => b.count - a.count);

      // Filter by selected tags if specified
      if (data?.selected_tags?.length) {
        tagsArray = tagsArray.filter(tag => 
          data.selected_tags?.includes(tag.name)
        );
      }

      // Create counts object for rendering
      const counts: Record<string, number> = {};
      tagsArray.forEach(tag => {
        counts[tag.name] = tag.count;
      });

      setTags(tagsArray);
      setProductCounts(counts);
    } catch (error) {
      console.error("Error loading tags:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate URL for tag
  const getTagUrl = (tag: string) => {
    return `/tag/${encodeURIComponent(tag)}`;
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Carregando tags...</p>
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div className="py-8 text-center">
        <Tag className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhuma tag encontrada</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Adicione produtos com tags para exibi-las aqui.
        </p>
      </div>
    );
  }

  // Badge style layout
  if (style === "badge") {
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

        <div className="flex flex-wrap gap-2 justify-center">
          {tags.map((tag) => (
            <Link 
              key={tag.name}
              to={preview ? "#" : getTagUrl(tag.name)}
              className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
            >
              {tag.name}
              {showCount && (
                <span className="ml-2 bg-primary/20 text-primary text-xs rounded-full px-2 py-0.5">
                  {tag.count}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Default card style layout
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
        {tags.map((tag) => (
          <Card 
            key={tag.name} 
            className="overflow-hidden hover:shadow-lg transition-shadow group"
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="bg-primary/10 rounded-full p-4 mb-4 group-hover:bg-primary/20 transition-colors">
                <Tag className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-medium text-lg mb-1">{tag.name}</h3>
              
              {showCount && (
                <p className="text-sm text-muted-foreground mb-4">
                  {tag.count} {tag.count === 1 ? 'produto' : 'produtos'}
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
                    <Link to={getTagUrl(tag.name)}>
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
