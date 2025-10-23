export interface Product {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number | null;
  price_unit: string;
  price_unit_custom: string | null;
  price_note: string | null;
  min_qty: number | null;
  price_on_request: boolean;
  price_on_request_label: string;
  price_hidden: boolean;
  sku: string | null;
  status: string;
  production_days: number | null;
  accepts_customization: boolean;
  customization_instructions: string | null;
  ingredients: string | null;
  allergens: string | null;
  conservation: string | null;
  category: string | null;
  categories: string[] | null;
  quality_tags: string[] | null;
  variants: string[] | null;
  photos: any;
  external_media: any;
  created_at: string;
  updated_at: string;
}

export interface ProductOption {
  id: string;
  product_id: string;
  user_id: string;
  name: string;
  sort: number;
  created_at: string;
  values?: ProductOptionValue[];
}

export interface ProductOptionValue {
  id: string;
  option_id: string;
  user_id: string;
  value: string;
  sort: number;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  user_id: string;
  sku: string | null;
  price: number | null;
  is_available: boolean;
  image_url: string | null;
  combination_key: string | null;
  created_at: string;
  options?: ProductVariantOption[];
}

export interface ProductVariantOption {
  variant_id: string;
  option_id: string;
  value_id: string;
  option_name?: string;
  value_name?: string;
}

// Helper type for the variant matrix UI
export interface VariantCombination {
  options: { [key: string]: string }; // option_id: value_id
  optionNames: { [key: string]: string }; // option_id: option_name
  valueNames: { [key: string]: string }; // value_id: value_name
  variant?: ProductVariant;
  isAvailable: boolean;
}
