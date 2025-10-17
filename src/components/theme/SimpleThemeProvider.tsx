import { useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SimpleThemeProviderProps {
  userSlug: string;
  children: ReactNode;
}

export function SimpleThemeProvider({ userSlug, children }: SimpleThemeProviderProps) {
  const [loading, setLoading] = useState(true);

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
          // Apply dark mode class to html element
          const isDark = profile.theme_mode === 'dark';
          if (isDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }

          // Apply accent color as CSS variable
          if (profile.accent_color) {
            document.documentElement.style.setProperty('--accent-color', profile.accent_color);
          }

          // Apply font theme
          const fontThemes: Record<string, { heading: string; body: string }> = {
            moderna: { heading: 'Poppins', body: 'Nunito' },
            elegante: { heading: 'Playfair Display', body: 'Inter' },
            neutra: { heading: 'Inter', body: 'Inter' },
            criativa: { heading: 'DM Sans', body: 'Lato' },
            romantica: { heading: 'Cormorant', body: 'Nunito' },
          };

          const fontTheme = profile.font_theme || 'moderna';
          const fonts = fontThemes[fontTheme] || fontThemes.moderna;

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
  }, [userSlug]);

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
