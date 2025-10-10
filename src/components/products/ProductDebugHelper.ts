import { Product } from "@/pages/Produtos";

/**
 * Helper function to sanitize product data before sending to Supabase
 * This ensures all fields have the correct data types
 */
export function sanitizeProductData(data: Partial<Product>): Record<string, any> {
  return {
    // Required fields
    user_id: data.user_id,
    title: data.title || "",
    status: data.status || "Disponível",
    price_unit: data.price_unit || "Unidade",
    
    // Optional fields with defaults
    price: data.price ?? 0,
    description: data.description || null,
    price_unit_custom: data.price_unit_custom || null,
    price_note: data.price_note || null,
    min_qty: data.min_qty || null,
    price_on_request: data.price_on_request || false,
    price_on_request_label: data.price_on_request_label || null,
    price_hidden: data.price_hidden || false,
    sku: data.sku || null,
    production_days: data.production_days || null,
    accepts_customization: data.accepts_customization || false,
    customization_instructions: data.customization_instructions || null,
    ingredients: data.ingredients || null,
    allergens: data.allergens || null,
    conservation: data.conservation || null,
    
    // Category field (separate from categories array)
    category: data.category || null,
    
    // Array fields
    categories: Array.isArray(data.categories) ? data.categories : [],
    quality_tags: Array.isArray(data.quality_tags) ? data.quality_tags : [],
    variants: Array.isArray(data.variants) ? data.variants : [],
    
    // JSON fields
    option_groups: Array.isArray(data.option_groups) ? data.option_groups : [],
    disabled_combinations: Array.isArray(data.disabled_combinations) ? data.disabled_combinations : [],
    photos: Array.isArray(data.photos) ? data.photos : [],
    external_media: Array.isArray(data.external_media) ? data.external_media : [],
  };
}

/**
 * Helper function to log product data for debugging
 */
export function logProductData(data: Partial<Product>, action: "create" | "update"): void {
  console.group(`Product ${action} data:`);
  console.log("Title:", data.title);
  console.log("User ID:", data.user_id);
  console.log("Price:", data.price);
  console.log("Categories:", data.categories);
  console.log("Quality Tags:", data.quality_tags);
  console.log("Variants:", data.variants);
  console.log("Option Groups:", data.option_groups);
  console.log("Photos:", data.photos);
  console.log("External Media:", data.external_media);
  console.log("Full data:", data);
  console.groupEnd();
}
