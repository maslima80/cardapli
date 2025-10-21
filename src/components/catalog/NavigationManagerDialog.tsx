import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, GripVertical, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NavigationItem {
  blockId: string;
  blockType: string;
  blockTitle: string;
  navigationLabel: string;
  anchorSlug: string;
  showInNav: boolean;
  sort: number;
}

interface NavigationManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blocks: any[];
  onUpdate: () => void;
}

const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

const getBlockTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    cover: "Capa",
    product_grid: "Grade de Produtos",
    category_grid: "Grade de Categorias",
    tag_grid: "Grade de Tags",
    text: "Texto",
    heading: "Título",
    testimonials: "Depoimentos",
    faq: "FAQ",
    contact: "Contato",
    location: "Localização",
    about: "Sobre",
    about_business: "Sobre o Negócio",
    socials: "Redes Sociais",
    informacoes: "Informações",
    catalogs: "Catálogos",
    external_links: "Links Externos",
  };
  return labels[type] || "Bloco";
};

export const NavigationManagerDialog = ({
  open,
  onOpenChange,
  blocks,
  onUpdate,
}: NavigationManagerDialogProps) => {
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      // Build navigation items from ALL blocks (not just those with titles)
      const items = blocks.map(block => {
        // Try to get a meaningful title from various sources
        const blockTitle = 
          block.data?.title || 
          block.data?.heading || 
          block.data?.text?.substring(0, 30) || 
          `${getBlockTypeLabel(block.type)} #${block.sort + 1}`;
        
        return {
          blockId: block.id,
          blockType: block.type,
          blockTitle: blockTitle,
          navigationLabel: block.navigation_label || "",
          anchorSlug: block.anchor_slug || "",
          showInNav: !!block.anchor_slug && !!block.navigation_label,
          sort: block.sort,
        };
      });
      setNavItems(items);
    }
  }, [open, blocks]);

  const handleToggleVisible = (blockId: string) => {
    setNavItems(prev =>
      prev.map(item => {
        if (item.blockId === blockId) {
          const newShowInNav = !item.showInNav;
          // If enabling, generate slug and set a default label if missing
          if (newShowInNav) {
            const defaultLabel = item.navigationLabel || item.blockTitle;
            return {
              ...item,
              showInNav: newShowInNav,
              navigationLabel: defaultLabel,
              anchorSlug: item.anchorSlug || generateSlug(defaultLabel),
            };
          }
          return { ...item, showInNav: newShowInNav };
        }
        return item;
      })
    );
  };

  const handleLabelChange = (blockId: string, label: string) => {
    setNavItems(prev =>
      prev.map(item =>
        item.blockId === blockId
          ? {
              ...item,
              navigationLabel: label,
              anchorSlug: label ? generateSlug(label) : generateSlug(item.blockTitle),
            }
          : item
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update each block
      const updates = navItems.map(item => ({
        id: item.blockId,
        navigation_label: item.showInNav ? item.navigationLabel : null,
        anchor_slug: item.showInNav ? item.anchorSlug : null,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from("catalog_blocks")
          .update({
            navigation_label: update.navigation_label,
            anchor_slug: update.anchor_slug,
          })
          .eq("id", update.id);

        if (error) throw error;
      }

      toast.success("Navegação atualizada!");
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving navigation:", error);
      toast.error("Erro ao salvar navegação");
    } finally {
      setSaving(false);
    }
  };

  const visibleCount = navItems.filter(item => item.showInNav).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Menu de Navegação</DialogTitle>
          <DialogDescription>
            Escolha quais seções do seu catálogo aparecem no menu inferior. 
            Seus clientes poderão navegar rapidamente entre as seções.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quick Enable All */}
          {visibleCount === 0 && navItems.length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                    🚀 Ative o menu de navegação
                  </p>
                  <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                    Seus clientes vão adorar navegar pelo catálogo!
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setNavItems(prev =>
                      prev.map(item => ({
                        ...item,
                        showInNav: true,
                        anchorSlug: item.anchorSlug || generateSlug(item.navigationLabel || item.blockTitle),
                      }))
                    );
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Ativar Tudo
                </Button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Itens no menu</p>
              <p className="text-2xl font-bold text-primary">{visibleCount}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total de blocos</p>
              <p className="text-lg font-semibold">{navItems.length}</p>
            </div>
          </div>

          {/* Preview */}
          {visibleCount > 0 && (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3 uppercase tracking-wide">
                👁️ Preview do Menu
              </p>
              <div className="bg-white dark:bg-slate-950 rounded-lg p-3 shadow-sm">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {navItems
                    .filter(item => item.showInNav)
                    .map((item, idx) => (
                      <div
                        key={item.blockId}
                        className={cn(
                          "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                          idx === 0
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {item.navigationLabel || item.blockTitle}
                      </div>
                    ))}
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Assim seu menu aparecerá na parte inferior do catálogo
              </p>
            </div>
          )}

          {/* Navigation Items */}
          <div className="space-y-3">
            {navItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">
                  Adicione blocos ao seu catálogo para criar o menu de navegação
                </p>
              </div>
            ) : (
              navItems.map((item, index) => (
                <div
                  key={item.blockId}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all",
                    item.showInNav
                      ? "border-primary/50 bg-primary/5"
                      : "border-border bg-muted/30"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Drag handle (future feature) */}
                    <div className="flex-shrink-0 pt-2 text-muted-foreground cursor-move opacity-50">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-3">
                      {/* Block info */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-muted-foreground uppercase">
                              {getBlockTypeLabel(item.blockType)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              #{index + 1}
                            </span>
                          </div>
                          <p className="text-sm font-medium">{item.blockTitle}</p>
                        </div>

                        {/* Visibility toggle */}
                        <button
                          onClick={() => handleToggleVisible(item.blockId)}
                          className={cn(
                            "flex-shrink-0 p-2 rounded-lg transition-colors",
                            item.showInNav
                              ? "bg-primary/10 text-primary hover:bg-primary/20"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          )}
                        >
                          {item.showInNav ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Navigation label input */}
                      {item.showInNav && (
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">Nome curto para o menu</Label>
                          <Input
                            value={item.navigationLabel}
                            onChange={(e) =>
                              handleLabelChange(item.blockId, e.target.value)
                            }
                            placeholder="Ex: Produtos, Sobre, Contato..."
                            className="h-9 text-sm"
                            maxLength={20}
                            autoFocus={!item.navigationLabel}
                          />
                          <p className="text-xs text-muted-foreground">
                            💡 Use nomes curtos e claros para facilitar a navegação
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 gap-2"
            >
              {saving ? (
                <>Salvando...</>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Navegação
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
