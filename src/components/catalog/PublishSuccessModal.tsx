import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, ExternalLink, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { publicCatalogUrl, whatsappShareCatalog } from "@/lib/urls";
import { useNavigate } from "react-router-dom";

interface PublishSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userSlug: string;
  catalogSlug: string;
  catalogTitle: string;
}

export const PublishSuccessModal = ({
  open,
  onOpenChange,
  userSlug,
  catalogSlug,
  catalogTitle,
}: PublishSuccessModalProps) => {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const publicUrl = `${window.location.origin}${publicCatalogUrl(userSlug, catalogSlug)}`;
  const whatsappUrl = whatsappShareCatalog(userSlug, catalogSlug);

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    window.open(whatsappUrl, "_blank");
  };

  const handleViewCatalog = () => {
    window.open(publicCatalogUrl(userSlug, catalogSlug), "_blank");
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Catálogo: ${catalogTitle}`);
    const body = encodeURIComponent(`Oi! Dá uma olhada neste catálogo:\n\n${publicUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center space-y-4">
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-4xl">🎉</span>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold mb-2">Catálogo publicado!</h2>
            <p className="text-muted-foreground">
              Agora você pode enviar para seus clientes
            </p>
          </div>

          {/* URL Display */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input 
                value={publicUrl} 
                readOnly 
                className="flex-1 text-sm" 
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                title="Copiar link"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <Button
              onClick={handleWhatsApp}
              className="w-full gap-2 bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Enviar no WhatsApp
            </Button>

            <Button
              onClick={handleEmail}
              variant="outline"
              className="w-full gap-2"
              size="lg"
            >
              <Mail className="w-4 h-4" />
              Enviar Email
            </Button>

            <Button
              onClick={handleViewCatalog}
              variant="outline"
              className="w-full gap-2"
              size="lg"
            >
              <ExternalLink className="w-4 h-4" />
              Ver catálogo
            </Button>
          </div>

          {/* Close Button */}
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            className="w-full"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
