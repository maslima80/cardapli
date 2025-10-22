import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { WizardState, WizardAutoSections } from "@/lib/wizard/types";
import { AutoSectionsStep } from "@/components/wizard/AutoSectionsStep";
import { ReviewStep } from "@/components/wizard/ReviewStep";
import { generateCatalogFromWizard } from "@/lib/wizard/generateCatalog";

export default function QuickCatalogCreate() {
  const navigate = useNavigate();
  const [step, setStep] = useState<3 | 4 | 5>(3);
  const [generating, setGenerating] = useState(false);
  const [userId, setUserId] = useState("");
  const [profile, setProfile] = useState<any>(null);

  // Wizard state
  const [wizardState, setWizardState] = useState<Partial<WizardState>>({
    mode: 'products',
    selectedIds: [],
    allProducts: [],
    title: '',
    description: '',
    coverImage: '',
    coverImages: [],
    coverLayout: 'image-top',
    showLogo: false,
    productLayout: 'grid',
    autoSections: {
      about: false,
      socials: false,
      location: false,
      how_to_buy: false,
      delivery: false,
      pickup: false,
      shipping: false,
      payment: false,
      testimonials: false,
      guarantee: false,
    },
  });

  useEffect(() => {
    initializeWizard();
  }, []);

  const initializeWizard = async () => {
    // Get user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/entrar");
      return;
    }
    setUserId(user.id);

    // Get profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    if (profileData) {
      setProfile(profileData);
    }

    // Get mode from sessionStorage
    const storedMode = sessionStorage.getItem('quickCatalogMode') as 'products' | 'categories' | 'tags' | null;
    if (!storedMode) {
      toast.error("Modo não especificado");
      navigate("/compartilhar");
      return;
    }

    // Auto-fill title with date
    const today = new Date();
    const dateStr = today.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });

    let selectedIds: string[] = [];
    let allProducts: any[] = [];
    let defaultTitle = '';
    let firstImage = '';

    if (storedMode === 'products') {
      const stored = sessionStorage.getItem('quickCatalogProducts');
      if (!stored) {
        toast.error("Nenhum produto selecionado");
        navigate("/compartilhar");
        return;
      }

      const selectedProducts = JSON.parse(stored);
      selectedIds = selectedProducts.map((p: any) => p.id);
      allProducts = selectedProducts;
      defaultTitle = `Sugestões – ${dateStr}`;
      firstImage = selectedProducts[0]?.photos?.[0]?.url || 
                   selectedProducts[0]?.photos?.[0]?.image_url || '';
    } else if (storedMode === 'categories') {
      const storedCategories = sessionStorage.getItem('quickCatalogCategories');
      const storedProducts = sessionStorage.getItem('quickCatalogAllProducts');
      if (!storedCategories || !storedProducts) {
        toast.error("Dados não encontrados");
        navigate("/compartilhar");
        return;
      }

      const categories = JSON.parse(storedCategories);
      allProducts = JSON.parse(storedProducts);
      selectedIds = categories;
      defaultTitle = `Catálogo por Categorias – ${dateStr}`;

      const firstCategoryProducts = allProducts.filter((p: any) => 
        p.category === categories[0] || 
        (Array.isArray(p.categories) && p.categories.includes(categories[0]))
      );
      firstImage = firstCategoryProducts[0]?.photos?.[0]?.url || 
                   firstCategoryProducts[0]?.photos?.[0]?.image_url || '';
    } else if (storedMode === 'tags') {
      const storedTags = sessionStorage.getItem('quickCatalogTags');
      const storedProducts = sessionStorage.getItem('quickCatalogAllProducts');
      if (!storedTags || !storedProducts) {
        toast.error("Dados não encontrados");
        navigate("/compartilhar");
        return;
      }

      const tags = JSON.parse(storedTags);
      allProducts = JSON.parse(storedProducts);
      selectedIds = tags;
      defaultTitle = `Catálogo por Tags – ${dateStr}`;

      const firstTagProducts = allProducts.filter((p: any) => {
        const productTags = p.quality_tags;
        if (typeof productTags === 'string') {
          return productTags.split(',').map((t: string) => t.trim()).includes(tags[0]);
        }
        if (Array.isArray(productTags)) {
          return productTags.includes(tags[0]);
        }
        return false;
      });
      firstImage = firstTagProducts[0]?.photos?.[0]?.url || 
                   firstTagProducts[0]?.photos?.[0]?.image_url || '';
    }

    setWizardState({
      ...wizardState,
      mode: storedMode,
      selectedIds,
      allProducts,
      title: defaultTitle,
      coverImage: firstImage,
    });
  };

  const handleGenerate = async () => {
    if (!wizardState.title?.trim()) {
      toast.error("Digite um título para o catálogo");
      return;
    }

    if (!userId || !profile) {
      toast.error("Erro ao carregar perfil");
      return;
    }

    setGenerating(true);

    try {
      const { pageId } = await generateCatalogFromWizard(
        supabase,
        userId,
        profile,
        wizardState as WizardState
      );

      toast.success("Catálogo criado com sucesso!");
      navigate(`/compartilhar/sucesso?pageId=${pageId}`);
    } catch (error: any) {
      console.error("Error generating catalog:", error);
      toast.error(error.message || "Erro ao criar catálogo");
    } finally {
      setGenerating(false);
    }
  };

  const updateWizardState = (updates: Partial<WizardState>) => {
    setWizardState({ ...wizardState, ...updates });
  };

  const updateAutoSections = (sections: WizardAutoSections) => {
    setWizardState({ ...wizardState, autoSections: sections });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (step > 3) {
                setStep((step - 1) as 3 | 4 | 5);
              } else {
                navigate("/compartilhar");
              }
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="text-sm text-muted-foreground">
            Passo {step} de 5
          </div>
        </div>

        {/* Step 3: Cover & Layout */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Capa e Layout</h2>
              <p className="text-muted-foreground">
                Configure a aparência do seu catálogo
              </p>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Título do catálogo *</Label>
              <Input
                id="title"
                value={wizardState.title || ''}
                onChange={(e) => updateWizardState({ title: e.target.value })}
                placeholder="Ex: Sugestões de Natal"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                value={wizardState.description || ''}
                onChange={(e) => updateWizardState({ description: e.target.value })}
                placeholder="Ex: Produtos especiais para o Natal"
                rows={3}
              />
            </div>

            {/* Cover Layout */}
            <div className="space-y-2">
              <Label>Estilo da capa</Label>
              <RadioGroup
                value={wizardState.coverLayout}
                onValueChange={(value: any) => updateWizardState({ coverLayout: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="image-top" id="image-top" />
                  <Label htmlFor="image-top" className="font-normal cursor-pointer">
                    Imagem Grande
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="logo-title-image" id="logo-title-image" />
                  <Label htmlFor="logo-title-image" className="font-normal cursor-pointer">
                    Logo + Título + Imagem
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="full-background" id="full-background" />
                  <Label htmlFor="full-background" className="font-normal cursor-pointer">
                    Imagem de Fundo
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Show Logo */}
            <div className="flex items-center justify-between">
              <Label htmlFor="show-logo">Mostrar logo do perfil</Label>
              <Switch
                id="show-logo"
                checked={wizardState.showLogo}
                onCheckedChange={(checked) => updateWizardState({ showLogo: checked })}
              />
            </div>

            {/* Product Layout */}
            <div className="space-y-2">
              <Label>Layout dos produtos</Label>
              <RadioGroup
                value={wizardState.productLayout}
                onValueChange={(value: any) => updateWizardState({ productLayout: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="grid" id="grid" />
                  <Label htmlFor="grid" className="font-normal cursor-pointer">
                    Grade
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="grid_cinematic" id="grid_cinematic" />
                  <Label htmlFor="grid_cinematic" className="font-normal cursor-pointer">
                    Cinemática
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="list" id="list" />
                  <Label htmlFor="list" className="font-normal cursor-pointer">
                    Lista
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/compartilhar")} className="flex-1">
                Voltar
              </Button>
              <Button onClick={() => setStep(4)} className="flex-1">
                Avançar
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Auto Sections */}
        {step === 4 && (
          <AutoSectionsStep
            autoSections={wizardState.autoSections!}
            onChange={updateAutoSections}
            onNext={() => setStep(5)}
            onBack={() => setStep(3)}
          />
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <ReviewStep
            state={wizardState as WizardState}
            onBack={() => setStep(4)}
            onGenerate={handleGenerate}
            generating={generating}
          />
        )}
      </div>
    </div>
  );
}
