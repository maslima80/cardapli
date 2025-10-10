import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { validateFileSize, validateFileType } from "@/lib/imagekit";

interface LogoUploaderProps {
  currentLogo: string | null;
  onLogoChange: (url: string) => void;
}

export function LogoUploader({ currentLogo, onLogoChange }: LogoUploaderProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadToImageKit = async (file: File): Promise<string | null> => {
    try {
      // Get signature from edge function - no productId for logos
      const { data: signatureData, error: signatureError } = await supabase.functions.invoke(
        'imagekit-signature',
        {
          // No productId for logos, it will use the catalogs folder
          body: {}
        }
      );

      if (signatureError) throw signatureError;

      const { token, expire, signature, publicKey, folder } = signatureData;

      // Prepare form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', `logo-${Date.now()}.${file.name.split('.').pop()}`);
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
      return uploadData.url;
    } catch (error: any) {
      console.error('ImageKit logo upload error:', error);
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

    const file = files[0]; // Only use the first file

    // Validate file
    if (!validateFileType(file)) {
      toast({
        title: 'Tipo inválido',
        description: 'O arquivo não é uma imagem válida',
        variant: 'destructive',
      });
      return;
    }
    
    if (!validateFileSize(file)) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O arquivo excede o limite de 10MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      // If there's an existing logo with a fileId, delete it
      if (currentLogo) {
        try {
          // Extract fileId from URL if possible
          const urlObj = new URL(currentLogo);
          const pathParts = urlObj.pathname.split('/');
          const filenamePart = pathParts[pathParts.length - 1];
          const fileId = filenamePart.split('.')[0]; // Assuming filename format is like "logo-1234567890.jpg"
          
          if (fileId) {
            await supabase.functions.invoke('imagekit-delete', {
              body: { fileId }
            });
          }
        } catch (error) {
          console.error('Failed to delete old logo:', error);
          // Continue with upload even if delete fails
        }
      }

      // Upload new logo
      const logoUrl = await uploadToImageKit(file);
      
      if (logoUrl) {
        onLogoChange(logoUrl);
        toast({
          title: 'Logo atualizado',
          description: 'Seu logo foi atualizado com sucesso',
        });
      }
    } catch (error: any) {
      console.error('Error handling logo upload:', error);
      toast({
        title: 'Erro ao atualizar logo',
        description: error.message || 'Ocorreu um erro ao atualizar o logo',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full"
      >
        <Upload className="h-4 w-4 mr-2" />
        {uploading ? 'Enviando...' : 'Enviar logo'}
      </Button>
    </div>
  );
}
