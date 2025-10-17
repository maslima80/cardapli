import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BlockRendererPremium } from "@/components/catalog/BlockRendererPremium";
import { SectionNavigation } from "@/components/catalog/SectionNavigation";
import { SimpleThemeProvider } from "@/components/theme/SimpleThemeProvider";
import { WhatsAppBubble } from "@/components/WhatsAppBubble";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { useMetaTags } from "@/hooks/useMetaTags";
import { publicProfileUrl, publicCatalogFullUrl } from "@/lib/urls";

const PublicCatalogPage = () => {
  const { userSlug, catalogSlug } = useParams();
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");
  const tag = searchParams.get("tag");
  const hasFilters = category || tag;
  
  const [loading, setLoading] = useState(true);
  const [catalog, setCatalog] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [unavailable, setUnavailable] = useState(false);

  // Debug logging to verify route matching
  console.log('PublicCatalogPage params:', { userSlug, catalogSlug });

  useEffect(() => {
    loadCatalog();
  }, [userSlug, catalogSlug]);

  const loadCatalog = async () => {
    try {
      // Get profile by slug
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("slug", userSlug)
        .single();

      if (profileError || !profileData) {
        console.error('Profile not found:', { userSlug, profileError });
        setUnavailable(true);
        setLoading(false);
        return;
      }

      console.log('Profile found:', profileData);

      // Get catalog by user_id and catalog slug
      const { data: catalogData, error: catalogError } = await supabase
        .from("catalogs")
        .select("*")
        .eq("user_id", profileData.id)
        .eq("slug", catalogSlug)
        .single();

      if (catalogError || !catalogData) {
        console.error('Catalog not found:', { catalogSlug, catalogError });
        setUnavailable(true);
        setLoading(false);
        return;
      }

      console.log('Catalog found:', catalogData);

      // Check if catalog is accessible
      // Status must be 'publicado' or old 'public'/'unlisted'
      const isPublished = catalogData.status === "publicado" || 
                         catalogData.status === "public" || 
                         catalogData.status === "unlisted";
      
      // Link must be active (or undefined for backward compat with old catalogs)
      const linkActive = catalogData.link_ativo !== false;

      console.log("Catalog access check:", {
        status: catalogData.status,
        link_ativo: catalogData.link_ativo,
        isPublished,
        linkActive,
        willShow: isPublished && linkActive
      });

      if (!isPublished || !linkActive) {
        setUnavailable(true);
        setLoading(false);
        return;
      }

      // Get blocks
      const { data: blocksData } = await supabase
        .from("catalog_blocks")
        .select("*")
        .eq("catalog_id", catalogData.id)
        .eq("visible", true)
        .order("sort", { ascending: true });

      setCatalog(catalogData);
      setBlocks(blocksData || []);
      setProfile(profileData);
      
      // If filters exist, load and filter products
      if (hasFilters) {
        const { data: productsData } = await supabase
          .from("products")
          .select("*")
          .eq("user_id", profileData.id);
        
        let filteredProducts = productsData || [];
        
        if (category) {
          filteredProducts = filteredProducts.filter((product) => {
            if (!product.categories) return false;
            const categories = Array.isArray(product.categories) 
              ? product.categories 
              : (typeof product.categories === 'string' ? JSON.parse(product.categories || "[]") : []);
            return Array.isArray(categories) && categories.includes(category);
          });
        }
        
        if (tag) {
          filteredProducts = filteredProducts.filter((product) => {
            if (!product.quality_tags) return false;
            const tags = Array.isArray(product.quality_tags)
              ? product.quality_tags
              : (typeof product.quality_tags === 'string' ? JSON.parse(product.quality_tags || "[]") : []);
            return Array.isArray(tags) && tags.includes(tag);
          });
        }
        
        setProducts(filteredProducts);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error loading catalog:", error);
      setUnavailable(true);
      setLoading(false);
    }
  };

  // Set meta tags for SEO and social sharing
  const catalogUrl = catalog && profile 
    ? publicCatalogFullUrl(profile.slug, catalog.slug)
    : undefined;

  const coverImageUrl = catalog?.cover?.url || catalog?.cover?.image_url;
  const metaDescription = catalog?.description || profile?.slogan || "";
  const pageTitle = catalog?.title && profile?.business_name
    ? `${catalog.title} — ${profile.business_name}`
    : catalog?.title || "Cardapli";

  useMetaTags({
    title: pageTitle,
    description: metaDescription,
    image: coverImageUrl,
    url: catalogUrl,
    type: "website",
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando catálogo...</p>
        </div>
      </div>
    );
  }

  if (unavailable) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Catálogo indisponível</h1>
            <p className="text-muted-foreground mb-6">
              Este catálogo não está acessível no momento.
            </p>
          </div>
          
          {profile?.slug && profile?.business_name && (
            <Button asChild size="lg">
              <Link to={publicProfileUrl(profile.slug)}>
                <Home className="w-4 h-4 mr-2" />
                Ver página de {profile.business_name}
              </Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  // If filters exist, show filtered products view
  if (hasFilters) {
    const filterTitle = category || tag;
    const filterType = category ? "Categoria" : "Tag";
    
    return (
      <SimpleThemeProvider 
        userSlug={userSlug!}
        catalogThemeOverrides={catalog?.theme_overrides}
      >
        {/* Header */}
        <div className="border-b" style={{ borderColor: 'var(--theme-surface)' }}>
          <div className="container max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => window.history.back()} className="gap-2">
                <ArrowLeft className="w-5 h-5" />
                Voltar
              </Button>
              <Button variant="ghost" onClick={() => window.location.href = publicProfileUrl(userSlug!)} className="gap-2">
                <Home className="w-4 h-4" />
                Início
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="py-12">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="mb-8">
              <p className="text-sm" style={{ color: 'var(--theme-muted)' }}>{filterType}</p>
              <h1 className="text-4xl font-bold" style={{ fontFamily: 'var(--font-heading, inherit)', color: 'var(--theme-foreground)' }}>
                {filterTitle}
              </h1>
              <p style={{ color: 'var(--theme-muted)' }} className="mt-2">
                {products.length} {products.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
              </p>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed rounded-2xl" style={{ borderColor: 'var(--theme-surface)' }}>
                <p style={{ color: 'var(--theme-muted)' }}>
                  Nenhum produto encontrado nesta {filterType.toLowerCase()}
                </p>
              </div>
            ) : (
              <>
                {/* Mobile: List View */}
                <div className="md:hidden space-y-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} layout="list" showPrice showTags showButton userSlug={userSlug} />
                  ))}
                </div>
                {/* Desktop: Grid View */}
                <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} layout="grid" showPrice showTags showButton userSlug={userSlug} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* WhatsApp Bubble */}
        {catalog?.settings?.show_whatsapp_bubble && profile?.whatsapp && (
          <WhatsAppBubble phoneNumber={profile.whatsapp} />
        )}
      </SimpleThemeProvider>
    );
  }

  // Build sections for navigation
  const sections = blocks
    .filter((block) => block.anchor_slug && block.data?.title)
    .map((block) => ({
      id: block.id,
      title: block.data.title,
      anchor: block.anchor_slug,
    }));

  const showSectionNav = catalog?.settings?.show_section_nav && sections.length > 0;

  // Normal catalog view
  return (
    <SimpleThemeProvider 
      userSlug={userSlug!}
      catalogThemeOverrides={catalog?.theme_overrides}
    >
      {showSectionNav && <SectionNavigation sections={sections} />}
      
      {blocks.map((block, index) => (
        <BlockRendererPremium
          key={block.id}
          block={block}
          profile={profile}
          userId={profile?.id}
          userSlug={userSlug}
          catalogSlug={catalogSlug}
          catalogTitle={catalog?.title}
          index={index}
        />
      ))}

      {blocks.length === 0 && (
        <div className="container max-w-[1120px] mx-auto text-center py-24 px-4">
          <p className="text-muted-foreground">
            Este catálogo ainda não tem conteúdo.
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="py-8 border-t" style={{ borderColor: 'var(--theme-surface)' }}>
        <div className="container max-w-[1120px] mx-auto text-center">
          <p className="text-sm" style={{ color: 'var(--theme-muted)' }}>
            {profile?.business_name && (
              <>
                © {new Date().getFullYear()} {profile.business_name}
                <br />
              </>
            )}
            <span className="text-xs">
              Feito com{" "}
              <a
                href="https://cardapli.com.br"
                style={{ color: 'var(--theme-accent)' }}
                className="hover:underline"
              >
                Cardapli
              </a>
            </span>
          </p>
        </div>
      </div>

      {/* WhatsApp Bubble */}
      {catalog?.settings?.show_whatsapp_bubble && profile?.whatsapp && (
        <WhatsAppBubble phoneNumber={profile.whatsapp} />
      )}
    </SimpleThemeProvider>
  );
};

export default PublicCatalogPage;
