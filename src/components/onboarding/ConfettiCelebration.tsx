/**
 * ConfettiCelebration Component
 * 
 * Celebration animation and modal when user completes all onboarding steps
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Layout, Share2 } from 'lucide-react';

interface ConfettiCelebrationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConfettiCelebration({ open, onOpenChange }: ConfettiCelebrationProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      // Trigger confetti animation
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Fire confetti from different positions
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [open]);

  const handleViewCatalogs = () => {
    onOpenChange(false);
    navigate('/catalogos');
  };

  const handleShare = () => {
    onOpenChange(false);
    navigate('/compartilhar');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center space-y-6 py-4">
          {/* Animated Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="flex justify-center"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <DialogTitle className="text-3xl font-bold mb-2">
              Parabéns! 🎉
            </DialogTitle>
            <DialogDescription className="text-base text-foreground">
              Você completou todos os passos!
            </DialogDescription>
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-xl p-6"
          >
            <p className="text-sm text-green-900 dark:text-green-100 leading-relaxed">
              ✨ Seu catálogo está pronto para ser compartilhado com o mundo!
              <br />
              <br />
              Agora você pode criar catálogos lindos e profissionais em minutos.
            </p>
          </motion.div>

          {/* Actions */}
          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button
              onClick={handleViewCatalogs}
              size="lg"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <Layout className="w-4 h-4 mr-2" />
              Ver meus catálogos
            </Button>
            <Button
              onClick={handleShare}
              size="lg"
              variant="outline"
              className="w-full"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar agora
            </Button>
          </DialogFooter>

          {/* Dismiss */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
