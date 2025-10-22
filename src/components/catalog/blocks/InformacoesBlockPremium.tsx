import { useRef, useState, useEffect } from "react";
import { 
  Star, Shield, Truck, Leaf, MessageCircle, Gift, 
  Diamond, Clock, Hammer, Globe, ThumbsUp, Check,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getBusinessInfo, BusinessInfoType } from "@/lib/businessInfo";

interface InformacoesBlockProps {
  data: {
    mode?: 'auto' | 'custom';
    section?: BusinessInfoType;
    auto?: {
      scope: 'global' | 'category' | 'tag' | 'product';
      scope_id?: string | null;
      fallback_to_global?: boolean;
    };
    title?: string;
    subtitle?: string;
    items?: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
    layout?: "grid" | "list";
  };
  userId?: string;
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

export const InformacoesBlockPremium = ({ data, userId }: InformacoesBlockProps) => {
  const [items, setItems] = useState(data.items || []);
  const [loading, setLoading] = useState(false);
  const title = data.title || "Informações importantes";
  const subtitle = data.subtitle || "";
  const layout = data.layout || "grid";
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Fetch business info if mode is auto
  useEffect(() => {
    if (data.mode === 'auto' && data.section) {
      fetchBusinessInfo();
    }
  }, [data.mode, data.section, data.auto]);

  const fetchBusinessInfo = async () => {
    if (!data.section) return;
    
    setLoading(true);
    try {
      // Try to get business info from the specified scope
      let businessInfo = await getBusinessInfo(
        data.section,
        data.auto?.scope || 'global',
        data.auto?.scope_id
      );

      // Fallback to global if not found and fallback is enabled
      if (!businessInfo && data.auto?.fallback_to_global !== false && data.auto?.scope !== 'global') {
        businessInfo = await getBusinessInfo(data.section, 'global');
      }

      if (businessInfo) {
        // Prefer items JSON
        if (businessInfo.items && businessInfo.items.length > 0) {
          // Ensure all required fields are present
          const validItems = businessInfo.items.map(item => ({
            icon: item.icon || 'star',
            title: item.title,
            description: item.description || '',
          }));
          setItems(validItems);
        } else if (businessInfo.content_md) {
          // Parse markdown to items (basic parsing)
          const parsedItems = parseMarkdownToItems(businessInfo.content_md);
          setItems(parsedItems);
        }
      }
    } catch (error) {
      console.error('Error fetching business info:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseMarkdownToItems = (markdown: string) => {
    const lines = markdown.split('\n').filter(line => line.trim());
    const items: Array<{ icon: string; title: string; description: string }> = [];
    
    for (const line of lines) {
      // Simple parsing: look for emoji at start, then title
      const match = line.match(/^([^a-zA-Z0-9\s]+)\s*(.+)$/);
      if (match) {
        items.push({
          icon: 'star', // Default icon
          title: match[2].trim(),
          description: '',
        });
      } else if (line.startsWith('-') || line.startsWith('•')) {
        items.push({
          icon: 'star',
          title: line.replace(/^[-•]\s*/, '').trim(),
          description: '',
        });
      }
    }
    
    return items;
  };

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
            <div className="text-center p-8 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700">
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Configure esta seção em <strong>Perfil → Informações do Negócio</strong> ou personalize este bloco.
              </p>
              {userId && (
                <a
                  href="/informacoes-negocio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                  Configurar agora
                </a>
              )}
            </div>
          </div>
        </div>
      );
    }
    
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
