import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Eye, Share2, Plus, MessageCircle, Edit } from "lucide-react";
import { toast } from "sonner";
import { publicCatalogUrl, whatsappShareCatalog } from "@/lib/urls";

export default function QuickCatalogSuccess() {
  const navigate = useNavigate();
  const [catalogInfo, setCatalogInfo] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('newCatalog');
    if (!stored) {
      navigate("/compartilhar");
      return;
    }

    const info = JSON.parse(stored);
    setCatalogInfo(info);
  }, [navigate]);

  const handleCopyLink = () => {
    if (!catalogInfo) return;
    const url = `${window.location.origin}${publicCatalogUrl(catalogInfo.userSlug, catalogInfo.slug)}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  };

  const handleWhatsAppShare = () => {
    if (!catalogInfo) return;
    const url = whatsappShareCatalog(catalogInfo.userSlug, catalogInfo.slug, catalogInfo.title);
    window.open(url, '_blank');
  };

  const handleViewCatalog = () => {
    if (!catalogInfo) return;
    window.open(publicCatalogUrl(catalogInfo.userSlug, catalogInfo.slug), '_blank');
  };

  const handleEditCatalog = () => {
    if (!catalogInfo) return;
    navigate(`/catalogos/${catalogInfo.id}/editor`);
  };

  const handleCreateAnother = () => {
    sessionStorage.removeItem('newCatalog');
    navigate("/compartilhar");
  };

  if (!catalogInfo) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const catalogUrl = `cardapli.com.br${publicCatalogUrl(catalogInfo.userSlug, catalogInfo.slug)}`;

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 space-y-6">
          {/* Success Icon */}
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">
              ✅ Seu catálogo está pronto!
            </h1>
            <p className="text-muted-foreground">
              Publicado e pronto para compartilhar
            </p>
          </div>

          {/* Catalog Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Seu link:
            </p>
            <p className="font-mono text-sm break-all">
              {catalogUrl}
            </p>
          </div>

          {/* Helpful Tip */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              💡 <strong>Dica:</strong> Você pode mover blocos, alterar textos e adicionar entrega, pagamentos e depoimentos no editor.
            </p>
          </div>

          {/* Primary Actions */}
          <div className="space-y-3">
            {/* Primary: View & Share */}
            <Button
              onClick={handleViewCatalog}
              className="w-full gap-2"
              size="lg"
            >
              <Eye className="w-5 h-5" />
              Ver e compartilhar
            </Button>

            {/* Secondary: Edit */}
            <Button
              onClick={handleEditCatalog}
              variant="outline"
              className="w-full gap-2"
              size="lg"
            >
              <Edit className="w-4 h-4" />
              Editar e adicionar seções
            </Button>
          </div>

          {/* Quick Share Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleWhatsAppShare}
              variant="outline"
              className="gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </Button>
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              Copiar link
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          {/* Create Another */}
          <Button
            onClick={handleCreateAnother}
            variant="ghost"
            className="w-full gap-2"
          >
            <Plus className="w-4 h-4" />
            Criar outro catálogo rápido
          </Button>

          {/* Go to Dashboard */}
          <Button
            onClick={() => navigate("/catalogos")}
            variant="ghost"
            className="w-full"
          >
            Ir para meus catálogos
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
