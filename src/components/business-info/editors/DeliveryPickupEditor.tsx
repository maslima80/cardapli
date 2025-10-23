/**
 * DeliveryPickup Editor - Chips + Text modes
 * 
 * Features:
 * - Title field
 * - Mode selector (chips/text)
 * - Quick chips presets
 * - Custom chip input
 * - Markdown text area
 * - Live preview
 */

import { useState } from 'react';
import { Truck, Plus, X } from 'lucide-react';
import { BusinessInfoDialog } from '../shared/BusinessInfoDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DeliveryPickupBlock } from '@/components/blocks/DeliveryPickupBlock';
import { upsertBusinessInfo } from '@/lib/businessInfo';
import { toast } from 'sonner';

interface DeliveryPickupEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: {
    title?: string;
    items?: Array<{ title: string }>;
    content_md?: string;
  };
  onSaved?: () => void;
}

const QUICK_CHIPS = [
  'Até 3 dias úteis',
  'Região: Grande SP',
  'Taxa sob consulta',
  'Retirada na loja',
  'Horário: seg–sáb 9h–18h',
  'Entrega grátis acima de R$ 100',
  'Frete calculado no checkout',
];

export function DeliveryPickupEditor({ open, onOpenChange, initialData, onSaved }: DeliveryPickupEditorProps) {
  const [title, setTitle] = useState(initialData?.title || 'Entrega & Retirada');
  const [mode, setMode] = useState<'chips' | 'text'>('chips');
  const [chips, setChips] = useState<string[]>(
    initialData?.items?.map(i => i.title) || ['Até 3 dias úteis', 'Região: Grande SP', 'Retirada na loja']
  );
  const [newChip, setNewChip] = useState('');
  const [textContent, setTextContent] = useState(
    initialData?.content_md || 'Entre em contato para combinar entrega ou retirada.'
  );
  const [saving, setSaving] = useState(false);

  const handleAddChip = (chip: string) => {
    if (chip && !chips.includes(chip)) {
      setChips([...chips, chip]);
      setNewChip('');
    }
  };

  const handleRemoveChip = (index: number) => {
    setChips(chips.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (mode === 'chips') {
        await upsertBusinessInfo('delivery', 'global', undefined, {
          title,
          items: chips.map(c => ({ title: c, description: '' })),
        });
      } else {
        await upsertBusinessInfo('delivery', 'global', undefined, {
          title,
          content_md: textContent,
        });
      }
      toast.success('Entrega & Retirada salvo com sucesso!');
      onSaved?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <BusinessInfoDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={Truck}
      title="Entrega & Retirada"
      description="Informe regiões atendidas, prazos, valores e horários"
      onSave={handleSave}
      onCancel={handleCancel}
      saving={saving}
      preview={
        <DeliveryPickupBlock
          mode="custom"
          custom={{
            title,
            variant: 'delivery_pickup',
            chips: mode === 'chips' ? chips : undefined,
            body_md: mode === 'text' ? textContent : undefined,
          }}
          design={{
            style: 'card',
            icon: 'truck',
            frame: true,
          }}
        />
      }
    >
      {/* Helpful Instructions */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-100 mb-2">
          💡 <strong>O que incluir:</strong>
        </p>
        <ul className="text-sm text-blue-900 dark:text-blue-100 space-y-1 ml-4 list-disc">
          <li><strong>Regiões:</strong> Onde você entrega (ex: "Região: Grande SP")</li>
          <li><strong>Prazos:</strong> Quanto tempo leva (ex: "Até 3 dias úteis")</li>
          <li><strong>Valores:</strong> Custo ou condições (ex: "Grátis acima de R$ 100")</li>
          <li><strong>Retirada:</strong> Se tem opção de retirar (ex: "Retirada na loja")</li>
          <li><strong>Horários:</strong> Quando entrega/retira (ex: "Seg–Sáb 9h–18h")</li>
        </ul>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label>Título da seção</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Entrega & Retirada"
        />
      </div>

      {/* Mode Selector */}
      <div className="space-y-3">
        <Label>Modo de edição</Label>
        <RadioGroup value={mode} onValueChange={(v) => setMode(v as any)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="chips" id="chips" />
            <Label htmlFor="chips" className="font-normal cursor-pointer">
              Lista (chips) — Recomendado
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="text" id="text" />
            <Label htmlFor="text" className="font-normal cursor-pointer">
              Texto livre (Markdown)
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Chips Mode */}
      {mode === 'chips' && (
        <div className="space-y-3">
          <div>
            <Label>Exemplos prontos (clique para adicionar)</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Escolha os que se aplicam ao seu negócio
            </p>
          </div>
          
          {/* Quick chips presets */}
          <div className="flex flex-wrap gap-2">
            {QUICK_CHIPS.map((chip) => (
              <Button
                key={chip}
                variant="outline"
                size="sm"
                onClick={() => handleAddChip(chip)}
                disabled={chips.includes(chip)}
              >
                <Plus className="w-3 h-3 mr-1" />
                {chip}
              </Button>
            ))}
          </div>

          {/* Current chips */}
          {chips.length > 0 && (
            <div className="space-y-2">
              <Label>Informações selecionadas (clique no X para remover)</Label>
              <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/30">
                {chips.map((chip, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {chip}
                    <button
                      onClick={() => handleRemoveChip(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Custom chip input */}
          <div className="space-y-2">
            <Label>Adicionar informação personalizada</Label>
            <div className="flex gap-2">
              <Input
                value={newChip}
                onChange={(e) => setNewChip(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChip(newChip);
                  }
                }}
                placeholder="Ex: Pedido mínimo R$ 50 para entrega"
              />
              <Button onClick={() => handleAddChip(newChip)} disabled={!newChip}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Digite e pressione Enter ou clique no + para adicionar
            </p>
          </div>
        </div>
      )}

      {/* Text Mode */}
      {mode === 'text' && (
        <div className="space-y-2">
          <Label>Descrição</Label>
          <Textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Ex.: Entrega em até 3 dias úteis na Grande SP. Retirada na Rua das Flores, 123."
            rows={6}
          />
        </div>
      )}
    </BusinessInfoDialog>
  );
}
