import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WizardState } from "@/lib/wizard/types";
import { Loader2 } from "lucide-react";

interface ReviewStepProps {
  state: WizardState;
  onBack: () => void;
  onGenerate: () => void;
  generating: boolean;
}

export function ReviewStep({ state, onBack, onGenerate, generating }: ReviewStepProps) {
  const getModeLabel = () => {
    switch (state.mode) {
      case 'products':
        return 'Poucos produtos';
      case 'categories':
        return 'Por categorias';
      case 'tags':
        return 'Por tags';
      default:
        return '';
    }
  };

  const getLayoutLabel = () => {
    switch (state.productLayout) {
      case 'grid':
        return 'Grade';
      case 'grid_cinematic':
        return 'Cinemática';
      case 'list':
        return 'Lista';
      default:
        return '';
    }
  };

  const getCoverLayoutLabel = () => {
    switch (state.coverLayout) {
      case 'logo-title-image':
        return 'Logo + Título + Imagem';
      case 'image-top':
        return 'Imagem Grande';
      case 'carousel-top':
        return 'Carrossel';
      case 'full-background':
        return 'Imagem de Fundo';
      default:
        return '';
    }
  };

  const getSelectedSections = () => {
    const sections: string[] = [];
    const { autoSections } = state;

    if (autoSections.about) sections.push('Sobre');
    if (autoSections.how_to_buy) sections.push('Como Comprar');
    if (autoSections.delivery) sections.push('Entrega');
    if (autoSections.shipping) sections.push('Envio');
    if (autoSections.payment) sections.push('Pagamentos');
    if (autoSections.testimonials) sections.push('Depoimentos');
    if (autoSections.guarantee) sections.push('Garantia');
    if (autoSections.socials) sections.push('Redes Sociais');
    if (autoSections.location) sections.push('Localização');

    return sections;
  };

  const selectedSections = getSelectedSections();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Revise e confirme</h2>
        <p className="text-muted-foreground">
          Confira as configurações do seu catálogo
        </p>
      </div>

      {/* Summary Cards */}
      <div className="space-y-4">
        {/* Type & Items */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Tipo de Catálogo</span>
                <span className="text-sm font-semibold">{getModeLabel()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Itens selecionados</span>
                <span className="text-sm font-semibold">{state.selectedIds.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cover & Layout */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Estilo da Capa</span>
                <span className="text-sm font-semibold">{getCoverLayoutLabel()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Layout dos Produtos</span>
                <span className="text-sm font-semibold">{getLayoutLabel()}</span>
              </div>
              {state.title && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Título</span>
                  <span className="text-sm font-semibold truncate max-w-[200px]">{state.title}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sections */}
        {selectedSections.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Seções incluídas</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedSections.map((section) => (
                    <span
                      key={section}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                    >
                      {section}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Info Tip */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          💡 <strong>Dica:</strong> Você poderá mover seções e editar textos no editor.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} disabled={generating} className="flex-1">
          Voltar e ajustar
        </Button>
        <Button onClick={onGenerate} disabled={generating} className="flex-1">
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Gerando...
            </>
          ) : (
            'Gerar Catálogo'
          )}
        </Button>
      </div>
    </div>
  );
}
