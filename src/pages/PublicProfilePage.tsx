import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BlockRenderer } from "@/components/catalog/BlockRenderer";
import { useMetaTags } from "@/hooks/useMetaTags";
import { publicProfileUrl } from "@/lib/urls";

const PublicProfilePage = () => {
  const { userSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [userSlug]);

  const loadProfile = async () => {
    try {
      // Get profile by slug
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("slug", userSlug)
        .single();

      if (profileError || !profileData) {
        console.error('Profile not found:', { userSlug, profileError });
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Get profile blocks
      const { data: blocksData, error: blocksError } = await supabase
        .from("profile_blocks")
        .select("*")
        .eq("user_id", profileData.id)
        .eq("visible", true)
        .order("sort", { ascending: true });

      if (blocksError) {
        console.error('Error loading blocks:', blocksError);
      }

      setProfile(profileData);
      setBlocks(blocksData || []);
      setLoading(false);
    } catch (error) {
      console.error("Error loading profile:", error);
      setNotFound(true);
      setLoading(false);
    }
  };

  // Set meta tags
  const profileUrl = profile ? `https://cardapli.com.br${publicProfileUrl(profile.slug)}` : undefined;
  const metaDescription = profile?.slogan || profile?.about || `Página de ${profile?.business_name || 'produtos'}`;

  useMetaTags({
    title: profile?.business_name ? `${profile.business_name} | Cardapli` : "Cardapli",
    description: metaDescription,
    image: profile?.logo_url,
    url: profileUrl,
    type: "website",
  });

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
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold mb-2">Página não encontrada</h1>
          <p className="text-muted-foreground">
            Este perfil não existe ou não está disponível.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Blocks */}
      <div className="container max-w-3xl mx-auto px-4 py-6">
        {blocks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Esta página ainda não tem conteúdo.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {blocks.map((block) => (
              <BlockRenderer
                key={block.id}
                block={block}
                profile={profile}
                userId={profile.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border mt-12">
        <div className="container max-w-3xl mx-auto px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            {profile.business_name && (
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

export default PublicProfilePage;
