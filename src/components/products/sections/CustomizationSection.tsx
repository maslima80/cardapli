import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface CustomizationSectionProps {
  accepts: boolean;
  instructions: string;
  onAcceptsChange: (value: boolean) => void;
  onInstructionsChange: (value: string) => void;
}

export function CustomizationSection({
  accepts,
  instructions,
  onAcceptsChange,
  onInstructionsChange,
}: CustomizationSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Personalização</h3>
        <p className="text-sm text-muted-foreground">
          Permite que clientes personalizem o produto
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="accepts_customization"
            checked={accepts}
            onCheckedChange={onAcceptsChange}
          />
          <Label
            htmlFor="accepts_customization"
            className="text-sm font-normal cursor-pointer"
          >
            Este produto aceita personalização
          </Label>
        </div>

        {accepts && (
          <div className="space-y-2">
            <Label htmlFor="customization_instructions">
              Instruções para o cliente
            </Label>
            <Textarea
              id="customization_instructions"
              placeholder="Informe o nome desejado ao fazer o pedido..."
              value={instructions}
              onChange={(e) => onInstructionsChange(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Explique como o cliente deve solicitar a personalização
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
