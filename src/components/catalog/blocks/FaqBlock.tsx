import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FaqBlockProps {
  data: {
    title?: string;
    items?: Array<{
      question: string;
      answer: string;
    }>;
    background?: "default" | "accent";
  };
}

export const FaqBlock = ({ data }: FaqBlockProps) => {
  const items = data.items || [];
  const title = data.title || "Perguntas Frequentes";

  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Nenhuma pergunta adicionada ainda
      </div>
    );
  }

  return (
    <div
      className={`py-12 ${
        data.background === "accent" ? "bg-primary/5" : ""
      }`}
    >
      <div className="container max-w-3xl mx-auto px-4">
        <h2 id={`title-${title.toLowerCase().replace(/\s+/g, '-')}`} className="text-3xl font-bold text-center mb-8">{title}</h2>
        <Accordion type="single" collapsible className="space-y-3">
          {items.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border rounded-xl px-6 bg-background"
            >
              <AccordionTrigger className="hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};
