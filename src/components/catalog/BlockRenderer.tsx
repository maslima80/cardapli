import { CoverBlock } from "./blocks/CoverBlock";
import { TextBlock } from "./blocks/TextBlock";
import { ImageBlock } from "./blocks/ImageBlock";
import { ProductGridBlock } from "./blocks/ProductGridBlock";
import { AboutBlock } from "./blocks/AboutBlock";
import { AboutBusinessBlock } from "./blocks/AboutBusinessBlock";
import { ContactBlock } from "./blocks/ContactBlock";
import { SocialsBlock } from "./blocks/SocialsBlock";
import { DividerBlock } from "./blocks/DividerBlock";
import { VideoBlock } from "./blocks/VideoBlock";
import { TestimonialsBlock } from "./blocks/TestimonialsBlock";
import { FaqBlock } from "./blocks/FaqBlock";
import { BenefitsBlock } from "./blocks/BenefitsBlock";

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
      return <ProductGridBlock data={block.data} userId={userId} />;
    
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
    
    case "important_info":
      return (
        <div className="py-8 px-6 text-center text-muted-foreground">
          Bloco "Info Importante" em construção
        </div>
      );
    
      default:
        return null;
    }
  };

  const content = renderBlock();
  if (!content) return null;

  // For blocks with titles, wrap in a section with anchor
  const blocksWithAnchors = ["cover", "text", "heading", "testimonials", "faq", "benefits", "product_grid", "about_business"];
  if (blocksWithAnchors.includes(block.type) && block.anchor_slug) {
    const title = block.data?.title || "";
    return (
      <section id={block.anchor_slug} aria-labelledby={title ? `title-${block.anchor_slug}` : undefined}>
        {content}
      </section>
    );
  }

  return content;
};
