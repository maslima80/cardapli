import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  BusinessInfoType,
  businessInfoTypeLabels,
  listBusinessInfo,
  BusinessInfoSection,
} from "@/lib/businessInfo";
import { BusinessInfoEditorModal } from "@/components/business-info/BusinessInfoEditorModal";

export default function InformacoesNegocio() {
  const navigate = useNavigate();
  const [sections, setSections] = useState<BusinessInfoSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingType, setEditingType] = useState<BusinessInfoType | null>(null);
  const [editingSection, setEditingSection] = useState<BusinessInfoSection | null>(null);

  useEffect(() => {
    checkAuth();
    loadSections();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/entrar");
    }
  };

  const loadSections = async () => {
    try {
      setLoading(true);
      const data = await listBusinessInfo();
      setSections(data);
    } catch (error) {
      console.error("Error loading business info:", error);
      toast.error("Erro ao carregar informações");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditor = (type: BusinessInfoType) => {
    // Find existing section for this type (global scope)
    const existing = sections.find(s => s.type === type && s.scope === 'global' && !s.scope_id);
    setEditingType(type);
    setEditingSection(existing || null);
  };

  const handleCloseEditor = () => {
    setEditingType(null);
    setEditingSection(null);
    loadSections(); // Reload after save
  };

  const infoTypes: BusinessInfoType[] = [
    'how_to_buy',
    'delivery',
    'payment',
    'guarantee',
    'shipping',
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20">
      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/perfil")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Informações do Negócio</h1>
            <p className="text-muted-foreground">
              Configure informações reutilizáveis para seus catálogos
            </p>
          </div>
        </div>

        {/* Info Tip */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            💡 <strong>Dica:</strong> Você pode ativar estas seções automaticamente ao criar catálogos.
            Configure uma vez e reutilize em todos os seus catálogos.
          </p>
        </div>

        {/* Info Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {infoTypes.map((type) => {
            const label = businessInfoTypeLabels[type];
            const hasContent = sections.some(s => s.type === type && s.scope === 'global');

            return (
              <Card
                key={type}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleOpenEditor(type)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{label.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                        {label.title}
                        {hasContent && (
                          <span className="inline-flex items-center justify-center w-2 h-2 bg-green-500 rounded-full"></span>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {label.description}
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        {hasContent ? 'Editar' : 'Configurar'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Testimonials Card (separate) */}
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/depoimentos")}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">💬</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg mb-1">
                  Depoimentos
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Avaliações dos seus clientes
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Gerenciar depoimentos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Editor Modal */}
      {editingType && (
        <BusinessInfoEditorModal
          type={editingType}
          existingSection={editingSection}
          open={true}
          onClose={handleCloseEditor}
        />
      )}
    </div>
  );
}
