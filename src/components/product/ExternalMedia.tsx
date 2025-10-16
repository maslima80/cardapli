import { useState } from "react";
import { Play, ExternalLink } from "lucide-react";

interface ExternalMediaItem {
  type: "video" | "link";
  url: string;
  thumbnail?: string;
  title?: string;
}

interface ExternalMediaProps {
  videoUrl?: string | null;
  externalMedia?: ExternalMediaItem[];
}

const getYouTubeEmbedUrl = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
    /youtube\.com\/embed\/([^&\s]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }
  return null;
};

const getVimeoEmbedUrl = (url: string): string | null => {
  const match = url.match(/vimeo\.com\/(\d+)/);
  if (match) {
    return `https://player.vimeo.com/video/${match[1]}`;
  }
  return null;
};

const getVideoEmbedUrl = (url: string): string | null => {
  return getYouTubeEmbedUrl(url) || getVimeoEmbedUrl(url);
};

export const ExternalMedia = ({ videoUrl, externalMedia = [] }: ExternalMediaProps) => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  // Combine video_url and external_media into a single array
  const allMedia: ExternalMediaItem[] = [];

  if (videoUrl) {
    allMedia.push({
      type: "video",
      url: videoUrl,
      title: "Vídeo do produto",
    });
  }

  if (externalMedia && externalMedia.length > 0) {
    allMedia.push(...externalMedia);
  }

  if (allMedia.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Mídia
      </h3>

      <div className="space-y-3">
        {allMedia.map((item, index) => {
          const embedUrl = item.type === "video" ? getVideoEmbedUrl(item.url) : null;
          const isActive = activeVideo === item.url;

          if (item.type === "video" && embedUrl) {
            return (
              <div key={index} className="space-y-2">
                {isActive ? (
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <iframe
                      src={embedUrl}
                      title={item.title || `Vídeo ${index + 1}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveVideo(item.url)}
                    className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden group hover:ring-2 hover:ring-primary transition-all"
                  >
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title || "Thumbnail do vídeo"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                        <Play className="w-16 h-16 text-white/80" />
                      </div>
                    )}
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" />
                      </div>
                    </div>

                    {item.title && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                        <p className="text-white text-sm font-medium">{item.title}</p>
                      </div>
                    )}
                  </button>
                )}
              </div>
            );
          }

          if (item.type === "link") {
            return (
              <a
                key={index}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 border border-border rounded-lg hover:border-primary hover:bg-accent/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <ExternalLink className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                      {item.title || "Link externo"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.url}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
              </a>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};
