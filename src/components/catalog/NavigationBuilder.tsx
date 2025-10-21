import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { GripVertical, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationItem {
  blockId: string;
  blockType: string;
  blockTitle: string;
  navigationLabel: string;
  anchorSlug: string;
  visible: boolean;
}

interface NavigationBuilderProps {
  blocks: any[];
  onUpdate: (updates: { blockId: string; navigationLabel: string; anchorSlug: string; visible: boolean }[]) => void;
}

export const NavigationBuilder = ({ blocks, onUpdate }: NavigationBuilderProps) => {
  // Build navigation items from blocks
  const [navItems, setNavItems] = useState<NavigationItem[]>(() => {
    return blocks
      .filter(block => block.data?.title || block.navigation_label)
      .map(block => ({
        blockId: block.id,
        blockType: block.type,
        blockTitle: block.data?.title || "Sem título",
        navigationLabel: block.navigation_label || block.data?.title || "",
        anchorSlug: block.anchor_slug || "",
        visible: !!block.anchor_slug, // Visible if has anchor
      }));
  });

  const handleToggleVisible = (blockId: string) => {
    setNavItems(prev => {
      const updated = prev.map(item =>
        item.blockId === blockId ? { ...item, visible: !item.visible } : item
      );
      
      // Notify parent of changes
      onUpdate(updated.map(item => ({
        blockId: item.blockId,
        navigationLabel: item.navigationLabel,
        anchorSlug: item.anchorSlug,
        visible: item.visible,
      })));
      
      return updated;
    });
  };

  const handleLabelChange = (blockId: string, label: string) => {
    setNavItems(prev => {
      const updated = prev.map(item =>
        item.blockId === blockId ? { ...item, navigationLabel: label } : item
      );
      
      // Notify parent of changes
      onUpdate(updated.map(item => ({
        blockId: item.blockId,
        navigationLabel: item.navigationLabel,
        anchorSlug: item.anchorSlug,
        visible: item.visible,
      })));
      
      return updated;
    });
  };

  const visibleCount = navItems.filter(item => item.visible).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Menu de Navegação</h3>
          <p className="text-sm text-muted-foreground">
            {visibleCount} {visibleCount === 1 ? "item visível" : "itens visíveis"}
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          💡 <strong>Dica:</strong> Selecione quais blocos aparecem no menu inferior. 
          Os visitantes podem navegar facilmente entre as seções.
        </p>
      </div>

      {/* Navigation Items */}
      <div className="space-y-3">
        {navItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">
              Adicione títulos aos seus blocos para criar itens de navegação
            </p>
          </div>
        ) : (
          navItems.map((item, index) => (
            <div
              key={item.blockId}
              className={cn(
                "p-4 rounded-lg border-2 transition-all",
                item.visible
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
                          {item.blockType === "cover" && "Capa"}
                          {item.blockType === "product_grid" && "Grade de Produtos"}
                          {item.blockType === "category_grid" && "Grade de Categorias"}
                          {item.blockType === "tag_grid" && "Grade de Tags"}
                          {item.blockType === "text" && "Texto"}
                          {item.blockType === "testimonials" && "Depoimentos"}
                          {item.blockType === "faq" && "FAQ"}
                          {item.blockType === "contact" && "Contato"}
                          {item.blockType === "location" && "Localização"}
                          {!["cover", "product_grid", "category_grid", "tag_grid", "text", "testimonials", "faq", "contact", "location"].includes(item.blockType) && "Bloco"}
                        </span>
                        <span className="text-xs text-muted-foreground">#{index + 1}</span>
                      </div>
                      <p className="text-sm font-medium">{item.blockTitle}</p>
                    </div>

                    {/* Visibility toggle */}
                    <button
                      onClick={() => handleToggleVisible(item.blockId)}
                      className={cn(
                        "flex-shrink-0 p-2 rounded-lg transition-colors",
                        item.visible
                          ? "bg-primary/10 text-primary hover:bg-primary/20"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {item.visible ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Navigation label input */}
                  {item.visible && (
                    <div className="space-y-2">
                      <Label className="text-xs">Texto no menu</Label>
                      <Input
                        value={item.navigationLabel}
                        onChange={(e) => handleLabelChange(item.blockId, e.target.value)}
                        placeholder={item.blockTitle}
                        className="h-9 text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Como este item aparece no menu inferior
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Preview hint */}
      {visibleCount > 0 && (
        <div className="bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800 rounded-lg p-4">
          <p className="text-sm text-violet-900 dark:text-violet-100">
            ✨ <strong>Preview:</strong> O menu aparecerá fixo na parte inferior da página. 
            No mobile, os visitantes podem deslizar para ver todos os itens.
          </p>
        </div>
      )}
    </div>
  );
};
