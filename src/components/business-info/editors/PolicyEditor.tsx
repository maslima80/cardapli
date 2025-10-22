/**
 * Policy Editor - Markdown with callout styles
 * 
 * Features:
 * - Title field
 * - Markdown text area
 * - Callout style selector
 * - Icon selector
 * - Live preview
 */

import { useState } from 'react';
import { ShieldCheck, Info, AlertTriangle } from 'lucide-react';
import { BusinessInfoDialog } from '../shared/BusinessInfoDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PolicyBlock } from '@/components/blocks/PolicyBlock';
import { upsertBusinessInfo } from '@/lib/businessInfo';
import { toast } from 'sonner';
import type { PolicyCallout } from '@/components/blocks/types/specializedBlocks';

interface PolicyEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: {
    title?: string;
    content_md?: string;
  };
  onSaved?: () => void;
}

export function PolicyEditor({ open, onOpenChange, initialData, onSaved }: PolicyEditorProps) {
  const [title, setTitle] = useState(initialData?.title || 'Garantia & Política');
  const [content, setContent] = useState(
    initialData?.content_md || 'Trocas apenas em caso de defeito de fabricação em até 7 dias.'
  );
  const [callout, setCallout] = useState<PolicyCallout>('info');
  const [icon, setIcon] = useState<'shield-check' | 'info'>('shield-check');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertBusinessInfo('guarantee', 'global', undefined, {
        title,
        content_md: content,
      });
      toast.success('Garantia & Política salvo com sucesso!');
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
      icon={ShieldCheck}
      title="Garantia & Política"
      description="Política de trocas e devoluções"
      onSave={handleSave}
      onCancel={handleCancel}
      saving={saving}
      preview={
        <PolicyBlock
          mode="custom"
          custom={{
            title,
            body_md: content,
            callout,
          }}
          design={{
            style: 'card',
            icon,
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
          placeholder="Garantia & Política"
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label>Política</Label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Ex.: Produtos personalizados não possuem troca, exceto em caso de defeito dentro de 7 dias."
          rows={6}
        />
        <p className="text-xs text-muted-foreground">
          Seja claro sobre trocas, devoluções, garantias e prazos.
        </p>
      </div>

      {/* Callout Style */}
      <div className="space-y-3">
        <Label>Destaque</Label>
        <RadioGroup value={callout} onValueChange={(v) => setCallout(v as PolicyCallout)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="neutral" id="neutral" />
            <Label htmlFor="neutral" className="font-normal cursor-pointer">
              Neutro (padrão)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="info" id="info" />
            <Label htmlFor="info" className="font-normal cursor-pointer">
              Informação (azul)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="warning" id="warning" />
            <Label htmlFor="warning" className="font-normal cursor-pointer">
              Aviso (amarelo)
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Icon */}
      <div className="space-y-3">
        <Label>Ícone</Label>
        <RadioGroup value={icon} onValueChange={(v) => setIcon(v as any)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="shield-check" id="shield" />
            <Label htmlFor="shield" className="font-normal cursor-pointer flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Escudo (garantia)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="info" id="info-icon" />
            <Label htmlFor="info-icon" className="font-normal cursor-pointer flex items-center gap-2">
              <Info className="w-4 h-4" />
              Informação
            </Label>
          </div>
        </RadioGroup>
      </div>
    </BusinessInfoDialog>
  );
}
