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
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddBlockDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectType: (type: string) => void;
  context?: "catalog" | "profile"; // catalog or profile builder
}

const blockTypes = [
  { type: "profile_header", icon: User, label: "Cabeçalho do Perfil", description: "Logo, nome e slogan", contexts: ["profile"] },
  { type: "cover", icon: ImagePlus, label: "Capa", description: "Imagem de destaque com título", contexts: ["catalog"] },
  { type: "heading", icon: Type, label: "Texto Livre", description: "Texto formatado com título opcional", contexts: ["catalog", "profile"] },
  { type: "image", icon: ImageIcon, label: "Imagem", description: "Foto única com legenda", contexts: ["catalog", "profile"] },
  { type: "video", icon: Video, label: "Vídeo", description: "Vídeo do YouTube ou Vimeo", contexts: ["catalog", "profile"] },
  { type: "product_grid", icon: LayoutGrid, label: "Grade de Produtos", description: "Mostre seus produtos", contexts: ["catalog", "profile"] },
  { type: "category_grid", icon: Layers, label: "Categorias", description: "Navegação por categorias", contexts: ["catalog", "profile"] },
  { type: "tag_grid", icon: Tag, label: "Tags", description: "Navegação por tags", contexts: ["catalog", "profile"] },
  { type: "location", icon: MapPin, label: "Localizações", description: "Mostre suas unidades/lojas", contexts: ["catalog", "profile"] },
  { type: "about_business", icon: Info, label: "Sobre o Negócio", description: "Apresente a história e o propósito do seu negócio", contexts: ["catalog", "profile"] },
  { type: "contact", icon: Phone, label: "Contato", description: "WhatsApp, email, telefone", contexts: ["catalog", "profile"] },
  { type: "socials", icon: Share2, label: "Redes Sociais", description: "Links para suas redes", contexts: ["catalog", "profile"] },
  { type: "testimonials", icon: Star, label: "Depoimentos", description: "Avaliações de clientes", contexts: ["catalog", "profile"] },
  { type: "informacoes", icon: List, label: "Informações", description: "Destaque informações importantes", contexts: ["catalog", "profile"] },
  { type: "faq", icon: HelpCircle, label: "Perguntas Frequentes", description: "Dúvidas comuns", contexts: ["catalog", "profile"] },
  { type: "catalogs", icon: Folder, label: "Catálogos", description: "Mostre seus catálogos", contexts: ["profile"] },
  { type: "external_links", icon: Link2, label: "Links Externos", description: "Links para qualquer site", contexts: ["catalog", "profile"] },
  { type: "divider", icon: Minus, label: "Divisor", description: "Linha de separação", contexts: ["catalog", "profile"] },
];

export const AddBlockDrawer = ({
  open,
  onOpenChange,
  onSelectType,
  context = "catalog",
}: AddBlockDrawerProps) => {
  // Filter blocks based on context
  const availableBlocks = blockTypes.filter(block => 
    block.contexts.includes(context)
  );
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle>Adicionar Bloco</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-1 gap-3 mt-6 overflow-y-auto max-h-[calc(80vh-100px)]">
          {availableBlocks.map((block) => (
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
