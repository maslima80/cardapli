import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { publicCatalogUrl } from "@/lib/urls";

interface PublishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catalogSlug: string;
  profileSlug?: string;
  currentStatus: string;
  linkAtivo: boolean;
  // noPerfil: deprecated - visibility controlled by profile_blocks 'catalogs' block
  onPublish: (data: { status: string; link_ativo: boolean }) => void;
}

export const PublishModal = ({
  open,
  onOpenChange,
  catalogSlug,
  profileSlug,
  currentStatus,
  linkAtivo,
  // noPerfil: deprecated
  onPublish,
}: PublishModalProps) => {
  const [linkActive, setLinkActive] = useState(true); // Default to active
  const [showInProfile, setShowInProfile] = useState(false); // Default to not on profile
  const [copied, setCopied] = useState(false);

  // URL format: /u/user-slug/catalog-slug
  const publicUrl = profileSlug 
    ? `${window.location.origin}${publicCatalogUrl(profileSlug, catalogSlug)}`
    : `${window.location.origin}/c/${catalogSlug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pronto para compartilhar?</DialogTitle>
          <DialogDescription>
            Seu catálogo ficará disponível para enviar por WhatsApp 📱
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">Permitir acesso por link</Label>
                <p className="text-xs text-muted-foreground">
                  Qualquer pessoa com o link poderá ver seu catálogo
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={linkActive}
                  onChange={(e) => setLinkActive(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
              </label>
            </div>
          </div>

          {linkActive && (
            <div className="space-y-3 animate-in fade-in-50 duration-200">
              <div className="space-y-2">
                <Label>Seu link para compartilhar</Label>
                <div className="flex gap-2">
                  <Input value={publicUrl} readOnly className="flex-1" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">
                  💡 <strong>Dica:</strong> Depois você pode adicionar este catálogo ao seu perfil público usando o construtor de perfil
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                onPublish({
                  status: 'publicado',
                  link_ativo: linkActive,
                  // no_perfil: deprecated - visibility controlled by profile_blocks 'catalogs' block
                });
                
                // Show warning if link is being deactivated
                if (!linkActive) {
                  toast.info("Link desativado. O catálogo não aparecerá mais na sua página pública.");
                }
                
                onOpenChange(false);
              }}
              className="gap-2"
            >
              🎉 Publicar Catálogo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
