import { cn } from "@/lib/utils";

interface TextBlockProps {
  data: {
    title?: string;
    body?: string;
    align?: "left" | "center";
  };
}

export const TextBlock = ({ data }: TextBlockProps) => {
  const align = data.align || "left";

  return (
    <div className={cn(
      "py-8 px-6 sm:px-8",
      align === "center" && "text-center"
    )}>
      {data.title && (
        <h2 
          id={`title-${data.title.toLowerCase().replace(/\s+/g, '-')}`} 
          className="text-2xl sm:text-3xl font-bold mb-4 text-foreground"
        >
          {data.title}
        </h2>
      )}
      {data.body && (
        <div className="prose prose-lg max-w-none text-muted-foreground whitespace-pre-wrap prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80">
          {data.body}
        </div>
      )}
    </div>
  );
};
