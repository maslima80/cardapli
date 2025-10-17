import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { publicCatalogUrl } from "@/lib/urls";
import { ExternalLink, Folder } from "lucide-react";

interface CatalogosBlockProps {
  data: {
    catalog_ids?: string[];
    layout?: "grid" | "swipe";
  };
  profile: {
    slug: string;
    id: string;
  };
}

interface Catalog {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover: any;
  status: string;
  link_ativo: boolean;
  updated_at: string;
}

export const CatalogosBlockPremium = ({ data, profile }: CatalogosBlockProps) => {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const layout = data.layout || "grid";

  useEffect(() => {
    loadCatalogs();
  }, [data.catalog_ids, profile.id]);

  // Handle scroll events to update active index (for swipe mode)
  useEffect(() => {
    if (layout !== "swipe") return;
    
    const handleScroll = () => {
      if (!scrollRef.current) return;
      
      const scrollLeft = scrollRef.current.scrollLeft;
      const containerWidth = scrollRef.current.clientWidth;
      
      const newActiveIndex = cardsRef.current.findIndex((card, index) => {
        if (!card) return false;
        const cardLeft = card.offsetLeft - scrollRef.current!.offsetLeft;
        const cardRight = cardLeft + card.clientWidth;
        
        return (cardLeft < scrollLeft + containerWidth / 2) && (cardRight > scrollLeft + containerWidth / 2);
      });
      
      if (newActiveIndex !== -1 && newActiveIndex !== activeIndex) {
        setActiveIndex(newActiveIndex);
      }
    };
    
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [activeIndex, layout]);

  const loadCatalogs = async () => {
    try {
      // Only show catalogs that are in catalog_ids (manual selection only)
      if (!data.catalog_ids || data.catalog_ids.length === 0) {
        setCatalogs([]);
        setLoading(false);
        return;
      }

      const { data: catalogsData, error } = await supabase
        .from("catalogs")
        .select("*")
        .eq("user_id", profile.id)
        .eq("status", "publicado")
        .eq("link_ativo", true)
        .in("id", data.catalog_ids);

      if (error) {
        console.error("Error loading catalogs:", error);
        setCatalogs([]);
      } else {
        // Maintain the order from catalog_ids
        const orderedCatalogs = data.catalog_ids
          .map(id => catalogsData?.find(c => c.id === id))
          .filter(Boolean) as Catalog[];
        
        setCatalogs(orderedCatalogs);
      }
    } catch (error) {
      console.error("Error:", error);
      setCatalogs([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <p className="text-slate-600 dark:text-slate-400">Carregando catálogos...</p>
      </div>
    );
  }

  if (catalogs.length === 0) {
    return null; // Don't show anything if no catalogs selected
  }

  const renderCatalogCard = (catalog: Catalog, index: number) => {
    const coverUrl = catalog.cover?.url || catalog.cover?.image_url;
    
    if (layout === "grid") {
      // Horizontal card with square thumbnail on left
      return (
        <a
          key={catalog.id}
          href={publicCatalogUrl(profile.slug, catalog.slug)}
          className="group flex gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-lg transition-all p-4"
        >
          {/* Square Thumbnail */}
          <div className="w-24 h-24 flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl overflow-hidden relative">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={catalog.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Folder 
                  className="w-10 h-10 opacity-30"
                  style={{ color: 'var(--accent-color, #8B5CF6)' }}
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h3 
              className="font-semibold text-lg mb-1 line-clamp-2 text-slate-900 dark:text-slate-50 transition-colors"
              style={{ 
                fontFamily: 'var(--font-heading, inherit)',
              }}
            >
              <span className="group-hover:text-[var(--accent-color,#8B5CF6)] transition-colors">
                {catalog.title}
              </span>
            </h3>
            {catalog.description && (
              <p 
                className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2"
                style={{ fontFamily: 'var(--font-body, inherit)' }}
              >
                {catalog.description}
              </p>
            )}
          </div>

          {/* Arrow icon */}
          <div className="flex items-center">
            <ExternalLink 
              className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: 'var(--accent-color, #8B5CF6)' }}
            />
          </div>
        </a>
      );
    } else {
      // Swipe mode - vertical card
      return (
        <div 
          key={catalog.id}
          ref={el => cardsRef.current[index] = el}
          className="flex-shrink-0 w-[85%] sm:w-[320px] snap-start"
        >
          <a
            href={publicCatalogUrl(profile.slug, catalog.slug)}
            className="group block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-lg transition-all h-full"
          >
            {/* Cover Image - Square for better visibility */}
            <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 relative overflow-hidden">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={catalog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Folder 
                    className="w-16 h-16 opacity-30"
                    style={{ color: 'var(--accent-color, #8B5CF6)' }}
                  />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 
                className="font-semibold text-lg mb-1 line-clamp-2 text-slate-900 dark:text-slate-50"
                style={{ fontFamily: 'var(--font-heading, inherit)' }}
              >
                <span className="group-hover:text-[var(--accent-color,#8B5CF6)] transition-colors">
                  {catalog.title}
                </span>
              </h3>
              {catalog.description && (
                <p 
                  className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2"
                  style={{ fontFamily: 'var(--font-body, inherit)' }}
                >
                  {catalog.description}
                </p>
              )}
            </div>
          </a>
        </div>
      );
    }
  };

  if (layout === "grid") {
    // Grid/List layout
    return (
      <div className="py-12">
        <div className="container max-w-4xl mx-auto px-4">
          <h2 
            className="text-3xl font-bold mb-8 text-slate-900 dark:text-slate-50"
            style={{ fontFamily: 'var(--font-heading, inherit)' }}
          >
            Catálogos
          </h2>
          <div className="space-y-4">
            {catalogs.map((catalog, index) => renderCatalogCard(catalog, index))}
          </div>
        </div>
      </div>
    );
  }

  // Swipe layout
  return (
    <div className="py-12">
      <div className="container max-w-6xl mx-auto px-4">
        <h2 
          className="text-3xl font-bold mb-8 text-slate-900 dark:text-slate-50"
          style={{ fontFamily: 'var(--font-heading, inherit)' }}
        >
          Catálogos
        </h2>
        
        <div className="relative">
          {/* Horizontal scroll container with drag support */}
          <div 
            ref={scrollRef}
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
            <div className="flex w-full gap-4">
              {catalogs.map((catalog, index) => renderCatalogCard(catalog, index))}
            </div>
          </div>
          
          {/* Pagination dots with accent color */}
          {catalogs.length > 1 && (
            <div className="flex justify-center gap-2 mt-2">
              {catalogs.map((_, index) => (
                <button
                  key={index}
                  aria-label={`Go to catalog ${index + 1}`}
                  aria-current={activeIndex === index}
                  onClick={() => {
                    const card = cardsRef.current[index];
                    if (card && scrollRef.current) {
                      scrollRef.current.scrollTo({
                        left: card.offsetLeft - 16,
                        behavior: 'smooth'
                      });
                    }
                  }}
                  className={`h-2 rounded-full transition-all ${
                    activeIndex === index ? 'w-6' : 'w-2 opacity-30'
                  }`}
                  style={{
                    backgroundColor: 'var(--accent-color, #8B5CF6)',
                  }}
                />
              ))}
            </div>
          )}

          {/* Scroll hint */}
          {catalogs.length > 1 && (
            <p className="text-center text-xs text-slate-500 dark:text-slate-500 mt-4">
              ← Deslize para ver mais →
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
