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

// Payment methods grouped by category - clean, professional
const PAYMENT_METHODS = {
  instant: [
    { value: 'pix' as PaymentMethod, label: 'Pix', category: 'Pagamento Instantâneo' },
    { value: 'dinheiro' as PaymentMethod, label: 'Dinheiro', category: 'Pagamento Instantâneo' },
  ],
  transfer: [
    { value: 'transferencia' as PaymentMethod, label: 'Transferência Bancária', category: 'Transferência' },
    { value: 'link' as PaymentMethod, label: 'Link de Pagamento', category: 'Transferência' },
  ],
  cards: [
    { value: 'visa' as PaymentMethod, label: 'Visa', category: 'Cartões' },
    { value: 'mastercard' as PaymentMethod, label: 'Mastercard', category: 'Cartões' },
    { value: 'amex' as PaymentMethod, label: 'American Express', category: 'Cartões' },
  ],
  other: [
    { value: 'boleto' as PaymentMethod, label: 'Boleto Bancário', category: 'Outros' },
    { value: 'paypal' as PaymentMethod, label: 'PayPal', category: 'Outros' },
  ],
};

const ALL_METHODS = [...PAYMENT_METHODS.instant, ...PAYMENT_METHODS.transfer, ...PAYMENT_METHODS.cards, ...PAYMENT_METHODS.other];

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
        if (text.includes('dinheiro')) methods.push('dinheiro');
        if (text.includes('transferência') || text.includes('transferencia')) methods.push('transferencia');
        if (text.includes('link')) methods.push('link');
        if (text.includes('boleto')) methods.push('boleto');
        if (text.includes('visa')) methods.push('visa');
        if (text.includes('mastercard')) methods.push('mastercard');
        if (text.includes('amex') || text.includes('american express')) methods.push('amex');
        if (text.includes('paypal')) methods.push('paypal');
      });
      if (methods.length > 0) {
        setSelectedMethods(methods);
      }
    }
  }, [open, initialData]);

  const loadSmartDefaults = async () => {
    try {
      // Smart defaults for Brazil (main market)
      // Most Brazilian businesses accept Pix and payment links
      setSelectedMethods(['pix', 'link']);
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
          title: ALL_METHODS.find(pm => pm.value === m)?.label || m,
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
      description="Informe quais formas de pagamento você aceita e condições especiais"
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
      {/* Helpful Instructions */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-100 mb-2">
          💡 <strong>Dica:</strong> Selecione todas as formas de pagamento que você aceita
        </p>
        <p className="text-xs text-blue-900 dark:text-blue-100">
          Quanto mais opções, mais fácil para seus clientes comprarem!
        </p>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label>Título da seção</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Formas de Pagamento"
        />
      </div>

      {/* Payment Methods - Grouped by Category */}
      <div className="space-y-4">
        <Label>Métodos aceitos (selecione todos que você aceita)</Label>
        
        {/* Instant Payments */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">Pagamento Instantâneo</h4>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.instant.map((method) => (
              <div
                key={method.value}
                className={`flex items-center space-x-3 border rounded-lg p-3 cursor-pointer transition-colors ${
                  selectedMethods.includes(method.value)
                    ? 'bg-primary/5 border-primary'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => handleToggleMethod(method.value)}
              >
                <Checkbox
                  checked={selectedMethods.includes(method.value)}
                  className="pointer-events-none"
                />
                <span className="text-sm font-medium flex-1">
                  {method.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Transfers */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">Transferência</h4>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.transfer.map((method) => (
              <div
                key={method.value}
                className={`flex items-center space-x-3 border rounded-lg p-3 cursor-pointer transition-colors ${
                  selectedMethods.includes(method.value)
                    ? 'bg-primary/5 border-primary'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => handleToggleMethod(method.value)}
              >
                <Checkbox
                  checked={selectedMethods.includes(method.value)}
                  className="pointer-events-none"
                />
                <span className="text-sm font-medium flex-1">
                  {method.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">Cartões de Crédito/Débito</h4>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.cards.map((method) => (
              <div
                key={method.value}
                className={`flex items-center space-x-3 border rounded-lg p-3 cursor-pointer transition-colors ${
                  selectedMethods.includes(method.value)
                    ? 'bg-primary/5 border-primary'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => handleToggleMethod(method.value)}
              >
                <Checkbox
                  checked={selectedMethods.includes(method.value)}
                  className="pointer-events-none"
                />
                <span className="text-sm font-medium flex-1">
                  {method.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Other */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">Outros</h4>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.other.map((method) => (
              <div
                key={method.value}
                className={`flex items-center space-x-3 border rounded-lg p-3 cursor-pointer transition-colors ${
                  selectedMethods.includes(method.value)
                    ? 'bg-primary/5 border-primary'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => handleToggleMethod(method.value)}
              >
                <Checkbox
                  checked={selectedMethods.includes(method.value)}
                  className="pointer-events-none"
                />
                <span className="text-sm font-medium flex-1">
                  {method.label}
                </span>
              </div>
            ))}
          </div>
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
