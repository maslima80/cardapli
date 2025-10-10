import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Image as ImageIcon,
  Type,
  LayoutGrid,
  Info,
  Phone,
  Share2,
  Minus,
  Star,
  List,
  HelpCircle,
  AlertCircle,
  Video,
  ImagePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddBlockDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectType: (type: string) => void;
}

const blockTypes = [
  { type: "cover", icon: ImagePlus, label: "Capa", description: "Imagem de destaque com título" },
  { type: "heading", icon: Type, label: "Texto Livre", description: "Texto formatado com título opcional" },
  { type: "image", icon: ImageIcon, label: "Imagem", description: "Foto única com legenda" },
  { type: "video", icon: Video, label: "Vídeo", description: "Vídeo do YouTube ou Vimeo" },
  { type: "product_grid", icon: LayoutGrid, label: "Grade de Produtos", description: "Mostre seus produtos" },
  { type: "about_business", icon: Info, label: "Sobre o Negócio", description: "Apresente a história e o propósito do seu negócio" },
  { type: "contact", icon: Phone, label: "Contato", description: "WhatsApp, email, telefone" },
  { type: "socials", icon: Share2, label: "Redes Sociais", description: "Links para suas redes" },
  { type: "testimonials", icon: Star, label: "Depoimentos", description: "Avaliações de clientes" },
  { type: "benefits", icon: List, label: "Benefícios", description: "Lista de vantagens" },
  { type: "faq", icon: HelpCircle, label: "Perguntas Frequentes", description: "Dúvidas comuns" },
  { type: "important_info", icon: AlertCircle, label: "Info Importante", description: "Destaque informações" },
  { type: "divider", icon: Minus, label: "Divisor", description: "Linha de separação" },
];

export const AddBlockDrawer = ({
  open,
  onOpenChange,
  onSelectType,
}: AddBlockDrawerProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle>Adicionar Bloco</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-1 gap-3 mt-6 overflow-y-auto max-h-[calc(80vh-100px)]">
          {blockTypes.map((block) => (
            <Button
              key={block.type}
              variant="outline"
              className="h-auto p-4 justify-start"
              onClick={() => {
                onSelectType(block.type);
                onOpenChange(false);
              }}
            >
              <block.icon className="w-5 h-5 mr-3 shrink-0" />
              <div className="text-left">
                <div className="font-medium">{block.label}</div>
                <div className="text-xs text-muted-foreground">
                  {block.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};
