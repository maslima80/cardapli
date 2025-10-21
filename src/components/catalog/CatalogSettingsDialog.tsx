import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PremiumThemeSettings } from "@/components/profile/PremiumThemeSettings";
import { MessageCircle } from "lucide-react";

interface CatalogSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: {
    show_section_nav?: boolean;
    show_whatsapp_bubble?: boolean;
    show_bottom_nav?: boolean;
  };
  themeOverrides?: {
    use_brand?: boolean;
    mode?: "light" | "dark";
    accent_color?: string;
    font?: string;
    font_theme?: string;
    cta_shape?: "rounded" | "square" | "capsule";
  };
  profile?: any;
  hasWhatsApp?: boolean;
  defaultTab?: "general" | "navigation" | "theme";
  onSave: (settings: any) => void;
  onThemeChange: (theme: any) => void;
}

export const CatalogSettingsDialog = ({
  open,
  onOpenChange,
  settings = { show_section_nav: false, show_whatsapp_bubble: false, show_bottom_nav: false },
  themeOverrides = {},
  profile,
  hasWhatsApp = false,
  defaultTab = "general",
  onSave,
  onThemeChange,
}: CatalogSettingsDialogProps) => {
  // Initialize localTheme with default values to prevent null/undefined errors
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

  // Safely access use_brand with a fallback to true
  const useBrand = localTheme?.use_brand !== false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurações Avançadas</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="navigation">Navegação</TabsTrigger>
            <TabsTrigger value="theme">Tema</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">

            {/* WhatsApp Bubble Toggle */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="space-y-0.5">
                  <Label>WhatsApp Bubble</Label>
                  <p className="text-xs text-muted-foreground">
                    {hasWhatsApp
                      ? "Mostrar botão flutuante de WhatsApp neste catálogo"
                      : "Adicione um WhatsApp no seu perfil primeiro"}
                  </p>
                </div>
              </div>
              <Switch
                checked={settings?.show_whatsapp_bubble || false}
                onCheckedChange={(checked) =>
                  onSave({ ...settings, show_whatsapp_bubble: checked })
                }
                disabled={!hasWhatsApp}
              />
            </div>
          </TabsContent>

          <TabsContent value="navigation" className="space-y-4 mt-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                💡 <strong>Dica:</strong> Use os botões de alternância no topo da página para ativar/desativar 
                o menu de navegação rapidamente. Quando ativo, clique em "Configurar" para escolher quais 
                seções aparecem no menu.
              </p>
            </div>

            {/* Section Navigation (legacy - keep for backward compatibility) */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-0.5">
                <Label>Navegação Lateral (Legado)</Label>
                <p className="text-xs text-muted-foreground">
                  Menu lateral antigo - recomendamos usar o Menu Inferior
                </p>
              </div>
              <Switch
                checked={settings?.show_section_nav || false}
                onCheckedChange={(checked) =>
                  onSave({ ...settings, show_section_nav: checked })
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="theme" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Usar estilo da marca</Label>
                <p className="text-xs text-muted-foreground">
                  Aplicar configurações de tema do seu perfil
                </p>
              </div>
              <Switch
                checked={useBrand}
                onCheckedChange={(checked) =>
                  handleThemeChange({ use_brand: checked })
                }
              />
            </div>

            {!useBrand && profile && (
              <div className="border-t pt-4">
                <PremiumThemeSettings
                  profile={{ 
                    ...profile, 
                    ...localTheme,
                    font_theme: localTheme.font || profile.font_theme,
                    theme_mode: localTheme.mode || profile.theme_mode
                  }}
                  onChange={(field, value) => handleThemeChange({ [field]: value })}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
