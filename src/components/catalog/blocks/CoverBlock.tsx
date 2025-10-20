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
      <div className="w-full bg-white dark:bg-slate-950 rounded-2xl overflow-hidden">
        <div className="p-8 sm:p-12 flex flex-col items-center text-center">
          {/* Logo */}
          {data.use_profile_logo && data.logo_url && (
            <img
              src={data.logo_url}
              alt="Logo"
              className="w-24 h-24 object-contain mb-6"
            />
          )}
          
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--theme-foreground)' }}>
            {data.title || "Novo Catálogo"}
          </h1>
          
          {/* Subtitle */}
          {data.subtitle && (
            <p className="text-lg mb-6" style={{ color: 'var(--theme-muted)' }}>
              {data.subtitle}
            </p>
          )}
        </div>
        
        {/* Main Image */}
        {data.image_url && (
          <div className="aspect-[4/3] w-full">
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
      <div className="w-full bg-white dark:bg-slate-950 rounded-2xl overflow-hidden">
        {/* Image */}
        {data.image_url && (
          <div className="aspect-[16/9] w-full">
            <img
              src={getOptimizedImageUrl(data.image_url, false)}
              alt={data.title || "Cover"}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Text Content */}
        <div className="p-8 sm:p-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: 'var(--theme-foreground)' }}>
            {data.title || "Novo Catálogo"}
          </h1>
          
          {data.subtitle && (
            <p className="text-lg" style={{ color: 'var(--theme-muted)' }}>
              {data.subtitle}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Carousel Top Layout (3 images)
  if (layout === "carousel-top") {
    const images = data.images || [];
    return (
      <div className="w-full bg-white dark:bg-slate-950 rounded-2xl overflow-hidden">
        {/* Image Carousel */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 p-4">
            {images.slice(0, 3).map((img, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden">
                <img
                  src={getOptimizedImageUrl(img, false)}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
        
        {/* Text Content */}
        <div className="p-8 sm:p-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: 'var(--theme-foreground)' }}>
            {data.title || "Novo Catálogo"}
          </h1>
          
          {data.subtitle && (
            <p className="text-lg" style={{ color: 'var(--theme-muted)' }}>
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
      <div className="relative w-full h-[60vh] min-h-[400px] rounded-2xl overflow-hidden">
        {/* Background Image */}
        {data.image_url && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${getOptimizedImageUrl(data.image_url, false)})` }}
          />
        )}
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Content */}
        <div className="relative h-full flex flex-col justify-center items-center text-center p-8 sm:p-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 drop-shadow-lg">
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
