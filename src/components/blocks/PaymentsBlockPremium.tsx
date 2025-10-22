/**
 * PaymentsBlockPremium - Bold payment section
 * 
 * Design:
 * - Full-width accent stripe
 * - Monochrome payment badges
 * - Professional typography
 * - Hover effects
 */

import { useEffect, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { resolveBlockContent } from './shared/autoContent';
import { mapToPayment } from './shared/contentMappers';
import { DEFAULT_PAYMENT, type PaymentsBlockProps, type PaymentContent, type PaymentMethod } from './types/specializedBlocks';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function PaymentsBlockPremium(props: PaymentsBlockProps & { userId?: string }) {
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
        const rawData = await resolveBlockContent(userId, 'payment', props);
        const mapped = mapToPayment(rawData);
        setContent(mapped || DEFAULT_PAYMENT);
      }
    } catch (error) {
      console.error('Error loading PaymentsBlockPremium content:', error);
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
    return null;
  }

  return (
    <div className="bg-primary/5 -mx-6 md:-mx-8 px-6 md:px-8 py-8 rounded-2xl border border-primary/10">
      {/* Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">{content.title}</h2>
      </div>

      {/* Payment Method Badges */}
      {content.show_badges && content.methods && content.methods.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          {content.methods.map((method, index) => (
            <PaymentBadge key={method} method={method} index={index} />
          ))}
        </div>
      )}

      {/* Terms */}
      {content.terms_md && (
        <div className="text-sm text-muted-foreground leading-relaxed pt-4 border-t border-border/50">
          <ReactMarkdown>{content.terms_md}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Payment Badge Component with Animation
// ============================================================================

function PaymentBadge({ method, index }: { method: PaymentMethod; index: number }) {
  const config = PAYMENT_BADGE_CONFIG[method];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.05, y: -2 }}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 rounded-xl",
        "bg-background/80 border border-border/50",
        "transition-all duration-200 cursor-default",
        "hover:border-primary/50 hover:shadow-sm"
      )}
    >
      <span className="text-lg">{config.icon}</span>
      <span className="font-medium text-sm">{config.label}</span>
    </motion.div>
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
