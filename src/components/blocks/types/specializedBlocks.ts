/**
 * Type definitions for specialized business info blocks
 * 
 * Each block has its own content structure and design options,
 * while sharing the auto/custom mode infrastructure
 */

import { AutoContentMixin } from '../shared/autoContent';

// ============================================================================
// Block 1: Como Comprar / Encomendar (Steps)
// ============================================================================

export type StepsLayout = 'stacked' | 'carousel';

export interface HowToBuyStep {
  icon?: string;
  title: string;
  description?: string;
}

export interface HowToBuyContent {
  title?: string; // default: "Como comprar" / "Como encomendar"
  layout: StepsLayout;
  show_numbers?: boolean; // 1, 2, 3…
  steps: HowToBuyStep[];
}

export interface HowToBuyBlockProps extends AutoContentMixin<HowToBuyContent> {
  design?: {
    accent?: 'brand' | 'neutral';
    frame?: boolean;
    bg?: 'none' | 'soft' | 'paper';
  };
}

// ============================================================================
// Block 2: Entrega & Retirada (Card)
// ============================================================================

export type DeliveryVariant = 'delivery_pickup' | 'delivery_only' | 'pickup_only';

export interface DeliveryPickupContent {
  title?: string; // e.g. "Entrega & Retirada"
  body_md?: string; // supports bold, bullets
  variant: DeliveryVariant;
  chips?: string[]; // e.g. ["Valença/Tuias", "Até 3 dias úteis"]
}

export interface DeliveryPickupBlockProps extends AutoContentMixin<DeliveryPickupContent> {
  design?: {
    style: 'card' | 'panel';
    icon?: 'truck' | 'store' | 'map-pin' | 'clock';
    frame?: boolean;
  };
}

// ============================================================================
// Block 3: Envios (Card)
// ============================================================================

export interface ShippingContent {
  title?: string; // e.g. "Envios"
  body_md?: string; // "Enviamos para todo o Brasil…"
  chips?: string[]; // "Correios", "Transportadora"
}

export interface ShippingBlockProps extends AutoContentMixin<ShippingContent> {
  design?: {
    style: 'card' | 'panel';
    icon?: 'package' | 'plane' | 'truck';
    frame?: boolean;
  };
}

// ============================================================================
// Block 4: Pagamentos (Badges + Terms)
// ============================================================================

export type PaymentMethod =
  | 'pix'
  | 'mbway'
  | 'visa'
  | 'mastercard'
  | 'amex'
  | 'dinheiro'
  | 'transferencia'
  | 'boleto'
  | 'link'
  | 'paypal';

export interface PaymentContent {
  title?: string; // "Formas de pagamento"
  methods?: PaymentMethod[];
  terms_md?: string; // "30% na encomenda, 70% antes do envio…"
  show_badges?: boolean; // show icons row
}

export interface PaymentsBlockProps extends AutoContentMixin<PaymentContent> {
  design?: {
    style: 'badges_card' | 'simple';
    frame?: boolean;
  };
}

// ============================================================================
// Block 5: Garantia / Política (Policy Card)
// ============================================================================

export type PolicyCallout = 'info' | 'warning' | 'neutral';

export interface PolicyContent {
  title?: string; // "Garantia & Política"
  body_md?: string; // "Trocas apenas em caso de defeito…"
  callout?: PolicyCallout;
}

export interface PolicyBlockProps extends AutoContentMixin<PolicyContent> {
  design?: {
    style: 'card' | 'note';
    icon?: 'shield-check' | 'info';
    frame?: boolean;
  };
}

// ============================================================================
// Default Content (for custom mode when empty)
// ============================================================================

export const DEFAULT_HOW_TO_BUY: HowToBuyContent = {
  title: 'Como comprar',
  layout: 'stacked',
  show_numbers: true,
  steps: [
    {
      icon: '🛍️',
      title: 'Escolha o produto',
      description: 'Navegue pelo catálogo e escolha o que deseja',
    },
    {
      icon: '💬',
      title: 'Fale no WhatsApp',
      description: 'Entre em contato para confirmar disponibilidade',
    },
    {
      icon: '💳',
      title: 'Pagamento',
      description: 'Acerte os detalhes de pagamento',
    },
    {
      icon: '📦',
      title: 'Entrega/Retirada',
      description: 'Receba seu pedido ou retire no local',
    },
  ],
};

export const DEFAULT_DELIVERY_PICKUP: DeliveryPickupContent = {
  title: 'Entrega & Retirada',
  variant: 'delivery_pickup',
  body_md: 'Entre em contato para combinar entrega ou retirada.',
  chips: [],
};

export const DEFAULT_SHIPPING: ShippingContent = {
  title: 'Envios',
  body_md: 'Enviamos para sua região. Entre em contato para calcular o frete.',
  chips: [],
};

export const DEFAULT_PAYMENT: PaymentContent = {
  title: 'Formas de pagamento',
  methods: ['pix'],
  terms_md: '',
  show_badges: true,
};

export const DEFAULT_POLICY: PolicyContent = {
  title: 'Garantia & Política',
  body_md: 'Entre em contato para saber mais sobre nossa política de trocas e devoluções.',
  callout: 'info',
};
