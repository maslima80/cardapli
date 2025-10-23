import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ShoppingBag, Truck, Package, CreditCard, ShieldCheck, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import {
  BusinessInfoType,
  businessInfoTypeLabels,
  listBusinessInfo,
  BusinessInfoSection,
} from "@/lib/businessInfo";
import { HowToBuyEditor } from "@/components/business-info/editors/HowToBuyEditor";
import { DeliveryPickupEditor } from "@/components/business-info/editors/DeliveryPickupEditor";
import { ShippingEditor } from "@/components/business-info/editors/ShippingEditor";
import { PaymentsEditor } from "@/components/business-info/editors/PaymentsEditor";
import { PolicyEditor } from "@/components/business-info/editors/PolicyEditor";
import { TestimonialsManager } from "@/components/testimonials/TestimonialsManager";

export default function InformacoesNegocio() {
  const navigate = useNavigate();
  const [sections, setSections] = useState<BusinessInfoSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingType, setEditingType] = useState<BusinessInfoType | null>(null);
  const [editingSection, setEditingSection] = useState<BusinessInfoSection | null>(null);
  const [testimonialsOpen, setTestimonialsOpen] = useState(false);

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
        {/* Breadcrumb */}
        <Button
          variant="ghost"
          onClick={() => navigate("/perfil")}
          className="mb-2 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Perfil
        </Button>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Informações do Negócio</h1>
          <p className="text-muted-foreground">
            Configure informações reutilizáveis para seus catálogos
          </p>
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

        {/* Testimonials Card */}
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setTestimonialsOpen(true)}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">💬</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg mb-1">Depoimentos</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Gerencie depoimentos para usar em seus catálogos
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Gerenciar Depoimentos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Specialized Editors */}
      {editingType === 'how_to_buy' && (
        <HowToBuyEditor
          open={true}
          onOpenChange={(open) => !open && handleCloseEditor()}
          initialData={editingSection}
          onSaved={handleCloseEditor}
        />
      )}

      {editingType === 'delivery' && (
        <DeliveryPickupEditor
          open={true}
          onOpenChange={(open) => !open && handleCloseEditor()}
          initialData={editingSection}
          onSaved={handleCloseEditor}
        />
      )}

      {editingType === 'shipping' && (
        <ShippingEditor
          open={true}
          onOpenChange={(open) => !open && handleCloseEditor()}
          initialData={editingSection}
          onSaved={handleCloseEditor}
        />
      )}

      {editingType === 'payment' && (
        <PaymentsEditor
          open={true}
          onOpenChange={(open) => !open && handleCloseEditor()}
          initialData={editingSection}
          onSaved={handleCloseEditor}
        />
      )}

      {editingType === 'guarantee' && (
        <PolicyEditor
          open={true}
          onOpenChange={(open) => !open && handleCloseEditor()}
          initialData={editingSection}
          onSaved={handleCloseEditor}
        />
      )}

      {/* Testimonials Manager Dialog */}
      {testimonialsOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Depoimentos</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Gerencie depoimentos para reutilizar em seus catálogos
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTestimonialsOpen(false)}
              >
                ✕
              </Button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <TestimonialsManager />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
