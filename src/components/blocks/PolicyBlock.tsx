/**
 * PolicyBlock - Policy card for "Garantia & Política"
 * 
 * Features:
 * - Card or note style
 * - Callout variants (info, warning, neutral)
 * - Auto mode: pulls from business_info_sections
 * - Custom mode: editable content
 */

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, Info, AlertTriangle } from 'lucide-react';
import { resolveBlockContent } from './shared/autoContent';
import { mapToPolicy } from './shared/contentMappers';
import { DEFAULT_POLICY, type PolicyBlockProps, type PolicyContent, type PolicyCallout } from './types/specializedBlocks';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';

export function PolicyBlock(props: PolicyBlockProps) {
  const [content, setContent] = useState<PolicyContent | null>(null);
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
        setContent(props.custom || DEFAULT_POLICY);
      } else {
        // Auto mode
        const rawData = await resolveBlockContent(user.id, 'guarantee', props);
        const mapped = mapToPolicy(rawData);
        setContent(mapped || DEFAULT_POLICY);
      }
    } catch (error) {
      console.error('Error loading PolicyBlock content:', error);
      setContent(DEFAULT_POLICY);
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
  const { style = 'card', icon = 'shield-check', frame = true } = design;

  const callout = content.callout || 'info';
  const IconComponent = icon === 'info' ? Info : ShieldCheck;
  
  const calloutStyles = getCalloutStyles(callout);

  return (
    <Card className={`${frame ? '' : 'border-none shadow-none'} ${calloutStyles.border}`}>
      <CardContent className={`${style === 'note' ? calloutStyles.bg : ''} p-6 space-y-4`}>
        {/* Header with icon */}
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${calloutStyles.iconBg}`}>
            <IconComponent className={`w-6 h-6 ${calloutStyles.iconColor}`} />
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-3">{content.title}</h3>
            
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

function getCalloutStyles(callout: PolicyCallout) {
  switch (callout) {
    case 'warning':
      return {
        border: 'border-yellow-500/20',
        bg: 'bg-yellow-500/5',
        iconBg: 'bg-yellow-500/10',
        iconColor: 'text-yellow-600',
      };
    case 'info':
      return {
        border: 'border-blue-500/20',
        bg: 'bg-blue-500/5',
        iconBg: 'bg-blue-500/10',
        iconColor: 'text-blue-600',
      };
    case 'neutral':
    default:
      return {
        border: 'border-border',
        bg: 'bg-muted/30',
        iconBg: 'bg-primary/10',
        iconColor: 'text-primary',
      };
  }
}

// ============================================================================
// Empty State
// ============================================================================

function EmptyState({ mode }: { mode: 'auto' | 'custom' }) {
  return (
    <Card className="border-dashed">
      <CardContent className="p-8 text-center space-y-3">
        <div className="text-4xl mb-2">🛡️</div>
        <h4 className="font-semibold">Garantia & Política</h4>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {mode === 'auto' ? (
            <>
              Configure esta seção em{' '}
              <span className="font-medium">Perfil → Informações do Negócio</span> ou
              personalize este bloco.
            </>
          ) : (
            'Adicione sua política de garantia e trocas.'
          )}
        </p>
      </CardContent>
    </Card>
  );
}
