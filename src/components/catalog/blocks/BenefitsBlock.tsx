import { Card } from "@/components/ui/card";
import { Star, Shield, Truck, Leaf } from "lucide-react";

interface BenefitsBlockProps {
  data: {
    title?: string;
    items?: Array<{
      icon: "star" | "shield" | "truck" | "leaf";
      title: string;
      description: string;
    }>;
    background?: "default" | "accent";
  };
}

const iconMap = {
  star: Star,
  shield: Shield,
  truck: Truck,
  leaf: Leaf,
};

export const BenefitsBlock = ({ data }: BenefitsBlockProps) => {
  const items = data.items || [];
  const title = data.title || "Por que escolher a gente";

  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Nenhum diferencial adicionado ainda
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {items.map((item, index) => {
            const Icon = iconMap[item.icon] || Star;
            return (
              <Card key={index} className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
