import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface BasicInfoSectionProps {
  title: string;
  description: string;
  status: string;
  productionDays: number | null;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onProductionDaysChange: (value: number | null) => void;
}

export function BasicInfoSection({
  title,
  description,
  status,
  productionDays,
  onTitleChange,
  onDescriptionChange,
  onStatusChange,
  onProductionDaysChange,
}: BasicInfoSectionProps) {
  const [showOptionalLeadTime, setShowOptionalLeadTime] = useState(!!productionDays);

  const shouldShowLeadTime = () => {
    if (status === "Sob encomenda") return true;
    if (status === "Disponível" && showOptionalLeadTime) return true;
    return false;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Informações Básicas</h3>
        <p className="text-sm text-muted-foreground">
          Detalhes principais do produto
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">
            Nome do produto <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            placeholder="Bolo de Chocolate 1 kg"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            placeholder="Bolo caseiro feito com chocolate belga..."
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="Disponível">Disponível</SelectItem>
              <SelectItem value="Sob encomenda">Sob encomenda</SelectItem>
              <SelectItem value="Indisponível">Indisponível</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lead time for "Sob encomenda" - always visible and prominent */}
        {status === "Sob encomenda" && (
          <div className="space-y-2 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <Label htmlFor="production_days" className="text-base font-medium">
              Prazo de produção (dias) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="production_days"
              type="number"
              placeholder="Ex: 3"
              value={productionDays || ""}
              onChange={(e) =>
                onProductionDaysChange(
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              min="0"
              className="text-base"
            />
            <p className="text-xs text-muted-foreground">
              Informe quantos dias são necessários para produzir este item
            </p>
          </div>
        )}

        {/* Optional lead time for "Disponível" - collapsible */}
        {status === "Disponível" && (
          <div className="space-y-2">
            {!showOptionalLeadTime ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowOptionalLeadTime(true)}
                className="w-full justify-between"
              >
                Adicionar prazo/entrega (opcional)
                <ChevronDown className="h-4 w-4" />
              </Button>
            ) : (
              <div className="space-y-2 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label htmlFor="production_days_optional">
                    Prazo de produção/entrega (dias)
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowOptionalLeadTime(false);
                      onProductionDaysChange(null);
                    }}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  id="production_days_optional"
                  type="number"
                  placeholder="Ex: 2"
                  value={productionDays || ""}
                  onChange={(e) =>
                    onProductionDaysChange(
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  min="0"
                />
                <p className="text-xs text-muted-foreground">
                  Tempo estimado para produção ou entrega
                </p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
