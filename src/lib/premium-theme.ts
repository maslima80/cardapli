/**
 * Premium Theme System
 * Computes full theme tokens from profile settings with auto-contrast and accessibility
 */

export interface ThemeProfile {
  theme_mode?: string | null;
  accent_color?: string | null;
  background_color?: string | null;
  font_theme?: string | null;
  cta_shape?: string | null;
}

export interface ComputedTheme {
  mode: 'light' | 'dark';
  accent: string;
  background: string;
  text: string;
  surface: string;
  muted: string;
  fontHeading: string;
  fontBody: string;
  radius: string;
}

// Curated accent color presets
export const ACCENT_PRESETS = [
  { name: 'Roxo', value: '#8B5CF6' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Verde', value: '#10B981' },
  { name: 'Âmbar', value: '#F59E0B' },
  { name: 'Neutro', value: '#6B7280' },
  { name: 'Azul', value: '#3B82F6' },
];

// Background color presets
export const BACKGROUND_PRESETS_LIGHT = [
  { name: 'Branco', value: '#FFFFFF' },
  { name: 'Cinza Claro', value: '#FAFAFA' },
  { name: 'Bege Quente', value: '#FFF8F6' },
  { name: 'Rosa Claro', value: '#FFF5F7' },
  { name: 'Verde Claro', value: '#F8FBF9' },
];

export const BACKGROUND_PRESETS_DARK = [
  { name: 'Preto', value: '#111111' },
  { name: 'Cinza Escuro', value: '#1A1A1A' },
  { name: 'Azul Escuro', value: '#0F172A' },
];

// Font pairings
export const FONT_THEMES = {
  moderna: {
    name: 'Moderna',
    heading: 'Poppins',
    body: 'Nunito',
    description: 'Limpa e contemporânea',
  },
  elegante: {
    name: 'Elegante',
    heading: 'Playfair Display',
    body: 'Inter',
    description: 'Sofisticada e refinada',
  },
  neutra: {
    name: 'Neutra',
    heading: 'Inter',
    body: 'Inter',
    description: 'Versátil e profissional',
  },
  criativa: {
    name: 'Criativa',
    heading: 'DM Sans',
    body: 'Lato',
    description: 'Moderna e expressiva',
  },
  romantica: {
    name: 'Romântica',
    heading: 'Cormorant',
    body: 'Nunito',
    description: 'Delicada e elegante',
  },
};

// Button shape options
export const BUTTON_SHAPES = {
  rounded: { name: 'Arredondado', value: '12px' },
  square: { name: 'Quadrado', value: '6px' },
  capsule: { name: 'Cápsula', value: '9999px' },
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
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
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
 * Lighten or darken a color by percentage
 */
function adjustColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const adjust = (val: number) => {
    const adjusted = val + (255 - val) * (percent / 100);
    return Math.min(255, Math.max(0, Math.round(adjusted)));
  };

  const r = adjust(rgb.r);
  const g = adjust(rgb.g);
  const b = adjust(rgb.b);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Compute full theme from profile settings
 */
export function computeTheme(profile: ThemeProfile): ComputedTheme {
  const mode = (profile.theme_mode || 'light') as 'light' | 'dark';
  const accent = profile.accent_color || '#8B5CF6';
  const fontTheme = profile.font_theme || 'moderna';
  const ctaShape = profile.cta_shape || 'rounded';

  // Determine background
  let background: string;
  if (profile.background_color) {
    background = profile.background_color;
  } else {
    background = mode === 'dark' ? '#111111' : '#FFFFFF';
  }

  // Determine text color based on background luminance
  const bgLuminance = getLuminance(background);
  const text = bgLuminance > 0.5 ? '#111111' : '#FFFFFF';

  // Calculate surface color (slightly lighter/darker than background)
  const surfaceAdjust = mode === 'dark' ? 8 : -3;
  const surface = adjustColor(background, surfaceAdjust);

  // Muted text color
  const muted = text === '#FFFFFF' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(17, 17, 17, 0.6)';

  // Font pairing
  const fonts = FONT_THEMES[fontTheme as keyof typeof FONT_THEMES] || FONT_THEMES.moderna;

  // Button radius
  const radius = BUTTON_SHAPES[ctaShape as keyof typeof BUTTON_SHAPES]?.value || '12px';

  return {
    mode,
    accent,
    background,
    text,
    surface,
    muted,
    fontHeading: fonts.heading,
    fontBody: fonts.body,
    radius,
  };
}

/**
 * Generate CSS variables from computed theme
 */
export function generateThemeVariables(theme: ComputedTheme): Record<string, string> {
  return {
    '--theme-accent': theme.accent,
    '--theme-background': theme.background,
    '--theme-text': theme.text,
    '--theme-surface': theme.surface,
    '--theme-muted': theme.muted,
    '--theme-radius': theme.radius,
    '--font-heading': theme.fontHeading,
    '--font-body': theme.fontBody,
  };
}

/**
 * Check if accent/background contrast is sufficient
 */
export function hasGoodContrast(accent: string, background: string): boolean {
  const ratio = getContrastRatio(accent, background);
  return ratio >= 4.5; // WCAG AA standard
}
