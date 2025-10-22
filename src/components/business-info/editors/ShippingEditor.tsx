/**
 * Shipping Editor - Simple card with chips
 * 
 * Features:
 * - Title field
 * - Markdown text area
 * - Quick chips for carriers
 * - Live preview
 */

import { useState } from 'react';
import { Package, Plus, X } from 'lucide-react';
import { BusinessInfoDialog } from '../shared/BusinessInfoDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShippingBlock } from '@/components/blocks/ShippingBlock';
import { upsertBusinessInfo } from '@/lib/businessInfo';
import { toast } from 'sonner';

interface ShippingEditorProps {
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
  'Correios',
  'Transportadora',
  'Código de rastreio',
  'Frete por conta do cliente',
  'Envio em 24h',
  'Todo o Brasil',
];

export function ShippingEditor({ open, onOpenChange, initialData, onSaved }: ShippingEditorProps) {
  const [title, setTitle] = useState(initialData?.title || 'Envios');
  const [textContent, setTextContent] = useState(
    initialData?.content_md || 'Enviamos para todo o Brasil via Correios ou transportadora.'
  );
  const [chips, setChips] = useState<string[]>(
    initialData?.items?.map(i => i.title) || []
  );
  const [newChip, setNewChip] = useState('');
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
      await upsertBusinessInfo('shipping', 'global', undefined, {
        title,
        content_md: textContent,
        items: chips.map(c => ({ title: c, description: '' })),
      });
      toast.success('Envios salvo com sucesso!');
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
      icon={Package}
      title="Envios"
      description="Informações sobre envio e frete"
      onSave={handleSave}
      onCancel={handleCancel}
      saving={saving}
      preview={
        <ShippingBlock
          mode="custom"
          custom={{
            title,
            body_md: textContent,
            chips,
          }}
          design={{
            style: 'card',
            icon: 'package',
            frame: true,
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
          placeholder="Envios"
        />
      </div>

      {/* Text Content */}
      <div className="space-y-2">
        <Label>Descrição</Label>
        <Textarea
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          placeholder="Ex.: Enviamos para todo o Brasil via Correios ou transportadora. Prazo estimado 5–10 dias úteis."
          rows={4}
        />
      </div>

      {/* Chips */}
      <div className="space-y-3">
        <Label>Chips rápidos (opcional)</Label>
        
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
        )}

        {/* Custom chip input */}
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
            placeholder="Adicionar chip personalizado..."
          />
          <Button onClick={() => handleAddChip(newChip)} disabled={!newChip}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </BusinessInfoDialog>
  );
}
