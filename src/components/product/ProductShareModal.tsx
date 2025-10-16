import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Copy, Eye, Check, Mail } from "lucide-react";
import { toast } from "sonner";
import { publicProductFullUrl, whatsappShareProduct } from "@/lib/urls";

interface ProductShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productTitle: string;
  productSlug: string;
  userSlug: string;
  publicLink: boolean;
  onActivateLink?: () => Promise<void>;
}

export const ProductShareModal = ({
  open,
  onOpenChange,
  productTitle,
  productSlug,
  userSlug,
  publicLink,
  onActivateLink,
}: ProductShareModalProps) => {
  const [copied, setCopied] = useState(false);
  const [activating, setActivating] = useState(false);

  const productUrl = publicProductFullUrl(userSlug, productSlug);
  const whatsappUrl = whatsappShareProduct(userSlug, productSlug, productTitle);

  const handleCopy = () => {
    navigator.clipboard.writeText(productUrl);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleActivateAndShare = async () => {
    if (!onActivateLink) return;
    
    setActivating(true);
    try {
      await onActivateLink();
      toast.success("Link público ativado!");
    } catch (error) {
      toast.error("Erro ao ativar link");
    } finally {
      setActivating(false);
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Confira: ${productTitle}`);
    const body = encodeURIComponent(`Olá!\n\nConfira este produto: "${productTitle}"\n\n${productUrl}\n\nEspero que goste!`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  // If product link is not public, show activation modal
  if (!publicLink) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ativar link público?</DialogTitle>
            <DialogDescription>
              Este produto está oculto. Para compartilhá-lo, ative o link público.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-900 dark:text-yellow-100">
                ⚠️ <strong>Produto oculto</strong>
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                Ao ativar o link público, qualquer pessoa com o link poderá ver este produto.
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleActivateAndShare}
                disabled={activating}
                className="gap-2"
              >
                {activating ? "Ativando..." : "Ativar e compartilhar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pronto para enviar?</DialogTitle>
          <DialogDescription>
            Compartilhe este produto com seus clientes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Info */}
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="font-medium truncate">{productTitle}</p>
          </div>

          {/* URL Display */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Link do produto</label>
            <div className="flex gap-2">
              <Input value={productUrl} readOnly className="flex-1" />
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

          {/* Action Buttons */}
          <div className="space-y-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full gap-2 bg-green-600 hover:bg-green-700">
                <MessageCircle className="w-4 h-4" />
                Enviar no WhatsApp
              </Button>
            </a>

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleEmailShare}
            >
              <Mail className="w-4 h-4" />
              Enviar Email
            </Button>

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                window.open(productUrl, '_blank');
              }}
            >
              <Eye className="w-4 h-4" />
              Ver produto
            </Button>
          </div>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-xs text-blue-900 dark:text-blue-100">
              💡 <strong>Dica:</strong> O link leva direto para a página do produto com todas as informações.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
