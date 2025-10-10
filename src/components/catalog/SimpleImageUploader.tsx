import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProductImagePickerModal } from "./ProductImagePickerModal";

interface SimpleImageUploaderProps {
  currentImageUrl?: string;
  onImageChange: (url: string, metadata?: { width?: number; height?: number; ratio?: number }) => void;
}

// Helper function to get image dimensions
const getImageDimensions = (file: File): Promise<{ width?: number; height?: number; ratio?: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const width = img.width;
      const height = img.height;
      const ratio = width / height;
      URL.revokeObjectURL(img.src); // Clean up
      resolve({ width, height, ratio });
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src); // Clean up
      resolve({}); // Return empty object if there's an error
    };
    img.src = URL.createObjectURL(file);
  });
};

export const SimpleImageUploader = ({
  currentImageUrl,
  onImageChange,
}: SimpleImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [productPickerOpen, setProductPickerOpen] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande (máx. 5MB)");
      return;
    }

    setUploading(true);

    try {
      // Get image dimensions before uploading
      const imageMetadata = await getImageDimensions(file);
      
      const { data: authData } = await supabase.functions.invoke("imagekit-signature");
      
      if (!authData || authData.error) {
        throw new Error("Erro ao gerar assinatura");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);
      formData.append("publicKey", authData.publicKey);
      formData.append("signature", authData.signature);
      formData.append("expire", authData.expire.toString());
      formData.append("token", authData.token);
      formData.append("folder", authData.folder);

      const response = await fetch(authData.uploadEndpoint || "https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.url) {
        onImageChange(result.url, imageMetadata);
        toast.success("Imagem enviada!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erro ao enviar imagem");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Enviar</TabsTrigger>
          <TabsTrigger value="url">URL</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-3">
          {currentImageUrl ? (
            <div className="relative">
              <div className="relative w-full flex justify-center items-center bg-muted/30 rounded-xl overflow-hidden" style={{ minHeight: '120px', maxHeight: '200px' }}>
                <img
                  src={currentImageUrl}
                  alt="Preview"
                  className="max-w-full max-h-[200px] object-contain"
                />
              </div>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => onImageChange("")}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
              <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground font-medium">
                {uploading ? "Enviando..." : "Arraste uma imagem ou clique aqui"}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                Tamanho máximo: 5 MB
              </span>
              <p className="text-xs text-muted-foreground mt-2 max-w-[80%] text-center">
                A imagem manterá seu formato original e será otimizada automaticamente
              </p>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
          )}
        </TabsContent>

        <TabsContent value="url" className="space-y-2">
          {currentImageUrl && (
            <div className="relative mb-3">
              <div className="relative w-full flex justify-center items-center bg-muted/30 rounded-xl overflow-hidden" style={{ minHeight: '120px', maxHeight: '200px' }}>
                <img
                  src={currentImageUrl}
                  alt="Preview"
                  className="max-w-full max-h-[200px] object-contain"
                />
              </div>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => onImageChange("")}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
          <Label>URL da Imagem</Label>
          <Input
            placeholder="https://..."
            value={currentImageUrl || ""}
            onChange={(e) => onImageChange(e.target.value)}
          />
        </TabsContent>

        <TabsContent value="products" className="space-y-3">
          {currentImageUrl ? (
            <div className="relative">
              <div className="relative w-full flex justify-center items-center bg-muted/30 rounded-xl overflow-hidden" style={{ minHeight: '120px', maxHeight: '200px' }}>
                <img
                  src={currentImageUrl}
                  alt="Preview"
                  className="max-w-full max-h-[200px] object-contain"
                />
              </div>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => onImageChange("")}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full h-48 border-2 border-dashed"
              onClick={() => setProductPickerOpen(true)}
            >
              <div className="flex flex-col items-center gap-2">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-medium">
                  Escolher imagem de um produto
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  Use fotos já existentes no seu catálogo
                </span>
              </div>
            </Button>
          )}
          {currentImageUrl && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setProductPickerOpen(true)}
            >
              Trocar Imagem
            </Button>
          )}
        </TabsContent>
      </Tabs>

      <ProductImagePickerModal
        open={productPickerOpen}
        onOpenChange={setProductPickerOpen}
        onSelectImage={onImageChange}
      />
    </>
  );
};
