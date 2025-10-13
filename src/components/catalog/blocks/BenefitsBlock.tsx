import { Card } from "@/components/ui/card";
import { 
  Star, Shield, Truck, Leaf, MessageCircle, Gift, 
  Diamond, Clock, Hammer, Globe, ThumbsUp, Check,
  Star as IconStar
} from "lucide-react";
import { useEffect, useRef } from "react";

interface BenefitsBlockProps {
  data: {
    title?: string;
    subtitle?: string;
    items?: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
    layout?: "grid" | "list";
    background?: "default" | "accent" | "cards_elevated";
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

export const BenefitsBlock = ({ data }: BenefitsBlockProps) => {
  const items = data.items || [];
  const title = data.title || "Por que escolher a gente";
  const subtitle = data.subtitle || "";
  const layout = data.layout || "grid";
  const containerRef = useRef<HTMLDivElement>(null);

  // Animation on scroll
  useEffect(() => {
    // Add a small delay to ensure the elements are properly rendered in preview mode
    const animationTimeout = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("benefit-animate-in");
            }
          });
        },
        { threshold: 0.1 }
      );

      const itemElements = containerRef.current?.querySelectorAll(".benefit-item");
      itemElements?.forEach((el) => observer.observe(el));

      return () => {
        itemElements?.forEach((el) => observer.unobserve(el));
      };
    }, 100); // Small delay to ensure DOM is ready
    
    return () => {
      clearTimeout(animationTimeout);
    };
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Nenhum diferencial adicionado ainda
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

  // Get card class based on background and layout
  const getCardClass = () => {
    const baseClass = "transition-all duration-300";
    
    if (layout === "list") {
      return `${baseClass} ${data.background === "cards_elevated" ? "shadow-sm hover:shadow" : "border-b pb-4 last:border-b-0"}`;
    }
    
    return `${baseClass} rounded-2xl ${data.background === "cards_elevated" ? "shadow-md hover:shadow-lg bg-card" : "border p-4 sm:p-6"}`;
  };

  return (
    <div
      className={`py-12 ${getBackgroundClass()}`}
    >
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 
            id={`title-${title.toLowerCase().replace(/\s+/g, '-')}`} 
            className="text-3xl font-bold"
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-muted-foreground mt-2">{subtitle}</p>
          )}
        </div>
        
        <div 
          ref={containerRef}
          className={layout === "grid" 
            ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" 
            : "space-y-4"}
        >
          {items.map((item, index) => {
            const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Star;
            
            if (layout === "grid") {
              return (
                <Card 
                  key={index} 
                  className={`${getCardClass()} text-center benefit-item opacity-0 translate-y-4 benefit-animate-in`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </Card>
              );
            } else {
              return (
                <div 
                  key={index} 
                  className={`${getCardClass()} flex items-start gap-4 benefit-item opacity-0 translate-y-4 benefit-animate-in`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
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
  .benefit-animate-in {
    animation: benefitFadeInUp 0.5s ease forwards;
  }
  
  @keyframes benefitFadeInUp {
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
