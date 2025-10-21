import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";
import { PremiumThemeSettings } from "@/components/profile/PremiumThemeSettings";

interface ColorsSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  useBrandColors: boolean;
  themeOverrides: any;
  profile: any;
  onToggle: (useBrand: boolean) => void;
  onThemeChange: (theme: any) => void;
}

export const ColorsSettingsDialog = ({
  open,
  onOpenChange,
  useBrandColors,
  themeOverrides,
  profile,
  onToggle,
  onThemeChange,
}: ColorsSettingsDialogProps) => {
  // Local theme state for customization
  const [localTheme, setLocalTheme] = useState(themeOverrides || {
    use_brand: true,
    mode: "light",
    accent_color: "#8B5CF6",
    font: "clean",
    cta_shape: "rounded"
  });

  const handleThemeChange = (updates: any) => {
    // Map font_theme to font for catalog theme overrides
    const mappedUpdates = { ...updates };
    if (mappedUpdates.font_theme) {
      mappedUpdates.font = mappedUpdates.font_theme;
      delete mappedUpdates.font_theme;
    }
    if (mappedUpdates.theme_mode) {
      mappedUpdates.mode = mappedUpdates.theme_mode;
      delete mappedUpdates.theme_mode;
    }
    
    const newTheme = { ...localTheme, ...mappedUpdates };
    setLocalTheme(newTheme);
    onThemeChange(newTheme);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Palette className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle>Cores do Catálogo</DialogTitle>
              <DialogDescription>Personalização de tema</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="space-y-1">
              <Label className="text-base font-semibold">Usar Cores da Marca</Label>
              <p className="text-sm text-muted-foreground">
                Aplicar cores do perfil
              </p>
            </div>
            <Switch checked={useBrandColors} onCheckedChange={onToggle} />
          </div>

          {/* Explanation */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Como funciona?</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                ✅ Quando <strong>ativado</strong>, este catálogo usa as mesmas
                cores e estilo visual configurados no seu perfil.
              </p>
              <p>
                🎨 Quando <strong>desativado</strong>, você pode personalizar
                cores específicas apenas para este catálogo.
              </p>
              <p>
                💡 Útil se você quer um catálogo com visual diferente dos outros!
              </p>
            </div>
          </div>

          {/* Custom Theme Options - Only visible when brand colors are OFF */}
          {!useBrandColors && (
            <div className="border-t pt-4 space-y-4">
              <h4 className="font-semibold text-sm">Personalizar Cores</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Configure o tema visual deste catálogo:
              </p>
              <PremiumThemeSettings
                profile={{ 
                  ...profile, 
                  ...localTheme,
                  font_theme: localTheme.font || profile?.font_theme,
                  theme_mode: localTheme.mode || profile?.theme_mode
                }}
                onChange={(field, value) => handleThemeChange({ [field]: value })}
              />
            </div>
          )}

          {/* Preview */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-sm mb-3">Preview</h4>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg p-4">
              <div className="space-y-3">
                <div 
                  className="h-10 rounded-lg flex items-center justify-center text-sm font-medium text-white"
                  style={{ 
                    backgroundColor: useBrandColors 
                      ? (profile?.accent_color || "#8B5CF6")
                      : (localTheme.accent_color || "#8B5CF6")
                  }}
                >
                  Botão de Ação
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {useBrandColors 
                    ? "Usando cores do perfil"
                    : "Usando cores personalizadas"}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-2">
            <Button onClick={() => onOpenChange(false)}>Fechar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
