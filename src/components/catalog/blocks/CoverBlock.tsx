import { cn } from "@/lib/utils";

interface CoverBlockProps {
  data: {
    image_url?: string;
    title?: string;
    subtitle?: string;
    align?: "left" | "center";
    use_profile_logo?: boolean;
    logo_url?: string;
  };
  preview?: boolean;
}

export const CoverBlock = ({ data, preview = false }: CoverBlockProps) => {
  const align = data.align || "center";

  return (
    <div className="relative w-full h-[60vh] min-h-[400px] overflow-hidden rounded-2xl">
      {/* Background Image */}
      {data.image_url && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${data.image_url})` }}
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
