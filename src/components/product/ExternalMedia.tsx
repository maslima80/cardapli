import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Play, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";

interface ExternalMediaItem {
  type?: "video" | "link";
  provider?: "youtube" | "vimeo";
  url: string;
  embedUrl?: string;
  thumbnail?: string;
  title?: string;
  videoId?: string;
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
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Embla carousel for videos
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    skipSnaps: false,
  });

  // Combine video_url and external_media into a single array
  const allMedia: ExternalMediaItem[] = [];

  if (videoUrl) {
    allMedia.push({
      type: "video",
      url: videoUrl,
      title: "Vídeo",
    });
  }

  if (externalMedia && externalMedia.length > 0) {
    allMedia.push(...externalMedia);
  }

  if (allMedia.length === 0) {
    return null;
  }

  const videoItems = allMedia.filter(item => 
    item.type === "video" || item.provider === "youtube" || item.provider === "vimeo"
  );
  const hasMultipleVideos = videoItems.length > 1;

  // Update selected index when embla scrolls
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const canScrollPrev = selectedIndex > 0;
  const canScrollNext = selectedIndex < videoItems.length - 1;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Vídeo
      </h3>

      {/* Video carousel / grid */}
      <div className="relative group">
        {/* Embla viewport for mobile, grid for desktop */}
        <div 
          className={`${hasMultipleVideos ? 'overflow-hidden md:overflow-visible' : ''}`}
          ref={hasMultipleVideos ? emblaRef : null}
        >
          <div className={`flex ${hasMultipleVideos ? 'md:grid md:grid-cols-2 touch-pan-y' : 'justify-center'} gap-2`}>
            {allMedia.map((item, index) => {
            // Handle both old format (type: "video") and new format (provider: "youtube")
            const isVideo = item.type === "video" || item.provider === "youtube" || item.provider === "vimeo";
            const embedUrl = item.embedUrl || (isVideo ? getVideoEmbedUrl(item.url) : null);
            const isActive = activeVideo === embedUrl;

            if (isVideo && embedUrl) {
              return (
                <div
                  key={index}
                  className={`relative aspect-video bg-black rounded-lg overflow-hidden transition-all ${hasMultipleVideos ? 'snap-start flex-shrink-0 w-[80%] md:w-auto' : 'w-full max-w-md'} ${
                    isActive ? "ring-2 ring-primary" : ""
                  }`}
                >
                  {isActive ? (
                    // Show iframe when active with autoplay
                    <iframe
                      src={`${embedUrl}?autoplay=1`}
                      title="Vídeo"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  ) : (
                    // Show thumbnail when not active
                    <button
                      onClick={() => setActiveVideo(embedUrl)}
                      className="relative w-full h-full group hover:ring-2 hover:ring-primary transition-all"
                    >
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt="Thumbnail do vídeo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                          <Play className="w-12 h-12 text-white/80" />
                        </div>
                      )}
                      
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                          <Play className="w-6 h-6 md:w-7 md:h-7 text-gray-900 ml-0.5" fill="currentColor" />
                        </div>
                      </div>
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

        {/* Navigation Arrows (desktop only, for multiple videos) */}
        {hasMultipleVideos && (
          <>
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-white/90 shadow-lg hover:bg-white disabled:opacity-0 transition-all z-10"
              aria-label="Vídeo anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-white/90 shadow-lg hover:bg-white disabled:opacity-0 transition-all z-10"
              aria-label="Próximo vídeo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
