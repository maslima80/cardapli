import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { 
  Grid2X2, 
  List, 
  Settings, 
  Check, 
  X, 
  Plus, 
  ImagePlus,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  ProductOption, 
  ProductOptionValue, 
  ProductVariant,
  ProductVariantOption,
  VariantCombination
} from "@/types/product";

interface VariantMatrixSectionProps {
  productId: string | undefined;
  userId: string;
  productOptions: ProductOption[];
  onVariantsChange?: (variants: ProductVariant[]) => void;
}

export function VariantMatrixSection({ 
  productId, 
  userId, 
  productOptions,
  onVariantsChange 
}: VariantMatrixSectionProps) {
  const { toast } = useToast();
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [combinations, setCombinations] = useState<VariantCombination[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingVariants, setGeneratingVariants] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Extract the first two options for grid view
  const gridOptions = useMemo(() => {
    if (productOptions.length >= 2) {
      return [productOptions[0], productOptions[1]];
    }
    return productOptions.slice(0, 2);
  }, [productOptions]);

  useEffect(() => {
    if (productId) {
      loadVariants();
    } else {
      setVariants([]);
      setCombinations([]);
    }
  }, [productId]);

  useEffect(() => {
    // When product options change, update combinations
    if (productOptions.length > 0) {
      generateCombinations();
    }
  }, [productOptions]);

  const loadVariants = async () => {
    if (!productId) return;
    
    setLoading(true);
    try {
      // Load variants
      const { data: variantsData, error: variantsError } = await supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", productId);
        
      if (variantsError) throw variantsError;
      
      const loadedVariants: ProductVariant[] = variantsData || [];
      
      // Load variant options for each variant
      for (const variant of loadedVariants) {
        const { data: optionsData, error: optionsError } = await supabase
          .from("product_variant_options")
          .select(`
            variant_id,
            option_id,
            value_id,
            product_options!inner(name),
            product_option_values!inner(value)
          `)
          .eq("variant_id", variant.id);
          
        if (optionsError) throw optionsError;
        
        if (optionsData) {
          variant.options = optionsData.map(item => ({
            variant_id: item.variant_id,
            option_id: item.option_id,
            value_id: item.value_id,
            option_name: item.product_options.name,
            value_name: item.product_option_values.value
          }));
        }
      }
      
      setVariants(loadedVariants);
      if (onVariantsChange) onVariantsChange(loadedVariants);
      
      // Generate combinations and match with existing variants
      if (productOptions.length > 0) {
        generateCombinations(loadedVariants);
      }
    } catch (error: any) {
      console.error("Error loading variants:", error);
      toast({
        title: "Erro ao carregar variantes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCombinations = (existingVariants: ProductVariant[] = variants) => {
    if (productOptions.length === 0) {
      setCombinations([]);
      return;
    }

    setGeneratingVariants(true);
    
    try {
      // Generate all possible combinations of option values
      const generateCartesianProduct = (
        options: ProductOption[],
        currentIndex: number = 0,
        currentCombination: { [key: string]: string } = {},
        currentOptionNames: { [key: string]: string } = {},
        currentValueNames: { [key: string]: string } = {}
      ): VariantCombination[] => {
        if (currentIndex === options.length) {
          // Base case: we've assigned a value to each option
          return [{
            options: { ...currentCombination },
            optionNames: { ...currentOptionNames },
            valueNames: { ...currentValueNames },
            isAvailable: false
          }];
        }
        
        const currentOption = options[currentIndex];
        const results: VariantCombination[] = [];
        
        // Skip if the option has no values
        if (!currentOption.values || currentOption.values.length === 0) {
          return generateCartesianProduct(
            options,
            currentIndex + 1,
            currentCombination,
            currentOptionNames,
            currentValueNames
          );
        }
        
        // For each value of the current option
        for (const value of currentOption.values) {
          const newCombination = { ...currentCombination, [currentOption.id]: value.id };
          const newOptionNames = { ...currentOptionNames, [currentOption.id]: currentOption.name };
          const newValueNames = { ...currentValueNames, [value.id]: value.value };
          
          const nextResults = generateCartesianProduct(
            options,
            currentIndex + 1,
            newCombination,
            newOptionNames,
            newValueNames
          );
          
          results.push(...nextResults);
        }
        
        return results;
      };
      
      let newCombinations = generateCartesianProduct(productOptions);
      
      // Match combinations with existing variants
      if (existingVariants.length > 0) {
        newCombinations = newCombinations.map(combo => {
          // Find a matching variant
          const matchingVariant = existingVariants.find(variant => {
            if (!variant.options) return false;
            
            // Check if all option-value pairs match
            const allOptionsMatch = Object.entries(combo.options).every(([optionId, valueId]) => {
              return variant.options?.some(opt => 
                opt.option_id === optionId && opt.value_id === valueId
              );
            });
            
            // Check if variant has exactly the same number of options
            return allOptionsMatch && variant.options.length === Object.keys(combo.options).length;
          });
          
          if (matchingVariant) {
            return {
              ...combo,
              variant: matchingVariant,
              isAvailable: matchingVariant.is_available
            };
          }
          
          return combo;
        });
      }
      
      setCombinations(newCombinations);
    } catch (error) {
      console.error("Error generating combinations:", error);
      toast({
        title: "Erro ao gerar combinações",
        description: "Ocorreu um erro ao gerar as combinações de variantes.",
        variant: "destructive",
      });
    } finally {
      setGeneratingVariants(false);
    }
  };

  const createVariants = async () => {
    if (!productId || combinations.length === 0) return;
    
    setGeneratingVariants(true);
    
    try {
      const newVariants: ProductVariant[] = [];
      
      // Process each combination
      for (const combo of combinations) {
        // Skip if variant already exists
        if (combo.variant) {
          newVariants.push(combo.variant);
          continue;
        }
        
        // Create new variant
        const { data: variantData, error: variantError } = await supabase
          .from("product_variants")
          .insert({
            product_id: productId,
            user_id: userId,
            is_available: false
          })
          .select()
          .single();
          
        if (variantError) throw variantError;
        
        if (variantData) {
          const newVariant: ProductVariant = variantData;
          newVariant.options = [];
          
          // Create variant options
          for (const [optionId, valueId] of Object.entries(combo.options)) {
            const { data: optionData, error: optionError } = await supabase
              .from("product_variant_options")
              .insert({
                variant_id: newVariant.id,
                option_id: optionId,
                value_id: valueId
              })
              .select()
              .single();
              
            if (optionError) throw optionError;
            
            if (optionData) {
              newVariant.options.push({
                ...optionData,
                option_name: combo.optionNames[optionId],
                value_name: combo.valueNames[valueId]
              });
            }
          }
          
          newVariants.push(newVariant);
          
          // Update the combination with the new variant
          combo.variant = newVariant;
          combo.isAvailable = newVariant.is_available;
        }
      }
      
      setVariants(newVariants);
      if (onVariantsChange) onVariantsChange(newVariants);
      
      toast({
        title: "Variantes geradas",
        description: `${newVariants.length} variantes foram geradas com sucesso.`,
      });
    } catch (error: any) {
      console.error("Error creating variants:", error);
      toast({
        title: "Erro ao criar variantes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGeneratingVariants(false);
    }
  };

  const toggleVariantAvailability = async (combo: VariantCombination) => {
    if (!combo.variant) return;
    
    try {
      const newIsAvailable = !combo.isAvailable;
      
      // Update in database
      const { error } = await supabase
        .from("product_variants")
        .update({ is_available: newIsAvailable })
        .eq("id", combo.variant.id);
        
      if (error) throw error;
      
      // Update in state
      setCombinations(combinations.map(c => {
        if (c.variant?.id === combo.variant?.id) {
          return {
            ...c,
            isAvailable: newIsAvailable,
            variant: {
              ...c.variant,
              is_available: newIsAvailable
            }
          };
        }
        return c;
      }));
      
      // Update variants state
      setVariants(variants.map(v => {
        if (v.id === combo.variant?.id) {
          return {
            ...v,
            is_available: newIsAvailable
          };
        }
        return v;
      }));
      
      if (onVariantsChange) onVariantsChange(variants);
    } catch (error: any) {
      console.error("Error toggling variant availability:", error);
      toast({
        title: "Erro ao atualizar disponibilidade",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateVariantDetails = async (
    variant: ProductVariant,
    sku: string | null,
    price: number | null,
    imageUrl: string | null
  ) => {
    try {
      // Update in database
      const { error } = await supabase
        .from("product_variants")
        .update({
          sku,
          price,
          image_url: imageUrl
        })
        .eq("id", variant.id);
        
      if (error) throw error;
      
      // Update in state
      setVariants(variants.map(v => {
        if (v.id === variant.id) {
          return {
            ...v,
            sku,
            price,
            image_url: imageUrl
          };
        }
        return v;
      }));
      
      // Update combinations state
      setCombinations(combinations.map(c => {
        if (c.variant?.id === variant.id) {
          return {
            ...c,
            variant: {
              ...c.variant,
              sku,
              price,
              image_url: imageUrl
            }
          };
        }
        return c;
      }));
      
      if (onVariantsChange) onVariantsChange(variants);
      
      toast({
        title: "Variante atualizada",
        description: "Os detalhes da variante foram atualizados com sucesso.",
      });
    } catch (error: any) {
      console.error("Error updating variant details:", error);
      toast({
        title: "Erro ao atualizar variante",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const setAllVariantsAvailability = async (available: boolean) => {
    if (variants.length === 0) return;
    
    try {
      // Update all variants in database
      const { error } = await supabase
        .from("product_variants")
        .update({ is_available: available })
        .eq("product_id", productId);
        
      if (error) throw error;
      
      // Update in state
      setVariants(variants.map(v => ({
        ...v,
        is_available: available
      })));
      
      setCombinations(combinations.map(c => ({
        ...c,
        isAvailable: available,
        variant: c.variant ? {
          ...c.variant,
          is_available: available
        } : undefined
      })));
      
      if (onVariantsChange) onVariantsChange(variants);
      
      toast({
        title: available ? "Todas variantes disponíveis" : "Todas variantes indisponíveis",
        description: `Todas as variantes foram marcadas como ${available ? 'disponíveis' : 'indisponíveis'}.`,
      });
    } catch (error: any) {
      console.error("Error setting all variants availability:", error);
      toast({
        title: "Erro ao atualizar disponibilidade",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openVariantDetails = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setVariantDialogOpen(true);
  };

  // Render grid view (for 2 options)
  const renderGridView = () => {
    if (gridOptions.length < 2 || !gridOptions[0].values || !gridOptions[1].values) {
      return (
        <div className="text-center py-6">
          <p className="text-muted-foreground">
            É necessário ter pelo menos 2 opções com valores para visualizar em grade.
          </p>
        </div>
      );
    }

    const option1 = gridOptions[0];
    const option2 = gridOptions[1];

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left border"></th>
              {option2.values.map(value => (
                <th key={value.id} className="p-2 text-center border bg-muted/30 font-medium">
                  {value.value}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {option1.values.map(value1 => (
              <tr key={value1.id}>
                <th className="p-2 text-left border bg-muted/30 font-medium">
                  {value1.value}
                </th>
                {option2.values.map(value2 => {
                  // Find the combination for this cell
                  const combo = combinations.find(c => 
                    c.options[option1.id] === value1.id && 
                    c.options[option2.id] === value2.id
                  );
                  
                  if (!combo) return <td key={value2.id} className="p-2 border"></td>;
                  
                  return (
                    <td key={value2.id} className="p-2 border text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Switch
                          checked={combo.isAvailable}
                          onCheckedChange={() => toggleVariantAvailability(combo)}
                          disabled={!combo.variant}
                        />
                        {combo.variant && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={() => openVariantDetails(combo.variant!)}
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            Detalhes
                          </Button>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render list view (for any number of options)
  const renderListView = () => {
    return (
      <div className="space-y-2">
        {combinations.map((combo, index) => (
          <div 
            key={index} 
            className={`p-3 border rounded-md flex items-center justify-between ${
              combo.isAvailable ? 'bg-primary/5 border-primary/20' : ''
            }`}
          >
            <div className="flex-1">
              <div className="flex flex-wrap gap-1 mb-1">
                {Object.entries(combo.options).map(([optionId, valueId]) => (
                  <Badge key={optionId} variant="outline">
                    {combo.optionNames[optionId]}: {combo.valueNames[valueId]}
                  </Badge>
                ))}
              </div>
              {combo.variant && combo.variant.sku && (
                <p className="text-xs text-muted-foreground">
                  SKU: {combo.variant.sku}
                </p>
              )}
              {combo.variant && combo.variant.price && (
                <p className="text-xs text-muted-foreground">
                  Preço: R$ {combo.variant.price.toFixed(2)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={combo.isAvailable}
                onCheckedChange={() => toggleVariantAvailability(combo)}
                disabled={!combo.variant}
              />
              {combo.variant && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openVariantDetails(combo.variant!)}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Detalhes
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Variant details dialog
  const renderVariantDetailsDialog = () => {
    if (!selectedVariant) return null;
    
    const [sku, setSku] = useState<string | null>(selectedVariant.sku);
    const [price, setPrice] = useState<number | null>(selectedVariant.price);
    const [imageUrl, setImageUrl] = useState<string | null>(selectedVariant.image_url);
    
    return (
      <Dialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Variante</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <h3 className="font-medium mb-2">Combinação</h3>
              <div className="flex flex-wrap gap-1">
                {selectedVariant.options?.map((opt, idx) => (
                  <Badge key={idx} variant="secondary">
                    {opt.option_name}: {opt.value_name}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sku">SKU (opcional)</Label>
              <Input
                id="sku"
                value={sku || ""}
                onChange={(e) => setSku(e.target.value || null)}
                placeholder="SKU da variante"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Preço (opcional)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price || ""}
                onChange={(e) => setPrice(e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="Preço específico da variante"
              />
              <p className="text-xs text-muted-foreground">
                Se não informado, será usado o preço base do produto.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">Imagem (opcional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="image"
                  value={imageUrl || ""}
                  onChange={(e) => setImageUrl(e.target.value || null)}
                  placeholder="URL da imagem"
                />
                <Button variant="outline" size="icon">
                  <ImagePlus className="h-4 w-4" />
                </Button>
              </div>
              {imageUrl && (
                <div className="mt-2 border rounded-md p-2 flex justify-center">
                  <img 
                    src={imageUrl} 
                    alt="Imagem da variante" 
                    className="max-h-40 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/400x400?text=Imagem+inválida";
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button 
              onClick={() => {
                updateVariantDetails(selectedVariant, sku, price, imageUrl);
                setVariantDialogOpen(false);
              }}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Variantes de Produto</h3>
        <p className="text-sm text-muted-foreground">
          Gerencie as combinações de opções disponíveis.
        </p>
      </div>

      <Card className="p-6 space-y-6">
        {productOptions.length === 0 ? (
          <div className="py-8 text-center border border-dashed rounded-md">
            <p className="text-muted-foreground mb-4">
              Nenhuma opção configurada. Adicione opções na aba "Opções" primeiro.
            </p>
            <Button variant="outline" disabled>
              Gerar variantes
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h4 className="font-medium">Matriz de Variantes</h4>
                <p className="text-sm text-muted-foreground">
                  {combinations.length} combinações possíveis
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => createVariants()}
                  disabled={generatingVariants || loading || productOptions.length === 0}
                >
                  {generatingVariants ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Gerar variantes
                </Button>
                
                <div className="flex border rounded-md overflow-hidden">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="sm"
                    className="rounded-none px-3"
                    onClick={() => setViewMode("grid")}
                    disabled={productOptions.length < 2}
                  >
                    <Grid2X2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="sm"
                    className="rounded-none px-3"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Bulk actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAllVariantsAvailability(true)}
                disabled={variants.length === 0}
              >
                <Check className="h-4 w-4 mr-1" />
                Marcar todas disponíveis
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAllVariantsAvailability(false)}
                disabled={variants.length === 0}
              >
                <X className="h-4 w-4 mr-1" />
                Marcar todas indisponíveis
              </Button>
            </div>
            
            {loading ? (
              <div className="py-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Carregando variantes...</p>
              </div>
            ) : combinations.length === 0 ? (
              <div className="py-8 text-center border border-dashed rounded-md">
                <p className="text-muted-foreground">
                  Nenhuma combinação disponível. Adicione valores às opções primeiro.
                </p>
              </div>
            ) : (
              <div className="pt-4">
                {viewMode === "grid" && productOptions.length >= 2 ? renderGridView() : renderListView()}
              </div>
            )}
          </>
        )}
      </Card>
      
      {renderVariantDetailsDialog()}
    </div>
  );
}
