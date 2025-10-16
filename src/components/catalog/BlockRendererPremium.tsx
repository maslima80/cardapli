import { CoverBlock } from "./blocks/CoverBlock";
import { TextBlock } from "./blocks/TextBlock";
import { ImageBlock } from "./blocks/ImageBlock";
import { ProductGridBlockV2Premium } from "./blocks/ProductGridBlockV2Premium";
import { CategoryGridBlockPremium } from "./blocks/CategoryGridBlockPremium";
import { TagGridBlockPremium } from "./blocks/TagGridBlockPremium";
import { ContactBlockPremium } from "./blocks/ContactBlockPremium";
import { SocialsBlockPremium } from "./blocks/SocialsBlockPremium";
import { AboutBlock } from "./blocks/AboutBlock";
import { AboutBusinessBlock } from "./blocks/AboutBusinessBlock";
import { DividerBlock } from "./blocks/DividerBlock";
import { VideoBlock } from "./blocks/VideoBlock";
import { TestimonialsBlock } from "./blocks/TestimonialsBlock";
import { FaqBlock } from "./blocks/FaqBlock";
import { BenefitsBlock } from "./blocks/BenefitsBlock";
import { StepByStepBlock } from "./blocks/StepByStepBlock";
import { ImportantInfoBlock } from "./blocks/ImportantInfoBlock";
import { LocationBlock } from "./blocks/LocationBlock";
import { CatalogosBlock } from "./blocks/CatalogosBlock";
import { ProfileHeaderBlock } from "./blocks/ProfileHeaderBlock";
import { Section } from "./Section";

interface BlockRendererProps {
  block: any;
  profile?: any;
  userId?: string;
  userSlug?: string;
  catalogSlug?: string;
  catalogTitle?: string;
  index?: number;
}

export const BlockRendererPremium = ({ 
  block, 
  profile, 
  userId, 
  userSlug,
  catalogSlug,
  catalogTitle,
  index = 0 
}: BlockRendererProps) => {
  // Determine if this block should have alternating background
  // Disabled for better dark mode support
  const useAltBackground = false;
  
  // Determine if this is a full-bleed block (no container padding)
  const isFullBleed = (block.type === "cover" && block.data?.layout === "full") ||
                     (block.type === "image" && block.data?.width === "full") ||
                     (block.type === "video" && block.data?.layout === "full");

  // Determine if this block needs no padding
  const noPadding = block.type === "cover" || block.type === "divider";

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
        return (
          <ProductGridBlockV2Premium 
            data={block.data} 
            userId={userId}
            userSlug={userSlug}
          />
        );
    
      case "category_grid":
        return (
          <CategoryGridBlockPremium 
            data={block.data} 
            userId={userId}
            userSlug={userSlug}
            catalogSlug={catalogSlug}
          />
        );
      
      case "tag_grid":
        return (
          <TagGridBlockPremium 
            data={block.data} 
            userId={userId}
            userSlug={userSlug}
            catalogSlug={catalogSlug}
          />
        );
    
      case "location":
        return <LocationBlock data={block.data} profile={profile} />;
    
      case "about":
        return <AboutBlock data={block.data} profileAbout={profile?.about} />;
      
      case "about_business":
        return <AboutBusinessBlock data={block.data} profileAbout={profile?.about} />;
    
      case "contact":
        return (
          <ContactBlockPremium 
            data={block.data} 
            profile={profile}
            catalogTitle={catalogTitle}
          />
        );
    
      case "socials":
        return <SocialsBlockPremium data={block.data} profile={profile} />;
    
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

  // Determine if this block has an anchor
  const hasAnchor = block.anchor_slug && block.data?.title;
  
  return (
    <Section
      id={hasAnchor ? block.anchor_slug : undefined}
      altBackground={useAltBackground && !isFullBleed}
      noPadding={noPadding}
      fullWidth={isFullBleed}
    >
      {content}
    </Section>
  );
};
