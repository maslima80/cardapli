import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductOption, ProductOptionValue, ProductVariant } from "@/types/product";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ProductVariantSelectorProps {
  productId: string;
  productCoverImage?: string;
  onVariantChange?: (variant: ProductVariant | null) => void;
  onVariantImageChange?: (imageUrl: string | null) => void;
}

export function ProductVariantSelector({ 
  productId, 
  productCoverImage,
  onVariantChange,
  onVariantImageChange
}: ProductVariantSelectorProps) {
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  useEffect(() => {
    if (productId) {
      loadOptionsAndVariants();
    }
  }, [productId]);

  useEffect(() => {
    // When product options change, update combinations
    if (options.length > 0 && variants.length > 0) {
      // Pre-select the first available option values
      const initialValues: Record<string, string> = {};
      
      // For each option, find the first available value
      for (const option of options) {
        if (option.values && option.values.length > 0) {
          // Find first value that is part of an available variant
          const availableValue = findFirstAvailableValue(option);
          if (availableValue) {
            initialValues[option.id] = availableValue.id;
          }
        }
      }
      
      setSelectedValues(initialValues);
    }
  }, [options, variants]);

  useEffect(() => {
    // When selected values change, find the matching variant
    if (Object.keys(selectedValues).length > 0) {
      findMatchingVariant();
    }
  }, [selectedValues]);

  // When selected variant changes, update the image if needed
  useEffect(() => {
    if (onVariantImageChange) {
      // If variant has an image, use it; otherwise use product cover
      const imageUrl = selectedVariant?.image_url || productCoverImage || null;
      onVariantImageChange(imageUrl);
    }
  }, [selectedVariant, productCoverImage]);

  const loadOptionsAndVariants = async () => {
    setLoading(true);
    
    try {
      // Load options
      const { data: optionsData, error: optionsError } = await supabase
        .from("product_options")
        .select("*")
        .eq("product_id", productId)
        .order("sort", { ascending: true });
        
      if (optionsError) throw optionsError;
      
      const loadedOptions: ProductOption[] = optionsData || [];
      
      // Load values for each option
      for (const option of loadedOptions) {
        const { data: valuesData, error: valuesError } = await supabase
          .from("product_option_values")
          .select("*")
          .eq("option_id", option.id)
          .order("sort", { ascending: true });
          
        if (valuesError) throw valuesError;
        
        option.values = valuesData || [];
      }
      
      // Load variants
      const { data: variantsData, error: variantsError } = await supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", productId)
        .eq("is_available", true);
        
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
      
      setOptions(loadedOptions);
      setVariants(loadedVariants);
    } catch (error) {
      console.error("Error loading product options and variants:", error);
    } finally {
      setLoading(false);
    }
  };

  const findFirstAvailableValue = (option: ProductOption): ProductOptionValue | undefined => {
    if (!option.values || option.values.length === 0) return undefined;
    
    // For the first option, just return the first value
    if (options.indexOf(option) === 0) {
      return option.values[0];
    }
    
    // For subsequent options, find a value that forms a valid combination with already selected values
    for (const value of option.values) {
      // Check if this value forms a valid combination with already selected values
      if (isValueAvailable(option.id, value.id)) {
        return value;
      }
    }
    
    return undefined;
  };

  const isValueAvailable = (optionId: string, valueId: string): boolean => {
    // Create a test selection with current selections plus this new value
    const testSelection = { ...selectedValues, [optionId]: valueId };
    
    // Check if there's at least one available variant that matches this selection
    return variants.some(variant => {
      if (!variant.options) return false;
      
      // Check if all selected options match this variant
      return Object.entries(testSelection).every(([optId, valId]) => {
        return variant.options?.some(opt => 
          opt.option_id === optId && opt.value_id === valId
        );
      });
    });
  };

  const getAvailableValuesForOption = (option: ProductOption): ProductOptionValue[] => {
    if (!option.values) return [];
    
    // For the first option, all values are available
    if (options.indexOf(option) === 0) {
      return option.values;
    }
    
    // For subsequent options, filter values based on what's available
    return option.values.filter(value => isValueAvailable(option.id, value.id));
  };

  const handleOptionChange = (optionId: string, valueId: string) => {
    // Update the selected value for this option
    const newSelectedValues = { ...selectedValues, [optionId]: valueId };
    
    // For each subsequent option, check if the current selection is still valid
    // If not, update it to the first available value
    const optionIndex = options.findIndex(o => o.id === optionId);
    
    if (optionIndex < options.length - 1) {
      // There are subsequent options to check
      for (let i = optionIndex + 1; i < options.length; i++) {
        const nextOption = options[i];
        const currentValueId = newSelectedValues[nextOption.id];
        
        // If the current value is not available with the new selection, update it
        if (!currentValueId || !isValueAvailable(nextOption.id, currentValueId)) {
          const availableValues = getAvailableValuesForOption(nextOption);
          if (availableValues.length > 0) {
            newSelectedValues[nextOption.id] = availableValues[0].id;
          } else {
            // No available values for this option, clear the selection
            delete newSelectedValues[nextOption.id];
          }
        }
      }
    }
    
    setSelectedValues(newSelectedValues);
  };

  const findMatchingVariant = () => {
    // Check if we have selected values for all options
    if (Object.keys(selectedValues).length !== options.length) {
      setSelectedVariant(null);
      if (onVariantChange) onVariantChange(null);
      return;
    }
    
    // Find a variant that matches all selected values
    const matchingVariant = variants.find(variant => {
      if (!variant.options) return false;
      
      // Check if all selected options match this variant
      return Object.entries(selectedValues).every(([optionId, valueId]) => {
        return variant.options?.some(opt => 
          opt.option_id === optionId && opt.value_id === valueId
        );
      });
    });
    
    setSelectedVariant(matchingVariant || null);
    if (onVariantChange) onVariantChange(matchingVariant || null);
  };

  if (loading) {
    return <div className="py-4">Carregando opções...</div>;
  }
  
  if (options.length === 0 || variants.length === 0) {
    return null; // No options or variants, don't render anything
  }

  return (
    <div className="space-y-4">
      {options.map((option) => {
        const availableValues = getAvailableValuesForOption(option);
        
        if (availableValues.length === 0) return null;
        
        return (
          <div key={option.id} className="space-y-2">
            <Label>{option.name}</Label>
            <Select
              value={selectedValues[option.id] || ""}
              onValueChange={(value) => handleOptionChange(option.id, value)}
              disabled={availableValues.length <= 1}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Selecione ${option.name.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {availableValues.map((value) => (
                  <SelectItem key={value.id} value={value.id}>
                    {value.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      })}
      
      {selectedVariant && selectedVariant.price && (
        <div className="mt-4 font-bold text-primary">
          Preço desta variante: R$ {selectedVariant.price.toFixed(2)}
        </div>
      )}
    </div>
  );
}
