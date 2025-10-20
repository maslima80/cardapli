import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface NavigationSettingsProps {
  block: any;
  onUpdate?: (block: any) => void;
  blockTitle?: string;
  generateSlug: (text: string) => string;
}

export const NavigationSettings = ({ 
  block, 
  onUpdate, 
  blockTitle = "",
  generateSlug 
}: NavigationSettingsProps) => {
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div className="space-y-2">
        <Label>Título na navegação (opcional)</Label>
        <Input
          value={block.navigation_label || ""}
          onChange={(e) => {
            const navLabel = e.target.value;
            if (onUpdate) {
              onUpdate({ 
                ...block, 
                navigation_label: navLabel,
                anchor_slug: navLabel ? generateSlug(navLabel) : (blockTitle ? generateSlug(blockTitle) : "")
              });
            }
          }}
          placeholder={blockTitle || "Ex: Produtos"}
        />
        <p className="text-xs text-muted-foreground">
          Texto curto que aparece no menu de navegação. Se vazio, usa o título do bloco.
        </p>
      </div>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">ID da seção (gerado automaticamente)</Label>
        <Input
          value={block.anchor_slug || ""}
          onChange={(e) => {
            if (onUpdate) {
              onUpdate({ ...block, anchor_slug: generateSlug(e.target.value) });
            }
          }}
          placeholder="id-da-secao"
          className="text-xs font-mono"
        />
        <p className="text-xs text-muted-foreground">
          URL amigável para links diretos (editável)
        </p>
      </div>
    </div>
  );
};
