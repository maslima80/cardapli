/**
 * HowToBuy Editor - Steps builder with presets
 * 
 * Features:
 * - Title field
 * - Layout selector (stacked/carousel)
 * - Steps list editor (icon, title, description)
 * - One-click presets
 * - Show numbers toggle
 * - Live preview
 */

import { useState, useEffect } from 'react';
import { ShoppingBag, Plus, GripVertical, Trash2 } from 'lucide-react';
import { BusinessInfoDialog } from '../shared/BusinessInfoDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { HowToBuyBlock } from '@/components/blocks/HowToBuyBlock';
import { upsertBusinessInfo } from '@/lib/businessInfo';
import { toast } from 'sonner';
import type { HowToBuyStep } from '@/components/blocks/types/specializedBlocks';

interface HowToBuyEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: {
    title?: string;
    items?: HowToBuyStep[];
  };
  onSaved?: () => void;
}

const PRESETS = [
  {
    label: 'WhatsApp + Pagamento + Entrega',
    steps: [
      { icon: '🛍️', title: 'Escolha o produto', description: 'Navegue pelo catálogo' },
      { icon: '💬', title: 'Fale no WhatsApp', description: 'Envie mensagem com o nome do produto' },
      { icon: '💳', title: 'Pagamento', description: 'Pix, MB Way ou cartão via link' },
      { icon: '🚚', title: 'Entrega/Retirada', description: 'Combine a melhor opção' },
    ],
  },
  {
    label: 'Carrinho + Endereço + Pagamento',
    steps: [
      { icon: '🛒', title: 'Adicione ao carrinho', description: 'Escolha os produtos desejados' },
      { icon: '📍', title: 'Informe o endereço', description: 'Para calcular o frete' },
      { icon: '💳', title: 'Pagamento', description: 'Escolha a forma de pagamento' },
      { icon: '✅', title: 'Confirmação', description: 'Receba a confirmação por WhatsApp' },
    ],
  },
  {
    label: 'Cotação + Aprovação + Produção',
    steps: [
      { icon: '📝', title: 'Solicite cotação', description: 'Envie suas especificações' },
      { icon: '✅', title: 'Aprovação', description: 'Confirme o orçamento' },
      { icon: '🏭', title: 'Produção', description: 'Acompanhe o andamento' },
      { icon: '📦', title: 'Envio', description: 'Receba seu pedido' },
    ],
  },
];

const ICON_OPTIONS = ['🛍️', '💬', '💳', '🚚', '📦', '✅', '🛒', '📍', '📝', '🏭', '⭐', '🎁', '🔔', '📞', '✨'];

export function HowToBuyEditor({ open, onOpenChange, initialData, onSaved }: HowToBuyEditorProps) {
  const [title, setTitle] = useState(initialData?.title || 'Como Comprar');
  const [layout, setLayout] = useState<'stacked' | 'carousel'>('stacked');
  const [showNumbers, setShowNumbers] = useState(true);
  const [steps, setSteps] = useState<HowToBuyStep[]>(
    initialData?.items || [
      { icon: '🛍️', title: 'Escolha o produto', description: 'Selecione os itens neste catálogo' },
      { icon: '💬', title: 'WhatsApp', description: 'Envie uma mensagem com o nome do produto' },
      { icon: '💳', title: 'Pagamento', description: 'Aceitamos Pix/MB Way ou cartão via link' },
      { icon: '🚚', title: 'Entrega/Retirada', description: 'Combine a melhor opção' },
    ]
  );
  const [saving, setSaving] = useState(false);

  const handleAddStep = () => {
    setSteps([...steps, { icon: '•', title: '', description: '' }]);
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleUpdateStep = (index: number, field: keyof HowToBuyStep, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setSteps(preset.steps);
    toast.success('Modelo aplicado!');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertBusinessInfo('how_to_buy', 'global', undefined, {
        title,
        items: steps,
      });
      toast.success('Como Comprar salvo com sucesso!');
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
      icon={ShoppingBag}
      title="Como Comprar / Encomendar"
      description="Guie seus clientes pelo processo de compra"
      onSave={handleSave}
      onCancel={handleCancel}
      saving={saving}
      preview={
        <HowToBuyBlock
          mode="custom"
          custom={{
            title,
            layout,
            show_numbers: showNumbers,
            steps,
          }}
          design={{
            accent: 'brand',
            frame: true,
            bg: 'soft',
          }}
        />
      }
    >
      {/* Title */}
      <div className="space-y-2">
        <Label>Título</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Como Comprar"
        />
      </div>

      {/* Layout */}
      <div className="space-y-3">
        <Label>Layout</Label>
        <RadioGroup value={layout} onValueChange={(v) => setLayout(v as any)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="stacked" id="stacked" />
            <Label htmlFor="stacked" className="font-normal cursor-pointer">
              Empilhado (vertical)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="carousel" id="carousel" />
            <Label htmlFor="carousel" className="font-normal cursor-pointer">
              Carrossel (horizontal deslizante)
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Show Numbers Toggle */}
      <div className="flex items-center justify-between">
        <Label htmlFor="show-numbers">Mostrar números (1, 2, 3...)</Label>
        <Switch
          id="show-numbers"
          checked={showNumbers}
          onCheckedChange={setShowNumbers}
        />
      </div>

      {/* Presets */}
      <div className="space-y-3">
        <Label>Modelos prontos (clique para aplicar)</Label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleApplyPreset(preset)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        <Label>Passos</Label>
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3 bg-card">
              <div className="flex items-start gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground mt-2" />
                <div className="flex-1 space-y-3">
                  {/* Icon Selector */}
                  <div className="flex gap-2 flex-wrap">
                    {ICON_OPTIONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => handleUpdateStep(index, 'icon', icon)}
                        className={`w-8 h-8 rounded border flex items-center justify-center text-lg hover:bg-muted transition-colors ${
                          step.icon === icon ? 'border-primary bg-primary/10' : ''
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>

                  {/* Title */}
                  <Input
                    value={step.title}
                    onChange={(e) => handleUpdateStep(index, 'title', e.target.value)}
                    placeholder="Título do passo"
                  />

                  {/* Description */}
                  <Textarea
                    value={step.description}
                    onChange={(e) => handleUpdateStep(index, 'description', e.target.value)}
                    placeholder="Descrição (opcional)"
                    rows={2}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveStep(index)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={handleAddStep} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar passo
        </Button>
      </div>
    </BusinessInfoDialog>
  );
}
