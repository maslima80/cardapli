/**
 * useOnboardingProgress Hook
 * 
 * Manages onboarding progress state and provides helper functions
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getOnboardingProgress,
  autoCheckAndUpdateProgress,
  OnboardingState,
  ONBOARDING_STEPS,
  OnboardingStep,
} from '@/lib/onboarding';

interface UseOnboardingProgressReturn {
  progress: OnboardingState | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  continueToNextStep: () => void;
  goToStep: (step: OnboardingStep) => void;
}

export function useOnboardingProgress(userId: string | null): UseOnboardingProgressReturn {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<OnboardingState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadProgress = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Auto-check and update progress first
      await autoCheckAndUpdateProgress(userId);

      // Then fetch current state
      const state = await getOnboardingProgress(userId);
      setProgress(state);
    } catch (err) {
      console.error('Error loading onboarding progress:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const refresh = useCallback(async () => {
    await loadProgress();
  }, [loadProgress]);

  const continueToNextStep = useCallback(() => {
    if (!progress?.nextStep) return;

    const stepConfig = ONBOARDING_STEPS.find((s) => s.id === progress.nextStep);
    if (stepConfig) {
      navigate(stepConfig.route);
    }
  }, [progress, navigate]);

  const goToStep = useCallback((step: OnboardingStep) => {
    const stepConfig = ONBOARDING_STEPS.find((s) => s.id === step);
    if (stepConfig) {
      navigate(stepConfig.route);
    }
  }, [navigate]);

  return {
    progress,
    loading,
    error,
    refresh,
    continueToNextStep,
    goToStep,
  };
}
