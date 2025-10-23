/**
 * OnboardingWelcomeWithSlug Component
 * 
 * Combined welcome modal + slug selection for new users
 * This replaces the separate /escolher-slug page
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ONBOARDING_STEPS } from '@/lib/onboarding';

interface OnboardingWelcomeWithSlugProps {
  open: boolean;
  onComplete: (slug: string) => void;
  userId: string;
}

export function OnboardingWelcomeWithSlug({
  open,
  onComplete,
  userId,
}: OnboardingWelcomeWithSlugProps) {
  const [step, setStep] = useState<'welcome' | 'slug'>('welcome');
  const [slug, setSlug] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (slug.length >= 3) {
        checkAvailability(slug);
      } else {
        setIsAvailable(null);
        setError('');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [slug]);

  const validateSlug = (value: string): boolean => {
    const slugRegex = /^[a-z0-9_]{3,20}$/;
    return slugRegex.test(value);
  };

  const handleSlugChange = (value: string) => {
    const lowercased = value.toLowerCase();
    setSlug(lowercased);
    
    if (value.length > 0 && value.length < 3) {
      setError('Mínimo de 3 caracteres');
      setIsAvailable(null);
    } else if (value.length > 20) {
      setError('Máximo de 20 caracteres');
      setIsAvailable(null);
    } else if (value.length >= 3 && !validateSlug(lowercased)) {
      setError('Use apenas letras minúsculas, números e _');
      setIsAvailable(null);
    } else {
      setError('');
    }
  };

  const checkAvailability = async (slugToCheck: string) => {
    if (!validateSlug(slugToCheck)) {
      setIsAvailable(null);
      return;
    }

    setIsChecking(true);
    try {
      const { data, error } = await supabase.rpc('is_slug_available', {
        check_slug: slugToCheck
      });

      if (error) throw error;
      setIsAvailable(data);
    } catch (err) {
      console.error('Error checking slug:', err);
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSaveSlug = async () => {
    if (!slug || !isAvailable || error) {
      console.log('[OnboardingWelcome] Cannot save - slug:', slug, 'available:', isAvailable, 'error:', error);
      return;
    }

    console.log('[OnboardingWelcome] Saving slug:', slug, 'for user:', userId);
    setIsSaving(true);
    try {
      // Update the slug
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ slug })
        .eq('id', userId);

      console.log('[OnboardingWelcome] Update result:', { error: updateError });

      if (updateError) {
        console.error('[OnboardingWelcome] Update error:', updateError);
        throw updateError;
      }

      // If no error, the update succeeded - trust it!
      console.log('[OnboardingWelcome] Slug saved successfully:', slug);

      toast.success('Nome de usuário definido!', {
        description: `Seu link: cardapli.com/u/${slug}`,
      });

      console.log('[OnboardingWelcome] Calling onComplete with slug:', slug);
      onComplete(slug);
    } catch (err: any) {
      console.error('[OnboardingWelcome] Error saving slug:', err);
      toast.error('Erro ao salvar', {
        description: err.message || 'Tente novamente',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
        {step === 'welcome' ? (
          <>
            <DialogHeader>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>
              
              <DialogTitle className="text-2xl text-center">
                Bem-vindo ao Cardapli! 🚀
              </DialogTitle>
              
              <DialogDescription className="text-center text-base pt-2">
                Vamos criar seu catálogo digital em 5 passos simples
              </DialogDescription>
            </DialogHeader>

            {/* Steps Preview */}
            <div className="space-y-2 py-4">
              {ONBOARDING_STEPS.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-accent/50"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-xs font-semibold text-purple-600 dark:text-purple-400">
                    {step.order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button
              onClick={() => setStep('slug')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              Começar
            </Button>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl text-center">
                Escolha seu nome de usuário
              </DialogTitle>
              <DialogDescription className="text-center">
                Será usado no link que você compartilha com seus clientes
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="slug">Nome de usuário</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    @
                  </div>
                  <Input
                    id="slug"
                    type="text"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="seu_nome"
                    className="pl-8 pr-10"
                    maxLength={20}
                    disabled={isSaving}
                    autoFocus
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isChecking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    {!isChecking && isAvailable === true && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                    {!isChecking && isAvailable === false && (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </div>
                
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                
                {!error && isAvailable === true && (
                  <p className="text-sm text-green-600 dark:text-green-500 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Disponível!
                  </p>
                )}
                
                {!error && isAvailable === false && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Já está em uso
                  </p>
                )}
                
                <p className="text-xs text-muted-foreground">
                  3 a 20 caracteres • letras, números e _
                </p>
              </div>

              {slug && isAvailable && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center"
                >
                  <p className="text-xs text-green-800 dark:text-green-200 mb-1">Seu link será:</p>
                  <p className="font-semibold text-green-900 dark:text-green-100">
                    cardapli.com/u/{slug}
                  </p>
                </motion.div>
              )}
            </div>

            <Button
              onClick={handleSaveSlug}
              disabled={!slug || !isAvailable || !!error || isSaving}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Continuar'
              )}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
