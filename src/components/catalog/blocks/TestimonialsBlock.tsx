import { useRef, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface TestimonialsBlockProps {
  data: {
    title?: string;
    source?: "manual" | "table";
    selected_testimonial_ids?: string[];
    items?: Array<{
      name: string;
      quote: string;
      avatar_url?: string;
      role?: string;
      rating?: number;
    }>;
    background?: "default" | "accent" | "cards_elevated";
  };
}

export const TestimonialsBlock = ({ data }: TestimonialsBlockProps) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(data.source === "table");
  const title = data.title || "Depoimentos";
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Load testimonials from table or use manual items
  useEffect(() => {
    async function loadTestimonials() {
      if (data.source === "table" && data.selected_testimonial_ids && data.selected_testimonial_ids.length > 0) {
        try {
          const { data: testimonials, error } = await supabase
            .from('testimonials')
            .select('*')
            .in('id', data.selected_testimonial_ids)
            .eq('status', 'approved');

          if (error) throw error;

          // Map testimonials to items format
          const mappedItems = (testimonials || []).map(t => ({
            name: t.author_name,
            quote: t.content,
            avatar_url: t.author_photo_url,
            role: t.author_role,
            rating: t.rating,
          }));

          setItems(mappedItems);
        } catch (error) {
          console.error('Error loading testimonials:', error);
          setItems([]);
        } finally {
          setLoading(false);
        }
      } else {
        // Use manual items
        let processedItems = [];
        if (data.items) {
          if (Array.isArray(data.items)) {
            processedItems = data.items.filter(item => item && item.name && item.quote);
          } else if (typeof data.items === 'object') {
            processedItems = Object.values(data.items).filter((item: any) => item && item.name && item.quote);
          }
        }
        setItems(processedItems);
        setLoading(false);
      }
    }

    loadTestimonials();
  }, [data.source, data.selected_testimonial_ids, data.items]);
  
  // Handle background style
  const getBackgroundClass = () => {
    switch (data.background) {
      case "accent":
        return "bg-primary/5"; // Tinted band using accent color
      case "cards_elevated":
        return ""; // No band, will emphasize card shadows
      default:
        return ""; // Default transparent background
    }
  };

  // Handle card style based on background
  const getCardClass = () => {
    const baseClass = "relative rounded-2xl border p-5 transition-all duration-300";
    
    switch (data.background) {
      case "cards_elevated":
        return `${baseClass} shadow-md hover:shadow-lg bg-card`;
      default:
        return `${baseClass} shadow-sm hover:shadow bg-card border-muted/30`;
    }
  };

  // Handle scrolling to the next/previous card
  const scrollToCard = (index: number) => {
    if (!scrollRef.current || items.length === 0) return;
    
    // Keep index within bounds
    const newIndex = Math.max(0, Math.min(index, items.length - 1));
    setActiveIndex(newIndex);
    
    const card = cardsRef.current[newIndex];
    if (card) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      scrollRef.current.scrollTo({
        left: card.offsetLeft - 16, // Account for padding
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        scrollToCard(activeIndex - 1);
      } else if (e.key === 'ArrowRight') {
        scrollToCard(activeIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex]);

  // Handle scroll events to update active index
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
      
      const scrollLeft = scrollRef.current.scrollLeft;
      const containerWidth = scrollRef.current.clientWidth;
      
      // Find the card that is most visible in the viewport
      const newActiveIndex = cardsRef.current.findIndex((card, index) => {
        if (!card) return false;
        const cardLeft = card.offsetLeft - scrollRef.current!.offsetLeft;
        const cardRight = cardLeft + card.clientWidth;
        
        // Card is at least partially visible
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

  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Nenhum depoimento adicionado ainda
      </div>
    );
  }

  return (
    <div
      className={`py-12 ${getBackgroundClass()}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="container max-w-6xl mx-auto px-4">
        <h2 
          id={`title-${title.toLowerCase().replace(/\s+/g, '-')}`} 
          className="text-3xl font-bold text-center mb-8"
        >
          {title}
        </h2>
        
        <div className="relative">
          {/* Desktop navigation arrows - only visible on hover and when there are multiple items */}
          {items.length > 1 && (
            <>
              <button 
                aria-label="Previous testimonial"
                onClick={() => scrollToCard(activeIndex - 1)}
                disabled={activeIndex === 0}
                className={`hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 h-10 w-10 items-center justify-center rounded-full bg-background/80 shadow-sm border border-muted/30 transition-opacity ${activeIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-0 hover:opacity-100'} ${isHovering ? 'opacity-70' : ''}`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <button 
                aria-label="Next testimonial"
                onClick={() => scrollToCard(activeIndex + 1)}
                disabled={activeIndex === items.length - 1}
                className={`hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 h-10 w-10 items-center justify-center rounded-full bg-background/80 shadow-sm border border-muted/30 transition-opacity ${activeIndex === items.length - 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-0 hover:opacity-100'} ${isHovering ? 'opacity-70' : ''}`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
          
          {/* Carousel container */}
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory scroll-pt-4 -mx-4 px-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex w-full gap-4 md:gap-6">
              {items.map((item, index) => (
                <div 
                  key={index}
                  ref={el => cardsRef.current[index] = el}
                  className="flex-shrink-0 w-full sm:w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] lg:w-[calc(33.333%-1.33rem)] snap-start"
                >
                  <Card className={getCardClass()}>
                    <CardContent className="p-0">
                      <Quote className="absolute top-5 right-5 w-8 h-8 text-primary/15" />
                      
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="w-10 h-10 shrink-0">
                          <AvatarImage src={item.avatar_url} alt={item.name} loading="lazy" />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {item.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{item.name}</p>
                          {item.role && (
                            <p className="text-xs text-muted-foreground">{item.role}</p>
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
                      
                      <div className="text-base leading-relaxed line-clamp-[12]">
                        {/* Add smart quotes if not present */}
                        {item.quote.startsWith('"') ? (
                          <p>{item.quote}</p>
                        ) : (
                          <p>"{item.quote}"</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
          
          {/* Pagination dots - only visible on mobile and when there are multiple items */}
          {items.length > 1 && (
            <div className="flex justify-center gap-2 mt-2">
              {items.map((_, index) => (
                <button
                  key={index}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={activeIndex === index}
                  onClick={() => scrollToCard(index)}
                  className={`h-2 rounded-full transition-all ${activeIndex === index ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// CSS for scrollbar hiding is imported from testimonials.css
