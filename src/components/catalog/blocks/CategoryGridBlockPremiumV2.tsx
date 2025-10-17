import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Layers, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoryGridBlockProps {
  data: {
    title?: string;
    subtitle?: string;
    selected_categories?: string[];
    show_count?: boolean;
    show_button?: boolean;
    button_text?: string;
    layout?: "cards" | "swipe";
  };
  userId?: string;
  userSlug?: string;
  catalogSlug?: string;
}

export function CategoryGridBlockPremiumV2({ data, userId, userSlug, catalogSlug }: CategoryGridBlockProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, [userId, data.selected_categories]);

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

      let categoriesArray = Array.from(categoryMap.values());

      // Filter by selected categories if specified
      if (data.selected_categories && data.selected_categories.length > 0) {
        categoriesArray = categoriesArray.filter(cat => data.selected_categories!.includes(cat.name));
        // Maintain order from selected_categories
        categoriesArray.sort((a, b) => {
          const indexA = data.selected_categories!.indexOf(a.name);
          const indexB = data.selected_categories!.indexOf(b.name);
          return indexA - indexB;
        });
      } else {
        // Sort alphabetically
        categoriesArray.sort((a, b) => a.name.localeCompare(b.name));
      }

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
      return `${url}?tr=w-240,h-240,fo-auto`;
    }
    return url;
  };

  const getCategoryUrl = (categoryName: string) => {
    if (userSlug && catalogSlug) {
      return `/u/${userSlug}/${catalogSlug}?category=${encodeURIComponent(categoryName)}`;
    } else if (userSlug) {
      return `/u/${userSlug}?category=${encodeURIComponent(categoryName)}`;
    }
    return "#";
  };

  const title = data?.title || "";
  const subtitle = data?.subtitle || "";
  const layout = data?.layout || "cards";
  const showButton = data?.show_button !== false;
  const buttonText = data?.button_text || "Ver produtos";

  if (loading) {
    return (
      <div className="py-12">
        <div className="container max-w-6xl mx-auto px-4">
          {title && (
            <div className="mb-8">
              <h2 
                className="text-3xl font-bold text-slate-900 dark:text-slate-50"
                style={{ fontFamily: 'var(--font-heading, inherit)' }}
              >
                {title}
              </h2>
              {subtitle && (
                <p 
                  className="text-slate-600 dark:text-slate-400 mt-2"
                  style={{ fontFamily: 'var(--font-body, inherit)' }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          )}
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[200px]">
                <Skeleton className="h-32 rounded-2xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="py-12">
        <div className="container max-w-6xl mx-auto px-4">
          {title && (
            <div className="mb-8">
              <h2 
                className="text-3xl font-bold text-slate-900 dark:text-slate-50"
                style={{ fontFamily: 'var(--font-heading, inherit)' }}
              >
                {title}
              </h2>
            </div>
          )}
          <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Layers className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-600 mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Nenhuma categoria encontrada</p>
          </div>
        </div>
      </div>
    );
  }

  const renderCategoryCard = (category: any) => (
    <Link
      key={category.name}
      to={getCategoryUrl(category.name)}
      className="group block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
    >
      {/* Category Image or Icon */}
      <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 relative overflow-hidden">
        {category.image ? (
          <img
            src={getImageUrl(category.image)}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--accent-color, #8B5CF6)' }}
            >
              <Layers className="w-8 h-8 text-white" />
            </div>
          </div>
        )}
        
        {/* Count badge */}
        {data.show_count !== false && (
          <div 
            className="absolute top-3 right-3 px-3 py-1 rounded-full text-white text-sm font-bold backdrop-blur-sm"
            style={{ backgroundColor: 'var(--accent-color, #8B5CF6)' }}
          >
            {category.count}
          </div>
        )}
      </div>
      
      {/* Category Info */}
      <div className="p-4">
        <h3 
          className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-50"
          style={{ fontFamily: 'var(--font-heading, inherit)' }}
        >
          {category.name}
        </h3>
        
        {showButton && (
          <div className="flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all"
            style={{ color: 'var(--accent-color, #8B5CF6)' }}
          >
            <span>{buttonText}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        )}
      </div>
    </Link>
  );

  // Always use horizontal swipe for categories (better mobile UX)
  return (
    <div className="py-12">
      <div className="container max-w-6xl mx-auto px-4">
        {title && (
          <div className="mb-8">
            <h2 
              className="text-3xl font-bold text-slate-900 dark:text-slate-50"
              style={{ fontFamily: 'var(--font-heading, inherit)' }}
            >
              {title}
            </h2>
            {subtitle && (
              <p 
                className="text-slate-600 dark:text-slate-400 mt-2"
                style={{ fontFamily: 'var(--font-body, inherit)' }}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}
        
        <div className="relative">
          <div 
            className="flex overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory scroll-pt-4 -mx-4 px-4 cursor-grab active:cursor-grabbing"
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
              {categories.map((category) => (
                <div key={category.name} className="flex-shrink-0 w-[180px] sm:w-[200px] snap-start">
                  {renderCategoryCard(category)}
                </div>
              ))}
            </div>
          </div>
          
          {categories.length > 1 && (
            <p className="text-center text-xs text-slate-500 dark:text-slate-500 mt-2">
              ← Deslize para ver mais →
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
