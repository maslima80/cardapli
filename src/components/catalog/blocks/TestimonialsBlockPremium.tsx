import { useRef, useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Quote, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { listTestimonials, Testimonial } from "@/lib/businessInfo";
import { cn } from "@/lib/utils";

interface TestimonialsBlockProps {
  data: {
    mode?: 'auto' | 'custom';
    source?: 'manual' | 'table' | {
      scope: 'global' | 'product' | 'category' | 'tag';
      scope_id?: string | null;
      include_global_backfill?: boolean;
      limit?: number;
    };
    selected_testimonial_ids?: string[];
    title?: string;
    subtitle?: string;
    items?: Array<{
      name: string;
      quote: string;
      avatar_url?: string;
      role?: string;
      rating?: number;
    }>;
    layout?: 'grid' | 'list';
  };
  userId?: string;
}

export const TestimonialsBlockPremium = ({ data, userId }: TestimonialsBlockProps) => {
  const [items, setItems] = useState<Array<{name: string; quote: string; avatar_url?: string; role?: string; rating?: number}>>([]);
  const [loading, setLoading] = useState(false);
  const title = data.title || "Depoimentos";
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Initialize items from data or fetch if auto mode
  useEffect(() => {
    // New structure: source = 'table' with selected_testimonial_ids
    if (data.source === 'table' && data.selected_testimonial_ids && data.selected_testimonial_ids.length > 0) {
      fetchSelectedTestimonials();
    }
    // Legacy auto mode
    else if (data.mode === 'auto') {
      fetchTestimonials();
    }
    // Manual mode
    else if (data.items) {
      let processedItems = [];
      if (Array.isArray(data.items)) {
        processedItems = data.items.filter(item => item && item.name && item.quote);
      } else if (typeof data.items === 'object') {
        processedItems = Object.values(data.items).filter((item: any) => item && item.name && item.quote);
      }
      setItems(processedItems);
    }
  }, [data.mode, data.source, data.items, data.selected_testimonial_ids]);

  const fetchSelectedTestimonials = async () => {
    setLoading(true);
    try {
      const { data: testimonials, error } = await supabase
        .from('testimonials')
        .select('*')
        .in('id', data.selected_testimonial_ids!)
        .eq('status', 'approved');

      if (error) throw error;

      // Map to component format
      const mappedItems = (testimonials || []).map(t => ({
        name: t.author_name,
        quote: t.content,
        avatar_url: t.author_photo_url,
        role: t.author_role,
        rating: t.rating,
      }));

      setItems(mappedItems);
    } catch (error) {
      console.error('Error loading selected testimonials:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      // Handle legacy source object structure
      const sourceObj = typeof data.source === 'object' ? data.source : { scope: 'global' as const };
      const scope = sourceObj.scope || 'global';
      const scopeId = sourceObj.scope_id;
      const limit = sourceObj.limit || 6;

      // Fetch testimonials for the specified scope
      let testimonials = await listTestimonials(scope, scopeId);

      // If include_global_backfill and we don't have enough, add global ones
      if (typeof data.source === 'object' && data.source.include_global_backfill && testimonials.length < limit && scope !== 'global') {
        const globalTestimonials = await listTestimonials('global');
        const remaining = limit - testimonials.length;
        testimonials = [...testimonials, ...globalTestimonials.slice(0, remaining)];
      }

      // Limit results
      testimonials = testimonials.slice(0, limit);

      // Map to component format
      const mappedItems = testimonials.map((t: Testimonial) => ({
        name: t.name,
        quote: t.message,
        avatar_url: t.image_url || undefined,
        role: undefined, // Could add role field to testimonials table later
      }));

      setItems(mappedItems);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle scroll events to update active index
  useEffect(() => {
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
  }, [activeIndex]);

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (items.length === 0) {
    // Show placeholder for auto mode
    if (data.mode === 'auto') {
      return (
        <div className="py-12">
          <div className="container max-w-4xl mx-auto px-4">
            <h2 
              className="text-3xl font-bold text-center mb-6 text-slate-900 dark:text-slate-50"
              style={{ fontFamily: 'var(--font-heading, inherit)' }}
            >
              {title}
            </h2>
            <div className="text-center p-8 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700">
              <p className="text-slate-600 dark:text-slate-400">
                Sem depoimentos ainda.
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="py-8 text-center text-slate-600 dark:text-slate-400">
        Nenhum depoimento adicionado ainda
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container max-w-6xl mx-auto px-4">
        <h2 
          className="text-3xl font-bold text-center mb-8 text-slate-900 dark:text-slate-50"
          style={{ fontFamily: 'var(--font-heading, inherit)' }}
        >
          {title}
        </h2>
        
        <div className="relative">
          {/* Carousel container with drag support */}
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
              {items.map((item, index) => (
                <div 
                  key={index}
                  ref={el => cardsRef.current[index] = el}
                  className="flex-shrink-0 w-[85%] sm:w-[400px] snap-start"
                >
                  <div className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 h-full">
                    {/* Quote icon with accent color */}
                    <Quote 
                      className="absolute top-5 right-5 w-8 h-8 opacity-20"
                      style={{ color: 'var(--accent-color, #8B5CF6)' }}
                    />
                    
                    {/* Avatar and name */}
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="w-12 h-12 shrink-0">
                        <AvatarImage src={item.avatar_url} alt={item.name} loading="lazy" />
                        <AvatarFallback 
                          className="text-white font-semibold"
                          style={{ backgroundColor: 'var(--accent-color, #8B5CF6)' }}
                        >
                          {item.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <p 
                          className="font-semibold text-base text-slate-900 dark:text-slate-50"
                          style={{ fontFamily: 'var(--font-heading, inherit)' }}
                        >
                          {item.name}
                        </p>
                        {item.role && (
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {item.role}
                          </p>
                        )}
                        {item.rating && (
                          <div className="flex gap-0.5 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "w-3 h-3",
                                  i < item.rating!
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                )}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Quote text */}
                    <div 
                      className="text-base leading-relaxed text-slate-700 dark:text-slate-300"
                      style={{ fontFamily: 'var(--font-body, inherit)' }}
                    >
                      {item.quote.startsWith('"') ? (
                        <p>{item.quote}</p>
                      ) : (
                        <p>"{item.quote}"</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Pagination dots with accent color */}
          {items.length > 1 && (
            <div className="flex justify-center gap-2 mt-2">
              {items.map((_, index) => (
                <button
                  key={index}
                  aria-label={`Go to slide ${index + 1}`}
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
          {items.length > 1 && (
            <p className="text-center text-xs text-slate-500 dark:text-slate-500 mt-4">
              ← Deslize para ver mais →
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
