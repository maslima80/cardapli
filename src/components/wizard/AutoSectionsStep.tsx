import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { WizardAutoSections } from "@/lib/wizard/types";
import { hasBusinessInfo, businessInfoTypeLabels, BusinessInfoType } from "@/lib/businessInfo";

interface AutoSectionsStepProps {
  autoSections: WizardAutoSections;
  onChange: (sections: WizardAutoSections) => void;
  onNext: () => void;
  onBack: () => void;
}

interface SectionConfig {
  key: keyof WizardAutoSections;
  label: string;
  icon: string;
  description: string;
  businessInfoType?: BusinessInfoType;
}

const sections: SectionConfig[] = [
  {
    key: 'about',
    label: 'Sobre o negócio',
    icon: 'ℹ️',
    description: 'Descrição e história',
  },
  {
    key: 'how_to_buy',
    label: 'Como Comprar',
    icon: '🛒',
    description: 'Passo a passo da compra',
    businessInfoType: 'how_to_buy',
  },
  {
    key: 'delivery',
    label: 'Entrega & Retirada',
    icon: '🚚',
    description: 'Áreas atendidas, prazos e horários',
    businessInfoType: 'delivery',
  },
  {
    key: 'shipping',
    label: 'Envio (Correios/Transportadora)',
    icon: '📦',
    description: 'Informações sobre envio',
    businessInfoType: 'shipping',
  },
  {
    key: 'payment',
    label: 'Pagamentos',
    icon: '💳',
    description: 'Pix, MB Way, cartão',
    businessInfoType: 'payment',
  },
  {
    key: 'testimonials',
    label: 'Depoimentos',
    icon: '💬',
    description: 'Avaliações dos seus clientes',
  },
  {
    key: 'guarantee',
    label: 'Garantia / Política',
    icon: '🛡️',
    description: 'Troca e devoluções',
    businessInfoType: 'guarantee',
  },
  {
    key: 'socials',
    label: 'Redes sociais',
    icon: '📱',
    description: 'Instagram, Facebook, etc.',
  },
  {
    key: 'location',
    label: 'Localização',
    icon: '📍',
    description: 'Endereço e mapa',
  },
];

export function AutoSectionsStep({
  autoSections,
  onChange,
  onNext,
  onBack,
}: AutoSectionsStepProps) {
  const [contentStatus, setContentStatus] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkContentStatus();
  }, []);

  const checkContentStatus = async () => {
    setLoading(true);
    const status: Record<string, boolean> = {};

    for (const section of sections) {
      if (section.businessInfoType) {
        const exists = await hasBusinessInfo(section.businessInfoType);
        status[section.key] = exists;
      } else {
        // For about, socials, location - assume they exist (from profile)
        status[section.key] = true;
      }
    }

    setContentStatus(status);
    setLoading(false);
  };

  const toggleSection = (key: keyof WizardAutoSections) => {
    onChange({
      ...autoSections,
      [key]: !autoSections[key],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Seções do Perfil (opcional)</h2>
        <p className="text-muted-foreground">
          Adicione informações do seu negócio automaticamente
        </p>
      </div>

      {/* Sections Grid */}
      <div className="space-y-3">
        {sections.map((section) => {
          const isSelected = autoSections[section.key] || false;
          const hasContent = contentStatus[section.key] !== false;

          return (
            <button
              key={section.key}
              type="button"
              onClick={() => toggleSection(section.key)}
              disabled={loading}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/20"
              } ${loading ? "opacity-50 cursor-wait" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-2xl">{section.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium flex items-center gap-2">
                      {section.label}
                      {!hasContent && section.businessInfoType && (
                        <span className="text-orange-600 dark:text-orange-400" title="Você ainda não configurou esta informação">
                          <AlertCircle className="w-4 h-4" />
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {section.description}
                    </p>
                    {!hasContent && section.businessInfoType && (
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                        ⚠️ Você ainda não configurou esta informação. Pode editar depois.
                      </p>
                    )}
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? "bg-primary border-primary" : "border-muted-foreground"
                  }`}
                >
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Info Tip */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          💡 <strong>Dica:</strong> Você pode mover seções e editar textos no editor depois de criar o catálogo.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Voltar
        </Button>
        <Button onClick={onNext} className="flex-1">
          Avançar
        </Button>
      </div>
    </div>
  );
}
