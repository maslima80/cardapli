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
  onPublish: (status: "public" | "unlisted") => void;
}

export const PublishModal = ({
  open,
  onOpenChange,
  catalogSlug,
  profileSlug,
  currentStatus,
  onPublish,
}: PublishModalProps) => {
  const [status, setStatus] = useState<"public" | "unlisted">(
    currentStatus === "public" ? "public" : "unlisted"
  );
  const [copied, setCopied] = useState(false);

  const publicUrl = profileSlug
    ? `${window.location.origin}/@${profileSlug}/${catalogSlug}`
    : "";

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
            <Label>Visibilidade</Label>
            <select
              className="w-full border rounded-xl p-2"
              value={status}
              onChange={(e) => setStatus(e.target.value as "public" | "unlisted")}
            >
              <option value="public">Público (aparece em buscas)</option>
              <option value="unlisted">Não listado (apenas com link)</option>
            </select>
          </div>

          {publicUrl && (
            <div className="space-y-2">
              <Label>URL Pública</Label>
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
                onPublish(status);
                onOpenChange(false);
              }}
            >
              Publicar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
