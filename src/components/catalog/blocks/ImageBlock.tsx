import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ZoomIn } from "lucide-react";

type ImageWidth = "auto" | "full" | "contained" | "inline";
type ImageCorners = "auto" | "none" | "soft" | "medium";
type ImageAlignment = "left" | "center" | "right";

interface ImageBlockProps {
  data: {
    image_url?: string;
    caption?: string;
    width?: ImageWidth;
    corners?: ImageCorners;
    align?: ImageAlignment;
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'landscape' | 'portrait' | 'square' | null>(null);
  
  if (!data.image_url) return null;

  const showCaption = data.show_caption !== false && data.caption;
  const width = data.width || "auto";
  const align = data.align || "center";
  const corners = data.corners || "auto";
  
  // Determine if we have image metadata to calculate aspect ratio
  useEffect(() => {
    if (data.image_metadata?.width && data.image_metadata?.height) {
      const ratio = data.image_metadata.width / data.image_metadata.height;
      if (ratio > 1.1) setAspectRatio('landscape');
      else if (ratio < 0.9) setAspectRatio('portrait');
      else setAspectRatio('square');
    }
  }, [data.image_metadata]);
  
  // Determine if image is very tall and should have a max height
  const isVeryTall = aspectRatio === 'portrait' && data.image_metadata?.ratio && data.image_metadata.ratio < 0.5;
  
  // Determine if we should apply rounded corners based on width and corners settings
  const shouldRound = () => {
    if (corners === "none") return false;
    if (corners === "soft" || corners === "medium") return true;
    if (corners === "auto") {
      // Auto applies rounded corners to all except full-bleed
      return width !== "full";
    }
    return true;
  };
  
  // Get corner radius class based on settings
  const getCornerClass = () => {
    if (!shouldRound()) return "";
    if (corners === "medium" || (corners === "auto" && width !== "full")) return "rounded-xl";
    if (corners === "soft") return "rounded-md";
    return "";
  };
  
  // Get container width class based on width setting and aspect ratio
  const getContainerClass = () => {
    switch (width) {
      case "full":
        return "w-full";
      case "contained":
        return "max-w-[1120px] mx-auto";
      case "inline":
        return "max-w-[70%] mx-auto";
      case "auto":
      default:
        // Auto width logic based on aspect ratio
        if (aspectRatio === 'portrait') return "max-w-[80%] mx-auto";
        if (aspectRatio === 'square') return "max-w-[1120px] mx-auto";
        return "max-w-[1120px] mx-auto";
    }
  };
  
  // Get alignment class for inline images
  const getAlignmentClass = () => {
    if (width !== "inline") return "mx-auto";
    
    switch (align) {
      case "left": return "ml-0 mr-auto";
      case "right": return "mr-0 ml-auto";
      case "center":
      default: return "mx-auto";
    }
  };
  
  // Get caption alignment class
  const getCaptionAlignmentClass = () => {
    if (width !== "inline") return "text-center";
    
    switch (align) {
      case "left": return "text-left";
      case "right": return "text-right";
      case "center":
      default: return "text-center";
    }
  };
  
  // Get shadow class
  const getShadowClass = () => {
    if (width === "full") return "";
    return "shadow-sm hover:shadow-md transition-shadow duration-300";
  };
  
  // Get border class
  const getBorderClass = () => {
    if (width === "contained" || (width === "auto" && (aspectRatio === 'landscape' || aspectRatio === 'square'))) {
      return "border border-border/30";
    }
    return "";
  };
  
  // Determine if image should be clickable for lightbox
  const isLightboxEnabled = isVeryTall || width === "inline" || width === "auto";
  
  // Optimize image URL if it's from ImageKit
  const getImageUrl = (forLightbox = false) => {
    if (!data.image_url) return "";
    
    if (data.image_url.includes('ik.imagekit.io')) {
      // Base transformations
      const baseParams = "q-80,dpr-auto,c-maintain_ratio";
      
      // Width based on usage
      let widthParam = "";
      
      if (forLightbox) {
        // Lightbox uses larger size
        widthParam = "w-1600";
      } else {
        // Responsive widths based on display mode
        if (width === "full") {
          // Full-bleed uses screen width
          widthParam = "w-1400";
        } else if (width === "inline") {
          // Inline is smaller
          widthParam = "w-800";
        } else {
          // Contained/auto uses container width
          widthParam = "w-1100";
        }
      }
      
      return `${data.image_url}?tr=${widthParam},${baseParams}`;
    }
    
    return data.image_url;
  };
  
  // Handle image click for lightbox
  const handleImageClick = () => {
    if (isLightboxEnabled) {
      setLightboxOpen(true);
    }
  };

  return (
    <>
      <div className={cn(
        width === "full" ? "" : "py-6",
        width === "full" && "relative"
      )}>
        <div className={cn(
          getContainerClass(),
          getAlignmentClass(),
          "relative"
        )}>
          <div className={cn(
            "relative overflow-hidden",
            isLightboxEnabled && "cursor-zoom-in",
            getCornerClass()
          )}>
            {isLightboxEnabled && (
              <div className="absolute inset-0 opacity-0 hover:opacity-100 bg-black/10 flex items-center justify-center transition-opacity duration-300">
                <ZoomIn className="text-white w-8 h-8" />
              </div>
            )}
            
            <img
              src={getImageUrl()}
              alt={data.caption || ""}
              className={cn(
                "w-full h-auto",
                getShadowClass(),
                getBorderClass(),
                isVeryTall && "max-h-[80vh] object-contain",
                !imageLoaded && "opacity-0",
                imageLoaded && "opacity-100 transition-opacity duration-500"
              )}
              loading="lazy"
              onClick={handleImageClick}
              onLoad={() => setImageLoaded(true)}
            />
          </div>
          
          {showCaption && (
            <p className={cn(
              "text-sm text-muted-foreground mt-3",
              getCaptionAlignmentClass()
            )}>
              {data.caption}
            </p>
          )}
        </div>
      </div>
      
      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-transparent border-none shadow-none">
          <img 
            src={getImageUrl(true)} 
            alt={data.caption || ""} 
            className="w-auto h-auto max-w-[90vw] max-h-[90vh] object-contain"
          />
          {showCaption && (
            <p className="text-sm text-white/80 text-center mt-2">
              {data.caption}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
