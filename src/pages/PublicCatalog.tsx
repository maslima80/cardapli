import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BlockRenderer } from "@/components/catalog/BlockRenderer";
import { SectionNavigation } from "@/components/catalog/SectionNavigation";
import { getEffectiveTheme, generateThemeVariables } from "@/lib/theme-utils";

const PublicCatalog = () => {
  const { slug, catalog_slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [catalog, setCatalog] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadCatalog();
  }, [slug, catalog_slug]);

  const loadCatalog = async () => {
    // Get profile by slug
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("slug", slug)
      .single();

    if (!profileData) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    // Get catalog
    const { data: catalogData } = await supabase
      .from("catalogs")
      .select("*")
      .eq("user_id", profileData.id)
      .eq("slug", catalog_slug)
      .in("status", ["public", "unlisted"])
      .single();

    if (!catalogData) {
      setNotFound(true);
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
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h1 className="text-6xl font-bold mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Catálogo não encontrado
          </p>
          <p className="text-sm text-muted-foreground">
            Este catálogo não existe ou foi definido como privado.
          </p>
        </div>
      </div>
    );
  }

  // Calculate effective theme
  const effectiveTheme = getEffectiveTheme(catalog?.theme_overrides, profile);
  const themeVars = generateThemeVariables(effectiveTheme);

  useEffect(() => {
    if (catalog?.title) {
      document.title = catalog.title;
    }
  }, [catalog]);

  // Build sections for navigation
  const sections = blocks
    .filter((block) => block.anchor_slug && (block.navigation_label || block.data?.title))
    .map((block) => ({
      id: block.id,
      title: block.navigation_label || block.data.title,
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
    <>
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
                Criado com{" "}
                <a
                  href="https://lovable.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Lovable
                </a>
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicCatalog;
