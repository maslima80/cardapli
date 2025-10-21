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
import { Navigation, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  onConfigure: () => void;
}

export const MenuSettingsDialog = ({
  open,
  onOpenChange,
  enabled,
  onToggle,
  onConfigure,
}: MenuSettingsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
              <Navigation className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle>Menu de Navegação</DialogTitle>
              <DialogDescription>Menu fixo na parte inferior</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="space-y-1">
              <Label className="text-base font-semibold">Ativar Menu</Label>
              <p className="text-sm text-muted-foreground">
                Mostrar menu de navegação
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={onToggle} />
          </div>

          {/* Explanation */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Como funciona?</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                ✅ Quando <strong>ativado</strong>, um menu fixo aparece na parte
                inferior do catálogo com links para as seções principais.
              </p>
              <p>
                🚀 Seus clientes podem pular rapidamente entre seções como
                "Produtos", "Sobre", "Contato", etc.
              </p>
              <p>
                ⚡ Perfeito para catálogos com várias seções - melhora muito a
                experiência de navegação!
              </p>
            </div>
          </div>

          {/* Configuration Options - Only visible when enabled */}
          {enabled && (
            <div className="border-t pt-4 space-y-4">
              <h4 className="font-semibold text-sm">Configurar Menu</h4>
              <p className="text-sm text-muted-foreground">
                Escolha quais blocos do seu catálogo aparecem no menu de navegação.
              </p>
              <Button
                onClick={() => {
                  onOpenChange(false);
                  onConfigure();
                }}
                className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
              >
                <Settings className="w-4 h-4" />
                Configurar Itens do Menu
              </Button>
            </div>
          )}

          {/* Preview */}
          {enabled && (
            <div className="border-t pt-4">
              <h4 className="font-semibold text-sm mb-3">Preview</h4>
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg p-4">
                <div className="bg-white dark:bg-slate-950 rounded-lg p-3 shadow-sm">
                  <div className="flex gap-2 justify-center">
                    <div className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium",
                      "bg-purple-600 text-white"
                    )}>
                      Produtos
                    </div>
                    <div className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                      Sobre
                    </div>
                    <div className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                      Contato
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Menu fixo na parte inferior do catálogo
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end pt-2">
            <Button onClick={() => onOpenChange(false)}>Fechar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
