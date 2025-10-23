/**
 * ProgressBar Component
 * 
 * Animated progress bar for onboarding completion
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  return (
    <div className={cn('w-full h-2 bg-muted rounded-full overflow-hidden', className)}>
      <motion.div
        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
}
