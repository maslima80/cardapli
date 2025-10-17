import { GripVertical, Eye, EyeOff, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface BlockCardProps {
  block: any;
  onEdit: () => void;
  onToggleVisible: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const blockTypeLabels: Record<string, string> = {
  cover: "Capa",
  heading: "Título + Texto",
  text: "Texto",
  image: "Imagem",
  video: "Vídeo",
  product_grid: "Grade de Produtos",
  about: "Sobre",
  about_business: "Sobre o Negócio",
  contact: "Contato",
  socials: "Redes Sociais",
  divider: "Divisor",
  testimonials: "Depoimentos",
  benefits: "Informações",
  informacoes: "Informações",
  faq: "Perguntas Frequentes",
};

export const BlockCard = ({
  block,
  onEdit,
  onToggleVisible,
  onDuplicate,
  onDelete,
}: BlockCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getBlockPreview = () => {
    const data = block.data || {};
    switch (block.type) {
      case "cover":
        return data.title || "Sem título";
      case "heading":
      case "text":
        return data.title || data.body?.substring(0, 50) || "Sem conteúdo";
      case "image":
        return data.caption || "Imagem";
      case "product_grid":
        return `Produtos: ${data.source || "manual"}`;
      default:
        return blockTypeLabels[block.type] || block.type;
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-4 mb-3 ${!block.visible ? "opacity-50" : ""}`}
    >
      <div className="flex items-center gap-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="flex-1 cursor-pointer" onClick={onEdit}>
          <div className="font-medium text-sm">
            {blockTypeLabels[block.type] || block.type}
          </div>
          <div className="text-xs text-muted-foreground line-clamp-1">
            {getBlockPreview()}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisible();
            }}
          >
            {block.visible ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
