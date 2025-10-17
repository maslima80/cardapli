import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

interface FaqBlockProps {
  data: {
    title?: string;
    items?: Array<{
      question: string;
      answer: string;
    }>;
  };
}

export const FaqBlockPremium = ({ data }: FaqBlockProps) => {
  const items = data.items || [];
  const title = data.title || "Perguntas Frequentes";

  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-slate-600 dark:text-slate-400">
        <HelpCircle className="h-12 w-12 mx-auto mb-4 text-slate-400 dark:text-slate-600" />
        <p>Nenhuma pergunta adicionada ainda</p>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container max-w-3xl mx-auto px-4">
        <h2 
          className="text-3xl font-bold text-center mb-8 text-slate-900 dark:text-slate-50"
          style={{ fontFamily: 'var(--font-heading, inherit)' }}
        >
          {title}
        </h2>
        
        <Accordion type="single" collapsible className="space-y-3">
          {items.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-0 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
            >
              <AccordionTrigger 
                className="px-6 py-4 hover:no-underline text-left font-semibold text-slate-900 dark:text-slate-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors [&[data-state=open]]:bg-slate-50 dark:[&[data-state=open]]:bg-slate-800"
                style={{ fontFamily: 'var(--font-heading, inherit)' }}
              >
                <div className="flex items-start gap-3 flex-1 pr-4">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: 'var(--accent-color, #8B5CF6)' }}
                  >
                    <HelpCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="flex-1">{item.question}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent 
                className="px-6 pb-4 text-slate-700 dark:text-slate-300 leading-relaxed"
                style={{ 
                  fontFamily: 'var(--font-body, inherit)',
                  paddingLeft: '3.75rem' // Align with question text (24px padding + 24px icon + 12px gap)
                }}
              >
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};
