/**
 * OnboardingHints Component
 * 
 * Contextual coach bubbles that guide users through onboarding
 */

import { AnimatePresence, motion } from 'framer-motion';
import { X, MessageCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOnboardingHints } from '@/hooks/useOnboardingHints';
import { OnboardingState } from '@/lib/onboarding';

interface OnboardingHintsProps {
  userId: string;
  progress: OnboardingState | null;
}

export function OnboardingHints({ userId, progress }: OnboardingHintsProps) {
  const { currentHint, showHint, dismissHint, handleHintCTA } = useOnboardingHints(userId, progress);

  if (!currentHint || !showHint) {
    return null;
  }

  // Replace {{name}} placeholder with user's first name if available
  const message = currentHint.message.replace('{{name}}', 'você');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed bottom-20 right-4 md:bottom-4 md:right-4 z-50 max-w-sm"
      >
        <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-2xl border-2 border-purple-200 dark:border-purple-800">
          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-relaxed mb-3">
                  {message}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  {currentHint.cta && currentHint.route && (
                    <Button
                      size="sm"
                      onClick={handleHintCTA}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      {currentHint.cta}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={dismissHint}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Ok, entendi
                  </Button>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={dismissHint}
                className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-accent"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
