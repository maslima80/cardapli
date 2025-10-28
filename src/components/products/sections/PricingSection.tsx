import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PricingSectionProps {
  price: number;
  priceUnit: string;
  priceUnitCustom: string;
  priceNote: string;
  minQty: number | null;
  priceOnRequest: boolean;
  priceOnRequestLabel: string;
  priceHidden: boolean;
  sku: string;
  onPriceChange: (value: number) => void;
  onPriceUnitChange: (value: string) => void;
  onPriceUnitCustomChange: (value: string) => void;
  onPriceNoteChange: (value: string) => void;
  onMinQtyChange: (value: number | null) => void;
  onPriceOnRequestChange: (value: boolean) => void;
  onPriceOnRequestLabelChange: (value: string) => void;
  onPriceHiddenChange: (value: boolean) => void;
  onSkuChange: (value: string) => void;
}

export function PricingSection({
  price,
  priceUnit,
  priceUnitCustom,
  priceNote,
  minQty,
  priceOnRequest,
  priceOnRequestLabel,
  priceHidden,
  sku,
  onPriceChange,
  onPriceUnitChange,
  onPriceUnitCustomChange,
  onPriceNoteChange,
  onMinQtyChange,
  onPriceOnRequestChange,
  onPriceOnRequestLabelChange,
  onPriceHiddenChange,
  onSkuChange,
}: PricingSectionProps) {
  const [showMoqInput, setShowMoqInput] = React.useState(!!minQty);

  // Update showMoqInput when minQty prop changes
  React.useEffect(() => {
    setShowMoqInput(!!minQty);
  }, [minQty]);
  const formatPreview = () => {
    if (priceOnRequest) {
      return priceOnRequestLabel || "Sob consulta";
    }

    const priceStr = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);

    const unit =
      priceUnit === "Outro" && priceUnitCustom
        ? priceUnitCustom
        : priceUnit.toLowerCase();

    const minQtyStr = minQty ? ` (mínimo ${minQty})` : "";

    return `${priceStr} por ${unit}${minQtyStr}`;
  };

  const handleMoqToggle = (checked: boolean) => {
    setShowMoqInput(checked);
    if (!checked) {
      onMinQtyChange(null);
    }
  };

  const handlePriceOnRequestToggle = (checked: boolean) => {
    onPriceOnRequestChange(checked);
    if (!checked && !priceOnRequestLabel) {
      onPriceOnRequestLabelChange("Sob consulta");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Preço e Disponibilidade</h3>
        <p className="text-sm text-muted-foreground">
          Configure valores e quantidades
        </p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Price on Request Toggle */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="space-y-1">
            <Label htmlFor="price_on_request">Preço sob consulta</Label>
            <p className="text-sm text-muted-foreground">
              Oculta campos de preço e exibe rótulo personalizado
            </p>
          </div>
          <Switch
            id="price_on_request"
            checked={priceOnRequest}
            onCheckedChange={handlePriceOnRequestToggle}
          />
        </div>

        {priceOnRequest ? (
          <div className="space-y-2">
            <Label htmlFor="price_on_request_label">Rótulo exibido</Label>
            <Input
              id="price_on_request_label"
              placeholder="Sob consulta"
              value={priceOnRequestLabel}
              onChange={(e) => onPriceOnRequestLabelChange(e.target.value)}
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">
                  Preço base
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="89.90"
                  value={price || ""}
                  onChange={(e) => onPriceChange(parseFloat(e.target.value) || 0)}
                  onBlur={(e) => {
                    // Format to 2 decimal places when user finishes typing
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value) && value > 0) {
                      onPriceChange(parseFloat(value.toFixed(2)));
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price_unit">
                  Preço por
                </Label>
                <Select value={priceUnit} onValueChange={onPriceUnitChange}>
                  <SelectTrigger id="price_unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Unidade">Unidade</SelectItem>
                    <SelectItem value="Kit">Kit</SelectItem>
                    <SelectItem value="Kg">Kg</SelectItem>
                    <SelectItem value="Hora">Hora</SelectItem>
                    <SelectItem value="Serviço">Serviço</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {priceUnit === "Outro" && (
              <div className="space-y-2">
                <Label htmlFor="price_unit_custom">Especifique a unidade</Label>
                <Input
                  id="price_unit_custom"
                  placeholder="Ex: dúzia, pacote, metro"
                  value={priceUnitCustom}
                  onChange={(e) => onPriceUnitCustomChange(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="price_note">Nota de preço (opcional)</Label>
              <Input
                id="price_note"
                placeholder="Preço por 50 peças"
                value={priceNote}
                onChange={(e) => onPriceNoteChange(e.target.value)}
              />
            </div>
          </>
        )}

        {/* MOQ Toggle */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label htmlFor="moq_toggle">Definir quantidade mínima (MOQ)?</Label>
              <p className="text-sm text-muted-foreground">
                Estabeleça um pedido mínimo
              </p>
            </div>
            <Switch
              id="moq_toggle"
              checked={showMoqInput}
              onCheckedChange={handleMoqToggle}
            />
          </div>

          {showMoqInput && (
            <div className="space-y-2">
              <Label htmlFor="min_qty">Quantidade mínima</Label>
              <Input
                id="min_qty"
                type="number"
                placeholder="1"
                value={minQty || ""}
                onChange={(e) =>
                  onMinQtyChange(e.target.value ? parseInt(e.target.value) : null)
                }
                min="1"
              />
            </div>
          )}
        </div>

        {/* Price Hidden Toggle */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-border">
          <div className="space-y-1">
            <Label htmlFor="price_hidden">Ocultar preço no catálogo</Label>
            <p className="text-sm text-muted-foreground">
              O preço não será exibido na listagem pública
            </p>
          </div>
          <Switch
            id="price_hidden"
            checked={priceHidden}
            onCheckedChange={onPriceHiddenChange}
          />
        </div>

        {/* SKU */}
        <div className="space-y-2 pt-4 border-t border-border">
          <Label htmlFor="sku">SKU (opcional)</Label>
          <Input
            id="sku"
            placeholder="Ex: PROD-001"
            value={sku}
            onChange={(e) => onSkuChange(e.target.value)}
          />
        </div>

        {/* Preview */}
        <div className="bg-secondary/50 rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-1">
            Previsualização:
          </p>
          <p className="font-medium">{formatPreview()}</p>
        </div>
      </Card>
    </div>
  );
}
