/**
 * Settings drawer for HowToBuy block
 * Allows switching between auto/custom modes and editing content
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import type { HowToBuyStep } from '@/components/blocks/types/specializedBlocks';

interface HowToBuySettingsProps {
  data: any;
  onChange: (data: any) => void;
}

const ICON_OPTIONS = ['🛍️', '💬', '💳', '🚚', '📦', '✅', '🛒', '📍', '📝', '🏭', '⭐', '🎁', '🔔', '📞', '✨'];

export function HowToBuySettings({ data, onChange }: HowToBuySettingsProps) {
  const [mode, setMode] = useState<'auto' | 'custom'>(data.mode || 'auto');
  const [customContent, setCustomContent] = useState(data.custom || {
    title: 'Como Comprar',
    layout: 'stacked',
    show_numbers: true,
    steps: [],
  });

  const handleModeChange = (newMode: 'auto' | 'custom') => {
    setMode(newMode);
    onChange({ ...data, mode: newMode });
  };

  const handleCustomChange = (updates: any) => {
    const newCustom = { ...customContent, ...updates };
    setCustomContent(newCustom);
    onChange({ ...data, custom: newCustom });
  };

  const handleAddStep = () => {
    const newSteps = [...(customContent.steps || []), { icon: '•', title: '', description: '' }];
    handleCustomChange({ steps: newSteps });
  };

  const handleRemoveStep = (index: number) => {
    const newSteps = customContent.steps.filter((_: any, i: number) => i !== index);
    handleCustomChange({ steps: newSteps });
  };

  const handleUpdateStep = (index: number, field: keyof HowToBuyStep, value: string) => {
    const newSteps = [...customContent.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    handleCustomChange({ steps: newSteps });
  };

  return (
    <div className="space-y-6 p-4">
      {/* Mode Selector */}
      <div className="space-y-3">
        <Label>Modo de Conteúdo</Label>
        <RadioGroup value={mode} onValueChange={(v) => handleModeChange(v as any)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="auto" id="auto" />
            <Label htmlFor="auto" className="font-normal cursor-pointer">
              Automático (usa informações do perfil)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="custom" id="custom" />
            <Label htmlFor="custom" className="font-normal cursor-pointer">
              Personalizado (editar neste catálogo)
            </Label>
          </div>
        </RadioGroup>
      </div>

      {mode === 'auto' && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            💡 Este bloco está sincronizado com as informações em <strong>/informacoes-negocio</strong>.
            Alterações lá serão refletidas aqui automaticamente.
          </p>
        </div>
      )}

      {mode === 'custom' && (
        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              value={customContent.title || ''}
              onChange={(e) => handleCustomChange({ title: e.target.value })}
              placeholder="Como Comprar"
            />
          </div>

          {/* Layout */}
          <div className="space-y-3">
            <Label>Layout</Label>
            <RadioGroup 
              value={customContent.layout || 'stacked'} 
              onValueChange={(v) => handleCustomChange({ layout: v })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="stacked" id="stacked" />
                <Label htmlFor="stacked" className="font-normal cursor-pointer">
                  Empilhado
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="carousel" id="carousel" />
                <Label htmlFor="carousel" className="font-normal cursor-pointer">
                  Carrossel
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Show Numbers */}
          <div className="flex items-center justify-between">
            <Label htmlFor="show-numbers">Mostrar números</Label>
            <Switch
              id="show-numbers"
              checked={customContent.show_numbers !== false}
              onCheckedChange={(checked) => handleCustomChange({ show_numbers: checked })}
            />
          </div>

          {/* Steps */}
          <div className="space-y-3">
            <Label>Passos</Label>
            <div className="space-y-3">
              {(customContent.steps || []).map((step: HowToBuyStep, index: number) => (
                <div key={index} className="border rounded-lg p-3 space-y-3">
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
        </div>
      )}
    </div>
  );
}
