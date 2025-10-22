/**
 * DeliveryShippingGroupPremium - Unified logistics section
 * 
 * Design:
 * - Combines Delivery + Shipping in elegant grid
 * - Shared soft background
 * - Minimalist icons
 * - Chip-based info display
 */

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Truck, Package, MapPin, Clock } from 'lucide-react';
import { resolveBusinessInfo, resolveBlockContent } from './shared/autoContent';
import { mapToDeliveryPickup, mapToShipping } from './shared/contentMappers';
import { 
  DEFAULT_DELIVERY_PICKUP, 
  DEFAULT_SHIPPING,
  type DeliveryPickupContent,
  type ShippingContent 
} from './types/specializedBlocks';
import { supabase } from '@/integrations/supabase/client';
import { InfoGrid } from '../catalog/CatalogThemeLayoutPremium';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface DeliveryShippingGroupProps {
  userId?: string;
  deliveryProps?: any;
  shippingProps?: any;
}

export function DeliveryShippingGroupPremium({ 
  userId, 
  deliveryProps = {},
  shippingProps = {}
}: DeliveryShippingGroupProps) {
  const [deliveryContent, setDeliveryContent] = useState<DeliveryPickupContent | null>(null);
  const [shippingContent, setShippingContent] = useState<ShippingContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, [userId]);

  async function loadContent() {
    setLoading(true);
    
    try {
      let uid = userId;
      if (!uid) {
        const { data: { user } } = await supabase.auth.getUser();
        uid = user?.id;
      }

      if (!uid) {
        setDeliveryContent(DEFAULT_DELIVERY_PICKUP);
        setShippingContent(DEFAULT_SHIPPING);
        setLoading(false);
        return;
      }

      // Load delivery + pickup
      if (deliveryProps.mode === 'custom') {
        setDeliveryContent(deliveryProps.custom || DEFAULT_DELIVERY_PICKUP);
      } else {
        const deliveryData = await resolveBusinessInfo(uid, 'delivery', deliveryProps.auto);
        const pickupData = await resolveBusinessInfo(uid, 'pickup', deliveryProps.auto);
        const mapped = mapToDeliveryPickup(deliveryData, pickupData);
        setDeliveryContent(mapped || DEFAULT_DELIVERY_PICKUP);
      }

      // Load shipping
      if (shippingProps.mode === 'custom') {
        setShippingContent(shippingProps.custom || DEFAULT_SHIPPING);
      } else {
        const rawData = await resolveBlockContent(uid, 'shipping', shippingProps);
        const mapped = mapToShipping(rawData);
        setShippingContent(mapped || DEFAULT_SHIPPING);
      }
    } catch (error) {
      console.error('Error loading logistics content:', error);
      setDeliveryContent(DEFAULT_DELIVERY_PICKUP);
      setShippingContent(DEFAULT_SHIPPING);
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

  const hasDelivery = deliveryContent && (deliveryContent.body_md || deliveryContent.chips?.length);
  const hasShipping = shippingContent && (shippingContent.body_md || shippingContent.chips?.length);

  if (!hasDelivery && !hasShipping) {
    return null;
  }

  return (
    <div className="bg-muted/5 -mx-6 md:-mx-8 px-6 md:px-8 py-8 rounded-2xl">
      <InfoGrid columns={hasDelivery && hasShipping ? 2 : 1}>
        {/* Delivery & Pickup */}
        {hasDelivery && (
          <LogisticsCard
            icon={<Truck className="w-5 h-5" />}
            title={deliveryContent.title}
            chips={deliveryContent.chips}
            body={deliveryContent.body_md}
          />
        )}

        {/* Shipping */}
        {hasShipping && (
          <LogisticsCard
            icon={<Package className="w-5 h-5" />}
            title={shippingContent.title}
            chips={shippingContent.chips}
            body={shippingContent.body_md}
          />
        )}
      </InfoGrid>
    </div>
  );
}

// ============================================================================
// Logistics Card Component
// ============================================================================

interface LogisticsCardProps {
  icon: React.ReactNode;
  title: string;
  chips?: string[];
  body?: string;
}

function LogisticsCard({ icon, title, chips, body }: LogisticsCardProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      </div>

      {/* Chips */}
      {chips && chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.map((chip, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="font-normal bg-background/80 border border-border/50"
            >
              {chip}
            </Badge>
          ))}
        </div>
      )}

      {/* Body */}
      {body && (
        <div className="text-sm text-muted-foreground leading-relaxed">
          <ReactMarkdown>{body}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
