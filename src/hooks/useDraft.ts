/**
 * useDraft - Auto-save form drafts to localStorage
 * 
 * Prevents data loss when users navigate away or close the app
 * Allows resuming where they left off
 */

import { useState, useEffect, useCallback } from "react";

export interface UseDraftOptions<T> {
  key: string; // Unique key for this draft (e.g., "product:new", "catalog:123")
  initialData?: T;
  enabled?: boolean; // Set to false to disable draft saving
}

export function useDraft<T extends Record<string, any>>({
  key,
  initialData,
  enabled = true,
}: UseDraftOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const draftKey = `draft:${key}`;

  // Load draft on mount
  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setData(parsed);
        setHasDraft(true);
      } else if (initialData) {
        setData(initialData);
      }
    } catch (error) {
      console.error("Error loading draft:", error);
    } finally {
      setIsLoading(false);
    }
  }, [draftKey, enabled]);

  // Save draft
  const saveDraft = useCallback(
    (newData: T) => {
      if (!enabled) return;

      try {
        localStorage.setItem(draftKey, JSON.stringify(newData));
        setData(newData);
        setHasDraft(true);
      } catch (error) {
        console.error("Error saving draft:", error);
      }
    },
    [draftKey, enabled]
  );

  // Clear draft
  const clearDraft = useCallback(() => {
    if (!enabled) return;

    try {
      localStorage.removeItem(draftKey);
      setData(null);
      setHasDraft(false);
    } catch (error) {
      console.error("Error clearing draft:", error);
    }
  }, [draftKey, enabled]);

  // Discard draft and reset to initial data
  const discardDraft = useCallback(() => {
    clearDraft();
    if (initialData) {
      setData(initialData);
    }
  }, [clearDraft, initialData]);

  return {
    data,
    hasDraft,
    isLoading,
    saveDraft,
    clearDraft,
    discardDraft,
  };
}

/**
 * Hook for auto-saving drafts with debounce
 */
export function useAutoSaveDraft<T extends Record<string, any>>(
  key: string,
  data: T,
  options: {
    enabled?: boolean;
    debounceMs?: number;
  } = {}
) {
  const { enabled = true, debounceMs = 1000 } = options;
  const draftKey = `draft:${key}`;

  useEffect(() => {
    if (!enabled || !data) return;

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify(data));
      } catch (error) {
        console.error("Error auto-saving draft:", error);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [data, draftKey, enabled, debounceMs]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(draftKey);
    } catch (error) {
      console.error("Error clearing draft:", error);
    }
  }, [draftKey]);

  return { clearDraft };
}
