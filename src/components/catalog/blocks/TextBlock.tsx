import { cn } from "@/lib/utils";

interface TextBlockProps {
  data: {
    title?: string;
    body?: string;
    align?: "left" | "center";
    show_frame?: boolean; // Optional frame/card styling
  };
}

export const TextBlock = ({ data }: TextBlockProps) => {
  const align = data.align || "left";
  const showFrame = data.show_frame || false;

  const content = (
    <>
      {data.title && (
        <h2 
          id={`title-${data.title.toLowerCase().replace(/\s+/g, '-')}`} 
          className="text-2xl sm:text-3xl font-bold mb-4 text-slate-900 dark:text-slate-50"
          style={{ fontFamily: 'var(--font-heading, inherit)' }}
        >
          {data.title}
        </h2>
      )}
      {data.body && (
        <div 
          className="prose prose-lg max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed"
          style={{ fontFamily: 'var(--font-body, inherit)' }}
        >
          {data.body}
        </div>
      )}
    </>
  );

  if (showFrame) {
    return (
      <div className={cn(
        "rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8",
        align === "center" && "text-center"
      )}>
        {content}
      </div>
    );
  }

  return (
    <div className={cn(
      "py-8 px-6 sm:px-8",
      align === "center" && "text-center"
    )}>
      {content}
    </div>
  );
};
