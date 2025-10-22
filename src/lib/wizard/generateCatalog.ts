import { WizardState } from "./types";

export async function generateCatalogFromWizard(
  supabase: any,
  userId: string,
  profile: any,
  state: WizardState
): Promise<{ pageId: string; catalogId: string }> {
  
  // 1. Create the catalog (page) with unique slug
  let baseSlug = generateSlug(state.title);
  let slug = baseSlug;
  let attempt = 0;
  let catalog = null;
  let catalogError = null;

  // Try to insert with unique slug (handle conflicts)
  while (attempt < 10) {
    const result = await supabase
      .from("catalogs")
      .insert({
        user_id: userId,
        title: state.title,
        slug: slug,
        status: "publicado",
        link_ativo: true,
        settings: {
          use_brand_colors: true,
          show_whatsapp_bubble: false,
          show_bottom_navigation: false,
        },
      })
      .select()
      .single();

    catalog = result.data;
    catalogError = result.error;

    // If successful, break
    if (!catalogError) break;

    // If it's a slug conflict, try with a suffix
    if (catalogError?.code === '23505' && catalogError?.message?.includes('catalogs_user_slug_idx')) {
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    } else {
      // Other error, throw it
      throw catalogError;
    }
  }

  if (catalogError) throw catalogError;
  if (!catalog) throw new Error('Failed to create catalog after multiple attempts');

  const blocksToInsert: any[] = [];
  let currentSort = 0;

  // 2. Cover Block (sort: 0)
  const coverData: any = {
    title: state.title.trim(),
    subtitle: state.description.trim() || '',
    layout: state.coverLayout,
    align: 'center',
    use_profile_logo: state.showLogo,
    logo_url: state.showLogo ? profile.logo_url : null,
  };

  if (state.coverLayout === 'carousel-top' && state.coverImages) {
    coverData.images = state.coverImages;
  } else {
    coverData.image_url = state.coverImage || '';
  }

  blocksToInsert.push({
    catalog_id: catalog.id,
    type: 'cover',
    sort: currentSort,
    visible: true,
    anchor_slug: generateAnchorSlug('cover', currentSort),
    data: coverData,
  });
  currentSort++;

  // 3. About Block (if selected)
  if (state.autoSections.about) {
    blocksToInsert.push({
      catalog_id: catalog.id,
      type: 'about_business',
      sort: currentSort,
      visible: true,
      anchor_slug: generateAnchorSlug('about', currentSort),
      data: {
        use_profile: true,
        title: 'Sobre o Negócio',
      },
    });
    currentSort++;
  }

  // 4. Product Sections
  if (state.mode === 'products') {
    // Simple product grid for "few products" mode
    blocksToInsert.push({
      catalog_id: catalog.id,
      type: 'product_grid',
      sort: currentSort,
      visible: true,
      anchor_slug: generateAnchorSlug('products', currentSort),
      data: {
        source_type: 'manual',
        selected_product_ids: state.selectedIds,
        layout: state.productLayout,
        show_price: true,
        show_tags: false,
        show_button: true,
        limit: state.selectedIds.length,
      },
    });
    currentSort++;
  } else if (state.mode === 'categories') {
    // For each category: section cover + product grid
    for (const category of state.selectedIds) {
      const categoryProducts = (state.allProducts || []).filter((p: any) => {
        if (p.category === category) return true;
        const cats = p.categories;
        if (Array.isArray(cats) && cats.includes(category)) return true;
        if (cats && typeof cats === 'object' && Object.values(cats).includes(category)) return true;
        return false;
      });

      if (categoryProducts.length === 0) continue;

      const firstImage = categoryProducts[0]?.photos?.[0]?.url || 
                         categoryProducts[0]?.photos?.[0]?.image_url;

      // Category cover
      blocksToInsert.push({
        catalog_id: catalog.id,
        type: 'cover',
        sort: currentSort,
        visible: true,
        anchor_slug: generateAnchorSlug('category-cover', currentSort),
        data: {
          title: category,
          subtitle: `${categoryProducts.length} produto${categoryProducts.length !== 1 ? 's' : ''}`,
          layout: 'full-background', // Premium background image layout
          align: 'center',
          image_url: firstImage || '',
        },
      });
      currentSort++;

      // Category products
      blocksToInsert.push({
        catalog_id: catalog.id,
        type: 'product_grid',
        sort: currentSort,
        visible: true,
        anchor_slug: generateAnchorSlug('category-products', currentSort),
        data: {
          source_type: 'manual',
          selected_product_ids: categoryProducts.map((p: any) => p.id),
          layout: state.productLayout,
          show_price: true,
          show_tags: false,
          show_button: true,
          limit: categoryProducts.length,
        },
      });
      currentSort++;
    }
  } else if (state.mode === 'tags') {
    // For each tag: section cover + product grid
    for (const tag of state.selectedIds) {
      const tagProducts = (state.allProducts || []).filter((p: any) => {
        const productTags = p.quality_tags;
        if (typeof productTags === 'string') {
          return productTags.split(',').map((t: string) => t.trim()).includes(tag);
        }
        if (Array.isArray(productTags)) {
          return productTags.includes(tag);
        }
        return false;
      });

      if (tagProducts.length === 0) continue;

      const firstImage = tagProducts[0]?.photos?.[0]?.url || 
                         tagProducts[0]?.photos?.[0]?.image_url;

      // Tag cover
      blocksToInsert.push({
        catalog_id: catalog.id,
        type: 'cover',
        sort: currentSort,
        visible: true,
        anchor_slug: generateAnchorSlug('tag-cover', currentSort),
        data: {
          title: tag,
          subtitle: `${tagProducts.length} produto${tagProducts.length !== 1 ? 's' : ''}`,
          layout: 'full-background', // Premium background image layout
          align: 'center',
          image_url: firstImage || '',
        },
      });
      currentSort++;

      // Tag products
      blocksToInsert.push({
        catalog_id: catalog.id,
        type: 'product_grid',
        sort: currentSort,
        visible: true,
        anchor_slug: generateAnchorSlug('tag-products', currentSort),
        data: {
          source_type: 'manual',
          selected_product_ids: tagProducts.map((p: any) => p.id),
          layout: state.productLayout,
          show_price: true,
          show_tags: false,
          show_button: true,
          limit: tagProducts.length,
        },
      });
      currentSort++;
    }
  }

  // 5. Specialized Business Info Blocks
  // How to Buy (steps block)
  if (state.autoSections.how_to_buy) {
    blocksToInsert.push({
      catalog_id: catalog.id,
      type: 'how_to_buy',
      sort: currentSort,
      visible: true,
      anchor_slug: generateAnchorSlug('how-to-buy', currentSort),
      data: {
        mode: 'auto',
        auto: {
          scope: 'global',
          fallback_to_global: true,
        },
        snapshot: {
          sync: true, // Live by default
        },
        design: {
          accent: 'brand',
          frame: true,
          bg: 'soft',
        },
      },
    });
    currentSort++;
  }

  // Delivery & Pickup (merged card)
  if (state.autoSections.delivery || state.autoSections.pickup) {
    blocksToInsert.push({
      catalog_id: catalog.id,
      type: 'delivery_pickup',
      sort: currentSort,
      visible: true,
      anchor_slug: generateAnchorSlug('delivery-pickup', currentSort),
      data: {
        mode: 'auto',
        auto: {
          scope: 'global',
          fallback_to_global: true,
        },
        snapshot: {
          sync: true,
        },
        design: {
          style: 'card',
          icon: 'truck',
          frame: true,
        },
      },
    });
    currentSort++;
  }

  // Shipping (card)
  if (state.autoSections.shipping) {
    blocksToInsert.push({
      catalog_id: catalog.id,
      type: 'shipping_info',
      sort: currentSort,
      visible: true,
      anchor_slug: generateAnchorSlug('shipping', currentSort),
      data: {
        mode: 'auto',
        auto: {
          scope: 'global',
          fallback_to_global: true,
        },
        snapshot: {
          sync: true,
        },
        design: {
          style: 'card',
          icon: 'package',
          frame: true,
        },
      },
    });
    currentSort++;
  }

  // Payment (badges + terms)
  if (state.autoSections.payment) {
    blocksToInsert.push({
      catalog_id: catalog.id,
      type: 'payments_info',
      sort: currentSort,
      visible: true,
      anchor_slug: generateAnchorSlug('payments', currentSort),
      data: {
        mode: 'auto',
        auto: {
          scope: 'global',
          fallback_to_global: true,
        },
        snapshot: {
          sync: true,
        },
        design: {
          style: 'badges_card',
          frame: true,
        },
      },
    });
    currentSort++;
  }

  // Guarantee / Policy (policy card)
  if (state.autoSections.guarantee) {
    blocksToInsert.push({
      catalog_id: catalog.id,
      type: 'policy_info',
      sort: currentSort,
      visible: true,
      anchor_slug: generateAnchorSlug('policy', currentSort),
      data: {
        mode: 'auto',
        auto: {
          scope: 'global',
          fallback_to_global: true,
        },
        snapshot: {
          sync: true,
        },
        design: {
          style: 'card',
          icon: 'shield-check',
          frame: true,
        },
      },
    });
    currentSort++;
  }

  // 6. Testimonials Block (if selected)
  if (state.autoSections.testimonials) {
    blocksToInsert.push({
      catalog_id: catalog.id,
      type: 'testimonials',
      sort: currentSort,
      visible: true,
      anchor_slug: generateAnchorSlug('testimonials', currentSort),
      data: {
        mode: 'auto',
        title: 'Depoimentos',
        subtitle: 'O que nossos clientes dizem',
        layout: 'grid',
        source: {
          scope: 'global',
          include_global_backfill: true,
          limit: 6,
        },
      },
    });
    currentSort++;
  }

  // 7. Location Block (if selected)
  if (state.autoSections.location) {
    blocksToInsert.push({
      catalog_id: catalog.id,
      type: 'location',
      sort: currentSort,
      visible: true,
      anchor_slug: generateAnchorSlug('location', currentSort),
      data: {
        use_profile: true,
        title: 'Localização',
      },
    });
    currentSort++;
  }

  // 8. Socials Block (if selected)
  if (state.autoSections.socials) {
    blocksToInsert.push({
      catalog_id: catalog.id,
      type: 'socials',
      sort: currentSort,
      visible: true,
      anchor_slug: generateAnchorSlug('socials', currentSort),
      data: {
        use_profile: true,
        title: 'Redes Sociais',
      },
    });
    currentSort++;
  }

  // Insert all blocks
  if (blocksToInsert.length > 0) {
    const { error: blocksError } = await supabase
      .from("catalog_blocks")
      .insert(blocksToInsert);

    if (blocksError) throw blocksError;
  }

  return {
    pageId: catalog.id,
    catalogId: catalog.id,
  };
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50);
}

function generateAnchorSlug(type: string, sort: number): string {
  return `${type}-${sort}-${Date.now()}`;
}
