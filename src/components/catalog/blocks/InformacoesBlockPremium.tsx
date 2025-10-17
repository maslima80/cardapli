import { useRef, useState, useEffect } from "react";
import { 
  Star, Shield, Truck, Leaf, MessageCircle, Gift, 
  Diamond, Clock, Hammer, Globe, ThumbsUp, Check,
} from "lucide-react";

interface InformacoesBlockProps {
  data: {
    title?: string;
    subtitle?: string;
    items?: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
    layout?: "grid" | "list";
  };
}

const iconMap = {
  star: Star,
  shield: Shield,
  truck: Truck,
  leaf: Leaf,
  chat: MessageCircle,
  gift: Gift,
  diamond: Diamond,
  clock: Clock,
  hammer: Hammer,
  globe: Globe,
  thumbsUp: ThumbsUp,
  check: Check,
};

export const InformacoesBlockPremium = ({ data }: InformacoesBlockProps) => {
  const items = data.items || [];
  const title = data.title || "Informações importantes";
  const subtitle = data.subtitle || "";
  const layout = data.layout || "grid";
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Handle scroll events to update active index (for grid/swipe mode)
  useEffect(() => {
    if (layout !== "grid") return;
    
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

  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-slate-600 dark:text-slate-400">
        Nenhuma informação adicionada ainda
      </div>
    );
  }

  // List layout - vertical stack
  if (layout === "list") {
    return (
      <div className="py-12">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 
              className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2"
              style={{ fontFamily: 'var(--font-heading, inherit)' }}
            >
              {title}
            </h2>
            {subtitle && (
              <p 
                className="text-slate-600 dark:text-slate-400"
                style={{ fontFamily: 'var(--font-body, inherit)' }}
              >
                {subtitle}
              </p>
            )}
          </div>
          
          <div className="space-y-4">
            {items.map((item, index) => {
              const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Star;
              
              return (
                <div 
                  key={index} 
                  className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-sm transition-shadow"
                >
                  <div className="flex-shrink-0">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--accent-color, #8B5CF6)' }}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 
                      className="font-semibold text-base mb-1 text-slate-900 dark:text-slate-50"
                      style={{ fontFamily: 'var(--font-heading, inherit)' }}
                    >
                      {item.title}
                    </h3>
                    <p 
                      className="text-sm text-slate-700 dark:text-slate-300"
                      style={{ fontFamily: 'var(--font-body, inherit)' }}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Grid layout - horizontal swipe
  return (
    <div className="py-12">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 
            className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2"
            style={{ fontFamily: 'var(--font-heading, inherit)' }}
          >
            {title}
          </h2>
          {subtitle && (
            <p 
              className="text-slate-600 dark:text-slate-400"
              style={{ fontFamily: 'var(--font-body, inherit)' }}
            >
              {subtitle}
            </p>
          )}
        </div>
        
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
              {items.map((item, index) => {
                const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Star;
                
                return (
                  <div 
                    key={index}
                    ref={el => cardsRef.current[index] = el}
                    className="flex-shrink-0 w-[85%] sm:w-[280px] snap-start"
                  >
                    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 text-center h-full flex flex-col">
                      <div className="flex justify-center mb-4">
                        <div 
                          className="w-14 h-14 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: 'var(--accent-color, #8B5CF6)' }}
                        >
                          <IconComponent className="w-7 h-7 text-white" />
                        </div>
                      </div>
                      <h3 
                        className="font-semibold text-lg mb-2 text-slate-900 dark:text-slate-50"
                        style={{ fontFamily: 'var(--font-heading, inherit)' }}
                      >
                        {item.title}
                      </h3>
                      <p 
                        className="text-sm text-slate-700 dark:text-slate-300 flex-1"
                        style={{ fontFamily: 'var(--font-body, inherit)' }}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
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
