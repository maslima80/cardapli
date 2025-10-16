import { useState } from "react";
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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  if (!photos || photos.length === 0) {
    return (
      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
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

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && selectedIndex < photos.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
    if (isRightSwipe && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handlePrevious = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex < photos.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  return (
    <>
      <div className="space-y-3">
        {/* Main Image */}
        <div className="relative aspect-square bg-muted rounded-lg overflow-hidden group">
          <img
            src={currentPhoto.url}
            alt={currentPhoto.alt || `${productTitle} - Imagem ${selectedIndex + 1}`}
            className="w-full h-full object-contain cursor-zoom-in"
            onClick={() => setLightboxOpen(true)}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            loading={selectedIndex === 0 ? "eager" : "lazy"}
          />

          {/* Navigation Arrows (Desktop) */}
          {photos.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                disabled={selectedIndex === 0}
                className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                aria-label="Imagem anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                disabled={selectedIndex === photos.length - 1}
                className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                aria-label="Próxima imagem"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Zoom Icon Hint */}
          <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="w-3 h-3" />
            <span className="hidden sm:inline">Clique para ampliar</span>
          </div>

          {/* Image Counter */}
          {photos.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-medium">
              {selectedIndex + 1} / {photos.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1">
            {photos.map((photo, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden snap-start transition-all ${
                  index === selectedIndex
                    ? "ring-2 ring-primary ring-offset-2 scale-105"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={photo.url}
                  alt={`Miniatura ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-0">
          <div className="relative w-full h-[95vh] flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Navigation in Lightbox */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  disabled={selectedIndex === 0}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white/30 text-white rounded-full disabled:opacity-30 disabled:cursor-not-allowed z-50"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={selectedIndex === photos.length - 1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white/30 text-white rounded-full disabled:opacity-30 disabled:cursor-not-allowed z-50"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Image Counter in Lightbox */}
            {photos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 text-white px-3 py-1.5 rounded-full text-sm font-medium z-50">
                {selectedIndex + 1} / {photos.length}
              </div>
            )}

            {/* Main Image in Lightbox */}
            <img
              src={currentPhoto.url}
              alt={currentPhoto.alt || `${productTitle} - Imagem ${selectedIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
