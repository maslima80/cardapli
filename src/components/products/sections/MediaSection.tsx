import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ImageKitUploader } from "../ImageKitUploader";
import { ExternalMediaUploader } from "../ExternalMediaUploader";
import { PhotoObject } from "@/lib/imagekit";
import { ExternalMediaObject } from "@/lib/external-media";

interface MediaSectionProps {
  photos: PhotoObject[];
  externalMedia: ExternalMediaObject[];
  productId?: string;
  onPhotosChange: (photos: PhotoObject[]) => void;
  onExternalMediaChange: (media: ExternalMediaObject[]) => void;
}

export function MediaSection({
  photos,
  externalMedia,
  productId,
  onPhotosChange,
  onExternalMediaChange,
}: MediaSectionProps) {

  return (
    <div className="space-y-6">
      {/* Photos Section with ImageKit */}
      <div className="space-y-4">
        <div>
          <Label>Fotos do produto</Label>
          <p className="text-sm text-muted-foreground mt-1">
            As fotos são armazenadas com CDN para carregamento rápido
          </p>
        </div>
        <ImageKitUploader
          photos={photos}
          productId={productId}
          onPhotosChange={onPhotosChange}
          maxPhotos={12}
        />
      </div>

      {/* External Media Section */}
      <Card className="p-6 space-y-4">
        <div>
          <Label>Mídia externa (opcional)</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Adicione vídeos do YouTube, TikTok ou Instagram Reels
          </p>
        </div>
        <ExternalMediaUploader
          media={externalMedia}
          onMediaChange={onExternalMediaChange}
          maxMedia={10}
        />
      </Card>
    </div>
  );
}
