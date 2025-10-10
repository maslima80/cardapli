import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Truck, CreditCard, MapPin, Clock, Calendar, Info,
  AlertCircle, AlertTriangle, MessageCircle, Package,
  ShieldCheck, Heart, Star, Gift, ExternalLink
} from "lucide-react";
import { useEffect, useRef } from "react";

interface ImportantInfoItem {
  icon?: string;
  show_icon?: boolean;
  title: string;
  content: string;
  link_label?: string | null;
  link_url?: string | null;
  accent_color?: string | null;
}

interface ImportantInfoBlockProps {
  data: {
    title?: string;
    layout?: "list" | "cards";
    items?: ImportantInfoItem[];
    background?: "default" | "accent" | "cards_elevated";
  };
}

// Map of icon names to Lucide components
const iconMap: Record<string, React.ComponentType<any>> = {
  truck: Truck,
  "credit-card": CreditCard,
  "map-pin": MapPin,
  clock: Clock,
  calendar: Calendar,
  info: Info,
  "alert-circle": AlertCircle,
  "alert-triangle": AlertTriangle,
  "message-circle": MessageCircle,
  package: Package,
  "shield-check": ShieldCheck,
  heart: Heart,
  star: Star,
  gift: Gift,
};

export const ImportantInfoBlock = ({ data }: ImportantInfoBlockProps) => {
  const title = data.title || "Informações importantes";
  const layout = data.layout || "list";
  const items = data.items || [];
  const containerRef = useRef<HTMLDivElement>(null);

  // Animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: 0.1 }
    );

    const itemElements = containerRef.current?.querySelectorAll(".info-item");
    itemElements?.forEach((el) => observer.observe(el));

    return () => {
      itemElements?.forEach((el) => observer.unobserve(el));
    };
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Nenhuma informação adicionada ainda
      </div>
    );
  }

  // Get background class based on selected background
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

  // Get card class based on background
  const getCardClass = () => {
    const baseClass = "transition-all duration-300 rounded-xl";
    
    return `${baseClass} ${data.background === "cards_elevated" 
      ? "shadow-md hover:shadow-lg bg-card" 
      : "border p-4 sm:p-6"}`;  
  };

  return (
    <div className={`py-12 ${getBackgroundClass()}`}>
      <div className="container max-w-6xl mx-auto px-4">
        <h2 
          id={`title-${title.toLowerCase().replace(/\s+/g, '-')}`} 
          className="text-3xl font-bold text-center mb-8"
        >
          {title}
        </h2>
        
        <div 
          ref={containerRef}
          className={layout === "cards" 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-6"}
        >
          {items.map((item, index) => {
            const IconComponent = item.icon && iconMap[item.icon] 
              ? iconMap[item.icon] 
              : null;
            
            // Use accent_color if provided, otherwise use theme primary color
            const iconColor = item.accent_color || "var(--primary)";
            
            const renderContent = () => (
              <>
                <div className="flex items-start gap-4">
                  {item.show_icon !== false && IconComponent && (
                    <div className="flex-shrink-0 mt-1">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center" 
                        style={{ 
                          backgroundColor: `color-mix(in srgb, ${iconColor} 10%, transparent)`,
                          border: `1px solid color-mix(in srgb, ${iconColor} 20%, transparent)`
                        }}
                      >
                        <IconComponent 
                          className="w-5 h-5" 
                          style={{ color: iconColor }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <div className="space-y-2 whitespace-pre-wrap text-muted-foreground">
                      {item.content.split('\n').map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                      ))}
                    </div>
                    
                    {item.link_label && item.link_url && (
                      <Button 
                        variant="link" 
                        className="mt-2 p-0 h-auto font-medium gap-1.5"
                        style={{ color: iconColor }}
                        onClick={() => window.open(item.link_url || "#", "_blank")}
                      >
                        {item.link_label}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </>
            );
            
            if (layout === "cards") {
              return (
                <Card 
                  key={index} 
                  className={`${getCardClass()} info-item opacity-0 translate-y-4`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {renderContent()}
                </Card>
              );
            } else {
              return (
                <div 
                  key={index} 
                  className={`${data.background === "cards_elevated" ? getCardClass() : "border-b pb-6 last:border-b-0"} info-item opacity-0 translate-y-4`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {renderContent()}
                </div>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
};

// Add CSS for animations
const animationStyles = `
  .animate-in {
    animation: fadeInUp 0.5s ease forwards;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(1rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Add style tag to document head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = animationStyles;
  document.head.appendChild(style);
}
