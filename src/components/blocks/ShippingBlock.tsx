/**
 * ShippingBlock - Card for "Envios"
 * 
 * Features:
 * - Card or panel style
 * - Chips for carriers/regions
 * - Auto mode: pulls from business_info_sections
 * - Custom mode: editable content
 */

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Plane, Truck } from 'lucide-react';
import { resolveBlockContent } from './shared/autoContent';
import { mapToShipping } from './shared/contentMappers';
import { DEFAULT_SHIPPING, type ShippingBlockProps, type ShippingContent } from './types/specializedBlocks';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';

export function ShippingBlock(props: ShippingBlockProps & { userId?: string }) {
  const [content, setContent] = useState<ShippingContent | null>(null);
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
        setContent(DEFAULT_SHIPPING);
        setLoading(false);
        return;
      }

      if (props.mode === 'custom') {
        setContent(props.custom || DEFAULT_SHIPPING);
      } else {
        // Auto mode
        const rawData = await resolveBlockContent(userId, 'shipping', props);
        const mapped = mapToShipping(rawData);
        setContent(mapped || DEFAULT_SHIPPING);
      }
    } catch (error) {
      console.error('Error loading ShippingBlock content:', error);
      setContent(DEFAULT_SHIPPING);
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
  const { style = 'card', icon = 'package', frame = true } = design;

  const IconComponent = icon === 'plane' ? Plane : icon === 'truck' ? Truck : Package;

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
// Empty State
// ============================================================================

function EmptyState({ mode }: { mode: 'auto' | 'custom' }) {
  return (
    <Card className="border-dashed">
      <CardContent className="p-8 text-center space-y-3">
        <div className="text-4xl mb-2">📦</div>
        <h4 className="font-semibold">Envios</h4>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {mode === 'auto' ? (
            <>
              Configure esta seção em{' '}
              <span className="font-medium">Perfil → Informações do Negócio</span> ou
              personalize este bloco.
            </>
          ) : (
            'Adicione informações sobre envios.'
          )}
        </p>
      </CardContent>
    </Card>
  );
}
