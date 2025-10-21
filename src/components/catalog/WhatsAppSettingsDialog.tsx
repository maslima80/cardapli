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
import { MessageCircle, Smartphone } from "lucide-react";

interface WhatsAppSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enabled: boolean;
  hasWhatsApp: boolean;
  whatsappNumber?: string;
  onToggle: (enabled: boolean) => void;
}

export const WhatsAppSettingsDialog = ({
  open,
  onOpenChange,
  enabled,
  hasWhatsApp,
  whatsappNumber,
  onToggle,
}: WhatsAppSettingsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle>WhatsApp</DialogTitle>
              <DialogDescription>Botão flutuante de contato</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="space-y-1">
              <Label className="text-base font-semibold">Ativar WhatsApp</Label>
              <p className="text-sm text-muted-foreground">
                Mostrar botão neste catálogo
              </p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={onToggle}
              disabled={!hasWhatsApp}
            />
          </div>

          {/* Explanation */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Como funciona?</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                ✅ Quando <strong>ativado</strong>, seus clientes verão um botão
                verde flutuante no canto inferior direito do catálogo.
              </p>
              <p>
                💬 Ao clicar, abrirão uma conversa direta com você no WhatsApp,
                facilitando o atendimento rápido.
              </p>
              {hasWhatsApp && whatsappNumber && (
                <div className="flex items-center gap-2 p-3 bg-[#25D366]/10 rounded-lg mt-3">
                  <Smartphone className="w-4 h-4 text-[#25D366]" />
                  <span className="text-sm font-medium">
                    Número: {whatsappNumber}
                  </span>
                </div>
              )}
              {!hasWhatsApp && (
                <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg mt-3">
                  <p className="text-sm text-orange-900 dark:text-orange-100">
                    ⚠️ Você precisa adicionar um número de WhatsApp no seu perfil
                    primeiro.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          {enabled && (
            <div className="border-t pt-4">
              <h4 className="font-semibold text-sm mb-3">Preview</h4>
              <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg p-6 h-32">
                <div className="absolute bottom-4 right-4">
                  <div className="w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg animate-pulse">
                    <MessageCircle className="w-7 h-7 text-white" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Assim aparecerá no seu catálogo →
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
