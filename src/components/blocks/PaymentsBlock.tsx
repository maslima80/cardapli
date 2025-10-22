/**
 * PaymentsBlock - Badges + Terms for "Pagamentos"
 * 
 * Features:
 * - Payment method badges (Pix, MB Way, Visa, etc.)
 * - Payment terms (e.g., "30% entrada, 70% antes do envio")
 * - Auto mode: pulls from business_info_sections + detects methods
 * - Custom mode: editable content
 */

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';
import { resolveBlockContent } from './shared/autoContent';
import { mapToPayment } from './shared/contentMappers';
import { DEFAULT_PAYMENT, type PaymentsBlockProps, type PaymentContent, type PaymentMethod } from './types/specializedBlocks';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';

export function PaymentsBlock(props: PaymentsBlockProps & { userId?: string }) {
  const [content, setContent] = useState<PaymentContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, [props.mode, props.auto, props.custom, props.snapshot, props.userId]);

  async function loadContent() {
    setLoading(true);
    
    try {
      let userId = props.userId;
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      }

      if (!userId) {
        setContent(DEFAULT_PAYMENT);
        setLoading(false);
        return;
      }

      if (props.mode === 'custom') {
        setContent(props.custom || DEFAULT_PAYMENT);
      } else {
        // Auto mode
        const rawData = await resolveBlockContent(userId, 'payment', props);
        const mapped = mapToPayment(rawData);
        setContent(mapped || DEFAULT_PAYMENT);
      }
    } catch (error) {
      console.error('Error loading PaymentsBlock content:', error);
      setContent(DEFAULT_PAYMENT);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="w-full py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!content) {
    return <EmptyState mode={props.mode} />;
  }

  const { design = {} } = props;
  const { style = 'badges_card', frame = true } = design;

  return (
    <Card className={frame ? '' : 'border-none shadow-none'}>
      <CardContent className="p-6 space-y-4">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-xl font-bold">{content.title}</h3>
        </div>

        {/* Payment Method Badges */}
        {content.show_badges && content.methods && content.methods.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {content.methods.map((method) => (
              <PaymentBadge key={method} method={method} />
            ))}
          </div>
        )}

        {/* Terms */}
        {content.terms_md && (
          <div className="prose prose-sm max-w-none text-muted-foreground pt-2 border-t">
            <ReactMarkdown>{content.terms_md}</ReactMarkdown>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Payment Badge Component
// ============================================================================

function PaymentBadge({ method }: { method: PaymentMethod }) {
  const config = PAYMENT_BADGE_CONFIG[method];
  
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-card">
      <span className="text-xl">{config.icon}</span>
      <span className="font-medium text-sm">{config.label}</span>
    </div>
  );
}

const PAYMENT_BADGE_CONFIG: Record<PaymentMethod, { icon: string; label: string }> = {
  pix: { icon: '🇧🇷', label: 'Pix' },
  mbway: { icon: '🇵🇹', label: 'MB Way' },
  visa: { icon: '💳', label: 'Visa' },
  mastercard: { icon: '💳', label: 'Mastercard' },
  amex: { icon: '💳', label: 'Amex' },
  dinheiro: { icon: '💵', label: 'Dinheiro' },
  transferencia: { icon: '🏦', label: 'Transferência' },
  boleto: { icon: '📄', label: 'Boleto' },
  link: { icon: '🔗', label: 'Link de Pagamento' },
  paypal: { icon: '🌐', label: 'PayPal' },
};

// ============================================================================
// Empty State
// ============================================================================

function EmptyState({ mode }: { mode: 'auto' | 'custom' }) {
  return (
    <Card className="border-dashed">
      <CardContent className="p-8 text-center space-y-3">
        <div className="text-4xl mb-2">💳</div>
        <h4 className="font-semibold">Formas de pagamento</h4>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {mode === 'auto' ? (
            <>
              Configure esta seção em{' '}
              <span className="font-medium">Perfil → Informações do Negócio</span> ou
              personalize este bloco.
            </>
          ) : (
            'Adicione as formas de pagamento aceitas.'
          )}
        </p>
      </CardContent>
    </Card>
  );
}
