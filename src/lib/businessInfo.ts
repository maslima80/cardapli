import { supabase } from "@/integrations/supabase/client";

// Business Info Types
export type BusinessInfoType =
  | 'how_to_buy'
  | 'delivery'
  | 'pickup'
  | 'shipping'
  | 'payment'
  | 'guarantee'
  | 'custom';

export type BusinessInfoScope = 'global' | 'category' | 'tag' | 'product';

export interface BusinessInfoSection {
  id: string;
  user_id: string;
  type: BusinessInfoType;
  scope: BusinessInfoScope;
  scope_id?: string | null;
  title?: string | null;
  content_md?: string | null;
  items?: { icon?: string; title: string; description?: string }[] | null;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  user_id: string;
  name: string;
  message: string;
  image_url?: string | null;
  rating?: number | null;
  scope: BusinessInfoScope;
  scope_id?: string | null;
  published: boolean;
  created_at: string;
}

// Helper: Upsert business info section
export async function upsertBusinessInfo(
  type: BusinessInfoType,
  scope: BusinessInfoScope = 'global',
  scopeId: string | undefined,
  data: { title?: string; items?: any[] | any; content_md?: string }
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const payload = {
    user_id: user.id,
    type,
    scope,
    scope_id: scopeId || null,
    title: data.title,
    items: data.items,
    content_md: data.content_md,
    updated_at: new Date().toISOString(),
  };

  const { data: result, error } = await supabase
    .from('business_info_sections')
    .upsert(payload, { 
      onConflict: 'user_id,type,scope,scope_id',
      ignoreDuplicates: false 
    })
    .select()
    .single();

  if (error) throw error;
  return result as BusinessInfoSection;
}

// Helper: List business info sections
export async function listBusinessInfo(type?: BusinessInfoType, scope?: BusinessInfoScope) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  let query = supabase
    .from('business_info_sections')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (type) query = query.eq('type', type);
  if (scope) query = query.eq('scope', scope);

  const { data, error } = await query;
  if (error) throw error;
  return data as BusinessInfoSection[];
}

// Helper: Get single business info section
export async function getBusinessInfo(type: BusinessInfoType, scope: BusinessInfoScope = 'global', scopeId?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  let query = supabase
    .from('business_info_sections')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', type)
    .eq('scope', scope);

  if (scopeId) {
    query = query.eq('scope_id', scopeId);
  } else {
    query = query.is('scope_id', null);
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data as BusinessInfoSection | null;
}

// Helper: Delete business info section
export async function deleteBusinessInfo(id: string) {
  const { error } = await supabase
    .from('business_info_sections')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Testimonials helpers
export async function upsertTestimonial(row: Partial<Testimonial>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const payload = {
    user_id: user.id,
    scope: 'global' as BusinessInfoScope,
    published: true,
    ...row,
  };

  const { data, error } = await supabase
    .from('testimonials')
    .upsert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as Testimonial;
}

export async function listTestimonials(scope?: BusinessInfoScope, scopeId?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  let query = supabase
    .from('testimonials')
    .select('*')
    .eq('user_id', user.id)
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (scope) query = query.eq('scope', scope);
  if (scopeId) query = query.eq('scope_id', scopeId);

  const { data, error } = await query;
  if (error) throw error;
  return data as Testimonial[];
}

export async function deleteTestimonial(id: string) {
  const { error } = await supabase
    .from('testimonials')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Helper: Check if business info exists
export async function hasBusinessInfo(type: BusinessInfoType, scope: BusinessInfoScope = 'global', scopeId?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  let query = supabase
    .from('business_info_sections')
    .select('id')
    .eq('user_id', user.id)
    .eq('type', type)
    .eq('scope', scope)
    .limit(1);

  if (scopeId) {
    query = query.eq('scope_id', scopeId);
  } else {
    query = query.is('scope_id', null);
  }

  const { data, error } = await query.maybeSingle();
  if (error) return false;
  return !!data;
}

// Helper: Get display names for business info types (Portuguese)
export const businessInfoTypeLabels: Record<BusinessInfoType, { icon: string; title: string; description: string }> = {
  how_to_buy: {
    icon: '🛒',
    title: 'Como Comprar',
    description: 'Passo a passo da compra',
  },
  delivery: {
    icon: '🚚',
    title: 'Entrega & Retirada',
    description: 'Áreas atendidas, prazos e horários',
  },
  pickup: {
    icon: '📍',
    title: 'Retirada no Local',
    description: 'Endereço e horários de retirada',
  },
  shipping: {
    icon: '📦',
    title: 'Envio (Correios/Transportadora)',
    description: 'Informações sobre envio',
  },
  payment: {
    icon: '💳',
    title: 'Pagamentos',
    description: 'Pix, MB Way, cartão',
  },
  guarantee: {
    icon: '🛡️',
    title: 'Garantia / Política',
    description: 'Troca e devoluções',
  },
  custom: {
    icon: '📝',
    title: 'Personalizado',
    description: 'Informação customizada',
  },
};
