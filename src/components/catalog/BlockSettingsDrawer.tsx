import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { SimpleImageUploader } from "./SimpleImageUploader";
import { ProductPickerModal } from "./ProductPickerModal";
import { MultiSelectChips } from "./MultiSelectChips";
import { supabase } from "@/integrations/supabase/client";
import { extractVideoInfo } from "@/lib/external-media";

interface BlockSettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  block: any;
  onSave: (data: any) => void;
  onUpdate?: (block: any) => void;
}

export const BlockSettingsDrawer = ({
  open,
  onOpenChange,
  block,
  onSave,
  onUpdate,
}: BlockSettingsDrawerProps) => {
  const [formData, setFormData] = useState(block?.data || {});
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    setFormData(block?.data || {});
    loadProfile();
    if (block?.type === "product_grid") {
      loadProductMetadata();
    }
  }, [block]);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setProfile(data);
  };

  const loadProductMetadata = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: products } = await supabase
      .from("products")
      .select("categories, quality_tags")
      .eq("user_id", user.id);

    if (products) {
      // Extract unique categories
      const cats = new Set<string>();
      products.forEach(p => {
        if (p.categories) {
          p.categories.forEach((cat: string) => cats.add(cat));
        }
      });
      setAvailableCategories(Array.from(cats).sort());

      // Extract unique tags
      const tags = new Set<string>();
      products.forEach(p => {
        if (p.quality_tags) {
          p.quality_tags.forEach((tag: string) => tags.add(tag));
        }
      });
      setAvailableTags(Array.from(tags).sort());
    }
  };

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const renderFields = () => {
    if (!block) return null;

    const blocksWithAnchors = ["cover", "text", "heading", "testimonials", "faq", "benefits", "product_grid"];
    const showAnchorField = blocksWithAnchors.includes(block?.type || "");

    switch (block.type) {
      case "cover":
        return (
          <>
            <div className="space-y-2">
              <Label>Imagem de Fundo</Label>
              <SimpleImageUploader
                currentImageUrl={formData.image_url}
                onImageChange={(url) => setFormData({ ...formData, image_url: url })}
              />
            </div>
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={formData.title || ""}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setFormData({ ...formData, title: newTitle });
                  if (onUpdate && (!block.anchor_slug || block.anchor_slug === generateSlug(block.data.title || ""))) {
                    onUpdate({ ...block, data: { ...formData, title: newTitle }, anchor_slug: generateSlug(newTitle) });
                  }
                }}
                placeholder="Título da capa"
              />
            </div>
            
            {showAnchorField && (
              <div className="space-y-2">
                <Label>ID da seção (para navegação)</Label>
                <Input
                  value={block.anchor_slug || ""}
                  onChange={(e) => {
                    if (onUpdate) {
                      onUpdate({ ...block, anchor_slug: generateSlug(e.target.value) });
                    }
                  }}
                  placeholder="id-da-secao"
                />
                <p className="text-xs text-muted-foreground">
                  Usado para criar links diretos para esta seção
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Subtítulo</Label>
              <Input
                value={formData.subtitle || ""}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Subtítulo (opcional)"
              />
            </div>
            <div className="space-y-2">
              <Label>Alinhamento</Label>
              <select
                className="w-full border rounded-xl p-2"
                value={formData.align || "center"}
                onChange={(e) => setFormData({ ...formData, align: e.target.value })}
              >
                <option value="left">Esquerda</option>
                <option value="center">Centro</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Usar logo do perfil</Label>
              <Switch
                checked={formData.use_profile_logo || false}
                onCheckedChange={(checked) => setFormData({ ...formData, use_profile_logo: checked, logo_url: checked ? profile?.logo_url : null })}
              />
            </div>
          </>
        );

      case "heading":
      case "text":
        // Texto Livre block
        return (
          <>
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={formData.title || ""}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setFormData({ ...formData, title: newTitle });
                  if (onUpdate && newTitle && (!block.anchor_slug || block.anchor_slug === generateSlug(block.data.title || ""))) {
                    onUpdate({ ...block, data: { ...formData, title: newTitle }, anchor_slug: generateSlug(newTitle) });
                  }
                }}
                placeholder="Título (opcional)"
              />
            </div>
            
            {showAnchorField && formData.title && (
              <div className="space-y-2">
                <Label>ID da seção</Label>
                <Input
                  value={block.anchor_slug || ""}
                  onChange={(e) => {
                    if (onUpdate) {
                      onUpdate({ ...block, anchor_slug: generateSlug(e.target.value) });
                    }
                  }}
                  placeholder="id-da-secao"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Corpo do Texto</Label>
              <Textarea
                value={formData.body || ""}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Escreva aqui..."
                rows={8}
              />
            </div>
            <div className="space-y-2">
              <Label>Alinhamento</Label>
              <select
                className="w-full border rounded-xl p-2"
                value={formData.align || "left"}
                onChange={(e) => setFormData({ ...formData, align: e.target.value })}
              >
                <option value="left">Esquerda</option>
                <option value="center">Centro</option>
              </select>
            </div>
          </>
        );

      case "image":
        return (
          <>
            <div className="space-y-2">
              <Label>Imagem</Label>
              <SimpleImageUploader
                currentImageUrl={formData.image_url}
                onImageChange={(url, metadata) => {
                  setFormData({
                    ...formData,
                    image_url: url,
                    image_metadata: metadata || {}
                  });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Legenda</Label>
              <Input
                value={formData.caption || ""}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                placeholder="Descrição da imagem (opcional)"
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="show-caption">Mostrar legenda</Label>
              <Switch
                id="show-caption"
                checked={formData.show_caption !== false}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, show_caption: checked })
                }
              />
            </div>
            {/* Tamanho and Alinhamento options hidden for MVP */}
          </>
        );

      case "video":
        return (
          <>
            <div className="space-y-2">
              <Label>URL do Vídeo</Label>
              <Input
                value={formData.url || ""}
                onChange={(e) => {
                  const url = e.target.value;
                  setFormData({ ...formData, url });
                  
                  // Validate if it's a YouTube URL
                  const info = extractVideoInfo(url);
                  if (url && (!info || info.provider !== 'youtube')) {
                    // Show error state on input
                    e.target.classList.add('border-destructive');
                  } else {
                    e.target.classList.remove('border-destructive');
                  }
                }}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p className="text-xs text-muted-foreground">
                Apenas vídeos do YouTube são suportados
              </p>
            </div>
            <div className="space-y-2">
              <Label>Título (opcional)</Label>
              <Input
                value={formData.title || ""}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setFormData({ ...formData, title: newTitle });
                  if (onUpdate && newTitle && (!block.anchor_slug || block.anchor_slug === generateSlug(block.data.title || ""))) {
                    onUpdate({ ...block, data: { ...formData, title: newTitle }, anchor_slug: generateSlug(newTitle) });
                  }
                }}
                placeholder="Título do vídeo para acessibilidade"
              />
            </div>
            
            {showAnchorField && formData.title && (
              <div className="space-y-2">
                <Label>ID da seção</Label>
                <Input
                  value={block.anchor_slug || ""}
                  onChange={(e) => {
                    if (onUpdate) {
                      onUpdate({ ...block, anchor_slug: generateSlug(e.target.value) });
                    }
                  }}
                  placeholder="id-da-secao"
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <Label>Autoplay mudo</Label>
              <Switch
                checked={formData.autoplay || false}
                onCheckedChange={(checked) => setFormData({ ...formData, autoplay: checked })}
              />
            </div>
          </>
        );

      case "product_grid":
        return (
          <>
            <div className="space-y-2">
              <Label>Fonte dos Produtos</Label>
              <select
                className="w-full border rounded-xl p-2"
                value={formData.source || "manual"}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              >
                <option value="manual">Seleção Manual</option>
                <option value="category">Por Categoria</option>
                <option value="tag">Por Tag</option>
              </select>
            </div>

            {formData.source === "manual" && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setProductPickerOpen(true)}
                >
                  Selecionar Produtos ({formData.product_ids?.length || 0})
                </Button>
              </div>
            )}

            {formData.source === "category" && (
              <div className="space-y-2">
                <Label>Categorias</Label>
                <MultiSelectChips
                  availableOptions={availableCategories}
                  selectedOptions={formData.categories || []}
                  onChange={(categories) => setFormData({ ...formData, categories })}
                  placeholder="Digite para buscar categorias..."
                />
              </div>
            )}

            {formData.source === "tag" && (
              <div className="space-y-2">
                <Label>Tags de Qualidade</Label>
                <MultiSelectChips
                  availableOptions={availableTags}
                  selectedOptions={formData.tags || []}
                  onChange={(tags) => setFormData({ ...formData, tags })}
                  placeholder="Digite para buscar tags..."
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Título (opcional)</Label>
              <Input
                value={formData.title || ""}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setFormData({ ...formData, title: newTitle });
                  if (onUpdate && newTitle && (!block.anchor_slug || block.anchor_slug === generateSlug(block.data.title || ""))) {
                    onUpdate({ ...block, data: { ...formData, title: newTitle }, anchor_slug: generateSlug(newTitle) });
                  }
                }}
                placeholder="Nossos produtos"
              />
            </div>

            {showAnchorField && formData.title && (
              <div className="space-y-2">
                <Label>ID da seção</Label>
                <Input
                  value={block.anchor_slug || ""}
                  onChange={(e) => {
                    if (onUpdate) {
                      onUpdate({ ...block, anchor_slug: generateSlug(e.target.value) });
                    }
                  }}
                  placeholder="id-da-secao"
                />
              </div>
            )}

            {formData.source !== "manual" && (
              <>
                <div className="space-y-2">
                  <Label>Filtrar por Status</Label>
                  <div className="space-y-2">
                    {["Disponível", "Sob encomenda"].map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${status}`}
                          checked={formData.status_filter?.includes(status)}
                          onCheckedChange={(checked) => {
                            const current = formData.status_filter || [];
                            const updated = checked
                              ? [...current, status]
                              : current.filter((s) => s !== status);
                            setFormData({ ...formData, status_filter: updated });
                          }}
                        />
                        <label htmlFor={`status-${status}`} className="text-sm">
                          {status}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Ordenação</Label>
                  <select
                    className="w-full border rounded-xl p-2"
                    value={formData.sort || "newest"}
                    onChange={(e) => setFormData({ ...formData, sort: e.target.value })}
                  >
                    <option value="newest">Mais recentes</option>
                    <option value="price_asc">Preço crescente</option>
                    <option value="price_desc">Preço decrescente</option>
                    <option value="name_asc">Nome A→Z</option>
                  </select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Limite de Produtos</Label>
              <Input
                type="number"
                value={formData.limit || 12}
                onChange={(e) => setFormData({ ...formData, limit: parseInt(e.target.value) })}
                min={1}
                max={50}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Mostrar Preço</Label>
              <Switch
                checked={formData.show_price !== false}
                onCheckedChange={(checked) => setFormData({ ...formData, show_price: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Mostrar Tags</Label>
              <Switch
                checked={formData.show_tags || false}
                onCheckedChange={(checked) => setFormData({ ...formData, show_tags: checked })}
              />
            </div>

            <ProductPickerModal
              open={productPickerOpen}
              onOpenChange={setProductPickerOpen}
              selectedIds={formData.product_ids || []}
              onSave={(ids) => setFormData({ ...formData, product_ids: ids })}
            />
          </>
        );

      case "about":
        return (
          <>
            <div className="flex items-center justify-between mb-4">
              <Label>Sincronizar com Perfil</Label>
              <Switch
                checked={formData.sync_profile !== false}
                onCheckedChange={(checked) => setFormData({ ...formData, sync_profile: checked })}
              />
            </div>
            {formData.sync_profile === false && (
              <>
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={formData.heading || "Sobre nós"}
                    onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Conteúdo</Label>
                  <Textarea
                    value={formData.content || ""}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={8}
                  />
                </div>
              </>
            )}
          </>
        );

      case "contact":
        return (
          <>
            <div className="flex items-center justify-between mb-4">
              <Label>Sincronizar com Perfil</Label>
              <Switch
                checked={formData.sync_profile !== false}
                onCheckedChange={(checked) => setFormData({ ...formData, sync_profile: checked })}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Mostrar WhatsApp</Label>
                <Checkbox
                  checked={formData.show_whatsapp !== false}
                  onCheckedChange={(checked) => setFormData({ ...formData, show_whatsapp: checked })}
                />
              </div>
              {formData.show_whatsapp !== false && (
                <Input
                  value={formData.whatsapp_label || "Falar no WhatsApp"}
                  onChange={(e) => setFormData({ ...formData, whatsapp_label: e.target.value })}
                  placeholder="Rótulo do botão"
                />
              )}
              <div className="flex items-center justify-between">
                <Label>Mostrar Email</Label>
                <Checkbox
                  checked={formData.show_email !== false}
                  onCheckedChange={(checked) => setFormData({ ...formData, show_email: checked })}
                />
              </div>
              {formData.show_email !== false && (
                <Input
                  value={formData.email_label || "Enviar email"}
                  onChange={(e) => setFormData({ ...formData, email_label: e.target.value })}
                  placeholder="Rótulo do botão"
                />
              )}
              <div className="flex items-center justify-between">
                <Label>Mostrar Telefone</Label>
                <Checkbox
                  checked={formData.show_phone !== false}
                  onCheckedChange={(checked) => setFormData({ ...formData, show_phone: checked })}
                />
              </div>
              {formData.show_phone !== false && (
                <Input
                  value={formData.phone_label || "Ligar"}
                  onChange={(e) => setFormData({ ...formData, phone_label: e.target.value })}
                  placeholder="Rótulo do botão"
                />
              )}
            </div>
          </>
        );

      case "socials":
        return (
          <>
            <div className="flex items-center justify-between mb-4">
              <Label>Sincronizar com Perfil</Label>
              <Switch
                checked={formData.sync_profile !== false}
                onCheckedChange={(checked) => setFormData({ ...formData, sync_profile: checked })}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Mostrar Instagram</Label>
                <Checkbox
                  checked={formData.show_instagram !== false}
                  onCheckedChange={(checked) => setFormData({ ...formData, show_instagram: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Mostrar YouTube</Label>
                <Checkbox
                  checked={formData.show_youtube !== false}
                  onCheckedChange={(checked) => setFormData({ ...formData, show_youtube: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Mostrar Facebook</Label>
                <Checkbox
                  checked={formData.show_facebook !== false}
                  onCheckedChange={(checked) => setFormData({ ...formData, show_facebook: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Mostrar Website</Label>
                <Checkbox
                  checked={formData.show_website !== false}
                  onCheckedChange={(checked) => setFormData({ ...formData, show_website: checked })}
                />
              </div>
            </div>
          </>
        );

      case "testimonials":
        return (
          <>
            <div className="space-y-2">
              <Label>Título do Bloco</Label>
              <Input
                value={formData.title || "Depoimentos"}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setFormData({ ...formData, title: newTitle });
                  if (onUpdate && (!block.anchor_slug || block.anchor_slug === generateSlug(block.data.title || ""))) {
                    onUpdate({ ...block, data: { ...formData, title: newTitle }, anchor_slug: generateSlug(newTitle) });
                  }
                }}
              />
            </div>

            {showAnchorField && (
              <div className="space-y-2">
                <Label>ID da seção</Label>
                <Input
                  value={block.anchor_slug || ""}
                  onChange={(e) => {
                    if (onUpdate) {
                      onUpdate({ ...block, anchor_slug: generateSlug(e.target.value) });
                    }
                  }}
                  placeholder="id-da-secao"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Fundo</Label>
              <select
                className="w-full border rounded-xl p-2"
                value={formData.background || "default"}
                onChange={(e) => setFormData({ ...formData, background: e.target.value })}
              >
                <option value="default">Padrão</option>
                <option value="accent">Faixa suave</option>
              </select>
            </div>

            <div className="space-y-3">
              <Label>Depoimentos</Label>
              {(formData.items || []).map((item: any, index: number) => (
                <div key={index} className="p-4 border rounded-xl space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Depoimento {index + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const items = [...(formData.items || [])];
                        items.splice(index, 1);
                        setFormData({ ...formData, items });
                      }}
                    >
                      Remover
                    </Button>
                  </div>
                  <Input
                    placeholder="Nome"
                    value={item.name || ""}
                    onChange={(e) => {
                      const items = [...(formData.items || [])];
                      items[index] = { ...items[index], name: e.target.value };
                      setFormData({ ...formData, items });
                    }}
                  />
                  <Textarea
                    placeholder="Depoimento"
                    value={item.quote || ""}
                    onChange={(e) => {
                      const items = [...(formData.items || [])];
                      items[index] = { ...items[index], quote: e.target.value };
                      setFormData({ ...formData, items });
                    }}
                    rows={3}
                  />
                  <Input
                    placeholder="URL do avatar (opcional)"
                    value={item.avatar_url || ""}
                    onChange={(e) => {
                      const items = [...(formData.items || [])];
                      items[index] = { ...items[index], avatar_url: e.target.value };
                      setFormData({ ...formData, items });
                    }}
                  />
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const items = [...(formData.items || []), { name: "", quote: "", avatar_url: "" }];
                  setFormData({ ...formData, items });
                }}
              >
                + Adicionar Depoimento
              </Button>
            </div>
          </>
        );

      case "faq":
        return (
          <>
            <div className="space-y-2">
              <Label>Título do Bloco</Label>
              <Input
                value={formData.title || "Perguntas Frequentes"}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setFormData({ ...formData, title: newTitle });
                  if (onUpdate && (!block.anchor_slug || block.anchor_slug === generateSlug(block.data.title || ""))) {
                    onUpdate({ ...block, data: { ...formData, title: newTitle }, anchor_slug: generateSlug(newTitle) });
                  }
                }}
              />
            </div>

            {showAnchorField && (
              <div className="space-y-2">
                <Label>ID da seção</Label>
                <Input
                  value={block.anchor_slug || ""}
                  onChange={(e) => {
                    if (onUpdate) {
                      onUpdate({ ...block, anchor_slug: generateSlug(e.target.value) });
                    }
                  }}
                  placeholder="id-da-secao"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Fundo</Label>
              <select
                className="w-full border rounded-xl p-2"
                value={formData.background || "default"}
                onChange={(e) => setFormData({ ...formData, background: e.target.value })}
              >
                <option value="default">Padrão</option>
                <option value="accent">Faixa suave</option>
              </select>
            </div>

            <div className="space-y-3">
              <Label>Perguntas</Label>
              {(formData.items || []).map((item: any, index: number) => (
                <div key={index} className="p-4 border rounded-xl space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Pergunta {index + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const items = [...(formData.items || [])];
                        items.splice(index, 1);
                        setFormData({ ...formData, items });
                      }}
                    >
                      Remover
                    </Button>
                  </div>
                  <Input
                    placeholder="Pergunta"
                    value={item.question || ""}
                    onChange={(e) => {
                      const items = [...(formData.items || [])];
                      items[index] = { ...items[index], question: e.target.value };
                      setFormData({ ...formData, items });
                    }}
                  />
                  <Textarea
                    placeholder="Resposta"
                    value={item.answer || ""}
                    onChange={(e) => {
                      const items = [...(formData.items || [])];
                      items[index] = { ...items[index], answer: e.target.value };
                      setFormData({ ...formData, items });
                    }}
                    rows={3}
                  />
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const items = [...(formData.items || []), { question: "", answer: "" }];
                  setFormData({ ...formData, items });
                }}
              >
                + Adicionar Pergunta
              </Button>
            </div>
          </>
        );

      case "benefits":
        return (
          <>
            <div className="space-y-2">
              <Label>Título do Bloco</Label>
              <Input
                value={formData.title || "Por que escolher a gente"}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setFormData({ ...formData, title: newTitle });
                  if (onUpdate && (!block.anchor_slug || block.anchor_slug === generateSlug(block.data.title || ""))) {
                    onUpdate({ ...block, data: { ...formData, title: newTitle }, anchor_slug: generateSlug(newTitle) });
                  }
                }}
              />
            </div>

            {showAnchorField && (
              <div className="space-y-2">
                <Label>ID da seção</Label>
                <Input
                  value={block.anchor_slug || ""}
                  onChange={(e) => {
                    if (onUpdate) {
                      onUpdate({ ...block, anchor_slug: generateSlug(e.target.value) });
                    }
                  }}
                  placeholder="id-da-secao"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Fundo</Label>
              <select
                className="w-full border rounded-xl p-2"
                value={formData.background || "default"}
                onChange={(e) => setFormData({ ...formData, background: e.target.value })}
              >
                <option value="default">Padrão</option>
                <option value="accent">Faixa suave</option>
              </select>
            </div>

            <div className="space-y-3">
              <Label>Diferenciais</Label>
              {(formData.items || []).map((item: any, index: number) => (
                <div key={index} className="p-4 border rounded-xl space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Diferencial {index + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const items = [...(formData.items || [])];
                        items.splice(index, 1);
                        setFormData({ ...formData, items });
                      }}
                    >
                      Remover
                    </Button>
                  </div>
                  <select
                    className="w-full border rounded-xl p-2"
                    value={item.icon || "star"}
                    onChange={(e) => {
                      const items = [...(formData.items || [])];
                      items[index] = { ...items[index], icon: e.target.value };
                      setFormData({ ...formData, items });
                    }}
                  >
                    <option value="star">Estrela</option>
                    <option value="shield">Escudo</option>
                    <option value="truck">Caminhão</option>
                    <option value="leaf">Folha</option>
                  </select>
                  <Input
                    placeholder="Título"
                    value={item.title || ""}
                    onChange={(e) => {
                      const items = [...(formData.items || [])];
                      items[index] = { ...items[index], title: e.target.value };
                      setFormData({ ...formData, items });
                    }}
                  />
                  <Textarea
                    placeholder="Descrição"
                    value={item.description || ""}
                    onChange={(e) => {
                      const items = [...(formData.items || [])];
                      items[index] = { ...items[index], description: e.target.value };
                      setFormData({ ...formData, items });
                    }}
                    rows={2}
                  />
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const items = [...(formData.items || []), { icon: "star", title: "", description: "" }];
                  setFormData({ ...formData, items });
                }}
              >
                + Adicionar Diferencial
              </Button>
            </div>
          </>
        );

      case "divider":
        return <p className="text-sm text-muted-foreground">Este bloco não tem configurações.</p>;

      default:
        return (
          <div className="space-y-2">
            <Label>Conteúdo</Label>
            <Textarea
              value={formData.content || ""}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Conteúdo do bloco..."
              rows={6}
            />
          </div>
        );
    }
  };

  if (!block) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {block.type === "heading" || block.type === "text" ? "Editar Texto Livre" :
             block.type === "cover" ? "Editar Capa" :
             block.type === "image" ? "Editar Imagem" :
             block.type === "video" ? "Editar Vídeo" :
             block.type === "product_grid" ? "Editar Grade de Produtos" :
             block.type === "about" ? "Editar Sobre" :
             block.type === "contact" ? "Editar Contato" :
             block.type === "socials" ? "Editar Redes Sociais" :
             block.type === "testimonials" ? "Editar Depoimentos" :
             block.type === "benefits" ? "Editar Benefícios" :
             block.type === "faq" ? "Editar Perguntas Frequentes" :
             block.type === "important_info" ? "Editar Info Importante" :
             block.type === "divider" ? "Editar Divisor" :
             "Editar Bloco"}
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-6">
          {renderFields()}
          <Button onClick={handleSave} className="w-full">
            Salvar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
