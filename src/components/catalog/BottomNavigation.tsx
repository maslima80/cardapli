import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface NavigationItem {
  id: string;
  label: string;
  anchor: string;
}

interface BottomNavigationProps {
  items: NavigationItem[];
}

export const BottomNavigation = ({ items }: BottomNavigationProps) => {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const handleScroll = () => {
      // Find which section is currently in view
      const sections = items.map(item => ({
        id: item.id,
        element: document.getElementById(item.anchor)
      })).filter(s => s.element);

      // Find the section that's most visible
      let currentSection = "";
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      for (const section of sections) {
        if (section.element) {
          const top = section.element.offsetTop;
          if (scrollPosition >= top) {
            currentSection = section.id;
          }
        }
      }

      setActiveId(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, [items]);

  const scrollToSection = (anchor: string) => {
    const element = document.getElementById(anchor);
    if (element) {
      const offset = 80; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pb-safe">
      {/* Backdrop blur effect */}
      <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-border/50" />
      
      {/* Navigation content */}
      <div className="relative">
        <div className="container max-w-[1120px] mx-auto px-4">
          {/* Horizontal scrollable nav */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-3 snap-x snap-mandatory">
            {items.map((item) => {
              const isActive = activeId === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.anchor)}
                  className={cn(
                    "flex-shrink-0 snap-center px-4 py-2.5 rounded-full font-medium text-sm transition-all duration-300 whitespace-nowrap",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg scale-105"
                      : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground hover:scale-105"
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
