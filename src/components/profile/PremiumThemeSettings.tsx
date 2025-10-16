import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sun, Moon, AlertCircle } from "lucide-react";
import {
  computeTheme,
  generateThemeVariables,
  hasGoodContrast,
  ACCENT_PRESETS,
  BACKGROUND_PRESETS_LIGHT,
  BACKGROUND_PRESETS_DARK,
  FONT_THEMES,
  BUTTON_SHAPES,
  type ThemeProfile,
  type ComputedTheme,
} from "@/lib/premium-theme";
import { cn } from "@/lib/utils";

interface PremiumThemeSettingsProps {
  profile: ThemeProfile & {
    business_name?: string | null;
    slogan?: string | null;
  };
  onChange: (field: string, value: any) => void;
}

export function PremiumThemeSettings({ profile, onChange }: PremiumThemeSettingsProps) {
  const [theme, setTheme] = useState<ComputedTheme>(computeTheme(profile));
  const [showContrastWarning, setShowContrastWarning] = useState(false);

  // Recompute theme when profile changes
  useEffect(() => {
    const computed = computeTheme(profile);
    setTheme(computed);
    
    // Check contrast
    const goodContrast = hasGoodContrast(computed.accent, computed.background);
    setShowContrastWarning(!goodContrast);
  }, [profile]);

  const themeVars = generateThemeVariables(theme);
  const mode = profile.theme_mode || 'light';
  const backgroundPresets = mode === 'dark' ? BACKGROUND_PRESETS_DARK : BACKGROUND_PRESETS_LIGHT;

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Modo</Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onChange('theme_mode', 'light')}
            className={cn(
              "h-12 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-medium",
              mode === 'light'
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background hover:bg-muted"
            )}
          >
            <Sun className="w-4 h-4" />
            Claro
          </button>
          <button
            type="button"
            onClick={() => onChange('theme_mode', 'dark')}
            className={cn(
              "h-12 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-medium",
              mode === 'dark'
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background hover:bg-muted"
            )}
          >
            <Moon className="w-4 h-4" />
            Escuro
          </button>
        </div>
      </div>

      {/* Accent Color */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Cor Principal</Label>
        
        {/* Color Picker + HEX Input */}
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={profile.accent_color || '#8B5CF6'}
            onChange={(e) => onChange('accent_color', e.target.value)}
            className="w-14 h-14 rounded-xl border-2 border-border cursor-pointer"
          />
          <Input
            value={profile.accent_color || '#8B5CF6'}
            onChange={(e) => onChange('accent_color', e.target.value)}
            placeholder="#8B5CF6"
            className="flex-1 h-14 text-base"
          />
        </div>

        {/* Preset Colors */}
        <div className="grid grid-cols-6 gap-2">
          {ACCENT_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => onChange('accent_color', preset.value)}
              className={cn(
                "h-12 rounded-lg border-2 transition-all",
                profile.accent_color === preset.value
                  ? "border-primary scale-105"
                  : "border-transparent hover:border-border"
              )}
              style={{ backgroundColor: preset.value }}
              title={preset.name}
            />
          ))}
        </div>

        {/* Contrast Warning */}
        {showContrastWarning && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>Cor principal com pouco contraste — pode afetar a legibilidade.</p>
          </div>
        )}
      </div>

      {/* Background Color */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Cor de Fundo</Label>
        
        {/* Preset Backgrounds */}
        <div className="grid grid-cols-3 gap-2">
          {backgroundPresets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => onChange('background_color', preset.value)}
              className={cn(
                "h-16 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1",
                profile.background_color === preset.value
                  ? "border-primary scale-105"
                  : "border-border hover:border-muted-foreground"
              )}
              style={{ backgroundColor: preset.value }}
            >
              <span className={cn(
                "text-xs font-medium",
                preset.value === '#FFFFFF' || preset.value === '#FAFAFA' || preset.value === '#FFF8F6' || preset.value === '#FFF5F7' || preset.value === '#F8FBF9'
                  ? "text-slate-700"
                  : "text-white"
              )}>
                {preset.name}
              </span>
            </button>
          ))}
        </div>

        {/* Custom HEX Input */}
        <Input
          value={profile.background_color || ''}
          onChange={(e) => onChange('background_color', e.target.value)}
          placeholder="Personalizado (ex: #F0F0F0)"
          className="h-12"
        />
      </div>

      {/* Font Pairing */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Fonte</Label>
        <div className="space-y-2">
          {Object.entries(FONT_THEMES).map(([key, font]) => (
            <button
              key={key}
              type="button"
              onClick={() => onChange('font_theme', key)}
              className={cn(
                "w-full p-4 rounded-xl border-2 transition-all text-left",
                profile.font_theme === key
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground"
              )}
            >
              <div className="font-semibold text-base">{font.name}</div>
              <div className="text-sm text-muted-foreground mt-0.5">
                {font.heading} + {font.body}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {font.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Button Shape */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Forma dos Botões</Label>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(BUTTON_SHAPES).map(([key, shape]) => (
            <button
              key={key}
              type="button"
              onClick={() => onChange('cta_shape', key)}
              className={cn(
                "h-12 border-2 transition-all font-medium",
                profile.cta_shape === key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:bg-muted"
              )}
              style={{ borderRadius: shape.value }}
            >
              {shape.name}
            </button>
          ))}
        </div>
      </div>

      {/* Live Preview */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Pré-visualização</Label>
        <div
          className="p-8 rounded-2xl border-2 border-border transition-all duration-300"
          style={{
            backgroundColor: theme.background,
            color: theme.text,
            fontFamily: theme.fontBody,
          }}
        >
          <div className="text-center space-y-4">
            {/* Logo placeholder */}
            <div
              className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl font-bold"
              style={{ backgroundColor: theme.accent, color: '#FFFFFF' }}
            >
              {profile.business_name?.charAt(0) || 'C'}
            </div>

            {/* Business Name */}
            <h3
              className="text-2xl font-bold"
              style={{ fontFamily: theme.fontHeading }}
            >
              {profile.business_name || 'Seu Negócio'}
            </h3>

            {/* Slogan */}
            <p style={{ color: theme.muted }}>
              {profile.slogan || 'Seu slogan aparece aqui'}
            </p>

            {/* CTA Button */}
            <button
              className="px-6 py-3 font-semibold transition-transform hover:scale-105 shadow-lg"
              style={{
                backgroundColor: theme.accent,
                color: '#FFFFFF',
                borderRadius: theme.radius,
                boxShadow: `0 4px 12px ${theme.accent}40`,
              }}
            >
              Ver Catálogo
            </button>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          onChange('theme_mode', 'light');
          onChange('accent_color', '#8B5CF6');
          onChange('background_color', null);
          onChange('font_theme', 'moderna');
          onChange('cta_shape', 'rounded');
        }}
        className="w-full"
      >
        Restaurar Padrão
      </Button>
    </div>
  );
}
