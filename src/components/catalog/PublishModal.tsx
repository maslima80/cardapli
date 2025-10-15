import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface PublishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catalogSlug: string;
  profileSlug?: string;
  currentStatus: string;
  linkAtivo: boolean;
  noPerfil: boolean;
  onPublish: (data: { status: string; link_ativo: boolean; no_perfil: boolean }) => void;
}

export const PublishModal = ({
  open,
  onOpenChange,
  catalogSlug,
  profileSlug,
  currentStatus,
  linkAtivo,
  noPerfil,
  onPublish,
}: PublishModalProps) => {
  const [status, setStatus] = useState<"rascunho" | "publicado">(
    currentStatus === "publicado" ? "publicado" : "rascunho"
  );
  const [linkActive, setLinkActive] = useState(linkAtivo);
  const [showInProfile, setShowInProfile] = useState(noPerfil);
  const [copied, setCopied] = useState(false);

  // URL format: /@user-slug/catalog-slug
  const publicUrl = profileSlug 
    ? `${window.location.origin}/@${profileSlug}/${catalogSlug}`
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
          <DialogTitle>Publicar Catálogo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Status do Conteúdo</Label>
            <select
              className="w-full border rounded-xl p-2"
              value={status}
              onChange={(e) => setStatus(e.target.value as "rascunho" | "publicado")}
            >
              <option value="rascunho">Rascunho (não publicado)</option>
              <option value="publicado">Publicado (pronto para compartilhar)</option>
            </select>
          </div>

          {status === "publicado" && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Link de Compartilhamento</Label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={linkActive}
                      onChange={(e) => setLinkActive(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{linkActive ? "Ativo" : "Desativado"}</span>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  {linkActive 
                    ? "Qualquer pessoa com o link pode acessar" 
                    : "O link não funcionará até ser ativado"}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Mostrar no Perfil</Label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showInProfile}
                      onChange={(e) => setShowInProfile(e.target.checked)}
                      className="w-4 h-4"
                      disabled={!linkActive}
                    />
                    <span className="text-sm">{showInProfile ? "Sim" : "Não"}</span>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  {!linkActive 
                    ? "Ative o link primeiro para mostrar no perfil" 
                    : showInProfile
                    ? "Aparecerá na sua página @" + (profileSlug || "seu-perfil")
                    : "Não aparecerá no seu perfil público"}
                </p>
              </div>
            </>
          )}

          {status === "publicado" && linkActive && (
            <div className="space-y-2">
              <Label>URL para Compartilhar</Label>
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
          )}

          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                onPublish({
                  status,
                  link_ativo: status === "publicado" ? linkActive : false,
                  no_perfil: status === "publicado" && linkActive ? showInProfile : false,
                });
                onOpenChange(false);
              }}
            >
              {status === "rascunho" ? "Salvar como Rascunho" : "Publicar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
