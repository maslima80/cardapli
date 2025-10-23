/**
 * Progress Tracking Helpers
 * 
 * Auto-detect and update onboarding progress when users complete actions
 */

import { updateStepStatus } from './onboarding';

/**
 * Call this when profile is saved
 * Checks if profile step is complete and updates progress
 */
export async function onProfileSaved(userId: string, profileData: any): Promise<void> {
  try {
    const isComplete = !!(
      profileData.business_name &&
      profileData.logo_url &&
      profileData.whatsapp
    );

    if (isComplete) {
      await updateStepStatus(userId, 'profile', 'completed');
    } else {
      // At least one field filled = in progress
      const hasAnyField = !!(
        profileData.business_name ||
        profileData.logo_url ||
        profileData.whatsapp
      );
      
      if (hasAnyField) {
        await updateStepStatus(userId, 'profile', 'in_progress');
      }
    }
  } catch (error) {
    console.error('Error updating profile progress:', error);
  }
}

/**
 * Call this when theme is updated
 * Checks if theme step is complete and updates progress
 */
export async function onThemeUpdated(userId: string, themeData: any): Promise<void> {
  try {
    const isComplete = !!themeData.theme_primary_color;

    if (isComplete) {
      await updateStepStatus(userId, 'theme', 'completed');
    }
  } catch (error) {
    console.error('Error updating theme progress:', error);
  }
}

/**
 * Call this when a product is added/updated
 * Checks if products step is complete (at least 3 products)
 */
export async function onProductChanged(userId: string, productCount: number): Promise<void> {
  try {
    if (productCount >= 3) {
      await updateStepStatus(userId, 'products', 'completed', { count: productCount });
    } else if (productCount > 0) {
      await updateStepStatus(userId, 'products', 'in_progress', { count: productCount });
    }
  } catch (error) {
    console.error('Error updating products progress:', error);
  }
}

/**
 * Call this when business info is saved
 * Checks if info step is complete (at least 2 sections)
 */
export async function onBusinessInfoSaved(userId: string, sectionCount: number): Promise<void> {
  try {
    if (sectionCount >= 2) {
      await updateStepStatus(userId, 'info', 'completed', { count: sectionCount });
    } else if (sectionCount > 0) {
      await updateStepStatus(userId, 'info', 'in_progress', { count: sectionCount });
    }
  } catch (error) {
    console.error('Error updating business info progress:', error);
  }
}

/**
 * Call this when a catalog is created
 * Marks catalog step as complete
 */
export async function onCatalogCreated(userId: string, catalogCount: number): Promise<void> {
  try {
    if (catalogCount > 0) {
      await updateStepStatus(userId, 'catalog', 'completed', { count: catalogCount });
    }
  } catch (error) {
    console.error('Error updating catalog progress:', error);
  }
}

/**
 * Convenience function to refresh progress after any action
 * Can be called from components to trigger a re-check
 */
export async function refreshProgress(userId: string): Promise<void> {
  try {
    // Import here to avoid circular dependency
    const { autoCheckAndUpdateProgress } = await import('./onboarding');
    await autoCheckAndUpdateProgress(userId);
  } catch (error) {
    console.error('Error refreshing progress:', error);
  }
}
