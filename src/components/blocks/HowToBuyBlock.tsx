/**
 * HowToBuyBlock - Steps block for "Como Comprar" / "Como Encomendar"
 * 
 * Features:
 * - Stacked or carousel layout
 * - Numbered steps (optional)
 * - Auto mode: pulls from business_info_sections
 * - Custom mode: editable content
 */

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { resolveBlockContent } from './shared/autoContent';
import { mapToHowToBuy } from './shared/contentMappers';
import { DEFAULT_HOW_TO_BUY, type HowToBuyBlockProps, type HowToBuyContent } from './types/specializedBlocks';
import { supabase } from '@/integrations/supabase/client';

export function HowToBuyBlock(props: HowToBuyBlockProps) {
  const [content, setContent] = useState<HowToBuyContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, [props.mode, props.auto, props.custom, props.snapshot]);

  async function loadContent() {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setContent(null);
        setLoading(false);
        return;
      }

      if (props.mode === 'custom') {
        setContent(props.custom || DEFAULT_HOW_TO_BUY);
      } else {
        // Auto mode
        const rawData = await resolveBlockContent(user.id, 'how_to_buy', props);
        const mapped = mapToHowToBuy(rawData);
        setContent(mapped || DEFAULT_HOW_TO_BUY);
      }
    } catch (error) {
      console.error('Error loading HowToBuyBlock content:', error);
      setContent(DEFAULT_HOW_TO_BUY);
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

  if (!content || content.steps.length === 0) {
    return <EmptyState mode={props.mode} />;
  }

  const { design = {} } = props;
  const { accent = 'brand', frame = true, bg = 'soft' } = design;

  return (
    <div className="w-full">
      {content.layout === 'stacked' ? (
        <StackedLayout content={content} accent={accent} frame={frame} bg={bg} />
      ) : (
        <CarouselLayout content={content} accent={accent} frame={frame} bg={bg} />
      )}
    </div>
  );
}

// ============================================================================
// Stacked Layout
// ============================================================================

function StackedLayout({
  content,
  accent,
  frame,
  bg,
}: {
  content: HowToBuyContent;
  accent: 'brand' | 'neutral';
  frame: boolean;
  bg: 'none' | 'soft' | 'paper';
}) {
  const bgClass = bg === 'soft' ? 'bg-muted/30' : bg === 'paper' ? 'bg-card' : '';
  const accentClass = accent === 'brand' ? 'text-primary' : 'text-foreground';

  return (
    <div className={`space-y-6 ${bgClass} ${frame ? 'p-6 rounded-lg' : ''}`}>
      {content.title && (
        <h3 className={`text-2xl font-bold ${accentClass}`}>{content.title}</h3>
      )}
      
      <div className="space-y-4">
        {content.steps.map((step, index) => (
          <div key={index} className="flex gap-4 items-start">
            {/* Number or Icon */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              accent === 'brand' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
            }`}>
              {content.show_numbers ? (
                <span>{index + 1}</span>
              ) : (
                <span className="text-xl">{step.icon || '•'}</span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <h4 className="font-semibold text-lg mb-1">{step.title}</h4>
              {step.description && (
                <p className="text-sm text-muted-foreground">{step.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Carousel Layout
// ============================================================================

function CarouselLayout({
  content,
  accent,
  frame,
  bg,
}: {
  content: HowToBuyContent;
  accent: 'brand' | 'neutral';
  frame: boolean;
  bg: 'none' | 'soft' | 'paper';
}) {
  const accentClass = accent === 'brand' ? 'text-primary' : 'text-foreground';

  return (
    <div className="space-y-6">
      {content.title && (
        <h3 className={`text-2xl font-bold ${accentClass}`}>{content.title}</h3>
      )}

      {/* Horizontal scroll container */}
      <div className="overflow-x-auto pb-4 -mx-4 px-4">
        <div className="flex gap-4 min-w-max">
          {content.steps.map((step, index) => (
            <Card key={index} className="w-64 flex-shrink-0">
              <CardContent className="p-6 space-y-3">
                {/* Number or Icon */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                  accent === 'brand' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                }`}>
                  {content.show_numbers ? (
                    <span className="text-lg">{index + 1}</span>
                  ) : (
                    <span className="text-2xl">{step.icon || '•'}</span>
                  )}
                </div>

                {/* Content */}
                <div>
                  <h4 className="font-semibold text-lg mb-2">{step.title}</h4>
                  {step.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Empty State
// ============================================================================

function EmptyState({ mode }: { mode: 'auto' | 'custom' }) {
  return (
    <Card className="border-dashed">
      <CardContent className="p-8 text-center space-y-3">
        <div className="text-4xl mb-2">🛍️</div>
        <h4 className="font-semibold">Como comprar</h4>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {mode === 'auto' ? (
            <>
              Configure esta seção em{' '}
              <span className="font-medium">Perfil → Informações do Negócio</span> ou
              personalize este bloco.
            </>
          ) : (
            'Adicione os passos para seus clientes saberem como comprar.'
          )}
        </p>
      </CardContent>
    </Card>
  );
}
