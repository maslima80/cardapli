import { BlockBackground } from "./BlockWrapper";

// This function maps block types and their data to appropriate background types
export const getBlockBackground = (blockType: string, blockData: any): BlockBackground => {
  // Default background is surface
  let background: BlockBackground = "surface";
  
  switch (blockType) {
    // Media blocks
    case "video":
      background = "media";
      break;
      
    // Image blocks - background depends on width setting
    case "image":
      if (blockData?.width === "full") {
        background = "media";
      } else {
        background = "surface";
      }
      break;
      
    // Blocks that can have configurable backgrounds
    case "benefits":
    case "step_by_step":
    case "important_info":
    case "testimonials":
      if (blockData?.background === "accent" || blockData?.background === "tint") {
        background = "tint";
      } else if (blockData?.background === "cards_elevated") {
        background = "elevated";
      }
      break;
      
    // Blocks that are typically elevated
    case "faq":
    case "contact":
      background = "elevated";
      break;
      
    // Cover blocks can be media or surface
    case "cover":
      if (blockData?.image_url) {
        // If it's full layout, treat as media block
        if (blockData?.layout === "full") {
          background = "media";
        } else {
          // For card layout with image, still treat as media but with different styling
          background = "media";
        }
      }
      break;
      
    // Default surface blocks
    case "text":
    case "heading":
    case "about":
    case "about_business":
    case "socials":
    case "product_grid":
    default:
      background = "surface";
      break;
  }
  
  return background;
};
