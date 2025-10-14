import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
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
  const [activeTab, setActiveTab] = useState<string>("produto");
  const [customUrl, setCustomUrl] = useState<string>(value || "");

  // Apply custom URL
  const applyCustomUrl = () => {
    if (customUrl.trim()) {
      onChange(customUrl.trim());
    }
  };

  // Remove image selection
  const removeImage = () => {
    onChange(null);
    setCustomUrl("");
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="produto">Produto</TabsTrigger>
          <TabsTrigger value="url">URL</TabsTrigger>
        </TabsList>

        <TabsContent value="produto" className="space-y-4 pt-2">
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
        </TabsContent>

        <TabsContent value="url" className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Cole a URL da imagem"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && customUrl.trim()) {
                  e.preventDefault();
                  applyCustomUrl();
                }
              }}
            />
            <Button
              onClick={applyCustomUrl}
              disabled={!customUrl.trim()}
              className="whitespace-nowrap"
            >
              Aplicar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Cole uma URL de imagem externa para usar como imagem da variante.
          </p>
        </TabsContent>
      </Tabs>

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
