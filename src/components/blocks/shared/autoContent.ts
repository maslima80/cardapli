/**
 * Shared infrastructure for blocks that support auto/custom content modes
 * 
 * Auto mode: Pull content from /informacoes-negocio (business_info_sections table)
 * Custom mode: Use content defined directly in the block
 * 
 * Supports snapshots: freeze auto content at a point in time, with optional sync
 */

import { supabase } from "@/integrations/supabase/client";

export type AutoScope = 'global' | 'category' | 'tag' | 'product';

export interface AutoContentMixin<TContent> {
  mode: 'auto' | 'custom';
  auto?: {
    scope: AutoScope;
    scope_id?: string | null;
    fallback_to_global?: boolean;
  };
  custom?: TContent; // used when mode='custom'
  snapshot?: {
    content?: TContent | null;
    taken_at?: string;
    sync?: boolean; // if true, ignore snapshot and always live-resolve
  };
}

export type BusinessInfoType =
  | 'how_to_buy'
  | 'delivery'
  | 'pickup'
  | 'shipping'
  | 'payment'
  | 'guarantee';

export interface BusinessInfoData {
  items?: any[];
  content_md?: string;
  title?: string;
}

/**
 * Resolve business info content from the database
 * 
 * @param userId - The user ID to fetch content for
 * @param type - The type of business info to fetch
 * @param auto - Auto configuration (scope, scope_id, fallback)
 * @returns The resolved business info data or null if not found
 */
export async function resolveBusinessInfo(
  userId: string,
  type: BusinessInfoType,
  auto?: { scope: AutoScope; scope_id?: string | null; fallback_to_global?: boolean }
): Promise<BusinessInfoData | null> {
  if (!auto) return null;

  const tryFetch = async (scope: AutoScope, scope_id?: string | null) => {
    let q = supabase
      .from('business_info_sections')
      .select('items, content_md, title')
      .eq('user_id', userId)
      .eq('type', type)
      .eq('scope', scope)
      .limit(1);
    
    if (scope_id) {
      q = q.eq('scope_id', scope_id);
    } else {
      q = q.is('scope_id', null);
    }
    
    const { data } = await q.maybeSingle();
    return data ?? null;
  };

  // Try scoped first
  const scoped = await tryFetch(auto.scope, auto.scope_id ?? undefined);
  if (scoped) return scoped;

  // Fallback to global if enabled
  if (auto.fallback_to_global !== false && auto.scope !== 'global') {
    const global = await tryFetch('global');
    if (global) return global;
  }
  
  return null;
}

/**
 * Resolve content for a block with auto/custom mode support
 * 
 * @param userId - The user ID
 * @param type - The business info type
 * @param config - The auto content configuration
 * @returns The resolved content or null
 */
export async function resolveBlockContent<TContent>(
  userId: string,
  type: BusinessInfoType,
  config: AutoContentMixin<TContent>
): Promise<TContent | null> {
  // Custom mode: return custom content
  if (config.mode === 'custom') {
    return config.custom ?? null;
  }

  // Auto mode with snapshot
  if (config.snapshot) {
    // If sync is enabled, ignore snapshot and live-resolve
    if (config.snapshot.sync) {
      const data = await resolveBusinessInfo(userId, type, config.auto);
      return data as TContent | null;
    }
    
    // Use snapshot if available
    if (config.snapshot.content) {
      return config.snapshot.content;
    }
  }

  // Auto mode: live-resolve
  const data = await resolveBusinessInfo(userId, type, config.auto);
  return data as TContent | null;
}

/**
 * Create a snapshot of current auto content
 * 
 * @param userId - The user ID
 * @param type - The business info type
 * @param auto - Auto configuration
 * @returns Snapshot object with content and timestamp
 */
export async function createSnapshot<TContent>(
  userId: string,
  type: BusinessInfoType,
  auto?: { scope: AutoScope; scope_id?: string | null; fallback_to_global?: boolean }
): Promise<{ content: TContent | null; taken_at: string; sync: boolean }> {
  const content = await resolveBusinessInfo(userId, type, auto);
  
  return {
    content: content as TContent | null,
    taken_at: new Date().toISOString(),
    sync: false, // By default, snapshot is detached
  };
}
