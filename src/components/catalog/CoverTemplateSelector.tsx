import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CoverTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  layout: "image-top" | "carousel-top" | "full-background";
  requiresMultipleImages: boolean;
}

const COVER_TEMPLATES: CoverTemplate[] = [
  {
    id: "image-top",
    name: "Imagem no Topo",
    description: "Imagem principal com título e descrição embaixo",
    preview: "/cover-templates/image-top.svg",
    layout: "image-top",
    requiresMultipleImages: false,
  },
  {
    id: "carousel-top",
    name: "Galeria de Fotos",
    description: "3 fotos em carrossel com título embaixo",
    preview: "/cover-templates/carousel-top.svg",
    layout: "carousel-top",
    requiresMultipleImages: true,
  },
  {
    id: "full-background",
    name: "Imagem de Fundo",
    description: "Foto de fundo com texto sobreposto",
    preview: "/cover-templates/full-background.svg",
    layout: "full-background",
    requiresMultipleImages: false,
  },
];

interface CoverTemplateSelectorProps {
  onSelect: (template: CoverTemplate) => void;
  onBack?: () => void;
}

export function CoverTemplateSelector({ onSelect, onBack }: CoverTemplateSelectorProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedTemplate = COVER_TEMPLATES[selectedIndex];

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : COVER_TEMPLATES.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < COVER_TEMPLATES.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Escolha o estilo da capa</h2>
        <p className="text-muted-foreground">
          Selecione o layout que melhor representa seu catálogo
        </p>
      </div>

      {/* Template Preview Carousel */}
      <div className="relative">
        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur"
          onClick={handlePrevious}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur"
          onClick={handleNext}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>

        {/* Preview Card */}
        <div className="px-12">
          <Card className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border-2 border-violet-200 dark:border-violet-800">
            <div className="aspect-[9/16] max-h-[400px] mx-auto bg-white dark:bg-slate-900 rounded-lg shadow-xl overflow-hidden relative">
              {/* Template Preview Illustration */}
              {selectedTemplate.layout === "image-top" && (
                <div className="h-full flex flex-col">
                  <div className="h-2/3 bg-gradient-to-br from-violet-200 to-purple-200 dark:from-violet-900 dark:to-purple-900 flex items-center justify-center">
                    <div className="text-center text-violet-600 dark:text-violet-300">
                      <div className="w-20 h-20 mx-auto mb-2 rounded-lg bg-white/50 dark:bg-black/20" />
                      <p className="text-xs">Sua foto aqui</p>
                    </div>
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-center">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-2 w-3/4" />
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-5/6 mt-1" />
                  </div>
                </div>
              )}

              {selectedTemplate.layout === "carousel-top" && (
                <div className="h-full flex flex-col">
                  <div className="h-2/3 bg-gradient-to-br from-blue-200 to-cyan-200 dark:from-blue-900 dark:to-cyan-900 flex items-center justify-center gap-2 p-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex-1 h-full rounded-lg bg-white/50 dark:bg-black/20 flex items-center justify-center">
                        <p className="text-xs text-blue-600 dark:text-blue-300">Foto {i}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-center">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-2 w-3/4" />
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                  </div>
                </div>
              )}

              {selectedTemplate.layout === "full-background" && (
                <div className="h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center p-8 relative">
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="relative text-center text-white z-10">
                    <div className="h-4 bg-white/80 rounded mb-3 w-48 mx-auto" />
                    <div className="h-2 bg-white/60 rounded w-64 mx-auto" />
                    <div className="h-2 bg-white/60 rounded w-56 mx-auto mt-2" />
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-4">
          {COVER_TEMPLATES.map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === selectedIndex
                  ? "bg-violet-600 w-6"
                  : "bg-slate-300 dark:bg-slate-700"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Template Info */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">{selectedTemplate.name}</h3>
        <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
        {selectedTemplate.requiresMultipleImages && (
          <p className="text-xs text-violet-600 dark:text-violet-400">
            💡 Você precisará adicionar 3 fotos para este layout
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {onBack && (
          <Button variant="outline" onClick={onBack} className="flex-1">
            Voltar
          </Button>
        )}
        <Button
          onClick={() => onSelect(selectedTemplate)}
          className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
        >
          Continuar com este estilo
        </Button>
      </div>
    </div>
  );
}
