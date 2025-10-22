/**
 * PolicyBlockPremium - Trust callout section
 * 
 * Design:
 * - Centered, minimal design
 * - Shield icon above title
 * - Soft blue tint for trust
 * - Quote-style presentation
 */

import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { resolveBlockContent } from './shared/autoContent';
import { mapToPolicy } from './shared/contentMappers';
import { DEFAULT_POLICY, type PolicyBlockProps, type PolicyContent } from './types/specializedBlocks';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

export function PolicyBlockPremium(props: PolicyBlockProps & { userId?: string }) {
  const [content, setContent] = useState<PolicyContent | null>(null);
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
        setContent(DEFAULT_POLICY);
        setLoading(false);
        return;
      }

      if (props.mode === 'custom') {
        setContent(props.custom || DEFAULT_POLICY);
      } else {
        const rawData = await resolveBlockContent(userId, 'guarantee', props);
        const mapped = mapToPolicy(rawData);
        setContent(mapped || DEFAULT_POLICY);
      }
    } catch (error) {
      console.error('Error loading PolicyBlockPremium content:', error);
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

  if (!content || !content.body_md) {
    return null;
  }

  return (
    <div className="bg-sky-50/50 dark:bg-sky-950/20 -mx-6 md:-mx-8 px-6 md:px-8 py-10 rounded-2xl">
      <div className="max-w-2xl mx-auto text-center space-y-4">
        {/* Shield Icon */}
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-sky-500/10 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-sky-600 dark:text-sky-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold tracking-tight">
          {content.title}
        </h2>

        {/* Body - Quote Style */}
        <div className="text-muted-foreground">
          <blockquote className="border-l-0 pl-0 italic text-base leading-relaxed">
            <ReactMarkdown>{content.body_md}</ReactMarkdown>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
