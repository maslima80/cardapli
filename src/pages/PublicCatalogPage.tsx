import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BlockRenderer } from "@/components/catalog/BlockRenderer";
import { SectionNavigation } from "@/components/catalog/SectionNavigation";
import { getEffectiveTheme, generateThemeVariables } from "@/lib/theme-utils";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useMetaTags } from "@/hooks/useMetaTags";
import { publicProfileUrl, publicCatalogFullUrl } from "@/lib/urls";

const PublicCatalogPage = () => {
  const { userSlug, catalogSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [catalog, setCatalog] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
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

  // Calculate effective theme
  const effectiveTheme = getEffectiveTheme(catalog?.theme_overrides, profile);
  const themeVars = generateThemeVariables(effectiveTheme);

  // Build sections for navigation
  const sections = blocks
    .filter((block) => block.anchor_slug && block.data?.title)
    .map((block) => ({
      id: block.id,
      title: block.data.title,
      anchor: block.anchor_slug,
    }));

  const showSectionNav = catalog?.settings?.show_section_nav && sections.length > 0;

  // Apply font family based on theme
  const fontClass =
    effectiveTheme.font === "elegant"
      ? "font-playfair"
      : effectiveTheme.font === "modern"
      ? "font-poppins"
      : "font-inter";

  return (
    <div
      className={`min-h-screen bg-gradient-subtle ${fontClass}`}
      style={themeVars as any}
    >
      {showSectionNav && <SectionNavigation sections={sections} />}
      
      {blocks.map((block) => (
        <BlockRenderer
          key={block.id}
          block={block}
          profile={profile}
          userId={profile?.id}
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
      <div className="block-wrapper" data-bg="surface">
        <div className="container max-w-[1120px] mx-auto text-center border-t border-border">
          <p className="text-sm text-muted-foreground py-8">
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
                className="text-primary hover:underline"
              >
                Cardapli
              </a>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicCatalogPage;
