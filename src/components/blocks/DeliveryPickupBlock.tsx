/**
 * DeliveryPickupBlock - Card for "Entrega & Retirada"
 * 
 * Features:
 * - Variants: delivery+pickup, delivery only, pickup only
 * - Chips for quick info (location, timing)
 * - Auto mode: merges delivery + pickup from business_info_sections
 * - Custom mode: editable content
 */

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Store, MapPin, Clock } from 'lucide-react';
import { resolveBusinessInfo } from './shared/autoContent';
import { mapToDeliveryPickup } from './shared/contentMappers';
import { DEFAULT_DELIVERY_PICKUP, type DeliveryPickupBlockProps, type DeliveryPickupContent } from './types/specializedBlocks';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';

export function DeliveryPickupBlock(props: DeliveryPickupBlockProps & { userId?: string }) {
  const [content, setContent] = useState<DeliveryPickupContent | null>(null);
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
        setContent(DEFAULT_DELIVERY_PICKUP);
        setLoading(false);
        return;
      }

      if (props.mode === 'custom') {
        setContent(props.custom || DEFAULT_DELIVERY_PICKUP);
      } else {
        // Auto mode: fetch both delivery and pickup
        const deliveryData = await resolveBusinessInfo(userId, 'delivery', props.auto);
        const pickupData = await resolveBusinessInfo(userId, 'pickup', props.auto);
        const mapped = mapToDeliveryPickup(deliveryData, pickupData);
        setContent(mapped || DEFAULT_DELIVERY_PICKUP);
      }
    } catch (error) {
      console.error('Error loading DeliveryPickupBlock content:', error);
      setContent(DEFAULT_DELIVERY_PICKUP);
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
  const { style = 'card', icon = 'truck', frame = true } = design;

  const IconComponent = getIcon(icon, content.variant);

  return (
    <Card className={frame ? '' : 'border-none shadow-none'}>
      <CardContent className={`${style === 'panel' ? 'bg-muted/30' : ''} p-6 space-y-4`}>
        {/* Header with icon */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <IconComponent className="w-6 h-6 text-primary" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">{content.title}</h3>
            
            {/* Chips */}
            {content.chips && content.chips.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {content.chips.map((chip, index) => (
                  <Badge key={index} variant="secondary" className="font-normal">
                    {chip}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Body */}
            {content.body_md && (
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <ReactMarkdown>{content.body_md}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function getIcon(iconProp: 'truck' | 'store' | 'map-pin' | 'clock', variant: string) {
  if (iconProp === 'store') return Store;
  if (iconProp === 'map-pin') return MapPin;
  if (iconProp === 'clock') return Clock;
  
  // Default based on variant
  if (variant === 'pickup_only') return Store;
  return Truck;
}

// ============================================================================
// Empty State
// ============================================================================

function EmptyState({ mode }: { mode: 'auto' | 'custom' }) {
  return (
    <Card className="border-dashed">
      <CardContent className="p-8 text-center space-y-3">
        <div className="text-4xl mb-2">🚚</div>
        <h4 className="font-semibold">Entrega & Retirada</h4>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {mode === 'auto' ? (
            <>
              Configure esta seção em{' '}
              <span className="font-medium">Perfil → Informações do Negócio</span> ou
              personalize este bloco.
            </>
          ) : (
            'Adicione informações sobre entrega e retirada.'
          )}
        </p>
      </CardContent>
    </Card>
  );
}
