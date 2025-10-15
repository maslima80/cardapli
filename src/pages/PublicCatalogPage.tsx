import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BlockRenderer } from "@/components/catalog/BlockRenderer";
import { SectionNavigation } from "@/components/catalog/SectionNavigation";
import { getEffectiveTheme, generateThemeVariables } from "@/lib/theme-utils";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const PublicCatalogPage = () => {
  const { slug, catalog_slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [catalog, setCatalog] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    loadCatalog();
  }, [slug, catalog_slug]);

  const loadCatalog = async () => {
    try {
      // Get profile by slug
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("slug", slug)
        .single();

      if (profileError || !profileData) {
        setUnavailable(true);
        setLoading(false);
        return;
      }

      // Get catalog by user_id and catalog slug
      const { data: catalogData, error: catalogError } = await supabase
        .from("catalogs")
        .select("*")
        .eq("user_id", profileData.id)
        .eq("slug", catalog_slug)
        .single();

      if (catalogError || !catalogData) {
        setUnavailable(true);
        setLoading(false);
        return;
      }

      // Check if catalog is accessible
      // Rascunho = not accessible publicly
      // Link desativado = not accessible
      // For backward compatibility, also check old status values
      const isRascunho = catalogData.status === "rascunho" || catalogData.status === "draft";
      const linkDesativado = catalogData.link_ativo === false;

      if (isRascunho || linkDesativado) {
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

  // Set page title
  useEffect(() => {
    if (catalog?.title) {
      document.title = `${catalog.title} | Cardapli`;
    }
  }, [catalog]);

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
              Este catálogo não está disponível no momento ou foi definido como privado.
            </p>
          </div>
          
          {profile?.slug && (
            <Button asChild>
              <Link to={`/@${profile.slug}`}>
                <Home className="w-4 h-4 mr-2" />
                Visitar perfil
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
