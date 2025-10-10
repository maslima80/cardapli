import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, GripVertical, ExternalLink } from "lucide-react";
import { ExternalMediaObject, extractVideoInfo, getThumbnail, supportsInlineEmbed } from "@/lib/external-media";
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
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ExternalMediaUploaderProps {
  media: ExternalMediaObject[];
  onMediaChange: (media: ExternalMediaObject[]) => void;
  maxMedia?: number;
}

interface SortableMediaProps {
  mediaItem: ExternalMediaObject;
  index: number;
  onDelete: () => void;
}

function SortableMedia({ mediaItem, index, onDelete }: SortableMediaProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: mediaItem.videoId || index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const thumbnail = getThumbnail(mediaItem);
  const Icon = supportsInlineEmbed(mediaItem.provider) ? Plus : ExternalLink;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group rounded-lg overflow-hidden border border-border bg-background min-w-[200px]"
    >
      {/* Drag handle */}
      <button
        className="absolute top-2 left-2 z-10 bg-background/80 backdrop-blur-sm p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity min-h-[44px] min-w-[44px] flex items-center justify-center touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Thumbnail or placeholder */}
      <div className="aspect-video bg-muted flex items-center justify-center">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={mediaItem.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="text-center p-4">
            <Icon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground capitalize">{mediaItem.provider}</p>
          </div>
        )}
      </div>

      {/* Provider badge */}
      <div className="absolute top-2 right-2 z-10 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-medium capitalize">
        {mediaItem.provider}
      </div>

      {/* Actions */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={onDelete}
            className="ml-auto min-h-[44px] min-w-[44px]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ExternalMediaUploader({
  media,
  onMediaChange,
  maxMedia = 10,
}: ExternalMediaUploaderProps) {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAdd = async () => {
    if (!url.trim()) return;

    // Check max limit
    if (media.length >= maxMedia) {
      toast({
        title: "Limite excedido",
        description: `Você pode adicionar no máximo ${maxMedia} vídeos`,
        variant: "destructive",
      });
      return;
    }

    // Quick validation
    const info = extractVideoInfo(url);
    if (!info) {
      toast({
        title: "URL não suportada",
        description: "Use links do YouTube, TikTok ou Instagram Reels",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Call edge function to resolve media info
      const { data, error } = await supabase.functions.invoke('resolve-external-media', {
        body: { url },
      });

      if (error) throw error;

      const newMedia: ExternalMediaObject = {
        url: data.url,
        provider: data.provider,
        videoId: data.videoId,
        title: data.title,
        thumbnail: data.thumbnail,
        embedUrl: data.embedUrl,
      };

      onMediaChange([...media, newMedia]);
      setUrl("");
      
      toast({
        title: "Vídeo adicionado ✓",
        description: `${data.provider.charAt(0).toUpperCase() + data.provider.slice(1)} detectado`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar vídeo",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (index: number) => {
    const newMedia = media.filter((_, i) => i !== index);
    onMediaChange(newMedia);
    
    toast({
      title: "Vídeo removido",
      description: "O vídeo foi removido com sucesso",
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = media.findIndex((m) => (m.videoId || media.indexOf(m)) === active.id);
      const newIndex = media.findIndex((m) => (m.videoId || media.indexOf(m)) === over.id);

      const newMedia = arrayMove(media, oldIndex, newIndex);
      onMediaChange(newMedia);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add input */}
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          placeholder="Cole o link do YouTube, TikTok ou Instagram Reels"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAdd();
            }
          }}
          className="min-h-[44px]"
          disabled={loading}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleAdd}
          disabled={loading || media.length >= maxMedia || !url.trim()}
          className="min-h-[44px] min-w-[44px]"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Media list */}
      {media.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={media.map((m, i) => m.videoId || i)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex gap-4 overflow-x-auto pb-2">
              {media.map((mediaItem, index) => (
                <SortableMedia
                  key={mediaItem.videoId || index}
                  mediaItem={mediaItem}
                  index={index}
                  onDelete={() => handleDelete(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Help text */}
      <p className="text-sm text-muted-foreground">
        Arraste e solte para reordenar. Máximo: {maxMedia} vídeos. Suporta YouTube, TikTok e Instagram Reels.
      </p>
    </div>
  );
}
