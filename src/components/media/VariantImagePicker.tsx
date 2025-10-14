import React from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface ProductPhoto {
  url: string;
  fileId?: string;
  width?: number;
  height?: number;
  alt?: string;
}

interface VariantImagePickerProps {
  productId: string;
  productPhotos: ProductPhoto[];
  value?: string | null;
  onChange: (url: string | null) => void;
}

export function VariantImagePicker({
  productId,
  productPhotos,
  value,
  onChange,
}: VariantImagePickerProps) {
  // Remove image selection
  const removeImage = () => {
    onChange(null);
  };

  return (
    <div className="space-y-4">
      {productPhotos.length > 0 ? (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
          {productPhotos.map((photo, index) => (
            <div
              key={photo.fileId || index}
              className={`border rounded-md overflow-hidden cursor-pointer aspect-square relative ${
                value === photo.url ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => onChange(photo.url)}
            >
              <img
                src={photo.url}
                alt={photo.alt || `Foto ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {value === photo.url && (
                <div className="absolute top-1 right-1 bg-primary text-white rounded-full p-0.5">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          Nenhuma foto disponível para este produto.
        </div>
      )}

      {/* Preview of selected image */}
      {value && (
        <div className="space-y-2">
          <div className="border rounded-md p-2 flex justify-center">
            <img
              src={value}
              alt="Imagem da variante"
              className="max-h-40 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/400x400?text=Imagem+inválida";
              }}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={removeImage}
          >
            <X className="h-4 w-4 mr-1" /> Remover imagem
          </Button>
        </div>
      )}
    </div>
  );
}
