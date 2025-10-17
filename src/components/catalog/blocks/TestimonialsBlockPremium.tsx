import { useRef, useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Quote } from "lucide-react";

interface TestimonialsBlockProps {
  data: {
    title?: string;
    items?: Array<{
      name: string;
      quote: string;
      avatar_url?: string;
      role?: string;
    }>;
  };
}

export const TestimonialsBlockPremium = ({ data }: TestimonialsBlockProps) => {
  // Ensure items is always an array
  let items = [];
  
  if (data.items) {
    if (Array.isArray(data.items)) {
      items = data.items.filter(item => item && item.name && item.quote);
    } else if (typeof data.items === 'object') {
      items = Object.values(data.items).filter((item: any) => item && item.name && item.quote);
    }
  }
  
  const title = data.title || "O que dizem por aí?";
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

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

  if (items.length === 0) {
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
                      
                      <div>
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
