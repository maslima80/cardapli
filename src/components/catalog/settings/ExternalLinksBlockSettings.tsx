import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, GripVertical, Image as ImageIcon, Link as LinkIcon, ExternalLink, Mail, Phone, MapPin, ShoppingBag, Calendar, FileText, Video, Music } from "lucide-react";
import { SimpleImageUploader } from "../SimpleImageUploader";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Popular icons for quick selection
const ICON_OPTIONS = [
  { icon: LinkIcon, label: "Link" },
  { icon: ExternalLink, label: "Website" },
  { icon: Mail, label: "Email" },
  { icon: Phone, label: "Telefone" },
  { icon: MapPin, label: "Local" },
  { icon: ShoppingBag, label: "Loja" },
  { icon: Calendar, label: "Evento" },
  { icon: FileText, label: "Documento" },
  { icon: Video, label: "Vídeo" },
  { icon: Music, label: "Música" },
];

// Popular emojis for quick selection
const EMOJI_OPTIONS = [
  "🔗", "🌐", "📱", "💼", "🎨", "📸", "🎵", "🎬", "📝", "📚",
  "🛍️", "🏪", "🏠", "📍", "✉️", "📞", "💬", "👤", "❤️", "⭐"
];

interface ExternalLinksBlockSettingsProps {
  data: any;
  onUpdate: (data: any) => void;
}

interface Link {
  url: string;
  title: string;
  description?: string;
  icon?: string;
  iconType?: "emoji" | "icon" | "image";
  thumbnail?: string;
}

const SortableLinkItem = ({ 
  link, 
  index, 
  onUpdate, 
  onRemove 
}: { 
  link: Link; 
  index: number; 
  onUpdate: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: `link-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [iconTab, setIconTab] = useState(link.iconType || "emoji");

  const IconComponent = link.icon && !link.iconType || link.iconType === "icon" 
    ? ICON_OPTIONS.find(opt => opt.label === link.icon)?.icon 
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border rounded-xl p-4 bg-muted/30 space-y-4"
    >
      <div className="flex items-center gap-2">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">Link {index + 1}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
          className="ml-auto"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Título *</Label>
        <Input
          value={link.title}
          onChange={(e) => onUpdate(index, 'title', e.target.value)}
          placeholder="Ex: Meu Portfolio"
        />
      </div>

      <div className="space-y-2">
        <Label>URL *</Label>
        <Input
          value={link.url}
          onChange={(e) => onUpdate(index, 'url', e.target.value)}
          placeholder="https://exemplo.com"
          type="url"
        />
      </div>

      <div className="space-y-2">
        <Label>Descrição (opcional)</Label>
        <Textarea
          value={link.description || ''}
          onChange={(e) => onUpdate(index, 'description', e.target.value)}
          placeholder="Breve descrição do link"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>Ícone/Imagem (opcional)</Label>
        <Tabs value={iconTab} onValueChange={(value) => {
          setIconTab(value as any);
          onUpdate(index, 'iconType', value);
        }}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="emoji">😊 Emoji</TabsTrigger>
            <TabsTrigger value="icon">🎨 Ícone</TabsTrigger>
            <TabsTrigger value="image">📷 Imagem</TabsTrigger>
          </TabsList>
          
          <TabsContent value="emoji" className="space-y-2">
            <p className="text-xs text-muted-foreground">Clique em um emoji:</p>
            <div className="grid grid-cols-10 gap-1">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onUpdate(index, 'icon', emoji)}
                  className={`p-2 text-xl hover:bg-accent rounded transition-colors ${
                    link.icon === emoji && link.iconType === 'emoji' ? 'bg-accent' : ''
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            {link.icon && link.iconType === 'emoji' && (
              <p className="text-sm text-muted-foreground">Selecionado: {link.icon}</p>
            )}
          </TabsContent>
          
          <TabsContent value="icon" className="space-y-2">
            <p className="text-xs text-muted-foreground">Escolha um ícone:</p>
            <div className="grid grid-cols-5 gap-2">
              {ICON_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => onUpdate(index, 'icon', option.label)}
                    className={`p-3 flex flex-col items-center gap-1 hover:bg-accent rounded-lg transition-colors ${
                      link.icon === option.label && link.iconType === 'icon' ? 'bg-accent' : ''
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px]">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="image" className="space-y-2">
            <p className="text-xs text-muted-foreground">Envie uma imagem:</p>
            <SimpleImageUploader
              value={link.thumbnail || ''}
              onChange={(url) => onUpdate(index, 'thumbnail', url)}
              aspectRatio="square"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export function ExternalLinksBlockSettings({ data, onUpdate }: ExternalLinksBlockSettingsProps) {
  const [links, setLinks] = useState<Link[]>(data?.links || []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sync state with data prop when it changes
  useEffect(() => {
    setLinks(data?.links || []);
  }, [data]);

  const updateParent = (newLinks: Link[]) => {
    const updatedData = {
      links: newLinks,
    };
    onUpdate(updatedData);
  };

  const addLink = () => {
    const newLinks = [...links, { 
      url: '', 
      title: '', 
      description: '', 
      icon: '🔗', 
      iconType: 'emoji',
      thumbnail: '' 
    }];
    setLinks(newLinks);
    updateParent(newLinks);
  };

  const updateLink = (index: number, field: string, value: any) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
    updateParent(newLinks);
  };

  const removeLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    setLinks(newLinks);
    updateParent(newLinks);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = parseInt(active.id.toString().split('-')[1]);
    const newIndex = parseInt(over.id.toString().split('-')[1]);
    const newLinks = arrayMove(links, oldIndex, newIndex);
    
    setLinks(newLinks);
    updateParent(newLinks);
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          💡 <strong>Links Externos:</strong> Adicione links para qualquer site, rede social, ou recurso externo. Escolha entre emojis, ícones ou imagens personalizadas!
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base">Links ({links.length})</Label>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={addLink}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar Link
          </Button>
        </div>

        {links.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-xl">
            <LinkIcon className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm mb-4">
              Nenhum link adicionado ainda
            </p>
            <Button onClick={addLink} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Adicionar Primeiro Link
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={links.map((_, i) => `link-${i}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {links.map((link, index) => (
                  <SortableLinkItem
                    key={`link-${index}`}
                    link={link}
                    index={index}
                    onUpdate={updateLink}
                    onRemove={removeLink}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
