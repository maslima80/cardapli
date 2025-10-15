import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Plus,
  Type,
  Image as ImageIcon,
  ImagePlus,
  Video,
  Box,
  Tag,
  MapPin,
  Info,
  Phone,
  Share2,
  Star,
  List,
  ListOrdered,
  AlertCircle,
  Minus,
  Folder,
  LayoutGrid,
  Layers,
  HelpCircle,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddBlockDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectType: (type: string) => void;
}

const blockTypes = [
  { type: "profile_header", icon: User, label: "Cabeçalho do Perfil", description: "Logo, nome e slogan" },
  { type: "cover", icon: ImagePlus, label: "Capa", description: "Imagem de destaque com título" },
  { type: "heading", icon: Type, label: "Texto Livre", description: "Texto formatado com título opcional" },
  { type: "image", icon: ImageIcon, label: "Imagem", description: "Foto única com legenda" },
  { type: "video", icon: Video, label: "Vídeo", description: "Vídeo do YouTube ou Vimeo" },
  { type: "product_grid", icon: LayoutGrid, label: "Grade de Produtos", description: "Mostre seus produtos" },
  { type: "category_grid", icon: Layers, label: "Categorias", description: "Navegação por categorias" },
  { type: "tag_grid", icon: Tag, label: "Tags", description: "Navegação por tags" },
  { type: "location", icon: MapPin, label: "Localizações", description: "Mostre suas unidades/lojas" },
  { type: "about_business", icon: Info, label: "Sobre o Negócio", description: "Apresente a história e o propósito do seu negócio" },
  { type: "contact", icon: Phone, label: "Contato", description: "WhatsApp, email, telefone" },
  { type: "socials", icon: Share2, label: "Redes Sociais", description: "Links para suas redes" },
  { type: "testimonials", icon: Star, label: "Depoimentos", description: "Avaliações de clientes" },
  { type: "benefits", icon: List, label: "Benefícios", description: "Lista de vantagens" },
  { type: "step_by_step", icon: ListOrdered, label: "Passo a passo", description: "Guia de instruções sequenciais" },
  { type: "faq", icon: HelpCircle, label: "Perguntas Frequentes", description: "Dúvidas comuns" },
  { type: "important_info", icon: AlertCircle, label: "Info Importante", description: "Destaque informações" },
  { type: "catalogs", icon: Folder, label: "Catálogos", description: "Mostre seus catálogos" },
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
