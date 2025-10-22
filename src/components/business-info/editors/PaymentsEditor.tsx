/**
 * Payments Editor - Badges multi-select + terms
 * 
 * Features:
 * - Title field
 * - Payment methods multi-select (badges)
 * - Terms text area (Markdown)
 * - Smart defaults based on profile
 * - Live preview
 */

import { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import { BusinessInfoDialog } from '../shared/BusinessInfoDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { PaymentsBlock } from '@/components/blocks/PaymentsBlock';
import { upsertBusinessInfo } from '@/lib/businessInfo';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { PaymentMethod } from '@/components/blocks/types/specializedBlocks';

interface PaymentsEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: {
    title?: string;
    items?: Array<{ title: string }>;
    content_md?: string;
  };
  onSaved?: () => void;
}

const PAYMENT_METHODS: Array<{ value: PaymentMethod; label: string; icon: string }> = [
  { value: 'pix', label: 'Pix', icon: '🇧🇷' },
  { value: 'mbway', label: 'MB Way', icon: '🇵🇹' },
  { value: 'dinheiro', label: 'Dinheiro', icon: '💵' },
  { value: 'transferencia', label: 'Transferência', icon: '🏦' },
  { value: 'link', label: 'Link de Pagamento', icon: '🔗' },
  { value: 'boleto', label: 'Boleto', icon: '📄' },
  { value: 'visa', label: 'Visa', icon: '💳' },
  { value: 'mastercard', label: 'Mastercard', icon: '💳' },
  { value: 'amex', label: 'Amex', icon: '💳' },
  { value: 'paypal', label: 'PayPal', icon: '🌐' },
];

export function PaymentsEditor({ open, onOpenChange, initialData, onSaved }: PaymentsEditorProps) {
  const [title, setTitle] = useState(initialData?.title || 'Formas de Pagamento');
  const [selectedMethods, setSelectedMethods] = useState<PaymentMethod[]>(['pix']);
  const [terms, setTerms] = useState(initialData?.content_md || '');
  const [saving, setSaving] = useState(false);

  // Smart defaults based on profile
  useEffect(() => {
    if (open && !initialData?.items) {
      loadSmartDefaults();
    } else if (initialData?.items) {
      // Parse existing items
      const methods: PaymentMethod[] = [];
      initialData.items.forEach(item => {
        const text = item.title.toLowerCase();
        if (text.includes('pix')) methods.push('pix');
        if (text.includes('mb way') || text.includes('mbway')) methods.push('mbway');
        if (text.includes('dinheiro')) methods.push('dinheiro');
        if (text.includes('transferência') || text.includes('transferencia')) methods.push('transferencia');
        if (text.includes('link')) methods.push('link');
        if (text.includes('boleto')) methods.push('boleto');
        if (text.includes('visa')) methods.push('visa');
        if (text.includes('mastercard')) methods.push('mastercard');
        if (text.includes('amex')) methods.push('amex');
        if (text.includes('paypal')) methods.push('paypal');
      });
      if (methods.length > 0) {
        setSelectedMethods(methods);
      }
    }
  }, [open, initialData]);

  const loadSmartDefaults = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('country')
        .eq('id', user.id)
        .single();

      if (profile?.country === 'BR') {
        setSelectedMethods(['pix', 'link']);
      } else if (profile?.country === 'PT') {
        setSelectedMethods(['mbway', 'link']);
      }
    } catch (error) {
      console.error('Error loading smart defaults:', error);
    }
  };

  const handleToggleMethod = (method: PaymentMethod) => {
    setSelectedMethods(prev =>
      prev.includes(method)
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertBusinessInfo('payment', 'global', undefined, {
        title,
        items: selectedMethods.map(m => ({
          title: PAYMENT_METHODS.find(pm => pm.value === m)?.label || m,
          description: '',
        })),
        content_md: terms,
      });
      toast.success('Pagamentos salvo com sucesso!');
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
      icon={CreditCard}
      title="Formas de Pagamento"
      description="Métodos aceitos e condições"
      onSave={handleSave}
      onCancel={handleCancel}
      saving={saving}
      preview={
        <PaymentsBlock
          mode="custom"
          custom={{
            title,
            methods: selectedMethods,
            terms_md: terms,
            show_badges: true,
          }}
          design={{
            style: 'badges_card',
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
          placeholder="Formas de Pagamento"
        />
      </div>

      {/* Payment Methods */}
      <div className="space-y-3">
        <Label>Métodos aceitos</Label>
        <div className="grid grid-cols-2 gap-3">
          {PAYMENT_METHODS.map((method) => (
            <div
              key={method.value}
              className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 cursor-pointer"
              onClick={() => handleToggleMethod(method.value)}
            >
              <Checkbox
                id={method.value}
                checked={selectedMethods.includes(method.value)}
                onCheckedChange={() => handleToggleMethod(method.value)}
              />
              <label
                htmlFor={method.value}
                className="flex items-center gap-2 cursor-pointer flex-1"
              >
                <span className="text-lg">{method.icon}</span>
                <span className="text-sm font-medium">{method.label}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Terms */}
      <div className="space-y-2">
        <Label>Termos e condições (opcional)</Label>
        <Textarea
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
          placeholder="Ex.: 30% na encomenda e 70% antes do envio. Pagamento à vista com desconto."
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Adicione condições especiais, parcelamento, descontos, etc.
        </p>
      </div>
    </BusinessInfoDialog>
  );
}
