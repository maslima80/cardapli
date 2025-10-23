/**
 * Simplified HowToBuy Editor - Easy for non-tech users
 * 
 * Features:
 * - Pre-filled with smart default template
 * - Just edit the text, no icon selection
 * - Clear instructions for each step
 * - Live preview with numbered steps
 * - One-click presets for common flows
 */

import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { BusinessInfoDialog } from '../shared/BusinessInfoDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
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

// Smart default template - works for most businesses
const DEFAULT_STEPS: HowToBuyStep[] = [
  { 
    title: 'Escolha o produto', 
    description: 'Navegue pelo catálogo e escolha o que deseja' 
  },
  { 
    title: 'Entre em contato', 
    description: 'Clique no WhatsApp e envie o nome do produto' 
  },
  { 
    title: 'Confirme o pedido', 
    description: 'Combine forma de pagamento e entrega' 
  },
  { 
    title: 'Receba seu pedido', 
    description: 'Retire no local ou receba em casa' 
  },
];

// Example templates to inspire users
const QUICK_PRESETS = [
  {
    label: '🎂 Exemplo: Bolos e Doces',
    description: 'Confeitarias, docerias, bolos personalizados',
    steps: [
      { title: 'Escolha o produto', description: 'Veja nossos bolos e doces disponíveis' },
      { title: 'Faça seu pedido', description: 'Entre em contato pelo WhatsApp' },
      { title: 'Confirme os detalhes', description: 'Data de entrega, sabor e decoração' },
      { title: 'Retire ou receba', description: 'Retire na loja ou receba em casa' },
    ],
  },
  {
    label: '🍕 Exemplo: Delivery',
    description: 'Restaurantes, lanchonetes, comida para entrega',
    steps: [
      { title: 'Monte seu pedido', description: 'Escolha os itens do cardápio' },
      { title: 'Envie pelo WhatsApp', description: 'Mande a lista do que deseja' },
      { title: 'Informe o endereço', description: 'Para calcularmos a entrega' },
      { title: 'Aguarde a entrega', description: 'Seu pedido chegará em breve' },
    ],
  },
  {
    label: '🛍️ Exemplo: Loja Online',
    description: 'E-commerce, vendas online, produtos variados',
    steps: [
      { title: 'Adicione ao carrinho', description: 'Selecione os produtos desejados' },
      { title: 'Finalize o pedido', description: 'Entre em contato para confirmar' },
      { title: 'Realize o pagamento', description: 'Pix, cartão ou transferência' },
      { title: 'Receba em casa', description: 'Entregamos ou enviamos pelos Correios' },
    ],
  },
];

export function HowToBuyEditorSimple({ open, onOpenChange, initialData, onSaved }: HowToBuyEditorProps) {
  const [title, setTitle] = useState(initialData?.title || 'Como Comprar');
  const [steps, setSteps] = useState<HowToBuyStep[]>(
    initialData?.items || DEFAULT_STEPS
  );
  const [saving, setSaving] = useState(false);

  const handleUpdateStep = (index: number, field: 'title' | 'description', value: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const handleApplyPreset = (preset: typeof QUICK_PRESETS[0]) => {
    setSteps(preset.steps);
    toast.success(`Modelo "${preset.label}" aplicado!`);
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
      description="Explique para seus clientes como fazer um pedido"
      onSave={handleSave}
      onCancel={handleCancel}
      saving={saving}
      preview={
        <HowToBuyBlock
          mode="custom"
          custom={{
            title,
            layout: 'stacked',
            show_numbers: true,
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
      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          💡 <strong>Dica:</strong> Já preenchemos com um modelo básico. Basta editar o texto para se adequar ao seu negócio!
        </p>
      </div>

      {/* Quick Presets */}
      <div className="space-y-3">
        <Label>Exemplos de como usar (clique para aplicar)</Label>
        <p className="text-sm text-muted-foreground">
          Veja alguns exemplos e adapte para o seu negócio
        </p>
        <div className="grid gap-2">
          {QUICK_PRESETS.map((preset, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={() => handleApplyPreset(preset)}
              className="justify-start h-auto py-3 px-4"
            >
              <div className="text-left">
                <div className="font-semibold">{preset.label}</div>
                <div className="text-xs text-muted-foreground">{preset.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label>Título da seção</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Como Comprar"
        />
        <p className="text-xs text-muted-foreground">
          Este é o título que aparecerá no catálogo
        </p>
      </div>

      {/* Steps - Simple text editing */}
      <div className="space-y-4">
        <Label>Passos do processo (edite o texto abaixo)</Label>
        
        {steps.map((step, index) => (
          <div key={index} className="space-y-3 p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                {index + 1}
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Passo {index + 1}
              </span>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`step-${index}-title`}>Título do passo</Label>
              <Input
                id={`step-${index}-title`}
                value={step.title}
                onChange={(e) => handleUpdateStep(index, 'title', e.target.value)}
                placeholder="Ex: Escolha o produto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`step-${index}-description`}>Explicação</Label>
              <Textarea
                id={`step-${index}-description`}
                value={step.description}
                onChange={(e) => handleUpdateStep(index, 'description', e.target.value)}
                placeholder="Ex: Navegue pelo catálogo e escolha o que deseja"
                rows={2}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Helper text */}
      <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
        <strong>Exemplos de passos comuns:</strong>
        <ul className="mt-2 space-y-1 ml-4 list-disc">
          <li>"Escolha o produto" → "Navegue pelo catálogo"</li>
          <li>"Entre em contato" → "Clique no WhatsApp"</li>
          <li>"Confirme o pedido" → "Combine pagamento e entrega"</li>
          <li>"Receba" → "Retire na loja ou receba em casa"</li>
        </ul>
      </div>
    </BusinessInfoDialog>
  );
}
