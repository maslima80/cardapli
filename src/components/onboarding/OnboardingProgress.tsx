/**
 * OnboardingProgress Component
 * 
 * Main progress tracker showing all 4 steps with visual progress bar
 * Automatically hides when user dismisses after completion
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressBar } from './ProgressBar';
import { OnboardingStepCard } from './OnboardingStepCard';
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress';
import { ONBOARDING_STEPS } from '@/lib/onboarding';

interface OnboardingProgressProps {
  userId: string;
}

export function OnboardingProgress({ userId }: OnboardingProgressProps) {
  const { progress, loading, continueToNextStep, goToStep } = useOnboardingProgress(userId);
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if user has dismissed onboarding
  useEffect(() => {
    const dismissed = localStorage.getItem(`onboarding_dismissed_${userId}`);
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, [userId]);

  const handleDismiss = () => {
    localStorage.setItem(`onboarding_dismissed_${userId}`, 'true');
    setIsDismissed(true);
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!progress || isDismissed) {
    return null;
  }

  const { completionPercentage, isComplete } = progress;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
      <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background border-purple-200 dark:border-purple-900">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h3 className="text-xl font-semibold">
                  {isComplete ? 'Parabéns! 🎉' : 'Seu progresso'}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {isComplete
                  ? 'Você completou todos os passos!'
                  : 'Monte seu catálogo passo a passo'}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {completionPercentage}%
                </div>
                <div className="text-xs text-muted-foreground">
                  completo
                </div>
              </div>
              {isComplete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDismiss}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <ProgressBar value={completionPercentage} />

          {/* Steps */}
          <div className="space-y-3">
            {ONBOARDING_STEPS.map((stepConfig) => {
              const stepProgress = progress.steps[stepConfig.id];
              
              return (
                <OnboardingStepCard
                  key={stepConfig.id}
                  title={stepConfig.title}
                  description={stepConfig.description}
                  status={stepProgress?.status || 'pending'}
                  order={stepConfig.order}
                  metadata={stepProgress?.metadata}
                  onClick={() => goToStep(stepConfig.id)}
                />
              );
            })}
          </div>

          {/* Continue Button */}
          {!isComplete && (
            <Button
              onClick={continueToNextStep}
              size="lg"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
            >
              Continuar de onde parei
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {/* Completion Message */}
          {isComplete && (
            <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-900">
              <p className="text-sm text-green-900 dark:text-green-100 mb-4">
                ✨ Seu catálogo está pronto para ser compartilhado com o mundo!
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  onClick={() => goToStep('catalog')}
                  variant="default"
                >
                  Ver meus catálogos
                </Button>
                <Button
                  onClick={() => window.open('/compartilhar', '_blank')}
                  variant="outline"
                >
                  Compartilhar agora
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </motion.div>
    </AnimatePresence>
  );
}
