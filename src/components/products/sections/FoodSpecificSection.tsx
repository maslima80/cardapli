import React from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface FoodSpecificSectionProps {
  ingredients: string;
  allergens: string;
  conservation: string;
  onIngredientsChange: (value: string) => void;
  onAllergensChange: (value: string) => void;
  onConservationChange: (value: string) => void;
}

export function FoodSpecificSection({
  ingredients,
  allergens,
  conservation,
  onIngredientsChange,
  onAllergensChange,
  onConservationChange,
}: FoodSpecificSectionProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="space-y-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="p-6">
          <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
            <div>
              <h3 className="text-lg font-semibold mb-1">Vende alimentos?</h3>
              <p className="text-sm text-muted-foreground">
                Adicione informações nutricionais e de conservação
              </p>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-muted-foreground transition-transform ${
                isOpen ? "transform rotate-180" : ""
              }`}
            />
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ingredients">Ingredientes</Label>
              <Textarea
                id="ingredients"
                placeholder="Ex: Farinha de trigo, açúcar, ovos, manteiga..."
                value={ingredients}
                onChange={(e) => onIngredientsChange(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergens">Informações alérgicas</Label>
              <Textarea
                id="allergens"
                placeholder="Ex: Contém glúten, lactose e ovos. Pode conter traços de amendoim."
                value={allergens}
                onChange={(e) => onAllergensChange(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conservation">Conservação / Validade</Label>
              <Input
                id="conservation"
                placeholder="Ex: Conservar em local fresco e seco. Validade: 30 dias."
                value={conservation}
                onChange={(e) => onConservationChange(e.target.value)}
              />
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
