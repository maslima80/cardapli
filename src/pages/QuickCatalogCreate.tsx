import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function QuickCatalogCreate() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [layout, setLayout] = useState<"grid" | "list">("grid");

  useEffect(() => {
    // Get selected products from sessionStorage
    const stored = sessionStorage.getItem('quickCatalogProducts');
    if (!stored) {
      toast.error("Nenhum produto selecionado");
      navigate("/compartilhar");
      return;
    }

    const selectedProducts = JSON.parse(stored);
    setProducts(selectedProducts);

    // Auto-fill title with date
    const today = new Date();
    const dateStr = today.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
    setTitle(`Sugestões – ${dateStr}`);

    // Auto-use first product image as cover
    const firstImage = selectedProducts[0]?.photos?.[0]?.url || 
                       selectedProducts[0]?.photos?.[0]?.image_url;
    if (firstImage) {
      setCoverImage(firstImage);
    }
  }, [navigate]);

  const generateSlug = (title: string): string => {
    const base = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Add timestamp to ensure uniqueness
    const timestamp = Date.now().toString(36);
    return `${base}-${timestamp}`;
  };

  const handleCreateCatalog = async () => {
    if (!title.trim()) {
      toast.error("Digite um título para o catálogo");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/entrar");
        return;
      }

      // Get user's slug
      const { data: profile } = await supabase
        .from("profiles")
        .select("slug")
        .eq("id", user.id)
        .single();

      if (!profile?.slug) {
        toast.error("Configure seu nome de usuário primeiro");
        navigate("/escolher-slug?from=compartilhar");
        return;
      }

      const catalogSlug = generateSlug(title);

      // Create catalog
      const { data: catalog, error: catalogError } = await supabase
        .from("catalogs")
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          slug: catalogSlug,
          status: 'publicado',
          link_ativo: true,
          // no_perfil: deprecated - visibility controlled by profile_blocks 'catalogs' block
          cover: coverImage ? { url: coverImage } : null,
        })
        .select()
        .single();

      if (catalogError) throw catalogError;

      // Create Capa block
      const { error: capaError } = await supabase
        .from("catalog_blocks")
        .insert({
          catalog_id: catalog.id,
          type: 'cover',
          sort: 0,
          visible: true,
          data: {
            title: title.trim(),
            subtitle: description.trim() || '',
            image_url: coverImage || '',
            layout: 'full',
            alignment: 'center',
          },
        });

      if (capaError) throw capaError;

      // Create Product Grid block
      const productIds = products.map(p => p.id);
      const { error: gridError } = await supabase
        .from("catalog_blocks")
        .insert({
          catalog_id: catalog.id,
          type: 'product_grid',
          sort: 1,
          visible: true,
          data: {
            mode: 'manual',
            product_ids: productIds,
            layout: layout,
            columns: layout === 'grid' ? 2 : 1,
            show_price: true,
            show_description: true,
          },
        });

      if (gridError) throw gridError;

      // Clear sessionStorage
      sessionStorage.removeItem('quickCatalogProducts');

      // Store catalog info for ShareModal
      sessionStorage.setItem('newCatalog', JSON.stringify({
        id: catalog.id,
        title: catalog.title,
        slug: catalogSlug,
        userSlug: profile.slug,
      }));

      // Navigate to share page
      navigate("/compartilhar/sucesso");

    } catch (error: any) {
      console.error("Error creating catalog:", error);
      toast.error(error.message || "Erro ao criar catálogo");
    } finally {
      setLoading(false);
    }
  };

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/compartilhar")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Criar Catálogo Rápido</h1>
            <p className="text-muted-foreground">
              {products.length} produto{products.length !== 1 ? "s" : ""} selecionado{products.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Catálogo</CardTitle>
            <CardDescription>
              Seu catálogo será publicado automaticamente e pronto para compartilhar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Título <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Sugestões de Natal"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                {title.length}/100 caracteres
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Adicione uma descrição para o catálogo..."
                maxLength={200}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {description.length}/200 caracteres
              </p>
            </div>

            {/* Cover Image Preview */}
            {coverImage && (
              <div className="space-y-2">
                <Label>Imagem de capa</Label>
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  <img
                    src={coverImage}
                    alt="Capa"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Usando a primeira imagem dos produtos selecionados
                </p>
              </div>
            )}

            {/* Layout */}
            <div className="space-y-3">
              <Label>Layout dos produtos</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLayout("grid")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    layout === "grid"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-1">
                      <div className="aspect-square bg-muted rounded"></div>
                      <div className="aspect-square bg-muted rounded"></div>
                    </div>
                    <p className="text-sm font-medium">Grade</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setLayout("list")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    layout === "list"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded"></div>
                    </div>
                    <p className="text-sm font-medium">Lista</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                💡 <strong>Dica:</strong> Seu catálogo será publicado automaticamente. 
                Você pode editá-lo depois no painel principal.
              </p>
            </div>

            {/* Action Button */}
            <Button
              onClick={handleCreateCatalog}
              disabled={loading || !title.trim()}
              size="lg"
              className="w-full gap-2 transition-all hover:scale-105"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Criando catálogo...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  Gerar Catálogo
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
