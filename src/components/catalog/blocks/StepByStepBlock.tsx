import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Search,
  MessageCircle,
  CreditCard,
  Truck,
  Pencil,
  Package,
  Calendar,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { useEffect, useRef } from "react";

interface Step {
  title: string;
  description: string;
  icon?: string;
  cta_label?: string | null;
  cta_url?: string | null;
}

interface StepByStepBlockProps {
  data: {
    title?: string;
    subtitle?: string;
    layout?: "timeline" | "cards";
    steps?: Step[];
    background?: "default" | "accent" | "cards_elevated";
  };
}

const iconMap = {
  search: Search,
  "message-circle": MessageCircle,
  "credit-card": CreditCard,
  truck: Truck,
  pencil: Pencil,
  package: Package,
  calendar: Calendar,
  "check-circle": CheckCircle,
};

export const StepByStepBlock = ({ data }: StepByStepBlockProps) => {
  const steps = data.steps || [];
  const title = data.title || "Passo a passo";
  const subtitle = data.subtitle || "";
  const layout = data.layout || "timeline";
  const containerRef = useRef<HTMLDivElement>(null);

  // Animation on scroll
  useEffect(() => {
    // Add a small delay to ensure the elements are properly rendered in preview mode
    const animationTimeout = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("step-animate-in");
            }
          });
        },
        { threshold: 0.1 }
      );

      const itemElements = containerRef.current?.querySelectorAll(".step-item");
      itemElements?.forEach((el) => observer.observe(el));

      return () => {
        itemElements?.forEach((el) => observer.unobserve(el));
      };
    }, 100); // Small delay to ensure DOM is ready
    
    return () => {
      clearTimeout(animationTimeout);
    };
  }, [steps]);

  if (steps.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Nenhum passo adicionado ainda
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
    const baseClass = "transition-all duration-300 rounded-2xl";
    
    return `${baseClass} ${data.background === "cards_elevated" 
      ? "shadow-md hover:shadow-lg bg-card" 
      : "border p-4 sm:p-6"}`;
  };

  // Render timeline layout
  const renderTimeline = () => (
    <div className="relative pl-8 sm:pl-12 py-4" ref={containerRef}>
      {/* Vertical line */}
      <div className="absolute left-4 sm:left-6 top-0 h-full w-0.5 bg-primary/20"></div>

      {steps.map((step, index) => {
        const IconComponent = step.icon && iconMap[step.icon as keyof typeof iconMap] 
          ? iconMap[step.icon as keyof typeof iconMap] 
          : null;
        
        return (
          <div 
            key={index} 
            className="mb-8 last:mb-0 relative step-item opacity-0 translate-y-4 step-animate-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Circle with number or icon */}
            <div className="absolute left-[-32px] sm:left-[-48px] top-0 w-8 h-8 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-semibold">
              {IconComponent ? (
                <IconComponent className="w-4 h-4 text-primary" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>

            {/* Content */}
            <div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground mb-3">{step.description}</p>
              
              {/* Optional CTA button */}
              {step.cta_label && step.cta_url && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5"
                  onClick={() => window.open(step.cta_url || "#", "_blank")}
                >
                  {step.cta_label}
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Render cards layout
  const renderCards = () => (
    <div 
      ref={containerRef}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {steps.map((step, index) => {
        const IconComponent = step.icon && iconMap[step.icon as keyof typeof iconMap] 
          ? iconMap[step.icon as keyof typeof iconMap] 
          : null;
        
        return (
          <Card 
            key={index} 
            className={`${getCardClass()} step-item opacity-0 translate-y-4 step-animate-in`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start gap-4">
              {/* Number badge */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {IconComponent ? (
                  <IconComponent className="w-5 h-5 text-primary" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground mb-3">{step.description}</p>
                
                {/* Optional CTA button */}
                {step.cta_label && step.cta_url && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1.5 mt-2"
                    onClick={() => window.open(step.cta_url || "#", "_blank")}
                  >
                    {step.cta_label}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className={`py-12 ${getBackgroundClass()}`}>
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
        
        {layout === "timeline" ? renderTimeline() : renderCards()}
      </div>
    </div>
  );
};

// Add CSS for animations
const animationStyles = `
  .step-animate-in {
    animation: stepFadeInUp 0.5s ease forwards;
  }
  
  @keyframes stepFadeInUp {
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
