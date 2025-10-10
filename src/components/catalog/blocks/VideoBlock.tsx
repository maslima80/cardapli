import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play } from "lucide-react";
import { extractVideoInfo, getThumbnail, supportsInlineEmbed, ExternalMediaObject } from "@/lib/external-media";

interface VideoBlockProps {
  data: {
    url?: string;
    provider?: string;
    title?: string;
    display?: "embed" | "card";
    autoplay?: boolean;
    thumbnail_url?: string;
  };
}

export const VideoBlock = ({ data }: VideoBlockProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoInfo, setVideoInfo] = useState<ExternalMediaObject | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data.url) return;

    const info = extractVideoInfo(data.url);
    if (info) {
      const media: ExternalMediaObject = {
        url: data.url,
        provider: info.provider,
        videoId: info.videoId,
        title: data.title || "",
        thumbnail: data.thumbnail_url || getThumbnail({
          url: data.url,
          provider: info.provider,
          videoId: info.videoId,
          title: data.title || "",
          thumbnail: data.thumbnail_url,
          embedUrl: ""
        } as ExternalMediaObject),
        embedUrl: getEmbedUrl(info.provider, info.videoId, data.autoplay)
      };
      setVideoInfo(media);
    }
  }, [data.url, data.title, data.thumbnail_url, data.autoplay]);

  // Lazy load: observe when element enters viewport
  useEffect(() => {
    if (!containerRef.current || data.display === "card") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [data.display]);

  if (!data.url || !videoInfo) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Configure o vídeo nas configurações do bloco
      </div>
    );
  }

  const handlePlayClick = () => {
    setIsPlaying(true);
    setIsVisible(true);
  };

  // Instagram always shows as card
  if (videoInfo.provider === "instagram") {
    return (
      <div className="py-6" ref={containerRef}>
        <Card className="max-w-md mx-auto overflow-hidden">
          {videoInfo.thumbnail && (
            <img
              src={videoInfo.thumbnail}
              alt={videoInfo.title || "Instagram post"}
              className="w-full aspect-square object-cover"
            />
          )}
          <div className="p-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(data.url, "_blank")}
              aria-label={`Ver ${videoInfo.title || "vídeo"} no Instagram`}
            >
              Ver no Instagram
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Card mode: show thumbnail with play button
  if (data.display === "card" && !isPlaying) {
    return (
      <div className="py-6" ref={containerRef}>
        <Card className="max-w-2xl mx-auto overflow-hidden cursor-pointer group" onClick={handlePlayClick}>
          <div className="relative aspect-video bg-muted">
            {videoInfo.thumbnail && (
              <img
                src={videoInfo.thumbnail}
                alt={videoInfo.title || "Thumbnail do vídeo"}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
              <div className="bg-white rounded-full p-4">
                <Play className="w-8 h-8 text-primary fill-current" />
              </div>
            </div>
          </div>
          {videoInfo.title && (
            <div className="p-4">
              <p className="font-medium">{videoInfo.title}</p>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // Embed mode: lazy load iframe
  if (!supportsInlineEmbed(videoInfo.provider)) {
    return (
      <div className="py-6 text-center text-muted-foreground">
        Este provedor não suporta incorporação inline
      </div>
    );
  }

  return (
    <div className="py-6" ref={containerRef}>
      <div className="aspect-video max-w-3xl mx-auto rounded-xl overflow-hidden bg-muted">
        {isVisible || isPlaying ? (
          <iframe
            src={videoInfo.embedUrl}
            title={videoInfo.title || "Vídeo"}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Carregando vídeo...</div>
          </div>
        )}
      </div>
    </div>
  );
};

function getEmbedUrl(provider: string, videoId: string, autoplay?: boolean): string {
  const autoplayParam = autoplay ? "1" : "0";
  
  switch (provider) {
    case "youtube":
      return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplayParam}&mute=${autoplayParam}`;
    case "tiktok":
      return `https://www.tiktok.com/embed/v2/${videoId}`;
    case "vimeo":
      return `https://player.vimeo.com/video/${videoId}?autoplay=${autoplayParam}&muted=${autoplayParam}`;
    default:
      return "";
  }
}
