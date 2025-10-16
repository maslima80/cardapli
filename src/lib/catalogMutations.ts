import { supabase } from "@/integrations/supabase/client";

export interface CatalogUpdate {
  status?: "rascunho" | "publicado";
  link_ativo?: boolean;
  no_perfil?: boolean;
}

/**
 * Update catalog status (rascunho/publicado)
 */
export async function setCatalogStatus(
  catalogId: string,
  status: "rascunho" | "publicado"
) {
  const { data, error } = await supabase
    .from("catalogs")
    .update({ status })
    .eq("id", catalogId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Toggle catalog link (ativo/desativado)
 */
export async function setCatalogLink(
  catalogId: string,
  linkAtivo: boolean
) {
  const { data, error } = await supabase
    .from("catalogs")
    .update({ link_ativo: linkAtivo })
    .eq("id", catalogId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Toggle catalog on profile
 */
export async function setCatalogOnProfile(
  catalogId: string,
  noPerfil: boolean
) {
  const { data, error } = await supabase
    .from("catalogs")
    .update({ no_perfil: noPerfil })
    .eq("id", catalogId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Batch update catalog (for guardrails)
 * Example: { status: 'publicado', link_ativo: true, no_perfil: true }
 */
export async function batchUpdateCatalog(
  catalogId: string,
  updates: CatalogUpdate
) {
  const { data, error } = await supabase
    .from("catalogs")
    .update(updates)
    .eq("id", catalogId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Duplicate a catalog
 * Creates a copy with unique slug and resets states
 */
export async function duplicateCatalog(catalogId: string, userId: string) {
  // Get original catalog
  const { data: original, error: fetchError } = await supabase
    .from("catalogs")
    .select("*")
    .eq("id", catalogId)
    .single();

  if (fetchError) throw fetchError;

  // Generate unique slug
  const baseSlug = `${original.slug}-copia`;
  let slug = baseSlug;
  let counter = 1;

  // Check if slug exists
  while (true) {
    const { data: existing } = await supabase
      .from("catalogs")
      .select("id")
      .eq("user_id", userId)
      .eq("slug", slug)
      .single();

    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Create new catalog
  const { data: newCatalog, error: createError } = await supabase
    .from("catalogs")
    .insert({
      user_id: userId,
      title: `${original.title} (Cópia)`,
      description: original.description,
      slug,
      status: "rascunho",
      link_ativo: false,
      no_perfil: false,
      cover: original.cover,
    })
    .select()
    .single();

  if (createError) throw createError;

  // Copy catalog blocks
  const { data: blocks, error: blocksError } = await supabase
    .from("catalog_blocks")
    .select("*")
    .eq("catalog_id", catalogId);

  if (blocksError) throw blocksError;

  if (blocks && blocks.length > 0) {
    const newBlocks = blocks.map((block) => ({
      catalog_id: newCatalog.id,
      type: block.type,
      data: block.data,
      sort: block.sort,
    }));

    const { error: insertBlocksError } = await supabase
      .from("catalog_blocks")
      .insert(newBlocks);

    if (insertBlocksError) throw insertBlocksError;
  }

  return newCatalog;
}
