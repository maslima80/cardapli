import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

interface CatalogSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: {
    show_section_nav?: boolean;
  };
  themeOverrides?: {
    use_brand?: boolean;
    mode?: "light" | "dark";
    accent_color?: string;
    font?: "clean" | "elegant" | "modern";
    cta_shape?: "rounded" | "square" | "capsule";
  };
  onSave: (settings: any) => void;
  onThemeChange: (theme: any) => void;
}

export const CatalogSettingsDialog = ({
  open,
  onOpenChange,
  settings = { show_section_nav: false },
  themeOverrides = {},
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
    const newTheme = { ...localTheme, ...updates };
    setLocalTheme(newTheme);
    onThemeChange(newTheme);
  };

  // Safely access use_brand with a fallback to true
  const useBrand = localTheme?.use_brand !== false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Configurações do Catálogo</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="theme">Tema</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mostrar navegação por seções</Label>
                <p className="text-xs text-muted-foreground">
                  Exibe uma navegação clicável para as seções com âncoras
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

            {!useBrand && (
              <>
                <div className="space-y-2">
                  <Label>Modo</Label>
                  <select
                    className="w-full border rounded-xl p-2 bg-background"
                    value={localTheme?.mode || "light"}
                    onChange={(e) =>
                      handleThemeChange({
                        mode: e.target.value as "light" | "dark",
                      })
                    }
                  >
                    <option value="light">Claro</option>
                    <option value="dark">Escuro</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Cor de destaque</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={localTheme?.accent_color || "#8B5CF6"}
                      onChange={(e) =>
                        handleThemeChange({ accent_color: e.target.value })
                      }
                      className="w-20 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={localTheme?.accent_color || "#8B5CF6"}
                      onChange={(e) =>
                        handleThemeChange({ accent_color: e.target.value })
                      }
                      placeholder="#8B5CF6"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Fonte</Label>
                  <select
                    className="w-full border rounded-xl p-2 bg-background"
                    value={localTheme?.font || "clean"}
                    onChange={(e) =>
                      handleThemeChange({
                        font: e.target.value as "clean" | "elegant" | "modern",
                      })
                    }
                  >
                    <option value="clean">Clean (Inter)</option>
                    <option value="elegant">Elegante (Playfair + Inter)</option>
                    <option value="modern">Moderna (Poppins)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Forma dos botões</Label>
                  <select
                    className="w-full border rounded-xl p-2 bg-background"
                    value={localTheme?.cta_shape || "rounded"}
                    onChange={(e) =>
                      handleThemeChange({
                        cta_shape: e.target.value as
                          | "rounded"
                          | "square"
                          | "capsule",
                      })
                    }
                  >
                    <option value="rounded">Rounded</option>
                    <option value="square">Square</option>
                    <option value="capsule">Capsule</option>
                  </select>
                </div>
              </>
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
