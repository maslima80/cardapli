/**
 * OnboardingStepCard Component
 * 
 * Individual step card showing status and action button
 */

import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Loader2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StepStatus } from '@/lib/onboarding';

interface OnboardingStepCardProps {
  title: string;
  description: string;
  status: StepStatus;
  order: number;
  metadata?: Record<string, any>;
  onClick: () => void;
}

export function OnboardingStepCard({
  title,
  description,
  status,
  order,
  metadata,
  onClick,
}: OnboardingStepCardProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />;
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20';
      case 'in_progress':
        return 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/20';
      default:
        return 'border-border bg-card hover:bg-accent/50';
    }
  };

  const getMetadataText = () => {
    if (!metadata) return null;
    
    if (metadata.count !== undefined) {
      return (
        <span className="text-xs text-muted-foreground ml-2">
          ({metadata.count} {metadata.count === 1 ? 'item' : 'itens'})
        </span>
      );
    }
    
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: order * 0.1 }}
      className={cn(
        'rounded-xl border p-4 transition-all duration-200 cursor-pointer',
        getStatusColor()
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {/* Status Icon */}
        <div className="flex-shrink-0">
          {getStatusIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm sm:text-base truncate">
              {order}. {title}
            </h4>
            {getMetadataText()}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">
            {description}
          </p>
        </div>

        {/* Action */}
        {status !== 'completed' && (
          <Button
            variant="ghost"
            size="sm"
            className="flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            <span className="hidden sm:inline mr-1">Ir agora</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
