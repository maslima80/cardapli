import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MultiSelectChips } from "./MultiSelectChips";
import { ProductPickerModal } from "./ProductPickerModalV2";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ProductGridBlockSettingsProps {
  formData: any;
  setFormData: (data: any) => void;
  onUpdate?: (block: any) => void;
  block?: any;
  profile?: any;
  userId?: string;
}

export function ProductGridBlockSettings({
  formData,
  setFormData,
  onUpdate,
  block,
  profile,
  userId,
}: ProductGridBlockSettingsProps) {
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableVariations, setAvailableVariations] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedProductsPreview, setSelectedProductsPreview] = useState<any[]>([]);

  useEffect(() => {
    loadCategoriesAndTags();
    
    // Ensure source_type is set to a default value if not already set
    if (!formData.source_type) {
      setFormData(prev => ({
        ...prev,
        source_type: prev.source_type || "manual"
      }));
    }
  }, []);
  
  // Load preview of selected products when IDs change
  useEffect(() => {
    if (formData.source_type === "manual" && formData.selected_product_ids?.length > 0) {
      loadSelectedProductsPreview();
    } else {
      setSelectedProductsPreview([]);
    }
  }, [formData.selected_product_ids]);
  
  // Load preview data for selected products
  const loadSelectedProductsPreview = async () => {
    if (!formData.selected_product_ids?.length) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data } = await supabase
      .from("products")
      .select("id, title, photos")
      .in("id", formData.selected_product_ids)
      .eq("user_id", user.id);
      
    if (data) {
      // Sort according to the order in selected_product_ids
      const orderedProducts = formData.selected_product_ids
        .map(id => data.find(p => p.id === id))
        .filter(Boolean);
      
      setSelectedProductsPreview(orderedProducts as any[]);
    }
  };

  const loadCategoriesAndTags = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load categories
    const { data: productsWithCategories } = await supabase
      .from("products")
      .select("categories")
      .eq("user_id", user.id)
      .not("categories", "is", null);

    if (productsWithCategories) {
      const allCategories = productsWithCategories
        .flatMap(product => product.categories || [])
        .filter(Boolean);
      
      const uniqueCategories = [...new Set(allCategories)].sort();
      setAvailableCategories(uniqueCategories);
    }

    // Load tags
    const { data: productsWithTags } = await supabase
      .from("products")
      .select("quality_tags")
      .eq("user_id", user.id)
      .not("quality_tags", "is", null);

    if (productsWithTags) {
      const allTags = productsWithTags
        .flatMap(product => product.quality_tags || [])
        .filter(Boolean);
      
      const uniqueTags = [...new Set(allTags)].sort();
      setAvailableTags(uniqueTags);
    }

    // Load variations - check if the column exists in the schema
    try {
      const { data: productsWithVariations } = await supabase
        .from("products")
        .select("variations")
        .eq("user_id", user.id)
        .not("variations", "is", null);

      if (productsWithVariations && Array.isArray(productsWithVariations)) {
        const allVariations = productsWithVariations
          .flatMap(product => {
            // Use type guards to safely access variations
            // First check if product is not null
            if (!product) return [];
            
            // Then check if it's an object with variations property
            if (typeof product === 'object' && 
                'variations' in product && 
                product.variations && 
                Array.isArray(product.variations)) {
              
              return product.variations
                .filter(v => v && typeof v === 'object' && 'name' in v)
                .map(v => v.name)
                .filter(Boolean);
            }
            return [];
          });
        
        const uniqueVariations = [...new Set(allVariations)].sort();
        setAvailableVariations(uniqueVariations);
      }
    } catch (error) {
      console.error("Error loading variations:", error);
      // If the column doesn't exist, just set empty variations
      setAvailableVariations([]);
    }
  };

  // Determine if we should show the variation filter
  const showVariationFilter = availableVariations.length > 0;

  // Determine if we're in combined mode (both categories and tags selected)
  const isCombinedMode = 
    formData.source_type === "combined" || 
    (formData.selected_categories?.length > 0 && formData.selected_tags?.length > 0);

  return (
    <>
      <div className="space-y-6">
        {/* Title field */}
        <div className="space-y-2">
          <Label>Título (opcional)</Label>
          <Input
            value={formData.title || ""}
            onChange={(e) => {
              const newTitle = e.target.value;
              setFormData({ ...formData, title: newTitle });
              if (onUpdate && newTitle && (!block.anchor_slug || block.anchor_slug === generateSlug(block.data.title || ""))) {
                onUpdate({ ...block, data: { ...formData, title: newTitle }, anchor_slug: generateSlug(newTitle) });
              }
            }}
            placeholder="Nossos produtos"
          />
        </div>

        {/* Source selection */}
        <div className="space-y-2">
          <Label>Fonte dos Produtos</Label>
          <Select
            value={formData.source_type || "manual"}
            onValueChange={(value) => {
              // Reset some filters when changing source type
              const updatedFormData = { 
                ...formData, 
                source_type: value,
                // Clear selections that don't apply to the new source type
                ...(value === "manual" && { selected_categories: undefined, selected_tags: undefined }),
                ...(value === "category" && { selected_product_ids: undefined, selected_tags: undefined }),
                ...(value === "tag" && { selected_product_ids: undefined, selected_categories: undefined }),
                ...(value === "combined" && { selected_product_ids: undefined }),
              };
              setFormData(updatedFormData);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Escolha a fonte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Seleção Manual</SelectItem>
              <SelectItem value="category">Por Categoria</SelectItem>
              <SelectItem value="tag">Por Tag</SelectItem>
              <SelectItem value="combined">Combinado (Categorias + Tags)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Manual product selection - show prominently */}
        {formData.source_type === "manual" && (
          <div className="space-y-4 mt-4 border rounded-lg p-4 bg-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Produtos selecionados</h3>
                <p className="text-sm text-muted-foreground">
                  {formData.selected_product_ids?.length || 0} produto(s) selecionado(s)
                </p>
              </div>
              <Button
                onClick={() => setProductPickerOpen(true)}
                className="whitespace-nowrap"
              >
                {formData.selected_product_ids?.length ? "Editar seleção" : "Selecionar produtos"}
              </Button>
            </div>
            
            {formData.selected_product_ids?.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-2">Produtos serão exibidos na ordem selecionada. Você pode reordenar na tela de seleção.</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto p-1">
                  {selectedProductsPreview.map((product) => (
                    <div key={product.id} className="border rounded-md p-2 flex items-center gap-2 bg-background">
                      <div className="w-10 h-10 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                        {product.photos?.[0]?.url ? (
                          <img 
                            src={product.photos[0].url} 
                            alt={product.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><line x1="12" y1="22" x2="12" y2="12"></line></svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{product.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed rounded-md">
                <p className="text-muted-foreground mb-4">Nenhum produto selecionado</p>
                <Button 
                  variant="outline" 
                  onClick={() => setProductPickerOpen(true)}
                >
                  Selecionar produtos
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Category selection */}
        {(formData.source_type === "category" || formData.source_type === "combined") && (
          <div className="space-y-2">
            <Label>Categorias</Label>
            <MultiSelectChips
              availableOptions={availableCategories}
              selectedOptions={formData.selected_categories || []}
              onChange={(selected_categories) => setFormData({ ...formData, selected_categories })}
              placeholder="Digite para buscar categorias..."
            />
          </div>
        )}

        {/* Tag selection */}
        {(formData.source_type === "tag" || formData.source_type === "combined") && (
          <div className="space-y-2">
            <Label>Tags</Label>
            <MultiSelectChips
              availableOptions={availableTags}
              selectedOptions={formData.selected_tags || []}
              onChange={(selected_tags) => setFormData({ ...formData, selected_tags })}
              placeholder="Digite para buscar tags..."
            />
          </div>
        )}

        {/* Advanced filters section */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="advanced-filters">
            <AccordionTrigger className="py-2">
              Filtros Avançados
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              {/* Combine logic (AND/OR) for combined mode */}
              {isCombinedMode && (
                <div className="space-y-2">
                  <Label>Lógica de combinação</Label>
                  <Select
                    value={formData.combine_logic || "or"}
                    onValueChange={(value) => setFormData({ ...formData, combine_logic: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha a lógica" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="or">Categorias OU Tags (qualquer um)</SelectItem>
                      <SelectItem value="and">Categorias E Tags (ambos)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    "OU" mostra produtos que estão em qualquer categoria OU possuem qualquer tag selecionada.
                    "E" mostra apenas produtos que estão em uma categoria E possuem todas as tags selecionadas.
                  </p>
                </div>
              )}

              {/* Match type for tags */}
              {formData.source_type === "tag" && formData.selected_tags?.length > 1 && (
                <div className="space-y-2">
                  <Label>Correspondência de Tags</Label>
                  <Select
                    value={formData.combine_logic || "or"}
                    onValueChange={(value) => setFormData({ ...formData, combine_logic: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo de correspondência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="or">Qualquer tag (OU)</SelectItem>
                      <SelectItem value="and">Todas as tags (E)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Variation filter */}
              {showVariationFilter && (
                <div className="space-y-2">
                  <Label>Filtrar por Variação</Label>
                  <Select
                    value={formData.variation_filter || ""}
                    onValueChange={(value) => setFormData({ ...formData, variation_filter: value || undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as variações" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas as variações</SelectItem>
                      {availableVariations.map(variation => (
                        <SelectItem key={variation} value={variation}>{variation}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Status filter */}
              <div className="space-y-2">
                <Label>Filtrar por Status</Label>
                <Select
                  value={formData.status_filter || "ambos"}
                  onValueChange={(value) => setFormData({ ...formData, status_filter: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ambos">Ambos</SelectItem>
                    <SelectItem value="disponivel">Disponível</SelectItem>
                    <SelectItem value="sob_encomenda">Sob encomenda</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort order */}
              <div className="space-y-2">
                <Label>Ordenação</Label>
                <Select
                  value={formData.sort_order || "recentes"}
                  onValueChange={(value) => setFormData({ ...formData, sort_order: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha a ordenação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recentes">Mais recentes</SelectItem>
                    <SelectItem value="antigos">Mais antigos</SelectItem>
                    <SelectItem value="nome_az">Nome (A-Z)</SelectItem>
                    <SelectItem value="preco_asc">Preço (menor para maior)</SelectItem>
                    <SelectItem value="preco_desc">Preço (maior para menor)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Product limit */}
              <div className="space-y-2">
                <Label>Limite de Produtos</Label>
                <Input
                  type="number"
                  value={formData.limit || 12}
                  onChange={(e) => setFormData({ ...formData, limit: parseInt(e.target.value) || 12 })}
                  min={1}
                  max={50}
                />
                <p className="text-xs text-muted-foreground">
                  Máximo de produtos a serem exibidos (1-50)
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Display options */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="display-options">
            <AccordionTrigger className="py-2">
              Opções de Exibição
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              {/* Layout selection */}
              <div className="space-y-2">
                <Label>Layout</Label>
                <Select
                  value={formData.layout || "grid"}
                  onValueChange={(value) => setFormData({ ...formData, layout: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha o layout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grade</SelectItem>
                    <SelectItem value="list">Lista</SelectItem>
                    {/* <SelectItem value="carousel">Carrossel</SelectItem> */}
                  </SelectContent>
                </Select>
              </div>

              {/* Show price toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="show-price">Mostrar Preço</Label>
                <Switch
                  id="show-price"
                  checked={formData.show_price !== false}
                  onCheckedChange={(checked) => setFormData({ ...formData, show_price: checked })}
                />
              </div>

              {/* Show tags toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="show-tags">Mostrar Tags</Label>
                <Switch
                  id="show-tags"
                  checked={formData.show_tags || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, show_tags: checked })}
                />
              </div>

              {/* Show button toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="show-button">Mostrar Botão "Ver produto"</Label>
                <Switch
                  id="show-button"
                  checked={formData.show_button !== false}
                  onCheckedChange={(checked) => setFormData({ ...formData, show_button: checked })}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Product picker modal */}
      <ProductPickerModal
        open={productPickerOpen}
        onOpenChange={setProductPickerOpen}
        selectedIds={formData.selected_product_ids || []}
        onSave={(ids) => setFormData({ ...formData, selected_product_ids: ids })}
        userId={userId}
      />
    </>
  );
}

// Helper function to generate slug from title
function generateSlug(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}
