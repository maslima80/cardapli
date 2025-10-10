import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Quote } from "lucide-react";

interface TestimonialsBlockProps {
  data: {
    title?: string;
    items?: Array<{
      name: string;
      quote: string;
      avatar_url?: string;
    }>;
    background?: "default" | "accent";
  };
}

export const TestimonialsBlock = ({ data }: TestimonialsBlockProps) => {
  const items = data.items || [];
  const title = data.title || "Depoimentos";

  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Nenhum depoimento adicionado ainda
      </div>
    );
  }

  return (
    <div
      className={`py-12 ${
        data.background === "accent" ? "bg-primary/5" : ""
      }`}
    >
      <div className="container max-w-6xl mx-auto px-4">
        <h2 id={`title-${title.toLowerCase().replace(/\s+/g, '-')}`} className="text-3xl font-bold text-center mb-8">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item, index) => (
            <Card key={index} className="p-6 relative">
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/20" />
              <div className="flex items-start gap-4">
                <Avatar className="w-12 h-12 shrink-0">
                  <AvatarImage src={item.avatar_url} alt={item.name} />
                  <AvatarFallback>
                    {item.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm italic mb-3">"{item.quote}"</p>
                  <p className="font-semibold text-sm">— {item.name}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
