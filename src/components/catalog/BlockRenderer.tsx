import { CoverBlock } from "./blocks/CoverBlock";
import { TextBlock } from "./blocks/TextBlock";
import { ImageBlock } from "./blocks/ImageBlock";
import { ProductGridBlockV2 } from "./blocks/ProductGridBlockV2";
import { AboutBlock } from "./blocks/AboutBlock";
import { AboutBusinessBlock } from "./blocks/AboutBusinessBlock";
import { ContactBlock } from "./blocks/ContactBlock";
import { SocialsBlock } from "./blocks/SocialsBlock";
import { DividerBlock } from "./blocks/DividerBlock";
import { VideoBlock } from "./blocks/VideoBlock";
import { TestimonialsBlock } from "./blocks/TestimonialsBlock";
import { FaqBlock } from "./blocks/FaqBlock";
import { BenefitsBlock } from "./blocks/BenefitsBlock";
import { StepByStepBlock } from "./blocks/StepByStepBlock";
import { ImportantInfoBlock } from "./blocks/ImportantInfoBlock";
import { LocationBlock } from "./blocks/LocationBlock";
import { CategoryGridBlock } from "./blocks/CategoryGridBlock";
import { TagGridBlock } from "./blocks/TagGridBlock";
import { CatalogosBlock } from "./blocks/CatalogosBlock";
import { ProfileHeaderBlock } from "./blocks/ProfileHeaderBlock";
import { BlockWrapper } from "./BlockWrapper";
import { getBlockBackground } from "./BlockBackgroundMapper";

interface BlockRendererProps {
  block: any;
  profile?: any;
  userId?: string;
}

export const BlockRenderer = ({ block, profile, userId }: BlockRendererProps) => {
  const renderBlock = () => {
    switch (block.type) {
      case "cover":
        return <CoverBlock data={block.data} />;
    
    case "heading":
    case "text":
      return <TextBlock data={block.data} />;
    
    case "image":
      return <ImageBlock data={block.data} />;
    
    case "video":
      return <VideoBlock data={block.data} />;
    
    case "product_grid":
      return <ProductGridBlockV2 data={block.data} userId={userId} />;
    
    case "category_grid":
      return <CategoryGridBlock data={block.data} userId={userId} />;
      
    case "tag_grid":
      return <TagGridBlock data={block.data} userId={userId} />;
    
    case "location":
      return <LocationBlock data={block.data} profile={profile} />;
    
    case "about":
      return <AboutBlock data={block.data} profileAbout={profile?.about} />;
      
    case "about_business":
      return <AboutBusinessBlock data={block.data} profileAbout={profile?.about} />;
    
    case "contact":
      return <ContactBlock data={block.data} profile={profile} />;
    
    case "socials":
      return <SocialsBlock data={block.data} profile={profile} />;
    
    case "divider":
      return <DividerBlock />;
    
    case "testimonials":
      return <TestimonialsBlock data={block.data} />;
    
    case "faq":
      return <FaqBlock data={block.data} />;
    
    case "benefits":
      return <BenefitsBlock data={block.data} />;
      
    case "step_by_step":
      return <StepByStepBlock data={block.data} />;
    
    case "important_info":
      return <ImportantInfoBlock data={block.data} />;
    
    case "catalogs":
      return <CatalogosBlock data={block.data} profile={profile} />;
    
    case "profile_header":
      return <ProfileHeaderBlock data={block.data} profile={profile} />;
    
      default:
        return null;
    }
  };

  const content = renderBlock();
  if (!content) return null;

  // Determine if this is a full-bleed block (like image or video)
  // For cover blocks: logo-title-image, image-top, and full-background are full-bleed
  // carousel-top is NOT full-bleed (has padding and rounded corners)
  const isFullBleed = (block.type === "image" && block.data?.width === "full") || 
                     (block.type === "video" && block.data?.layout === "full") || 
                     (block.type === "cover" && (
                       block.data?.layout === "logo-title-image" || 
                       block.data?.layout === "image-top" || 
                       block.data?.layout === "full-background" ||
                       block.data?.layout === "full" // legacy
                     ));
                     
  // Get the appropriate background for this block
  const background = getBlockBackground(block.type, block.data);
  
  // Determine if this block has an anchor
  const hasAnchor = block.anchor_slug && block.data?.title;
  const title = block.data?.title || "";
  
  return (
    <BlockWrapper 
      id={hasAnchor ? block.anchor_slug : undefined}
      ariaLabelledby={hasAnchor && title ? `title-${block.anchor_slug}` : undefined}
      background={background}
      fullBleed={isFullBleed}
    >
      {content}
    </BlockWrapper>
  );
};
