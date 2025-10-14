import { cn } from "@/lib/utils";

interface CoverBlockProps {
  data: {
    image_url?: string;
    title?: string;
    subtitle?: string;
    align?: "left" | "center";
    use_profile_logo?: boolean;
    logo_url?: string;
    layout?: "card" | "full";
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
  
  // Determine if we should apply rounded corners based on layout
  const isFullBleed = layout === "full";

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
