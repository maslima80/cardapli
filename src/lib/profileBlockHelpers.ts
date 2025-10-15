import { supabase } from "@/integrations/supabase/client";

/**
 * Adds a catalog to the user's profile by updating the Catálogos block
 * Creates the block if it doesn't exist
 */
export async function addCatalogToProfile(userId: string, catalogId: string): Promise<boolean> {
  try {
    // Find existing Catálogos block
    const { data: blocks, error: fetchError } = await supabase
      .from("profile_blocks")
      .select("*")
      .eq("user_id", userId)
      .eq("type", "catalogs")
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 = no rows returned, which is fine
      throw fetchError;
    }

    if (blocks) {
      // Block exists - append catalog_id if not already present
      const currentIds = (blocks.data as any)?.catalog_ids || [];
      
      if (currentIds.includes(catalogId)) {
        // Already in the list
        return true;
      }

      const blockData = blocks.data as any;
      const { error: updateError } = await supabase
        .from("profile_blocks")
        .update({
          data: {
            ...blockData,
            catalog_ids: [...currentIds, catalogId],
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", blocks.id);

      if (updateError) throw updateError;
    } else {
      // Block doesn't exist - create it
      const { error: createError } = await supabase
        .from("profile_blocks")
        .insert({
          user_id: userId,
          type: "catalogs",
          data: {
            catalog_ids: [catalogId],
            layout: "grid",
            columns: 2,
          },
          sort: 999, // Add at the end
          visible: true,
        });

      if (createError) throw createError;
    }

    return true;
  } catch (error) {
    console.error("Error adding catalog to profile:", error);
    return false;
  }
}

/**
 * Removes a catalog from the user's profile by updating the Catálogos block
 */
export async function removeCatalogFromProfile(userId: string, catalogId: string): Promise<boolean> {
  try {
    // Find existing Catálogos block
    const { data: blocks, error: fetchError } = await supabase
      .from("profile_blocks")
      .select("*")
      .eq("user_id", userId)
      .eq("type", "catalogs")
      .single();

    if (fetchError) {
      // No block exists, nothing to remove
      return true;
    }

    const blockData = blocks.data as any;
    const currentIds = blockData?.catalog_ids || [];
    const newIds = currentIds.filter((id: string) => id !== catalogId);

    const { error: updateError } = await supabase
      .from("profile_blocks")
      .update({
        data: {
          ...blockData,
          catalog_ids: newIds,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", blocks.id);

    if (updateError) throw updateError;

    return true;
  } catch (error) {
    console.error("Error removing catalog from profile:", error);
    return false;
  }
}

/**
 * Checks if a catalog is in the user's profile
 */
export async function isCatalogInProfile(userId: string, catalogId: string): Promise<boolean> {
  try {
    const { data: blocks, error } = await supabase
      .from("profile_blocks")
      .select("data")
      .eq("user_id", userId)
      .eq("type", "catalogs")
      .single();

    if (error || !blocks) return false;

    const catalogIds = (blocks.data as any)?.catalog_ids || [];
    return catalogIds.includes(catalogId);
  } catch (error) {
    return false;
  }
}
