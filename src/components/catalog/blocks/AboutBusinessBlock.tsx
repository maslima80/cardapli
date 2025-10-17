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
  
  // Always allow custom title, fallback to "Sobre o Negócio"
  const title = data.title || "Sobre o Negócio";
  
  // Don't render the block if there's no content to display
  if (!content) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
      <h2 
        className="text-2xl sm:text-3xl font-bold mb-4 text-slate-900 dark:text-slate-50"
        style={{ fontFamily: 'var(--font-heading, inherit)' }}
      >
        {title}
      </h2>
      <div 
        className="prose prose-lg max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed"
        style={{ fontFamily: 'var(--font-body, inherit)' }}
      >
        {content}
      </div>
    </div>
  );
};
