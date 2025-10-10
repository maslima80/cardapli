import { cn } from "@/lib/utils";

interface AboutBusinessBlockProps {
  data: {
    use_profile?: boolean;
    title?: string;
    content?: string;
  };
  profileAbout?: string;
}

export const AboutBusinessBlock = ({ data, profileAbout }: AboutBusinessBlockProps) => {
  // Use profile content if use_profile is true and profileAbout exists
  const useProfileContent = data.use_profile === true && !!profileAbout;
  
  // If using profile content, display that, otherwise use custom content
  const content = useProfileContent ? profileAbout : data.content;
  
  // Use custom title if provided, otherwise default to "Sobre nós"
  const title = !useProfileContent && data.title ? data.title : "Sobre nós";
  
  // Don't render the block if there's no content to display
  if (!content) {
    return null;
  }

  return (
    <div className="py-8 px-6 sm:px-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-foreground">{title}</h2>
      <div className="prose prose-lg max-w-none text-muted-foreground whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
};
