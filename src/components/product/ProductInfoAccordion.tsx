import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Leaf, AlertTriangle, Snowflake, Info } from "lucide-react";

interface ProductInfoAccordionProps {
  ingredients?: string | null;
  allergens?: string | null;
  conservation?: string | null;
  description?: string | null;
}

export const ProductInfoAccordion = ({
  ingredients,
  allergens,
  conservation,
  description,
}: ProductInfoAccordionProps) => {
  const hasAnyInfo = ingredients || allergens || conservation || description;

  if (!hasAnyInfo) {
    return null;
  }

  const items = [];

  if (description) {
    items.push({
      value: "description",
      icon: Info,
      title: "Descrição",
      content: description,
      iconColor: "text-blue-600",
    });
  }

  if (ingredients) {
    items.push({
      value: "ingredients",
      icon: Leaf,
      title: "Ingredientes",
      content: ingredients,
      iconColor: "text-green-600",
    });
  }

  if (allergens) {
    items.push({
      value: "allergens",
      icon: AlertTriangle,
      title: "Alérgenos",
      content: allergens,
      iconColor: "text-amber-600",
    });
  }

  if (conservation) {
    items.push({
      value: "conservation",
      icon: Snowflake,
      title: "Conservação",
      content: conservation,
      iconColor: "text-cyan-600",
    });
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Informações
      </h3>
      
      <Accordion type="single" collapsible className="w-full">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <AccordionItem key={item.value} value={item.value} className="border-b">
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${item.iconColor}`} />
                  <span className="font-medium text-sm">{item.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-1">
                <div 
                  className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: item.content }}
                />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};
