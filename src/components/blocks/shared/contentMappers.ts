/**
 * Mappers to convert business_info_sections data to specialized block content
 */

import type { BusinessInfoData } from './autoContent';
import type {
  HowToBuyContent,
  DeliveryPickupContent,
  ShippingContent,
  PaymentContent,
  PolicyContent,
  PaymentMethod,
  HowToBuyStep,
} from '../types/specializedBlocks';

// ============================================================================
// How to Buy Mapper
// ============================================================================

export function mapToHowToBuy(data: BusinessInfoData | null): HowToBuyContent | null {
  if (!data) return null;

  const content: HowToBuyContent = {
    title: data.title || 'Como comprar',
    layout: 'stacked',
    show_numbers: true,
    steps: [],
  };

  // If items exist, map them to steps
  if (data.items && Array.isArray(data.items)) {
    content.steps = data.items.map((item: any) => ({
      icon: item.icon || '•',
      title: item.title || '',
      description: item.description || '',
    }));
  }
  // Otherwise, parse content_md into steps
  else if (data.content_md) {
    content.steps = parseMarkdownToSteps(data.content_md);
  }

  return content.steps.length > 0 ? content : null;
}

function parseMarkdownToSteps(markdown: string): HowToBuyStep[] {
  const steps: HowToBuyStep[] = [];
  const lines = markdown.split('\n').filter(line => line.trim());

  for (const line of lines) {
    // Match emoji at start: "🛍️ Title — Description"
    const emojiMatch = line.match(/^([\p{Emoji}]+)\s+(.+)$/u);
    if (emojiMatch) {
      const [, icon, rest] = emojiMatch;
      const [title, ...descParts] = rest.split('—').map(s => s.trim());
      steps.push({
        icon,
        title,
        description: descParts.join('—'),
      });
    }
    // Match numbered list: "1. Title — Description"
    else if (line.match(/^\d+\.\s+/)) {
      const text = line.replace(/^\d+\.\s+/, '');
      const [title, ...descParts] = text.split('—').map(s => s.trim());
      steps.push({
        title,
        description: descParts.join('—'),
      });
    }
    // Match bullet list: "- Title — Description"
    else if (line.startsWith('-') || line.startsWith('*')) {
      const text = line.replace(/^[-*]\s+/, '');
      const [title, ...descParts] = text.split('—').map(s => s.trim());
      steps.push({
        title,
        description: descParts.join('—'),
      });
    }
  }

  return steps;
}

// ============================================================================
// Delivery & Pickup Mapper
// ============================================================================

export function mapToDeliveryPickup(
  deliveryData: BusinessInfoData | null,
  pickupData: BusinessInfoData | null
): DeliveryPickupContent | null {
  const hasDelivery = !!deliveryData;
  const hasPickup = !!pickupData;

  if (!hasDelivery && !hasPickup) return null;

  // Determine variant
  let variant: 'delivery_pickup' | 'delivery_only' | 'pickup_only' = 'delivery_pickup';
  if (hasDelivery && !hasPickup) variant = 'delivery_only';
  if (!hasDelivery && hasPickup) variant = 'pickup_only';

  // Merge data
  const primaryData = deliveryData || pickupData;
  const chips: string[] = [];
  let body_md = '';

  // Extract chips from items
  if (primaryData?.items && Array.isArray(primaryData.items)) {
    chips.push(...primaryData.items.map((item: any) => item.title || item.description || '').filter(Boolean));
  }

  // Use content_md as body
  if (primaryData?.content_md) {
    body_md = primaryData.content_md;
  }

  // If both exist, merge them
  if (hasDelivery && hasPickup && deliveryData && pickupData) {
    if (pickupData.items && Array.isArray(pickupData.items)) {
      chips.push(...pickupData.items.map((item: any) => item.title || item.description || '').filter(Boolean));
    }
    if (pickupData.content_md) {
      body_md += (body_md ? '\n\n' : '') + pickupData.content_md;
    }
  }

  return {
    title: primaryData?.title || (variant === 'delivery_only' ? 'Entrega' : variant === 'pickup_only' ? 'Retirada' : 'Entrega & Retirada'),
    variant,
    body_md: body_md || undefined,
    chips: chips.length > 0 ? chips : undefined,
  };
}

// ============================================================================
// Shipping Mapper
// ============================================================================

export function mapToShipping(data: BusinessInfoData | null): ShippingContent | null {
  if (!data) return null;

  const chips: string[] = [];

  // Extract chips from items
  if (data.items && Array.isArray(data.items)) {
    chips.push(...data.items.map((item: any) => item.title || item.description || '').filter(Boolean));
  }

  return {
    title: data.title || 'Envios',
    body_md: data.content_md || undefined,
    chips: chips.length > 0 ? chips : undefined,
  };
}

// ============================================================================
// Payment Mapper
// ============================================================================

const PAYMENT_KEYWORDS: Record<string, PaymentMethod> = {
  'pix': 'pix',
  'mb way': 'mbway',
  'mbway': 'mbway',
  'visa': 'visa',
  'mastercard': 'mastercard',
  'amex': 'amex',
  'american express': 'amex',
  'dinheiro': 'dinheiro',
  'transferência': 'transferencia',
  'transferencia': 'transferencia',
  'boleto': 'boleto',
  'link': 'link',
  'paypal': 'paypal',
};

export function mapToPayment(data: BusinessInfoData | null): PaymentContent | null {
  if (!data) return null;

  const methods: PaymentMethod[] = [];
  let terms_md = '';

  // Parse items for payment methods
  if (data.items && Array.isArray(data.items)) {
    for (const item of data.items) {
      const text = `${item.title || ''} ${item.description || ''}`.toLowerCase();
      
      // Check for known payment methods
      for (const [keyword, method] of Object.entries(PAYMENT_KEYWORDS)) {
        if (text.includes(keyword) && !methods.includes(method)) {
          methods.push(method);
        }
      }

      // If not a recognized method, add to terms
      if (!Object.keys(PAYMENT_KEYWORDS).some(k => text.includes(k))) {
        terms_md += (terms_md ? '\n' : '') + (item.title || item.description || '');
      }
    }
  }

  // Add content_md to terms
  if (data.content_md) {
    terms_md += (terms_md ? '\n\n' : '') + data.content_md;
  }

  return {
    title: data.title || 'Formas de pagamento',
    methods: methods.length > 0 ? methods : undefined,
    terms_md: terms_md || undefined,
    show_badges: methods.length > 0,
  };
}

// ============================================================================
// Policy Mapper
// ============================================================================

export function mapToPolicy(data: BusinessInfoData | null): PolicyContent | null {
  if (!data) return null;

  return {
    title: data.title || 'Garantia & Política',
    body_md: data.content_md || undefined,
    callout: 'info',
  };
}
