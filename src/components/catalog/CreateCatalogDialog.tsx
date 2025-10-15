import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { SimpleImageUploader } from "./SimpleImageUploader";

interface CreateCatalogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateCatalogDialog({ open, onOpenChange, onSuccess }: CreateCatalogDialogProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [slug, setSlug] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [slugError, setSlugError] = useState("");

  // Auto-generate slug from title
  useEffect(() => {
    if (title) {
      const generatedSlug = title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(generatedSlug);
    }
  }, [title]);

  // Check slug uniqueness
  useEffect(() => {
    const checkSlug = async () => {
      if (!slug.trim()) {
        setSlugError("");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("catalogs")
        .select("id")
        .eq("user_id", user.id)
        .eq("slug", slug.trim())
        .maybeSingle();

      if (data) {
        setSlugError("Este identificador já está em uso");
      } else {
        setSlugError("");
      }
    };

    const timer = setTimeout(checkSlug, 300);
    return () => clearTimeout(timer);
  }, [slug]);

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Por favor, insira um título");
      return;
    }

    if (slugError) {
      toast.error("Corrija o erro no identificador antes de continuar");
      return;
    }

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Você precisa estar logado");
      setLoading(false);
      return;
    }

    const finalSlug = slug.trim() || `catalogo-${Date.now()}`;

    const { data, error } = await supabase
      .from("catalogs")
      .insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        slug: finalSlug,
        status: 'rascunho', // Always start as draft
        link_ativo: false, // Not active until published
        // no_perfil: deprecated - visibility controlled by profile_blocks 'catalogs' block
      })
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation
      if (error.code === '23505') {
        setSlugError("Este identificador já está em uso");
        toast.error("Este identificador já está em uso");
      } else {
        toast.error("Erro ao criar catálogo");
        console.error(error);
      }
      setLoading(false);
    } else {
      // Create the cover block automatically
      await supabase
        .from("catalog_blocks")
        .insert({
          catalog_id: data.id,
          type: "cover",
          sort: 0,
          visible: true,
          data: {
            title: title.trim(),
            subtitle: description.trim() || "",
            image_url: coverImage || "",
            align: "center",
            use_profile_logo: false,
          },
        });

      // Reset form
      setTitle("");
      setDescription("");
      setCoverImage("");
      setSlug("");
      setSlugError("");
      setShowAdvanced(false);
      setLoading(false);
      onOpenChange(false);
      
      // Call onSuccess if provided, otherwise navigate
      if (onSuccess) {
        onSuccess();
        toast.success("Catálogo criado com sucesso ✨");
      } else {
        navigate(`/catalogos/${data.id}/editor`);
        setTimeout(() => {
          toast.success("Catálogo criado com sucesso ✨");
        }, 100);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Catálogo</DialogTitle>
          <DialogDescription>
            Vamos criar algo bonito para você compartilhar ✨
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">
              Como quer chamar seu catálogo? <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Catálogo de Páscoa 2025"
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Conte em poucas palavras o que seus clientes vão encontrar"
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cover-image">Imagem de Capa (opcional)</Label>
            <SimpleImageUploader
              currentImageUrl={coverImage}
              onImageChange={setCoverImage}
            />
            <p className="text-xs text-muted-foreground">
              💡 Você pode adicionar ou trocar depois
            </p>
          </div>

          {/* Advanced options - collapsed by default */}
          <div className="border-t pt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              {showAdvanced ? "▼" : "▶"} Opções avançadas
            </button>
            
            {showAdvanced && (
              <div className="grid gap-2 mt-3">
                <Label htmlFor="slug">Endereço personalizado (URL)</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="catalogo-pascoa-2025"
                  className={slugError ? "border-destructive" : ""}
                />
                {slugError ? (
                  <p className="text-xs text-destructive">{slugError}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Deixe em branco para gerar automaticamente
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={!title.trim() || loading || !!slugError}>
            {loading ? "Criando..." : "Criar e Começar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
