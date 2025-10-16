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
          .select('theme_mode, accent_color')
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
