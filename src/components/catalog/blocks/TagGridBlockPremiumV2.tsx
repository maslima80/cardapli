import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Tag, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TagGridBlockProps {
  data: {
    title?: string;
    subtitle?: string;
    selected_tags?: string[];
    show_count?: boolean;
    show_button?: boolean;
    button_text?: string;
    layout?: "cards" | "swipe";
  };
  userId?: string;
  userSlug?: string;
  catalogSlug?: string;
}

export function TagGridBlockPremiumV2({ data, userId, userSlug, catalogSlug }: TagGridBlockProps) {
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTags();
  }, [userId, data.selected_tags]);

  const loadTags = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      // Get all products to extract tags
      const { data: products, error } = await supabase
        .from("products")
        .select("quality_tags")
        .eq("user_id", userId)
        .not("quality_tags", "is", null);

      if (error) throw error;

      // Extract unique tags with counts
      const tagMap = new Map<string, { name: string; count: number }>();
      
      products?.forEach((product) => {
        if (Array.isArray(product.quality_tags)) {
          product.quality_tags.forEach((tag: string) => {
            const existing = tagMap.get(tag);
            if (existing) {
              existing.count++;
            } else {
              tagMap.set(tag, {
                name: tag,
                count: 1,
              });
            }
          });
        }
      });

      let tagsArray = Array.from(tagMap.values());

      // Filter by selected tags if specified
      if (data.selected_tags && data.selected_tags.length > 0) {
        tagsArray = tagsArray.filter(tag => data.selected_tags!.includes(tag.name));
        // Maintain order from selected_tags
        tagsArray.sort((a, b) => {
          const indexA = data.selected_tags!.indexOf(a.name);
          const indexB = data.selected_tags!.indexOf(b.name);
          return indexA - indexB;
        });
      } else {
        // Sort by count descending
        tagsArray.sort((a, b) => b.count - a.count);
      }

      setTags(tagsArray);
    } catch (error) {
      console.error("Error loading tags:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTagUrl = (tagName: string) => {
    if (userSlug && catalogSlug) {
      return `/u/${userSlug}/${catalogSlug}?tag=${encodeURIComponent(tagName)}`;
    } else if (userSlug) {
      return `/u/${userSlug}?tag=${encodeURIComponent(tagName)}`;
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

  if (tags.length === 0) {
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
            <Tag className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-600 mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Nenhuma tag encontrada</p>
          </div>
        </div>
      </div>
    );
  }

  const renderTagPill = (tag: any) => (
    <Link
      key={tag.name}
      to={getTagUrl(tag.name)}
      className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-full transition-all hover:shadow-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
    >
      <span 
        className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-50 transition-colors"
        style={{ fontFamily: 'var(--font-body, inherit)' }}
      >
        {tag.name}
      </span>
      {data.show_count !== false && (
        <span 
          className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white"
          style={{ backgroundColor: 'var(--accent-color, #8B5CF6)' }}
        >
          {tag.count}
        </span>
      )}
    </Link>
  );

  // Always use horizontal swipe for tags (compact pills)
  return (
    <div className="py-12">
      <div className="container max-w-6xl mx-auto px-4">
        {title && (
          <div className="mb-6">
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
            className="flex overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 cursor-grab active:cursor-grabbing"
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
            <div className="flex gap-3">
              {tags.map(renderTagPill)}
            </div>
          </div>
          
          {tags.length > 3 && (
            <p className="text-center text-xs text-slate-500 dark:text-slate-500 mt-2">
              ← Deslize para ver mais →
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
