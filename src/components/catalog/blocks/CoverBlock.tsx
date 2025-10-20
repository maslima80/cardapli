import { cn } from "@/lib/utils";

interface CoverBlockProps {
  data: {
    image_url?: string;
    images?: string[]; // For carousel layout
    title?: string;
    subtitle?: string;
    align?: "left" | "center";
    use_profile_logo?: boolean;
    logo_url?: string;
    layout?: "logo-title-image" | "image-top" | "carousel-top" | "full-background" | "card" | "full"; // New + legacy
  };
  preview?: boolean;
}

// Helper function to optimize image URL for ImageKit
const getOptimizedImageUrl = (url: string, isFullBleed: boolean): string => {
  if (!url) return "";
  
  if (url.includes('ik.imagekit.io')) {
    // Base transformations
    const baseParams = "q-80,dpr-auto,c-maintain_ratio";
    
    // Width based on layout
    const widthParam = isFullBleed ? "w-1600" : "w-1200";
    
    return `${url}?tr=${widthParam},${baseParams}`;
  }
  
  return url;
};

export const CoverBlock = ({ data, preview = false }: CoverBlockProps) => {
  const align = data.align || "center";
  const layout = data.layout || "card";
  
  // Legacy layouts
  const isFullBleed = layout === "full";

  // Logo + Title + Image Layout (Borcello style)
  if (layout === "logo-title-image") {
    return (
      <div className="w-full bg-white dark:bg-slate-950">
        <div className="p-6 sm:p-8 flex flex-col items-center text-center">
          {/* Logo - Premium presentation with glow effect */}
          {data.use_profile_logo && data.logo_url && (
            <div className="relative group mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img
                src={data.logo_url}
                alt="Logo"
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover shadow-xl ring-4 ring-white/10 dark:ring-slate-800/50"
              />
            </div>
          )}
          
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--theme-foreground)', fontFamily: 'var(--font-heading, inherit)' }}>
            {data.title || "Novo Catálogo"}
          </h1>
          
          {/* Subtitle */}
          {data.subtitle && (
            <p className="text-base sm:text-lg mb-4 max-w-2xl leading-relaxed" style={{ color: 'var(--theme-muted)', fontFamily: 'var(--font-body, inherit)' }}>
              {data.subtitle}
            </p>
          )}
        </div>
        
        {/* Main Image - Square, Full Bleed (edge to edge) */}
        {data.image_url && (
          <div className="aspect-square w-full">
            <img
              src={getOptimizedImageUrl(data.image_url, false)}
              alt={data.title || "Cover"}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    );
  }

  // Image Top Layout
  if (layout === "image-top") {
    return (
      <div className="w-full bg-white dark:bg-slate-950">
        {/* Image - Square, Full Bleed (edge to edge) */}
        {data.image_url && (
          <div className="aspect-square w-full">
            <img
              src={getOptimizedImageUrl(data.image_url, false)}
              alt={data.title || "Cover"}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Text Content */}
        <div className="p-6 sm:p-8 flex flex-col items-center text-center">
          {/* Logo - Premium presentation */}
          {data.use_profile_logo && data.logo_url && (
            <div className="relative group mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img
                src={data.logo_url}
                alt="Logo"
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover shadow-xl ring-4 ring-white/10 dark:ring-slate-800/50"
              />
            </div>
          )}
          
          <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--theme-foreground)', fontFamily: 'var(--font-heading, inherit)' }}>
            {data.title || "Novo Catálogo"}
          </h1>
          
          {data.subtitle && (
            <p className="text-base sm:text-lg max-w-2xl leading-relaxed" style={{ color: 'var(--theme-muted)', fontFamily: 'var(--font-body, inherit)' }}>
              {data.subtitle}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Carousel Top Layout (3 images) - Infinite swipeable carousel
  if (layout === "carousel-top") {
    const images = data.images || [];
    // Create infinite loop by repeating images multiple times
    const infiniteImages = images.length > 0 ? [...images, ...images, ...images, ...images] : [];
    
    return (
      <div className="w-full bg-white dark:bg-slate-950 overflow-hidden">
        {/* Image Carousel - Swipeable with center focus */}
        {images.length > 0 && (
          <div className="relative w-full">
            <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-[10%] py-6">
              {infiniteImages.map((img, index) => (
                <div 
                  key={index} 
                  className="flex-shrink-0 w-[80%] aspect-square snap-center"
                >
                  <img
                    src={getOptimizedImageUrl(img, false)}
                    alt={`Image ${(index % images.length) + 1}`}
                    className="w-full h-full object-cover rounded-3xl shadow-2xl"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Text Content */}
        <div className="p-8 sm:p-12 flex flex-col items-center text-center">
          {/* Logo - Premium presentation */}
          {data.use_profile_logo && data.logo_url && (
            <div className="relative group mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img
                src={data.logo_url}
                alt="Logo"
                className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover shadow-xl ring-4 ring-white/10 dark:ring-slate-800/50"
              />
            </div>
          )}
          
          <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: 'var(--theme-foreground)', fontFamily: 'var(--font-heading, inherit)' }}>
            {data.title || "Novo Catálogo"}
          </h1>
          
          {data.subtitle && (
            <p className="text-lg max-w-2xl leading-relaxed" style={{ color: 'var(--theme-muted)', fontFamily: 'var(--font-body, inherit)' }}>
              {data.subtitle}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Full Background Layout
  if (layout === "full-background") {
    return (
      <div className="relative w-full aspect-[3/4] sm:aspect-square overflow-hidden">
        {/* Background Image - Full Bleed */}
        {data.image_url && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${getOptimizedImageUrl(data.image_url, false)})` }}
          />
        )}
        
        {/* Gradient Overlay - Stronger at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Content - Positioned at bottom, centered */}
        <div className="relative h-full flex flex-col justify-end items-center text-center p-8 sm:p-12">
          {/* Logo - Premium presentation on dark background */}
          {data.use_profile_logo && data.logo_url && (
            <div className="relative group mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img
                src={data.logo_url}
                alt="Logo"
                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-2xl ring-4 ring-white/20"
              />
            </div>
          )}
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg" style={{ fontFamily: 'var(--font-heading, inherit)' }}>
            {data.title || "Novo Catálogo"}
          </h1>
          
          {data.subtitle && (
            <p className="text-base sm:text-lg text-white/90 max-w-2xl drop-shadow-md leading-relaxed" style={{ fontFamily: 'var(--font-body, inherit)' }}>
              {data.subtitle}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Legacy layouts (card/full) - keep existing behavior
  return (
    <div className={cn(
      "relative w-full h-[60vh] min-h-[400px] overflow-hidden",
      !isFullBleed && "rounded-2xl",
      isFullBleed && "mx-[-1.5rem] sm:mx-[-1.5rem] w-[calc(100%+3rem)]"
    )}>
      {/* Background Image */}
      {data.image_url && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${getOptimizedImageUrl(data.image_url, isFullBleed)})` }}
        />
      )}
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* Content */}
      <div className={cn(
        "relative h-full flex flex-col justify-end p-8 sm:p-12",
        align === "center" && "items-center text-center"
      )}>
        {data.use_profile_logo && data.logo_url && (
          <img
            src={data.logo_url}
            alt="Logo"
            className="w-20 h-20 object-contain mb-4 rounded-xl bg-white/10 backdrop-blur-sm p-2"
          />
        )}
        
        <h1 id={data.title ? `title-${data.title.toLowerCase().replace(/\s+/g, '-')}` : undefined} className="text-4xl sm:text-5xl font-bold text-white mb-4 drop-shadow-lg">
          {data.title || "Novo Catálogo"}
        </h1>
        
        {data.subtitle && (
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl drop-shadow-md">
            {data.subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
