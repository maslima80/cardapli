/**
 * HowToBuyBlockPremium - Cinematic "Como Comprar" experience
 * 
 * Design:
 * - Vertical timeline with connecting lines
 * - Gradient numbered circles
 * - No card borders - pure flow
 * - Staggered animations
 */

import { useEffect, useState } from 'react';
import { resolveBlockContent } from './shared/autoContent';
import { mapToHowToBuy } from './shared/contentMappers';
import { DEFAULT_HOW_TO_BUY, type HowToBuyBlockProps, type HowToBuyContent } from './types/specializedBlocks';
import { supabase } from '@/integrations/supabase/client';
import { StaggeredList, StaggeredItem } from '../catalog/CatalogThemeLayoutPremium';
import { cn } from '@/lib/utils';

export function HowToBuyBlockPremium(props: HowToBuyBlockProps & { userId?: string }) {
  const [content, setContent] = useState<HowToBuyContent | null>(null);
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
        setContent(DEFAULT_HOW_TO_BUY);
        setLoading(false);
        return;
      }

      if (props.mode === 'custom') {
        setContent(props.custom || DEFAULT_HOW_TO_BUY);
      } else {
        const rawData = await resolveBlockContent(userId, 'how_to_buy', props);
        const mapped = mapToHowToBuy(rawData);
        setContent(mapped || DEFAULT_HOW_TO_BUY);
      }
    } catch (error) {
      console.error('Error loading HowToBuyBlockPremium content:', error);
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
    return null;
  }

  return (
    <div className="w-full">
      {/* Title */}
      {content.title && (
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-8 text-primary">
          {content.title}
        </h2>
      )}

      {/* Timeline Steps */}
      <StaggeredList className="space-y-0">
        {content.steps.map((step, index) => (
          <StaggeredItem key={index}>
            <div className="flex gap-6 items-start relative pb-8 last:pb-0">
              {/* Connecting Line */}
              {index < content.steps.length - 1 && (
                <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 to-transparent" />
              )}

              {/* Number Circle with Gradient */}
              <div className="relative flex-shrink-0 z-10">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg",
                  "bg-gradient-to-br from-primary to-primary/70 text-primary-foreground",
                  "shadow-lg shadow-primary/20"
                )}>
                  {content.show_numbers ? (
                    <span>{index + 1}</span>
                  ) : (
                    <span className="text-xl">{step.icon || '•'}</span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 pt-1">
                <h3 className="text-lg font-semibold mb-1.5 tracking-tight">
                  {step.title}
                </h3>
                {step.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          </StaggeredItem>
        ))}
      </StaggeredList>
    </div>
  );
}
