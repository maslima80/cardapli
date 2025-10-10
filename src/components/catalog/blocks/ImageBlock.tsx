interface ImageBlockProps {
  data: {
    image_url?: string;
    caption?: string;
    width?: "auto" | "full" | "small";
    align?: "left" | "center" | "right";
    show_caption?: boolean;
    image_metadata?: {
      width?: number;
      height?: number;
      ratio?: number;
    };
  };
}

import { cn } from "@/lib/utils";

export const ImageBlock = ({ data }: ImageBlockProps) => {
  if (!data.image_url) return null;

  const showCaption = data.show_caption !== false && data.caption;
  
  // Optimize image URL if it's from ImageKit
  const imageUrl = data.image_url.includes('ik.imagekit.io') 
    ? `${data.image_url}?tr=w-1200,q-80,c-maintain_ratio` 
    : data.image_url;

  return (
    <div className="py-6">
      <div className="max-w-3xl mx-auto">
        <img
          src={imageUrl}
          alt={data.caption || ""}
          className="w-full h-auto rounded-xl shadow-sm"
          loading="lazy"
        />
        {showCaption && (
          <p className="text-sm text-muted-foreground text-center mt-3">
            {data.caption}
          </p>
        )}
      </div>
    </div>
  );
};
