import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
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

  const handleRemoveLogo = async () => {
    if (!currentLogo) return;

    setUploading(true);
    try {
      // Try to delete from ImageKit
      try {
        const urlObj = new URL(currentLogo);
        const pathParts = urlObj.pathname.split('/');
        const filenamePart = pathParts[pathParts.length - 1];
        const fileId = filenamePart.split('.')[0];
        
        if (fileId) {
          await supabase.functions.invoke('imagekit-delete', {
            body: { fileId }
          });
        }
      } catch (error) {
        console.error('Failed to delete logo from ImageKit:', error);
      }

      // Update profile with null logo
      onLogoChange('');
      toast({
        title: 'Logo removido',
        description: 'Seu logo foi removido com sucesso',
      });
    } catch (error: any) {
      console.error('Error removing logo:', error);
      toast({
        title: 'Erro ao remover logo',
        description: error.message || 'Ocorreu um erro ao remover o logo',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
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
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {currentLogo ? (
        <div className="space-y-3">
          {/* Logo Preview */}
          <div className="relative w-32 h-32 mx-auto">
            <img
              src={currentLogo}
              alt="Logo atual"
              className="w-full h-full object-cover rounded-xl border-2 border-slate-200 dark:border-slate-800"
            />
            <button
              type="button"
              onClick={handleRemoveLogo}
              disabled={uploading}
              className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Change Logo Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Enviando...' : 'Alterar logo'}
          </Button>
        </div>
      ) : (
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
      )}
    </div>
  );
}
