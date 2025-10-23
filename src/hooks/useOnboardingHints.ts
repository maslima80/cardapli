/**
 * useOnboardingHints Hook
 * 
 * Manages contextual hint display based on user progress
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCurrentHint,
  markHintViewed,
  Hint,
  OnboardingState,
} from '@/lib/onboarding';

interface UseOnboardingHintsReturn {
  currentHint: Hint | null;
  showHint: boolean;
  dismissHint: () => void;
  handleHintCTA: () => void;
}

export function useOnboardingHints(
  userId: string | null,
  progress: OnboardingState | null
): UseOnboardingHintsReturn {
  const navigate = useNavigate();
  const [currentHint, setCurrentHint] = useState<Hint | null>(null);
  const [showHint, setShowHint] = useState(false);

  const loadHint = useCallback(async () => {
    if (!userId || !progress) return;

    try {
      const hint = await getCurrentHint(userId, progress);
      if (hint) {
        setCurrentHint(hint);
        setShowHint(true);
      } else {
        setCurrentHint(null);
        setShowHint(false);
      }
    } catch (error) {
      console.error('Error loading hint:', error);
    }
  }, [userId, progress]);

  useEffect(() => {
    loadHint();
  }, [loadHint]);

  const dismissHint = useCallback(async () => {
    if (!userId || !currentHint) return;

    try {
      await markHintViewed(userId, currentHint.key);
      setShowHint(false);
      setCurrentHint(null);
    } catch (error) {
      console.error('Error dismissing hint:', error);
    }
  }, [userId, currentHint]);

  const handleHintCTA = useCallback(() => {
    if (!currentHint?.route) return;

    dismissHint();
    navigate(currentHint.route);
  }, [currentHint, dismissHint, navigate]);

  return {
    currentHint,
    showHint,
    dismissHint,
    handleHintCTA,
  };
}
