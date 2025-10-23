/**
 * OnboardingWelcomeModal Component
 * 
 * Welcome modal shown to first-time users after slug selection
 */

import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ONBOARDING_STEPS } from '@/lib/onboarding';

interface OnboardingWelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName?: string;
}

export function OnboardingWelcomeModal({
  open,
  onOpenChange,
  userName = 'você',
}: OnboardingWelcomeModalProps) {
  const handleStart = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
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
            Parabéns, {userName}! 🎉
          </DialogTitle>
          
          <DialogDescription className="text-center text-base pt-2">
            Agora vamos montar seu primeiro catálogo em 5 passos simples
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

        {/* Benefits */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-100 mb-2 font-medium">
            ✨ Por que seguir esses passos?
          </p>
          <ul className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>Seu catálogo fica profissional desde o início</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>Você não esquece nenhuma informação importante</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>Seus clientes confiam mais no seu negócio</span>
            </li>
          </ul>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Ver depois
          </Button>
          <Button
            onClick={handleStart}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            Começar minha jornada
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
