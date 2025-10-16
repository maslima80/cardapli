/**
 * Public Theme Engine
 * Computes and applies theme tokens to public pages based on profile settings
 */

export type ThemeInput = {
  theme_mode?: 'light' | 'dark' | null;
  accent_color?: string | null;
  background_color?: string | null;
  font_theme?: string | null;
  cta_shape?: string | null;
};

export type ThemeTokens = {
  mode: 'light' | 'dark';
  accent: string;
  background: string;
  text: string;
  surface: string;
  muted: string;
  radius: string;
  fontHeading: string;
  fontBody: string;
  googleFontsUrl: string | null;
};

// Font theme mappings
const FONT_THEMES: Record<string, { heading: string; body: string; weights: string }> = {
  moderna: {
    heading: 'Poppins',
    body: 'Nunito',
    weights: 'family=Poppins:wght@400;500;600;700&family=Nunito:wght@400;500;600;700',
  },
  elegante: {
    heading: 'Playfair Display',
    body: 'Inter',
    weights: 'family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@400;500;600;700',
  },
  neutra: {
    heading: 'Inter',
    body: 'Inter',
    weights: 'family=Inter:wght@400;500;600;700',
  },
  criativa: {
    heading: 'DM Sans',
    body: 'Lato',
    weights: 'family=DM+Sans:wght@400;500;600;700&family=Lato:wght@400;700',
  },
  romantica: {
    heading: 'Cormorant Garamond',
    body: 'Nunito',
    weights: 'family=Cormorant+Garamond:wght@400;500;600;700&family=Nunito:wght@400;500;600;700',
  },
};

/**
 * Calculate relative luminance for WCAG contrast
 */
function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
    const sRGB = val / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Convert HEX to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Pick readable text color based on background luminance
 */
function pickReadableText(background: string): string {
  const luminance = getLuminance(background);
  return luminance > 0.5 ? '#111111' : '#FFFFFF';
}

/**
 * Lighten or darken a color by percentage
 */
function shiftColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const adjust = (val: number) => {
    if (percent > 0) {
      // Lighten
      const adjusted = val + (255 - val) * (percent / 100);
      return Math.min(255, Math.max(0, Math.round(adjusted)));
    } else {
      // Darken
      const adjusted = val * (1 + percent / 100);
      return Math.min(255, Math.max(0, Math.round(adjusted)));
    }
  };

  const r = adjust(rgb.r);
  const g = adjust(rgb.g);
  const b = adjust(rgb.b);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Convert hex color to rgba with opacity
 */
function hexToRgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(0, 0, 0, ${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/**
 * Map font theme key to font families and Google Fonts URL
 */
function mapFontTheme(fontTheme: string | null | undefined): {
  heading: string;
  body: string;
  googleFontsUrl: string | null;
} {
  const theme = FONT_THEMES[fontTheme || 'moderna'] || FONT_THEMES.moderna;
  
  return {
    heading: theme.heading,
    body: theme.body,
    googleFontsUrl: `https://fonts.googleapis.com/css2?${theme.weights}&display=swap`,
  };
}

/**
 * Compute complete theme tokens from profile/catalog settings
 */
export function computeThemeTokens(input: ThemeInput): ThemeTokens {
  // Defaults
  const mode = (input.theme_mode || 'light') as 'light' | 'dark';
  const accent = input.accent_color || '#8B5CF6';
  
  // Background
  let background: string;
  if (input.background_color) {
    background = input.background_color;
  } else {
    background = mode === 'dark' ? '#0f1115' : '#ffffff';
  }

  // Text color based on background luminance
  const text = pickReadableText(background);

  // Surface color (slightly lighter/darker than background)
  const surfaceShift = mode === 'dark' ? 8 : -3;
  const surface = shiftColor(background, surfaceShift);

  // Muted text
  const muted = hexToRgba(text, 0.6);

  // Button radius
  let radius: string;
  switch (input.cta_shape) {
    case 'square':
      radius = '6px';
      break;
    case 'capsule':
      radius = '9999px';
      break;
    case 'rounded':
    default:
      radius = '12px';
      break;
  }

  // Font pairing
  const { heading, body, googleFontsUrl } = mapFontTheme(input.font_theme);

  return {
    mode,
    accent,
    background,
    text,
    surface,
    muted,
    radius,
    fontHeading: heading,
    fontBody: body,
    googleFontsUrl,
  };
}

/**
 * Apply theme tokens as CSS variables to document root
 */
export function applyThemeTokens(tokens: ThemeTokens): void {
  const root = document.documentElement;
  
  root.style.setProperty('--theme-accent', tokens.accent);
  root.style.setProperty('--theme-background', tokens.background);
  root.style.setProperty('--theme-text', tokens.text);
  root.style.setProperty('--theme-surface', tokens.surface);
  root.style.setProperty('--theme-muted', tokens.muted);
  root.style.setProperty('--theme-radius', tokens.radius);
  root.style.setProperty('--theme-font-heading', tokens.fontHeading);
  root.style.setProperty('--theme-font-body', tokens.fontBody);
  
  // Set data attribute for mode
  root.dataset.themeMode = tokens.mode;
}

/**
 * Load Google Fonts for the theme
 */
export function loadGoogleFonts(url: string | null): () => void {
  if (!url) return () => {};

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  link.id = 'theme-fonts';
  
  // Remove existing font link if present
  const existing = document.getElementById('theme-fonts');
  if (existing) {
    existing.remove();
  }
  
  document.head.appendChild(link);

  // Cleanup function
  return () => {
    const linkToRemove = document.getElementById('theme-fonts');
    if (linkToRemove) {
      linkToRemove.remove();
    }
  };
}
