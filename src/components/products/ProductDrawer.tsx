import { useState, useEffect } from "react";
import { Product, ProductOption, ProductVariant } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { debounce } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaSection } from "./sections/MediaSection";
import { BasicInfoSection } from "./sections/BasicInfoSection";
import { PricingSection } from "./sections/PricingSection";
import { CustomizationSection } from "./sections/CustomizationSection";
import { FoodSpecificSection } from "./sections/FoodSpecificSection";
import { CategoriesSection } from "./sections/CategoriesSection";
import { OptionSection } from "./sections/OptionSection";
import { VariantListSection } from "./sections/VariantListSection";
import { ProductDeleteButton } from "./ProductDeleteButton";
import { sanitizeProductData, logProductData } from "./ProductDebugHelper";

interface ProductDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSaved: () => void;
}

export function ProductDrawer({
  open,
  onOpenChange,
  product,
  onSaved,
}: ProductDrawerProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Product>>({
    title: "",
    description: "",
    price: 0,
    price_unit: "Unidade",
    price_unit_custom: "",
    price_note: "",
    min_qty: null,
    status: "Disponível",
    production_days: null,
    accepts_customization: false,
    customization_instructions: "",
    ingredients: "",
    allergens: "",
    conservation: "",
    category: null,
    categories: [],
    quality_tags: [],
    variants: [],
    photos: [],
    external_media: [],
  });
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("geral");

  useEffect(() => {
    if (product) {
      // Ensure proper data types when loading product
      setFormData({
        ...product,
        category: product.category || null,
        photos: product.photos || [],
        external_media: product.external_media || [],
        min_qty: product.min_qty ?? null,
        sku: product.sku || "",
        price_on_request: product.price_on_request || false,
        price_hidden: product.price_hidden || false,
        categories: Array.isArray(product.categories) ? product.categories : [],
        quality_tags: Array.isArray(product.quality_tags) ? product.quality_tags : [],
        variants: Array.isArray(product.variants) ? product.variants : [],
      });
    } else {
      resetForm();
    }
  }, [product, open]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: 0,
      price_unit: "Unidade",
      price_unit_custom: "",
      price_note: "",
      min_qty: null,
      status: "Disponível",
      production_days: null,
      accepts_customization: false,
      customization_instructions: "",
      ingredients: "",
      allergens: "",
      conservation: "",
      category: null,
      categories: [],
      quality_tags: [],
      variants: [],
      photos: [],
      external_media: [],
    });
  };

  const saveProduct = async (data: Partial<Product>) => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      if (product?.id) {
        // Update existing product
        const updateData = sanitizeProductData({
          ...data,
          user_id: product.user_id
        });
        
        logProductData(updateData, "update");
        
        const { error } = await supabase
          .from("products")
          .update(updateData)
          .eq("id", product.id);
        
        if (error) throw error;
        
        setLastSaved(new Date());
        toast({
          title: "Salvo ✓",
          description: "Produto atualizado com sucesso",
        });
      } else {
        // Create new product
        if (!data.title) {
          throw new Error("Título é obrigatório");
        }
        
        // Validate price only if price on request is disabled
        if (!data.price_on_request && (data.price === null || data.price === undefined || data.price === 0)) {
          throw new Error("Preço é obrigatório ou ative 'Preço sob consulta'");
        }
        
        const productData = sanitizeProductData({
          ...data,
          user_id: user.id
        });
        
        logProductData(productData, "create");
        
        // Convert productData to the correct type for Supabase insert
        const { error } = await supabase
          .from("products")
          .insert(productData as any);
        
        if (error) throw error;
        
        setLastSaved(new Date());
        toast({
          title: "Salvo ✓",
          description: "Rascunho salvo automaticamente",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const debouncedSave = debounce(saveProduct, 500);

  const updateField = (field: keyof Product, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    // Track that changes were made
    if (product?.id) {
      setHasChanges(true);
      debouncedSave(newData);
    }
  };

  const handleOpenChange = (open: boolean) => {
    // If closing the drawer after editing and there were changes, refresh the list
    if (!open && product?.id && hasChanges) {
      onSaved();
      setHasChanges(false);
    }
    onOpenChange(open);
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="h-[90vh]">
        <DrawerHeader className="border-b sticky top-0 bg-background z-10">
          <div className="flex items-center justify-between">
            <DrawerTitle>
              {product ? "Editar Produto" : "Novo Produto"}
            </DrawerTitle>
            <div className="flex items-center gap-3">
              {/* Autosave indicator */}
              {product && lastSaved && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in">
                  <span className="text-green-600">✓</span>
                  <span>Salvo</span>
                </div>
              )}
              {product && saving && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Salvando...</span>
                </div>
              )}
              {product && (
                <ProductDeleteButton
                  product={product}
                  onDeleted={() => {
                    onSaved();
                    onOpenChange(false);
                  }}
                />
              )}
              {!product && (
                <Button 
                  onClick={() => {
                    // Title is always required
                    if (!formData.title) {
                      toast({
                        title: "Título obrigatório",
                        description: "Preencha o título do produto",
                        variant: "destructive",
                      });
                      return;
                    }
                    
                    // Price is required only if not price_on_request
                    if (!formData.price_on_request && !formData.price) {
                      toast({
                        title: "Preço obrigatório",
                        description: "Preencha o preço ou ative 'Preço sob consulta'",
                        variant: "destructive",
                      });
                      return;
                    }
                    
                    saveProduct(formData).then(() => onSaved());
                  }}
                  disabled={saving}
                  className="min-h-[44px] min-w-[44px]"
                >
                  {saving ? "Salvando..." : "Salvar Produto"}
                </Button>
              )}
            </div>
          </div>
        </DrawerHeader>

        {/* Fixed: Adjusted height calculations and added explicit overflow handling */}
        <div className="flex flex-col" style={{ height: "calc(90vh - 65px)" }}>
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="flex flex-col h-full"
          >
            <div className="border-b px-4">
              <TabsList className="h-12">
                <TabsTrigger value="geral">Geral</TabsTrigger>
                <TabsTrigger value="opcoes">Opções</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="geral" className="flex-1 overflow-auto" style={{ height: "calc(100% - 48px)" }}>
              <div className="p-4 md:p-6">
                <div className="max-w-4xl mx-auto space-y-8">
                  
                  {/* Sticky section header */}
                  <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 -mx-4 md:-mx-6 px-4 md:px-6 py-3 mb-4 border-b">
                    <h2 className="text-sm font-semibold text-muted-foreground">Mídia</h2>
                  </div>
                  <MediaSection
                    photos={formData.photos || []}
                    externalMedia={formData.external_media || []}
                    productId={product?.id}
                    onPhotosChange={(photos) => updateField("photos", photos)}
                    onExternalMediaChange={(media) => updateField("external_media", media)}
                  />

                  {/* Sticky section header */}
                  <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 -mx-4 md:-mx-6 px-4 md:px-6 py-3 mb-4 border-b">
                    <h2 className="text-sm font-semibold text-muted-foreground">Informações Básicas</h2>
                  </div>
                  <BasicInfoSection
                    title={formData.title || ""}
                    description={formData.description || ""}
                    status={formData.status || "Disponível"}
                    productionDays={formData.production_days || null}
                    onTitleChange={(v) => updateField("title", v)}
                    onDescriptionChange={(v) => updateField("description", v)}
                    onStatusChange={(v) => updateField("status", v)}
                    onProductionDaysChange={(v) => updateField("production_days", v)}
                  />

                  {/* Sticky section header */}
                  <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 -mx-4 md:-mx-6 px-4 md:px-6 py-3 mb-4 border-b">
                    <h2 className="text-sm font-semibold text-muted-foreground">Preço e Disponibilidade</h2>
                  </div>

                  <PricingSection
                    price={formData.price || 0}
                    priceUnit={formData.price_unit || "Unidade"}
                    priceUnitCustom={formData.price_unit_custom || ""}
                    priceNote={formData.price_note || ""}
                    minQty={formData.min_qty || null}
                    priceOnRequest={formData.price_on_request || false}
                    priceOnRequestLabel={formData.price_on_request_label || "Sob consulta"}
                    priceHidden={formData.price_hidden || false}
                    sku={formData.sku || ""}
                    onPriceChange={(v) => updateField("price", v)}
                    onPriceUnitChange={(v) => updateField("price_unit", v)}
                    onPriceUnitCustomChange={(v) => updateField("price_unit_custom", v)}
                    onPriceNoteChange={(v) => updateField("price_note", v)}
                    onMinQtyChange={(v) => updateField("min_qty", v)}
                    onPriceOnRequestChange={(v) => updateField("price_on_request", v)}
                    onPriceOnRequestLabelChange={(v) => updateField("price_on_request_label", v)}
                    onPriceHiddenChange={(v) => updateField("price_hidden", v)}
                    onSkuChange={(v) => updateField("sku", v)}
                  />

                  {/* Sticky section header */}
                  <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 -mx-4 md:-mx-6 px-4 md:px-6 py-3 mb-4 border-b">
                    <h2 className="text-sm font-semibold text-muted-foreground">Personalização</h2>
                  </div>
                  <CustomizationSection
                    accepts={formData.accepts_customization || false}
                    instructions={formData.customization_instructions || ""}
                    onAcceptsChange={(v) => updateField("accepts_customization", v)}
                    onInstructionsChange={(v) => updateField("customization_instructions", v)}
                  />

                  {/* Sticky section header */}
                  <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 -mx-4 md:-mx-6 px-4 md:px-6 py-3 mb-4 border-b">
                    <h2 className="text-sm font-semibold text-muted-foreground">Informações Alimentares</h2>
                  </div>

                  <FoodSpecificSection
                    ingredients={formData.ingredients || ""}
                    allergens={formData.allergens || ""}
                    conservation={formData.conservation || ""}
                    onIngredientsChange={(v) => updateField("ingredients", v)}
                    onAllergensChange={(v) => updateField("allergens", v)}
                    onConservationChange={(v) => updateField("conservation", v)}
                  />

                  {/* Sticky section header */}
                  <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 -mx-4 md:-mx-6 px-4 md:px-6 py-3 mb-4 border-b">
                    <h2 className="text-sm font-semibold text-muted-foreground">Categorias e Tags</h2>
                  </div>
                  <CategoriesSection
                    categories={formData.categories || []}
                    tags={formData.quality_tags || []}
                    onCategoriesChange={(v) => updateField("categories", v)}
                    onTagsChange={(v) => updateField("quality_tags", v)}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="opcoes" className="flex-1 overflow-auto" style={{ height: "calc(100% - 48px)" }}>
              <div className="p-4 md:p-6">
                <div className="max-w-4xl mx-auto space-y-8">
                  <h3 className="text-lg font-semibold mb-1">Opções de Produto</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure opções como tamanho, cor, material, etc.
                  </p>
                  
                  <OptionSection 
                    productId={product?.id} 
                    userId={product?.user_id || ""}
                    onOptionsChange={setProductOptions}
                  />
                  
                  {productOptions.length > 0 && (
                    <VariantListSection
                      productId={product?.id}
                      userId={product?.user_id || ""}
                      productOptions={productOptions}
                      productPhotos={formData.photos || []}
                      onVariantsChange={setProductVariants}
                    />
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
