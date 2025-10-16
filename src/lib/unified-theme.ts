/**
 * Unified Theme System
 * Generates complete design tokens for light/dark modes with proper surfaces and scales
 */

export type ThemeMode = 'light' | 'dark';
export type FontPair = 'moderna' | 'elegante' | 'neutra' | 'criativa' | 'romantica';
export type ButtonShape = 'rounded' | 'square' | 'capsule';

export interface ThemeConfig {
  mode: ThemeMode;
  accentColor: string;
  backgroundColor?: string | null;
  fontPair: FontPair;
  buttonShape: ButtonShape;
}

export interface ThemeTokens {
  // Core colors
  bg: string;
  text: string;
  muted: string;
  
  // Surfaces
  surface: string;
  surfaceAlt: string;
  
  // Brand
  brand: string;
  brandContrast: string;
  
  // Brand scale (100-900)
  brand100: string;
  brand200: string;
  brand300: string;
  brand400: string;
  brand500: string;
  brand600: string;
  brand700: string;
  brand800: string;
  brand900: string;
  
  // Layout
  cardRadius: string;
  shadowSm: string;
  shadowMd: string;
  
  // Typography
  fontHeading: string;
  fontBody: string;
  googleFontsUrl: string;
}

// Font pair definitions
const FONT_PAIRS: Record<FontPair, { heading: string; body: string; weights: string }> = {
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

// Button shape mappings
const BUTTON_SHAPES: Record<ButtonShape, string> = {
  rounded: '12px',
  square: '6px',
  capsule: '9999px',
};

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
 * Convert RGB to HEX
 */
function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Lighten or darken a color by percentage
 */
function adjustColor(hex: string, percent: number): string {
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

  return rgbToHex(adjust(rgb.r), adjust(rgb.g), adjust(rgb.b));
}

/**
 * Generate a 10-step color scale from base color
 */
function generateColorScale(baseColor: string): {
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
} {
  return {
    100: adjustColor(baseColor, 60),
    200: adjustColor(baseColor, 45),
    300: adjustColor(baseColor, 30),
    400: adjustColor(baseColor, 15),
    500: baseColor,
    600: adjustColor(baseColor, -15),
    700: adjustColor(baseColor, -30),
    800: adjustColor(baseColor, -45),
    900: adjustColor(baseColor, -60),
  };
}

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
 * Pick readable contrast color (white or black)
 */
function getContrastColor(bgColor: string): string {
  const luminance = getLuminance(bgColor);
  return luminance > 0.5 ? '#111111' : '#FFFFFF';
}

/**
 * Generate complete theme tokens
 */
export function generateThemeTokens(config: ThemeConfig): ThemeTokens {
  const { mode, accentColor, backgroundColor, fontPair, buttonShape } = config;

  // Core colors based on mode
  let bg: string;
  let surface: string;
  let surfaceAlt: string;
  let text: string;
  let muted: string;

  if (mode === 'dark') {
    bg = backgroundColor || '#0B0B0E';
    surface = adjustColor(bg, 8);
    surfaceAlt = adjustColor(bg, 12);
    text = '#EDEEF0';
    muted = '#9AA1AC';
  } else {
    bg = backgroundColor || '#F7F7F8';
    surface = '#FFFFFF';
    surfaceAlt = '#FAFAFB';
    text = '#111111';
    muted = '#6B7280';
  }

  // Brand colors
  const brand = accentColor;
  const brandContrast = getContrastColor(brand);
  const brandScale = generateColorScale(brand);

  // Layout tokens
  const cardRadius = BUTTON_SHAPES[buttonShape];
  const shadowSm = mode === 'dark' 
    ? '0 1px 2px 0 rgba(0, 0, 0, 0.5)'
    : '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
  const shadowMd = mode === 'dark'
    ? '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)'
    : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';

  // Typography
  const fonts = FONT_PAIRS[fontPair];
  const googleFontsUrl = `https://fonts.googleapis.com/css2?${fonts.weights}&display=swap`;

  return {
    bg,
    text,
    muted,
    surface,
    surfaceAlt,
    brand,
    brandContrast,
    brand100: brandScale[100],
    brand200: brandScale[200],
    brand300: brandScale[300],
    brand400: brandScale[400],
    brand500: brandScale[500],
    brand600: brandScale[600],
    brand700: brandScale[700],
    brand800: brandScale[800],
    brand900: brandScale[900],
    cardRadius,
    shadowSm,
    shadowMd,
    fontHeading: fonts.heading,
    fontBody: fonts.body,
    googleFontsUrl,
  };
}

/**
 * Apply theme tokens as CSS variables
 */
export function applyThemeTokens(tokens: ThemeTokens, root: HTMLElement = document.documentElement): void {
  root.style.setProperty('--bg', tokens.bg);
  root.style.setProperty('--text', tokens.text);
  root.style.setProperty('--muted', tokens.muted);
  root.style.setProperty('--surface', tokens.surface);
  root.style.setProperty('--surface-alt', tokens.surfaceAlt);
  root.style.setProperty('--brand', tokens.brand);
  root.style.setProperty('--brand-contrast', tokens.brandContrast);
  root.style.setProperty('--brand-100', tokens.brand100);
  root.style.setProperty('--brand-200', tokens.brand200);
  root.style.setProperty('--brand-300', tokens.brand300);
  root.style.setProperty('--brand-400', tokens.brand400);
  root.style.setProperty('--brand-500', tokens.brand500);
  root.style.setProperty('--brand-600', tokens.brand600);
  root.style.setProperty('--brand-700', tokens.brand700);
  root.style.setProperty('--brand-800', tokens.brand800);
  root.style.setProperty('--brand-900', tokens.brand900);
  root.style.setProperty('--card-radius', tokens.cardRadius);
  root.style.setProperty('--shadow-sm', tokens.shadowSm);
  root.style.setProperty('--shadow-md', tokens.shadowMd);
  root.style.setProperty('--font-heading', tokens.fontHeading);
  root.style.setProperty('--font-body', tokens.fontBody);
  
  // Set data attribute for mode
  root.dataset.themeMode = tokens.bg === '#0B0B0E' || tokens.bg.startsWith('#0') ? 'dark' : 'light';
}
