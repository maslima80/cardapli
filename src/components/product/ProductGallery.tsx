import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Photo {
  url: string;
  alt?: string;
}

interface ProductGalleryProps {
  photos: Photo[];
  productTitle: string;
}

export const ProductGallery = ({ photos, productTitle }: ProductGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageEntering, setImageEntering] = useState(false);
  
  // Embla carousel for main gallery
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'center',
    skipSnaps: false,
  });

  // Embla carousel for lightbox
  const [emblaLightboxRef, emblaLightboxApi] = useEmblaCarousel({
    loop: false,
    align: 'center',
  });

  // Embla carousel for thumbnails
  const [emblaThumbnailRef, emblaThumbnailApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    containScroll: 'keepSnaps',
    dragFree: true,
  });

  // Update selected index when embla scrolls
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const newIndex = emblaApi.selectedScrollSnap();
    if (newIndex !== selectedIndex) {
      // Trigger enter animation
      setImageEntering(true);
      setTimeout(() => setImageEntering(false), 200);
    }
    setSelectedIndex(newIndex);
  }, [emblaApi, selectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Sync lightbox carousel with main carousel
  useEffect(() => {
    if (!emblaLightboxApi || !lightboxOpen) return;
    emblaLightboxApi.scrollTo(selectedIndex);
  }, [emblaLightboxApi, lightboxOpen, selectedIndex]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollLightboxPrev = useCallback(() => {
    if (emblaLightboxApi) emblaLightboxApi.scrollPrev();
  }, [emblaLightboxApi]);

  const scrollLightboxNext = useCallback(() => {
    if (emblaLightboxApi) emblaLightboxApi.scrollNext();
  }, [emblaLightboxApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
    if (emblaThumbnailApi) emblaThumbnailApi.scrollTo(index);
  }, [emblaApi, emblaThumbnailApi]);

  if (!photos || photos.length === 0) {
    return (
      <div className="aspect-[4/3] bg-muted rounded-2xl flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-2 opacity-20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <p className="text-sm">Sem imagens</p>
        </div>
      </div>
    );
  }

  const currentPhoto = photos[selectedIndex];
  const canScrollPrev = selectedIndex > 0;
  const canScrollNext = selectedIndex < photos.length - 1;

  return (
    <>
      <div className="w-full space-y-3">
        {/* Main Gallery with Embla */}
        <div className="relative group w-full">
          <div className="overflow-hidden rounded-2xl min-w-0" ref={emblaRef}>
            <div className="flex touch-pan-y min-w-0">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  className="flex-[0_0_100%] min-w-0 relative"
                  style={{ aspectRatio: '4/3' }}
                >
                  {/* Blur depth layer - uses contain to match foreground */}
                  <div
                    className="absolute inset-0 blur-3xl scale-125 opacity-20"
                    style={{
                      backgroundImage: `url(${photo.url})`,
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                    }}
                    aria-hidden="true"
                  />
                  
                  {/* Foreground container */}
                  <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6">
                    <img
                      key={`${photo.url}-${index}`}
                      src={photo.url}
                      alt={photo.alt || `${productTitle} - Imagem ${index + 1}`}
                      className={`relative z-10 max-w-full max-h-full w-auto h-auto object-contain cursor-zoom-in transition-all duration-200 ease-out ${
                        index === selectedIndex && imageEntering
                          ? 'opacity-0 scale-[0.985]'
                          : 'opacity-100 scale-100 hover:scale-[1.02]'
                      }`}
                      onClick={() => setLightboxOpen(true)}
                      loading={index === 0 ? "eager" : "lazy"}
                      draggable={false}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          {photos.length > 1 && (
            <>
              <button
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 disabled:cursor-not-allowed z-10"
                aria-label="Imagem anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={scrollNext}
                disabled={!canScrollNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 disabled:cursor-not-allowed z-10"
                aria-label="Próxima imagem"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Zoom Hint */}
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <ZoomIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-medium">Clique para ampliar</span>
          </div>

          {/* Image Counter */}
          {photos.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
              {selectedIndex + 1} / {photos.length}
            </div>
          )}
        </div>

        {/* Thumbnails with Embla carousel */}
        {photos.length > 1 && (
          <div
            className="relative overflow-hidden w-full min-w-0"
            style={{
              WebkitMaskImage:
                'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
              maskImage:
                'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
            }}
            ref={emblaThumbnailRef}
          >
            <div className="flex gap-2 touch-pan-y">
              {photos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden snap-start transition-all ${
                    index === selectedIndex
                      ? "ring-3 ring-primary shadow-lg scale-105"
                      : "opacity-60 hover:opacity-100 hover:scale-105"
                  }`}
                >
                  <img
                    src={photo.url}
                    alt={`Miniatura ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    draggable={false}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Premium Lightbox with Embla */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[100vw] max-h-[100vh] w-full h-full p-0 bg-black/95 border-0">
          <div className="relative w-full h-full">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Embla Carousel for Lightbox */}
            <div className="overflow-hidden h-full" ref={emblaLightboxRef}>
              <div className="flex h-full touch-pan-y">
                {photos.map((photo, index) => (
                  <div
                    key={index}
                    className="flex-[0_0_100%] min-w-0 h-full flex items-center justify-center p-4 sm:p-8"
                  >
                    <img
                      src={photo.url}
                      alt={photo.alt || `${productTitle} - Imagem ${index + 1}`}
                      className="max-w-full max-h-full w-auto h-auto object-contain select-none"
                      draggable={false}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation in Lightbox */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={scrollLightboxPrev}
                  disabled={!canScrollPrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full disabled:opacity-20 disabled:cursor-not-allowed z-50 transition-all"
                  aria-label="Imagem anterior"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={scrollLightboxNext}
                  disabled={!canScrollNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full disabled:opacity-20 disabled:cursor-not-allowed z-50 transition-all"
                  aria-label="Próxima imagem"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Image Counter in Lightbox */}
            {photos.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold z-50 shadow-lg">
                {selectedIndex + 1} / {photos.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
