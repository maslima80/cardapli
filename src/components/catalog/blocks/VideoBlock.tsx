import { useState, useEffect } from "react";
import { extractVideoInfo } from "@/lib/external-media";
import { Youtube, Play } from "lucide-react";

interface VideoBlockProps {
  data: {
    url?: string;
    title?: string;
  };
}

export const VideoBlock = ({ data }: VideoBlockProps) => {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  useEffect(() => {
    if (!data.url) return;
    
    const info = extractVideoInfo(data.url);
    if (info && info.provider === 'youtube') {
      setVideoId(info.videoId);
    } else {
      setVideoId(null);
    }
  }, [data.url]);

  if (!data.url) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Configure o vídeo nas configurações do bloco
      </div>
    );
  }

  if (!videoId) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <Youtube className="w-8 h-8 mx-auto mb-2" />
        <p>Apenas vídeos do YouTube são suportados</p>
        <p className="text-sm mt-1">Insira uma URL válida do YouTube</p>
      </div>
    );
  }

  // Get the thumbnail URL
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  
  // If not playing yet, show the thumbnail with play button
  if (!isPlaying) {
    return (
      <div className="py-6">
        <div className="max-w-3xl mx-auto">
          <div 
            className="relative aspect-video bg-muted rounded-xl overflow-hidden cursor-pointer" 
            onClick={() => setIsPlaying(true)}
          >
            <img
              src={thumbnailUrl}
              alt={data.title || "YouTube video"}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center hover:bg-black/50 transition-colors">
              <div className="bg-white rounded-full p-4">
                <Play className="w-8 h-8 text-red-600 fill-current" />
              </div>
            </div>
          </div>
          {data.title && (
            <p className="text-sm text-center mt-2">{data.title}</p>
          )}
        </div>
      </div>
    );
  }
  
  // Build the embed URL with parameters
  const baseParams = 'playsinline=1&rel=0&modestbranding=1';
  
  // Always add autoplay=1 when user clicks the play button
  const autoplayParams = isPlaying ? '&autoplay=1&mute=1' : '';
  
  const embedUrl = `https://www.youtube.com/embed/${videoId}?${baseParams}${autoplayParams}`;
  
  // Show the embedded video
  return (
    <div className="py-6">
      <div className="max-w-3xl mx-auto">
        <div className="aspect-video rounded-xl overflow-hidden">
          <iframe
            src={embedUrl}
            title={data.title || "YouTube video"}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        {data.title && (
          <p className="text-sm text-center mt-2">{data.title}</p>
        )}
      </div>
    </div>
  );
};
