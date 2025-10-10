// Utility functions for theme management

export interface ThemeOverrides {
  use_brand?: boolean;
  mode?: "light" | "dark";
  accent_color?: string;
  font?: "clean" | "elegant" | "modern";
  cta_shape?: "rounded" | "square" | "capsule";
}

export interface Profile {
  accent_color?: string;
  theme_mode?: string;
  font_theme?: string;
  cta_shape?: string;
}

// Convert hex color to HSL
export function hexToHSL(hex: string): string {
  // Remove the # if present
  hex = hex.replace("#", "");

  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  const lPercent = Math.round(l * 100);

  return `${h} ${s}% ${lPercent}%`;
}

// Calculate effective theme based on catalog overrides and profile defaults
export function getEffectiveTheme(
  themeOverrides?: ThemeOverrides,
  profile?: Profile
) {
  const useBrand = themeOverrides?.use_brand !== false;

  if (useBrand) {
    // Use profile defaults
    return {
      mode: profile?.theme_mode || "light",
      accentColor: profile?.accent_color || "#8B5CF6",
      font: profile?.font_theme || "clean",
      ctaShape: profile?.cta_shape || "rounded",
    };
  }

  // Use catalog overrides
  return {
    mode: themeOverrides?.mode || "light",
    accentColor: themeOverrides?.accent_color || "#8B5CF6",
    font: themeOverrides?.font || "clean",
    ctaShape: themeOverrides?.cta_shape || "rounded",
  };
}

// Generate CSS variables for theme
export function generateThemeVariables(theme: {
  mode: string;
  accentColor: string;
  font: string;
  ctaShape: string;
}): Record<string, string> {
  const isDark = theme.mode === "dark";
  const accentHSL = hexToHSL(theme.accentColor);

  // Font family mapping
  const fontFamilies = {
    clean: { heading: "Inter, sans-serif", body: "Inter, sans-serif" },
    elegant: { heading: "Playfair Display, serif", body: "Inter, sans-serif" },
    modern: { heading: "Poppins, sans-serif", body: "Poppins, sans-serif" },
  };

  const fonts = fontFamilies[theme.font as keyof typeof fontFamilies] || fontFamilies.clean;

  // Button radius mapping
  const radiusMap = {
    rounded: "1rem",
    square: "0.375rem",
    capsule: "9999px",
  };

  const radius = radiusMap[theme.ctaShape as keyof typeof radiusMap] || radiusMap.rounded;

  return {
    "--background": isDark ? "240 10% 10%" : "0 0% 100%",
    "--foreground": isDark ? "0 0% 95%" : "240 10% 10%",
    "--card": isDark ? "240 10% 13%" : "0 0% 100%",
    "--card-foreground": isDark ? "0 0% 95%" : "240 10% 10%",
    "--popover": isDark ? "240 10% 13%" : "0 0% 100%",
    "--popover-foreground": isDark ? "0 0% 95%" : "240 10% 10%",
    "--primary": accentHSL,
    "--primary-foreground": "0 0% 100%",
    "--secondary": isDark ? "240 5% 20%" : "240 5% 96%",
    "--secondary-foreground": isDark ? "0 0% 95%" : "240 10% 10%",
    "--muted": isDark ? "240 5% 20%" : "240 5% 96%",
    "--muted-foreground": isDark ? "240 5% 64%" : "240 4% 46%",
    "--accent": accentHSL,
    "--accent-foreground": "0 0% 100%",
    "--border": isDark ? "240 6% 20%" : "240 6% 90%",
    "--input": isDark ? "240 6% 20%" : "240 6% 90%",
    "--ring": accentHSL,
    "--radius": radius,
    "--font-heading": fonts.heading,
    "--font-body": fonts.body,
  };
}
