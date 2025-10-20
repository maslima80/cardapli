import { useEffect, useState, ReactNode, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SimpleThemeProviderProps {
  userSlug: string;
  catalogThemeOverrides?: {
    use_brand?: boolean;
    mode?: string;
    accent_color?: string;
    font?: string;
  };
  children: ReactNode;
}

export function SimpleThemeProvider({ userSlug, catalogThemeOverrides, children }: SimpleThemeProviderProps) {
  const [loading, setLoading] = useState(true);

  // Memoize the theme overrides to prevent infinite loops
  const themeOverrides = useMemo(() => catalogThemeOverrides, [
    catalogThemeOverrides?.use_brand,
    catalogThemeOverrides?.mode,
    catalogThemeOverrides?.accent_color,
    catalogThemeOverrides?.font,
  ]);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        // Fetch user's theme preference
        const { data: profile } = await supabase
          .from('profiles')
          .select('theme_mode, accent_color, font_theme')
          .eq('slug', userSlug)
          .single();

        if (profile) {
          // Check if catalog has theme overrides
          const useBrand = themeOverrides?.use_brand !== false;
          
          // Determine which theme to use
          const themeMode = !useBrand && themeOverrides?.mode 
            ? themeOverrides.mode 
            : profile.theme_mode;
          const accentColor = !useBrand && themeOverrides?.accent_color
            ? themeOverrides.accent_color
            : profile.accent_color;
          const fontTheme = !useBrand && themeOverrides?.font
            ? themeOverrides.font
            : profile.font_theme;
          
          // Apply dark mode class to html element
          const isDark = themeMode === 'dark';
          if (isDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }

          // Apply accent color as CSS variable
          if (accentColor) {
            document.documentElement.style.setProperty('--accent-color', accentColor);
          }

          // Apply font theme - Premium SaaS-grade fonts
          const fontThemes: Record<string, { heading: string; body: string }> = {
            neutra: { heading: 'Inter', body: 'Inter' },
            moderna: { heading: 'DM Sans', body: 'Inter' },
            elegante: { heading: 'Fraunces', body: 'Inter' },
            expressiva: { heading: 'Space Grotesk', body: 'Inter' },
            classica: { heading: 'Lora', body: 'Source Sans 3' },
          };

          const selectedFontTheme = fontTheme || 'neutra';
          const fonts = fontThemes[selectedFontTheme] || fontThemes.neutra;

          document.documentElement.style.setProperty('--font-heading', fonts.heading);
          document.documentElement.style.setProperty('--font-body', fonts.body);

          // Load Google Fonts
          const fontWeights = 'wght@400;500;600;700';
          const headingFont = fonts.heading.replace(/ /g, '+');
          const bodyFont = fonts.body.replace(/ /g, '+');
          const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${headingFont}:${fontWeights}&family=${bodyFont}:${fontWeights}&display=swap`;
          
          // Check if link already exists
          const existingLink = document.querySelector(`link[href*="fonts.googleapis.com"]`);
          if (existingLink) {
            existingLink.setAttribute('href', googleFontsUrl);
          } else {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = googleFontsUrl;
            document.head.appendChild(link);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading theme:', error);
        setLoading(false);
      }
    };

    loadTheme();

    // Cleanup on unmount
    return () => {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.removeProperty('--accent-color');
      document.documentElement.style.removeProperty('--font-heading');
      document.documentElement.style.removeProperty('--font-body');
    };
  }, [userSlug, themeOverrides]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      {children}
    </div>
  );
}
