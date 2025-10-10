import { useState, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, X, Star, GripVertical } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  PhotoObject,
  validateFileSize,
  validateFileType,
  getResponsiveImageUrl,
  extractFileId,
} from "@/lib/imagekit";
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

interface ImageKitUploaderProps {
  photos: PhotoObject[];
  productId?: string;
  onPhotosChange: (photos: PhotoObject[]) => void;
  maxPhotos?: number;
}

interface SortablePhotoProps {
  photo: PhotoObject;
  index: number;
  onSetCover: () => void;
  onDelete: () => void;
}

function SortablePhoto({ photo, index, onSetCover, onDelete }: SortablePhotoProps) {
  const isMobile = useIsMobile();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.fileId || index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group rounded-lg overflow-hidden border border-border bg-background"
    >
      {/* Drag handle - always visible on mobile */}
      <button
        className={`absolute top-2 left-2 z-10 bg-background/90 backdrop-blur-sm p-2 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center touch-none transition-opacity ${
          isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Cover badge */}
      {photo.is_cover && (
        <div className="absolute top-2 right-2 z-10 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
          <Star className="h-3 w-3 fill-current" />
          Capa
        </div>
      )}

      {/* Image */}
      <div className="aspect-square">
        <img
          src={getResponsiveImageUrl(photo.url, 'thumb')}
          alt={photo.alt || `Foto ${index + 1}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Actions - always visible on mobile */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 transition-opacity ${
        isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <div className="flex gap-2">
          {!photo.is_cover && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onSetCover}
              className="flex-1 min-h-[44px] text-xs"
            >
              <Star className="h-4 w-4 mr-1" />
              Definir capa
            </Button>
          )}
          <Button
            size="sm"
            variant="destructive"
            onClick={onDelete}
            className="min-h-[44px] min-w-[44px] shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ImageKitUploader({
  photos,
  productId,
  onPhotosChange,
  maxPhotos = 12,
}: ImageKitUploaderProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 200, // Long press for mobile
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const uploadToImageKit = async (file: File): Promise<PhotoObject | null> => {
    try {
      // Get signature from edge function
      const { data: signatureData, error: signatureError } = await supabase.functions.invoke(
        'imagekit-signature',
        {
          body: { productId },
        }
      );

      if (signatureError) throw signatureError;

      const { token, expire, signature, publicKey, folder } = signatureData;

      // Prepare form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', `image-${Date.now()}.jpg`);
      formData.append('publicKey', publicKey);
      formData.append('signature', signature);
      formData.append('expire', expire.toString());
      formData.append('token', token);
      formData.append('folder', folder);

      // Upload to ImageKit
      const uploadResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const uploadData = await uploadResponse.json();

      // Create photo object (is_cover will be set by handleFileSelect)
      const photoObject: PhotoObject = {
        url: uploadData.url,
        width: uploadData.width,
        height: uploadData.height,
        alt: '',
        is_cover: false, // Will be set correctly by handleFileSelect
        fileId: uploadData.fileId,
        lqip: uploadData.url + '?tr=w-50,q-10,fo-auto',
      };

      return photoObject;
    } catch (error: any) {
      console.error('ImageKit upload error:', error);
      toast({
        title: 'Erro no upload',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check max photos limit
    if (photos.length + files.length > maxPhotos) {
      toast({
        title: 'Limite excedido',
        description: `Você pode adicionar no máximo ${maxPhotos} fotos`,
        variant: 'destructive',
      });
      return;
    }

    // Validate files
    const validFiles = files.filter((file) => {
      if (!validateFileType(file)) {
        toast({
          title: 'Tipo inválido',
          description: `${file.name} não é uma imagem válida`,
          variant: 'destructive',
        });
        return false;
      }
      if (!validateFileSize(file)) {
        toast({
          title: 'Arquivo muito grande',
          description: `${file.name} excede o limite de 10MB`,
          variant: 'destructive',
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);

    // Track if we already have photos (to determine cover)
    const isFirstBatch = photos.length === 0;

    // Upload files
    const uploadPromises = validFiles.map((file) => uploadToImageKit(file));
    const uploadedPhotos = await Promise.all(uploadPromises);

    // Filter out failed uploads and set cover only for first photo of first batch
    const successfulPhotos = uploadedPhotos
      .filter((photo) => photo !== null)
      .map((photo, index) => ({
        ...photo!,
        is_cover: isFirstBatch && index === 0, // Only first photo of first batch is cover
      }));

    if (successfulPhotos.length > 0) {
      onPhotosChange([...photos, ...successfulPhotos]);
      toast({
        title: 'Upload concluído',
        description: `${successfulPhotos.length} foto(s) adicionada(s)`,
      });
    }

    setUploading(false);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSetCover = (index: number) => {
    const newPhotos = photos.map((photo, i) => ({
      ...photo,
      is_cover: i === index,
    }));

    // Move cover to index 0
    const coverPhoto = newPhotos[index];
    newPhotos.splice(index, 1);
    newPhotos.unshift(coverPhoto);

    onPhotosChange(newPhotos);
  };

  const handleDelete = async (index: number) => {
    const photo = photos[index];

    try {
      // Delete from ImageKit
      if (photo.fileId) {
        await supabase.functions.invoke('imagekit-delete', {
          body: { fileId: photo.fileId, productId },
        });
      }
    } catch (error) {
      console.error('Failed to delete from ImageKit:', error);
      // Continue with array removal even if ImageKit delete fails
    }

    const newPhotos = photos.filter((_, i) => i !== index);

    // If we deleted the cover, set first photo as cover
    if (photo.is_cover && newPhotos.length > 0) {
      newPhotos[0].is_cover = true;
    }

    onPhotosChange(newPhotos);

    toast({
      title: 'Foto removida',
      description: 'A foto foi removida com sucesso',
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = photos.findIndex((p) => (p.fileId || photos.indexOf(p)) === active.id);
      const newIndex = photos.findIndex((p) => (p.fileId || photos.indexOf(p)) === over.id);

      const newPhotos = arrayMove(photos, oldIndex, newIndex);

      // Maintain cover on first position
      if (newPhotos[0]) {
        newPhotos.forEach((p, i) => (p.is_cover = i === 0));
      }

      onPhotosChange(newPhotos);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || photos.length >= maxPhotos}
          className="w-full min-h-[44px]"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Enviando...' : `Adicionar fotos (${photos.length}/${maxPhotos})`}
        </Button>
      </div>

      {/* Photo grid */}
      {photos.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={photos.map((p, i) => p.fileId || i)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {photos.map((photo, index) => (
                <SortablePhoto
                  key={photo.fileId || index}
                  photo={photo}
                  index={index}
                  onSetCover={() => handleSetCover(index)}
                  onDelete={() => handleDelete(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Help text */}
      <p className="text-sm text-muted-foreground">
        Arraste e solte para reordenar. Mantenha pressionado no mobile. Máximo: {maxPhotos} fotos, 10MB cada.
      </p>
    </div>
  );
}
