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
    layout?: "grid" | "chips" | "featured";
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
  const layout = data?.layout || "grid";
  const showCount = data?.show_count !== false;
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

  // Grid Layout - Large tappable cards (premium, catalog-worthy)
  const renderGridLayout = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {tags.map((tag) => (
        <Link
          key={tag.name}
          to={getTagUrl(tag.name)}
          className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-6 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          style={{
            border: '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
          }}
        >
          {/* Gradient overlay on hover */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ 
              background: 'linear-gradient(to bottom right, var(--accent-color, #8B5CF6)0A, var(--accent-color, #8B5CF6)1A)'
            }}
          />
          
          {/* Content */}
          <div className="relative flex flex-col items-center text-center space-y-3">
            {/* Icon */}
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
              style={{
                background: 'linear-gradient(to bottom right, var(--accent-color, #8B5CF6)1A, var(--accent-color, #8B5CF6)33)'
              }}
            >
              <Tag className="w-6 h-6" style={{ color: 'var(--accent-color, #8B5CF6)' }} />
            </div>
            
            {/* Tag name */}
            <h3 
              className="font-semibold text-base transition-colors"
              style={{ 
                fontFamily: 'var(--font-heading, inherit)',
                color: 'var(--theme-foreground)'
              }}
            >
              {tag.name}
            </h3>
            
            {/* Count */}
            {showCount && (
              <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--theme-muted)' }}>
                <span className="font-medium">{tag.count}</span>
                <span className="text-xs">{tag.count === 1 ? 'produto' : 'produtos'}</span>
              </div>
            )}
          </div>
          
          {/* Arrow indicator */}
          <ChevronRight 
            className="absolute bottom-3 right-3 w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" 
            style={{ color: 'var(--theme-muted)' }}
          />
        </Link>
      ))}
    </div>
  );

  // Chips Layout - Wrapped pills (clean, compact)
  const renderChipsLayout = () => (
    <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
      {tags.map((tag) => (
        <Link
          key={tag.name}
          to={getTagUrl(tag.name)}
          className="group inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full transition-all hover:shadow-lg hover:scale-105 active:scale-95"
          style={{
            backgroundColor: 'var(--theme-surface)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
          }}
        >
          <span 
            className="text-sm sm:text-base font-semibold transition-colors"
            style={{ 
              fontFamily: 'var(--font-body, inherit)',
              color: 'var(--theme-foreground)'
            }}
          >
            {tag.name}
          </span>
          {showCount && (
            <span 
              className="text-xs font-bold px-2 py-0.5 rounded-full text-white min-w-[24px] text-center"
              style={{ backgroundColor: 'var(--accent-color, #8B5CF6)' }}
            >
              {tag.count}
            </span>
          )}
        </Link>
      ))}
    </div>
  );

  // Featured Layout - Hero tag + grid (highlight most popular)
  const renderFeaturedLayout = () => {
    const [featuredTag, ...restTags] = tags;
    
    return (
      <div className="space-y-6">
        {/* Featured Tag - Large hero card */}
        {featuredTag && (
          <Link
            to={getTagUrl(featuredTag.name)}
            className="group relative block overflow-hidden rounded-3xl p-8 sm:p-12 transition-all hover:shadow-2xl hover:scale-[1.01]"
            style={{
              background: 'linear-gradient(to bottom right, var(--accent-color, #8B5CF6)1A, var(--accent-color, #8B5CF6)0D, transparent)',
              border: '1px solid var(--accent-color, #8B5CF6)33',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            </div>
            
            {/* Content */}
            <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                {/* Large icon */}
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: 'var(--accent-color, #8B5CF6)'
                  }}
                >
                  <Tag className="w-10 h-10" style={{ color: '#ffffff' }} />
                </div>
                
                {/* Text */}
                <div className="text-center sm:text-left">
                  <div 
                    className="text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: 'var(--accent-color, #8B5CF6)' }}
                  >
                    Mais Popular
                  </div>
                  <h3 
                    className="text-3xl sm:text-4xl font-bold mb-2"
                    style={{ 
                      fontFamily: 'var(--font-heading, inherit)',
                      color: 'var(--theme-foreground)'
                    }}
                  >
                    {featuredTag.name}
                  </h3>
                  {showCount && (
                    <p className="text-lg" style={{ color: 'var(--theme-muted)' }}>
                      {featuredTag.count} {featuredTag.count === 1 ? 'produto' : 'produtos'}
                    </p>
                  )}
                </div>
              </div>
              
              {/* CTA */}
              <div 
                className="flex items-center gap-2 font-semibold group-hover:gap-4 transition-all"
                style={{ color: 'var(--accent-color, #8B5CF6)' }}
              >
                <span>Explorar</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </Link>
        )}
        
        {/* Rest of tags in grid */}
        {restTags.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {restTags.map((tag) => (
              <Link
                key={tag.name}
                to={getTagUrl(tag.name)}
                className="group flex items-center gap-3 p-4 rounded-xl transition-all hover:shadow-md"
                style={{
                  backgroundColor: 'var(--theme-surface)',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
                }}
              >
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(to bottom right, var(--accent-color, #8B5CF6)1A, var(--accent-color, #8B5CF6)33)'
                  }}
                >
                  <Tag className="w-5 h-5" style={{ color: 'var(--accent-color, #8B5CF6)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 
                    className="font-semibold text-sm truncate"
                    style={{ 
                      fontFamily: 'var(--font-body, inherit)',
                      color: 'var(--theme-foreground)'
                    }}
                  >
                    {tag.name}
                  </h4>
                  {showCount && (
                    <p className="text-xs" style={{ color: 'var(--theme-muted)' }}>
                      {tag.count} {tag.count === 1 ? 'item' : 'itens'}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render based on selected layout
  return (
    <div className="py-12">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        {title && (
          <div className="mb-8 text-center">
            <h2 
              className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-3"
              style={{ fontFamily: 'var(--font-heading, inherit)' }}
            >
              {title}
            </h2>
            {subtitle && (
              <p 
                className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
                style={{ fontFamily: 'var(--font-body, inherit)' }}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}
        
        {/* Layout content */}
        {layout === "grid" && renderGridLayout()}
        {layout === "chips" && renderChipsLayout()}
        {layout === "featured" && renderFeaturedLayout()}
      </div>
    </div>
  );
}
