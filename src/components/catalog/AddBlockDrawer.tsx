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
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AddBlockDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectType: (type: string) => void;
  context?: "catalog" | "profile"; // catalog or profile builder
}

// Organized block categories for intuitive UX
const blockCategories = [
  {
    id: "essential",
    label: "✨ Essenciais",
    description: "Comece por aqui",
    blocks: [
      { type: "profile_header", icon: User, label: "Cabeçalho", description: "Logo, nome e slogan", contexts: ["profile"], popular: true },
      { type: "cover", icon: ImagePlus, label: "Capa", description: "Imagem de destaque com título", contexts: ["catalog"], popular: true },
      { type: "about_business", icon: Info, label: "Sobre Nós", description: "História do seu negócio", contexts: ["catalog", "profile"], popular: true },
      { type: "contact", icon: Phone, label: "Contato", description: "WhatsApp, email, telefone", contexts: ["catalog", "profile"], popular: true },
    ],
  },
  {
    id: "products",
    label: "🛍️ Produtos",
    description: "Mostre o que você vende",
    blocks: [
      { type: "product_grid", icon: LayoutGrid, label: "Grade de Produtos", description: "Mostre seus produtos", contexts: ["catalog", "profile"], popular: true },
      { type: "category_grid", icon: Layers, label: "Categorias", description: "Navegue por categorias", contexts: ["catalog", "profile"] },
      { type: "tag_grid", icon: Tag, label: "Tags", description: "Navegue por tags", contexts: ["catalog", "profile"] },
      { type: "catalogs", icon: Folder, label: "Catálogos", description: "Mostre seus catálogos", contexts: ["profile"] },
    ],
  },
  {
    id: "content",
    label: "📝 Conteúdo",
    description: "Textos, fotos e vídeos",
    blocks: [
      { type: "heading", icon: Type, label: "Texto Livre", description: "Texto formatado", contexts: ["catalog", "profile"] },
      { type: "image", icon: ImageIcon, label: "Imagem", description: "Foto única com legenda", contexts: ["catalog", "profile"] },
      { type: "video", icon: Video, label: "Vídeo", description: "YouTube ou Vimeo", contexts: ["catalog", "profile"] },
    ],
  },
  {
    id: "trust",
    label: "💬 Confiança & Social",
    description: "Construa credibilidade",
    blocks: [
      { type: "testimonials", icon: Star, label: "Depoimentos", description: "Avaliações de clientes", contexts: ["catalog", "profile"], popular: true },
      { type: "socials", icon: Share2, label: "Redes Sociais", description: "Links para suas redes", contexts: ["catalog", "profile"] },
      { type: "location", icon: MapPin, label: "Localizações", description: "Suas unidades/lojas", contexts: ["catalog", "profile"] },
    ],
  },
  {
    id: "info",
    label: "ℹ️ Informação & Ajuda",
    description: "Guias e dúvidas",
    blocks: [
      { type: "informacoes", icon: List, label: "Informações", description: "Destaque informações", contexts: ["catalog", "profile"] },
      { type: "faq", icon: HelpCircle, label: "FAQ", description: "Perguntas frequentes", contexts: ["catalog", "profile"] },
      { type: "external_links", icon: Link2, label: "Links Externos", description: "Links para qualquer site", contexts: ["catalog", "profile"] },
    ],
  },
  {
    id: "layout",
    label: "🎨 Layout",
    description: "Organize sua página",
    blocks: [
      { type: "divider", icon: Minus, label: "Divisor", description: "Linha de separação", contexts: ["catalog", "profile"] },
    ],
  },
];

export const AddBlockDrawer = ({
  open,
  onOpenChange,
  onSelectType,
  context = "catalog",
}: AddBlockDrawerProps) => {
  // Filter categories and blocks based on context
  const availableCategories = blockCategories
    .map(category => ({
      ...category,
      blocks: category.blocks.filter(block => block.contexts.includes(context)),
    }))
    .filter(category => category.blocks.length > 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] flex flex-col">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="text-xl">Adicionar Bloco</SheetTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Escolha um bloco para adicionar à sua página
          </p>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto mt-4 pb-6 space-y-6">
          {availableCategories.map((category) => (
            <div key={category.id} className="space-y-3">
              {/* Category Header */}
              <div className="sticky top-0 bg-background/95 backdrop-blur-sm pb-2 z-10">
                <h3 className="text-sm font-semibold text-foreground">
                  {category.label}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {category.description}
                </p>
              </div>
              
              {/* Category Blocks */}
              <div className="grid grid-cols-1 gap-2">
                {category.blocks.map((block) => (
                  <Button
                    key={block.type}
                    variant="outline"
                    className={cn(
                      "h-auto p-4 justify-start relative group",
                      "hover:bg-accent hover:border-primary/50 transition-all",
                      "active:scale-[0.98]"
                    )}
                    onClick={() => {
                      onSelectType(block.type);
                      onOpenChange(false);
                    }}
                  >
                    {/* Popular badge */}
                    {block.popular && (
                      <div className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
                        Popular
                      </div>
                    )}
                    
                    {/* Icon with gradient background */}
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mr-3 shrink-0 group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
                      <block.icon className="w-5 h-5 text-primary" />
                    </div>
                    
                    {/* Text content */}
                    <div className="text-left flex-1">
                      <div className="font-semibold text-[15px] mb-0.5">
                        {block.label}
                      </div>
                      <div className="text-xs text-muted-foreground leading-relaxed">
                        {block.description}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};
