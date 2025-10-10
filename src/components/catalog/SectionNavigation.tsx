import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  title: string;
  anchor: string;
}

interface SectionNavigationProps {
  sections: Section[];
}

export const SectionNavigation = ({ sections }: SectionNavigationProps) => {
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-100px 0px -66%",
      }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.anchor);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (anchor: string) => {
    const element = document.getElementById(anchor);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  if (sections.length === 0) return null;

  if (isMobile) {
    return (
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="overflow-x-auto hide-scrollbar">
          <div className="flex gap-2 px-4 py-3 min-w-max">
            {sections.map((section) => (
              <button
                key={section.anchor}
                onClick={() => scrollToSection(section.anchor)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                  activeSection === section.anchor
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <nav className="fixed right-8 top-1/2 -translate-y-1/2 z-40 hidden lg:block">
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border border-border rounded-2xl p-3 shadow-lg">
        <div className="flex flex-col gap-2">
          {sections.map((section) => (
            <button
              key={section.anchor}
              onClick={() => scrollToSection(section.anchor)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-colors text-left",
                activeSection === section.anchor
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
              title={section.title}
            >
              <span className="line-clamp-1">{section.title}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};
