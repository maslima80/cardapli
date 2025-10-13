import { BlockBackground } from "./BlockWrapper";

// This function maps block types and their data to appropriate background types
export const getBlockBackground = (blockType: string, blockData: any): BlockBackground => {
  // Default background is surface
  let background: BlockBackground = "surface";
  
  switch (blockType) {
    // Media blocks
    case "image":
    case "video":
      background = "media";
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
        background = "media";
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
