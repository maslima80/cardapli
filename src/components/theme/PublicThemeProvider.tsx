import { useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { computeThemeTokens, applyThemeTokens, loadGoogleFonts, type ThemeInput } from '@/lib/public-theme';

interface PublicThemeProviderProps {
  userSlug: string;
  catalogOverrides?: ThemeInput | null;
  children: ReactNode;
}

export function PublicThemeProvider({ userSlug, catalogOverrides, children }: PublicThemeProviderProps) {
  const [loading, setLoading] = useState(true);
  const [themeApplied, setThemeApplied] = useState(false);

  useEffect(() => {
    let fontCleanup: (() => void) | null = null;

    const loadAndApplyTheme = async () => {
      try {
        // Fetch profile by slug
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('theme_mode, accent_color, background_color, font_theme, cta_shape')
          .eq('slug', userSlug)
          .single();

        if (error || !profile) {
          console.error('Error fetching profile theme:', error);
          setLoading(false);
          return;
        }

        // Merge profile theme with catalog overrides (if any)
        const themeInput: ThemeInput = {
          theme_mode: catalogOverrides?.theme_mode || profile.theme_mode,
          accent_color: catalogOverrides?.accent_color || profile.accent_color,
          background_color: catalogOverrides?.background_color || profile.background_color,
          font_theme: catalogOverrides?.font_theme || profile.font_theme,
          cta_shape: catalogOverrides?.cta_shape || profile.cta_shape,
        };

        // Compute theme tokens
        const tokens = computeThemeTokens(themeInput);

        // Apply CSS variables
        applyThemeTokens(tokens);

        // Load Google Fonts
        fontCleanup = loadGoogleFonts(tokens.googleFontsUrl);

        setThemeApplied(true);
        setLoading(false);
      } catch (error) {
        console.error('Error applying theme:', error);
        setLoading(false);
      }
    };

    loadAndApplyTheme();

    // Cleanup fonts on unmount
    return () => {
      if (fontCleanup) {
        fontCleanup();
      }
    };
  }, [userSlug, catalogOverrides]);

  // Show loading state briefly
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Wrapper with theme variables applied
  return (
    <div
      style={{
        backgroundColor: 'var(--theme-background)',
        color: 'var(--theme-text)',
        minHeight: '100vh',
        fontFamily: 'var(--theme-font-body)',
      }}
    >
      {children}
    </div>
  );
}
