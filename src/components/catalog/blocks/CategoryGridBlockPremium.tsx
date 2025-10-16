import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SectionHeader } from "../Section";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";

interface CategoryGridBlockProps {
  data: any;
  userId?: string;
  userSlug?: string;
  catalogSlug?: string;
}

export function CategoryGridBlockPremium({ data, userId, userSlug, catalogSlug }: CategoryGridBlockProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, [userId]);

  const loadCategories = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      // Get all products to extract categories
      const { data: products, error } = await supabase
        .from("products")
        .select("id, categories, photos")
        .eq("user_id", userId)
        .not("categories", "is", null);

      if (error) throw error;

      // Extract unique categories with counts and first product image
      const categoryMap = new Map<string, { name: string; count: number; image?: string }>();
      
      products?.forEach((product) => {
        if (Array.isArray(product.categories)) {
          product.categories.forEach((category: string) => {
            const existing = categoryMap.get(category);
            if (existing) {
              existing.count++;
              // Keep first image found
              if (!existing.image && product.photos?.[0]?.url) {
                existing.image = product.photos[0].url;
              }
            } else {
              categoryMap.set(category, {
                name: category,
                count: 1,
                image: product.photos?.[0]?.url,
              });
            }
          });
        }
      });

      const categoriesArray = Array.from(categoryMap.values())
        .sort((a, b) => a.name.localeCompare(b.name));

      setCategories(categoriesArray);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("ik.imagekit.io")) {
      return `${url}?tr=w-160,h-160,fo-auto`;
    }
    return url;
  };

  const getCategoryUrl = (categoryName: string) => {
    if (userSlug && catalogSlug) {
      return `/u/${userSlug}/${catalogSlug}?category=${encodeURIComponent(categoryName)}`;
    }
    return "#";
  };

  if (loading) {
    return (
      <div>
        <SectionHeader title={data?.title} subtitle={data?.subtitle} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3">
              <Skeleton className="aspect-square rounded-xl mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-12 mt-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div>
        <SectionHeader title={data?.title} subtitle={data?.subtitle} />
        <div className="text-center py-12 border-2 border-dashed rounded-2xl">
          <Package className="mx-auto h-10 w-10 text-muted-foreground opacity-50 mb-3" />
          <p className="text-muted-foreground">Nenhuma categoria encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title={data?.title} subtitle={data?.subtitle} />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((category) => (
          <Link
            key={category.name}
            to={getCategoryUrl(category.name)}
            className="group block rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all p-3"
          >
            {/* Category Image */}
            <div className="aspect-square overflow-hidden rounded-xl bg-muted mb-2">
              {category.image ? (
                <img
                  src={getImageUrl(category.image)}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  width={160}
                  height={160}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                    <span className="text-lg font-semibold text-slate-600">
                      {category.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Category Name */}
            <h3 className="text-sm font-medium line-clamp-1">
              {category.name}
            </h3>

            {/* Product Count */}
            <p className="text-[11px] text-slate-500 mt-0.5">
              {category.count} {category.count === 1 ? "produto" : "produtos"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
