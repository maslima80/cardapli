import { supabase } from "@/integrations/supabase/client";

export interface OptionValue {
  id: string;
  label: string;
  sort: number;
}

export interface ProductOption {
  id: string;
  name: string;
  sort: number;
  values: OptionValue[];
}

export interface ProductVariant {
  id: string;
  sku: string | null;
  price: number | null;
  is_available: boolean;
  image_url: string | null;
  combination: Record<string, string>; // optionId -> valueId
}

export interface VariantsData {
  options: ProductOption[];
  variants: ProductVariant[];
}

/**
 * Fetch and build variants data for a product
 */
export async function buildVariants(productId: string): Promise<VariantsData> {
  try {
    // 1. Fetch product options
    const { data: options, error: optionsError } = await supabase
      .from("product_options")
      .select("id, name, sort")
      .eq("product_id", productId)
      .order("sort", { ascending: true });

    if (optionsError) throw optionsError;

    if (!options || options.length === 0) {
      return { options: [], variants: [] };
    }

    // 2. Fetch option values for all options
    const optionIds = options.map(o => o.id);
    const { data: values, error: valuesError } = await supabase
      .from("product_option_values")
      .select("id, option_id, value, sort")
      .in("option_id", optionIds)
      .order("sort", { ascending: true });

    if (valuesError) throw valuesError;

    // 3. Build options with their values
    const productOptions: ProductOption[] = options.map(option => ({
      id: option.id,
      name: option.name,
      sort: option.sort,
      values: (values || [])
        .filter(v => v.option_id === option.id)
        .map(v => ({
          id: v.id,
          label: v.value,
          sort: v.sort,
        })),
    }));

    // 4. Fetch variants
    const { data: variants, error: variantsError } = await supabase
      .from("product_variants")
      .select(`
        id,
        sku,
        price,
        is_available,
        image_url,
        product_variant_options (
          value_id
        )
      `)
      .eq("product_id", productId);

    if (variantsError) throw variantsError;

    // 5. Build variants with their combinations
    const productVariants: ProductVariant[] = (variants || []).map(variant => {
      const combination: Record<string, string> = {};
      
      // Map each variant option to its option_id -> value_id
      if (variant.product_variant_options) {
        for (const variantOption of variant.product_variant_options) {
          const valueId = variantOption.value_id;
          // Find which option this value belongs to
          const value = values?.find(v => v.id === valueId);
          if (value) {
            combination[value.option_id] = valueId;
          }
        }
      }

      return {
        id: variant.id,
        sku: variant.sku,
        price: variant.price,
        is_available: variant.is_available,
        image_url: variant.image_url,
        combination,
      };
    });

    return {
      options: productOptions,
      variants: productVariants,
    };
  } catch (error) {
    console.error("Error building variants:", error);
    return { options: [], variants: [] };
  }
}

/**
 * Find a variant that matches the selected combination
 */
export function findMatchingVariant(
  variants: ProductVariant[],
  selectedCombination: Record<string, string>
): ProductVariant | null {
  return variants.find(variant => {
    // Check if all keys in selectedCombination match the variant's combination
    return Object.keys(selectedCombination).every(
      optionId => variant.combination[optionId] === selectedCombination[optionId]
    );
  }) || null;
}

/**
 * Get price range from variants
 */
export function getPriceRange(variants: ProductVariant[], basePrice: number | null): {
  min: number | null;
  max: number | null;
  hasRange: boolean;
} {
  const prices = variants
    .map(v => v.price || basePrice)
    .filter((p): p is number => p !== null);

  if (prices.length === 0) {
    return { min: basePrice, max: basePrice, hasRange: false };
  }

  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return {
    min,
    max,
    hasRange: min !== max,
  };
}
