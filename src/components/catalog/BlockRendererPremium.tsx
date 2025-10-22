import { CoverBlock } from "./blocks/CoverBlock";
import { TextBlock } from "./blocks/TextBlock";
import { ImageBlock } from "./blocks/ImageBlock";
import { ProductGridBlockV2Premium } from "./blocks/ProductGridBlockV2Premium";
import { CategoryGridBlockPremiumV2 } from "./blocks/CategoryGridBlockPremiumV2";
import { TagGridBlockPremiumV2 } from "./blocks/TagGridBlockPremiumV2";
import { ContactBlockPremium } from "./blocks/ContactBlockPremium";
import { SocialsBlockPremium } from "./blocks/SocialsBlockPremium";
import { AboutBlock } from "./blocks/AboutBlock";
import { AboutBusinessBlock } from "./blocks/AboutBusinessBlock";
import { DividerBlock } from "./blocks/DividerBlock";
import { VideoBlock } from "./blocks/VideoBlock";
import { TestimonialsBlockPremium } from "./blocks/TestimonialsBlockPremium";
import { FaqBlockPremium } from "./blocks/FaqBlockPremium";
import { InformacoesBlockPremium } from "./blocks/InformacoesBlockPremium";
import { LocationBlockPremium } from "./blocks/LocationBlockPremium";
import { CatalogosBlockPremium } from "./blocks/CatalogosBlockPremium";
import { ExternalLinksBlockPremium } from "./blocks/ExternalLinksBlockPremium";
import { ProfileHeaderBlock } from "./blocks/ProfileHeaderBlock";
import { HowToBuyBlock } from "../blocks/HowToBuyBlock";
import { DeliveryPickupBlock } from "../blocks/DeliveryPickupBlock";
import { ShippingBlock } from "../blocks/ShippingBlock";
import { PaymentsBlock } from "../blocks/PaymentsBlock";
import { PolicyBlock } from "../blocks/PolicyBlock";
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
  // For cover blocks: logo-title-image, image-top, and full-background are full-bleed
  // carousel-top is NOT full-bleed (has padding and rounded corners)
  const isFullBleed = (block.type === "cover" && (
                       block.data?.layout === "logo-title-image" || 
                       block.data?.layout === "image-top" || 
                       block.data?.layout === "full-background" ||
                       block.data?.layout === "full" // legacy
                     )) ||
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
            catalogSlug={catalogSlug}
          />
        );
    
      case "category_grid":
        return (
          <CategoryGridBlockPremiumV2 
            data={block.data} 
            userId={userId}
            userSlug={userSlug}
            catalogSlug={catalogSlug}
          />
        );
      
      case "tag_grid":
        return (
          <TagGridBlockPremiumV2 
            data={block.data} 
            userId={userId}
            userSlug={userSlug}
            catalogSlug={catalogSlug}
          />
        );
    
      case "location":
        return <LocationBlockPremium data={block.data} profile={profile} />;
    
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
        return <TestimonialsBlockPremium data={block.data} />;
    
      case "faq":
        return <FaqBlockPremium data={block.data} />;
    
      case "benefits":
      case "informacoes":
        return <InformacoesBlockPremium data={block.data} />;
      
      case "how_to_buy":
        return <HowToBuyBlock {...block.data} />;
      
      case "delivery_pickup":
        return <DeliveryPickupBlock {...block.data} />;
      
      case "shipping_info":
        return <ShippingBlock {...block.data} />;
      
      case "payments_info":
        return <PaymentsBlock {...block.data} />;
      
      case "policy_info":
        return <PolicyBlock {...block.data} />;
    
      case "catalogs":
        return <CatalogosBlockPremium data={block.data} profile={profile} />;
    
      case "external_links":
        return <ExternalLinksBlockPremium data={block.data} />;
    
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
