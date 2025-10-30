/**
 * Onboarding System - Core Logic
 * 
 * Manages user progress through the 5-step onboarding journey:
 * 1. Profile (name, logo, contacts)
 * 2. Theme (colors, fonts)
 * 3. Products (at least 3)
 * 4. Business Info (delivery, payments, policy)
 * 5. Catalog (create first catalog)
 */

import { supabase } from "@/integrations/supabase/client";

// ============================================================================
// TYPES
// ============================================================================

export type OnboardingStep = 'profile' | 'products' | 'info' | 'catalog';
export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export interface UserProgress {
  id: string;
  user_id: string;
  step: OnboardingStep;
  status: StepStatus;
  completed_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface StepConfig {
  id: OnboardingStep;
  title: string;
  description: string;
  route: string;
  icon: string;
  order: number;
}

export interface OnboardingState {
  steps: Record<OnboardingStep, UserProgress>;
  completionPercentage: number;
  nextStep: OnboardingStep | null;
  isComplete: boolean;
}

// ============================================================================
// STEP CONFIGURATION
// ============================================================================

export const ONBOARDING_STEPS: StepConfig[] = [
  {
    id: 'profile',
    title: 'Complete seu Perfil',
    description: 'Nome, logo e contatos',
    route: '/perfil?section=profile',
    icon: 'User',
    order: 1,
  },
  {
    id: 'products',
    title: 'Adicione Produtos',
    description: 'Pelo menos 1 produto',
    route: '/produtos',
    icon: 'Package',
    order: 2,
  },
  {
    id: 'info',
    title: 'Informações do Negócio',
    description: 'Entrega, Pagamentos, Política',
    route: '/informacoes-negocio',
    icon: 'Info',
    order: 3,
  },
  {
    id: 'catalog',
    title: 'Crie seu Catálogo',
    description: 'Monte e publique',
    route: '/catalogo/criar',
    icon: 'Layout',
    order: 4,
  },
];

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Get user's onboarding progress
 */
export async function getOnboardingProgress(userId: string): Promise<OnboardingState> {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    // Convert array to object keyed by step
    const steps: Record<OnboardingStep, UserProgress> = {} as any;
    (data || []).forEach((progress) => {
      steps[progress.step as OnboardingStep] = progress;
    });

    // Calculate completion percentage (4 steps now)
    const completedCount = Object.values(steps).filter(
      (s) => s.status === 'completed'
    ).length;
    const completionPercentage = Math.round((completedCount / 4) * 100);

    // Find next incomplete step
    const nextStep = ONBOARDING_STEPS.find(
      (config) => steps[config.id]?.status !== 'completed'
    )?.id || null;

    const isComplete = completedCount === 4;

    return {
      steps,
      completionPercentage,
      nextStep,
      isComplete,
    };
  } catch (error) {
    console.error('Error fetching onboarding progress:', error);
    throw error;
  }
}

/**
 * Update step status
 */
export async function updateStepStatus(
  userId: string,
  step: OnboardingStep,
  status: StepStatus,
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    const { error } = await supabase.rpc('update_step_status', {
      p_user_id: userId,
      p_step: step,
      p_status: status,
      p_metadata: metadata,
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error updating step status:', error);
    throw error;
  }
}

/**
 * Get completion percentage
 */
export async function getCompletionPercentage(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('get_completion_percentage', {
      p_user_id: userId,
    });

    if (error) throw error;
    return data || 0;
  } catch (error) {
    console.error('Error getting completion percentage:', error);
    return 0;
  }
}

/**
 * Get next incomplete step
 */
export async function getNextIncompleteStep(userId: string): Promise<OnboardingStep | null> {
  try {
    const { data, error } = await supabase.rpc('get_next_incomplete_step', {
      p_user_id: userId,
    });

    if (error) throw error;
    return data as OnboardingStep | null;
  } catch (error) {
    console.error('Error getting next step:', error);
    return null;
  }
}

// ============================================================================
// STEP COMPLETION CHECKS
// ============================================================================

/**
 * Check if profile step is complete
 */
export async function checkProfileComplete(userId: string): Promise<boolean> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('business_name, logo_url, whatsapp')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error checking profile completion:', error);
      return false;
    }

    if (!profile) {
      // Profile doesn't exist yet
      return false;
    }

    return !!(
      profile.business_name &&
      profile.logo_url &&
      profile.whatsapp
    );
  } catch (error) {
    console.error('Error checking profile completion:', error);
    return false;
  }
}

/**
 * Check if theme step is complete
 * NOTE: Theme completion is now marked explicitly when user changes theme settings
 * We don't auto-check because theme fields have defaults
 */
export async function checkThemeComplete(userId: string): Promise<boolean> {
  // Theme step is marked complete explicitly when user changes settings
  // Don't auto-check to avoid false positives from default values
  return false;
}

/**
 * Check if products step is complete (at least 3 products)
 */
export async function checkProductsComplete(userId: string): Promise<{ complete: boolean; count: number }> {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;

    const productCount = count || 0;
    return {
      complete: productCount >= 1,
      count: productCount,
    };
  } catch (error) {
    console.error('Error checking products completion:', error);
    return { complete: false, count: 0 };
  }
}

/**
 * Check if business info step is complete (at least 2 sections)
 */
export async function checkBusinessInfoComplete(userId: string): Promise<{ complete: boolean; count: number }> {
  try {
    const { count, error } = await supabase
      .from('business_info_sections')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('scope', 'global');

    if (error) throw error;

    const infoCount = count || 0;
    return {
      complete: infoCount >= 2,
      count: infoCount,
    };
  } catch (error) {
    console.error('Error checking business info completion:', error);
    return { complete: false, count: 0 };
  }
}

/**
 * Check if catalog step is complete (at least 1 catalog)
 */
export async function checkCatalogComplete(userId: string): Promise<{ complete: boolean; count: number }> {
  try {
    const { count, error } = await supabase
      .from('catalogs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;

    const catalogCount = count || 0;
    return {
      complete: catalogCount > 0,
      count: catalogCount,
    };
  } catch (error) {
    console.error('Error checking catalog completion:', error);
    return { complete: false, count: 0 };
  }
}

/**
 * Auto-check and update all steps
 */
export async function autoCheckAndUpdateProgress(userId: string): Promise<void> {
  try {
    // Check profile
    const profileComplete = await checkProfileComplete(userId);
    if (profileComplete) {
      await updateStepStatus(userId, 'profile', 'completed');
    }

    // Check products
    const { complete: productsComplete, count: productCount } = await checkProductsComplete(userId);
    if (productsComplete) {
      await updateStepStatus(userId, 'products', 'completed', { count: productCount });
    } else if (productCount > 0) {
      await updateStepStatus(userId, 'products', 'in_progress', { count: productCount });
    }

    // Check business info
    const { complete: infoComplete, count: infoCount } = await checkBusinessInfoComplete(userId);
    if (infoComplete) {
      await updateStepStatus(userId, 'info', 'completed', { count: infoCount });
    } else if (infoCount > 0) {
      await updateStepStatus(userId, 'info', 'in_progress', { count: infoCount });
    }

    // Check catalog
    const { complete: catalogComplete, count: catalogCount } = await checkCatalogComplete(userId);
    if (catalogComplete) {
      await updateStepStatus(userId, 'catalog', 'completed', { count: catalogCount });
    }
  } catch (error) {
    console.error('Error auto-checking progress:', error);
  }
}

// ============================================================================
// HINT MANAGEMENT
// ============================================================================

export type HintKey = 
  | 'welcome'
  | 'profile_done'
  | 'products_done'
  | 'info_done'
  | 'all_done';

export interface Hint {
  key: HintKey;
  message: string;
  cta?: string;
  route?: string;
}

export const HINTS: Record<HintKey, Hint> = {
  welcome: {
    key: 'welcome',
    message: '👋 Oi! Vamos criar seu primeiro catálogo? Comece pelo Perfil.',
    cta: 'Ir para Perfil',
    route: '/perfil?section=profile',
  },
  profile_done: {
    key: 'profile_done',
    message: '✨ Perfeito! Agora adicione pelo menos um produto.',
    cta: 'Adicionar Produtos',
    route: '/produtos',
  },
  products_done: {
    key: 'products_done',
    message: '💡 Ótimo! Adicione suas informações de entrega e pagamento.',
    cta: 'Adicionar Informações',
    route: '/informacoes-negocio',
  },
  info_done: {
    key: 'info_done',
    message: '🎉 Quase lá! Agora é só criar seu catálogo e compartilhar!',
    cta: 'Criar Catálogo',
    route: '/catalogo/criar',
  },
  all_done: {
    key: 'all_done',
    message: '🎊 Parabéns! Seu catálogo está pronto para ser compartilhado com o mundo!',
    cta: 'Ver Catálogos',
    route: '/catalogos',
  },
};

/**
 * Check if hint has been viewed
 */
export async function hasViewedHint(userId: string, hintKey: HintKey): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('onboarding_hints_viewed')
      .select('id')
      .eq('user_id', userId)
      .eq('hint_key', hintKey)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking hint viewed:', error);
    return false;
  }
}

/**
 * Mark hint as viewed
 */
export async function markHintViewed(userId: string, hintKey: HintKey): Promise<void> {
  try {
    const { error } = await supabase
      .from('onboarding_hints_viewed')
      .insert({
        user_id: userId,
        hint_key: hintKey,
      });

    if (error && error.code !== '23505' && error.code !== '23503') { 
      // Ignore duplicate key error (23505) and foreign key error (23503)
      // Foreign key error happens if profile doesn't exist yet
      throw error;
    }
  } catch (error) {
    console.error('Error marking hint viewed:', error);
    // Don't throw - hints are not critical, just log the error
  }
}

/**
 * Get current hint to show based on progress
 */
export async function getCurrentHint(userId: string, progress: OnboardingState): Promise<Hint | null> {
  try {
    // Determine which hint to show
    let hintKey: HintKey | null = null;

    if (progress.isComplete) {
      hintKey = 'all_done';
    } else if (progress.steps.info?.status === 'completed') {
      hintKey = 'info_done';
    } else if (progress.steps.products?.status === 'completed') {
      hintKey = 'products_done';
    } else if (progress.steps.profile?.status === 'completed') {
      hintKey = 'profile_done';
    } else {
      hintKey = 'welcome';
    }

    // Check if already viewed
    const viewed = await hasViewedHint(userId, hintKey);
    if (viewed) {
      return null;
    }

    return HINTS[hintKey];
  } catch (error) {
    console.error('Error getting current hint:', error);
    return null;
  }
}
