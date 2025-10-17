import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BlockRendererPremium } from "@/components/catalog/BlockRendererPremium";
import { SimpleThemeProvider } from "@/components/theme/SimpleThemeProvider";
import { WhatsAppBubble } from "@/components/WhatsAppBubble";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { useMetaTags } from "@/hooks/useMetaTags";
import { publicProfileUrl } from "@/lib/urls";

const PublicProfilePage = () => {
  const { userSlug } = useParams();
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");
  const tag = searchParams.get("tag");
  const hasFilters = category || tag;
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
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

  // If filters exist, show filtered products view
  if (hasFilters) {
    const filterTitle = category || tag;
    const filterType = category ? "Categoria" : "Tag";
    
    return (
      <SimpleThemeProvider userSlug={userSlug!}>
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
        {profile.show_whatsapp_bubble && profile.whatsapp && (
          <WhatsAppBubble phoneNumber={profile.whatsapp} />
        )}
      </SimpleThemeProvider>
    );
  }

  // Normal profile view
  return (
    <SimpleThemeProvider userSlug={userSlug!}>
      {/* Blocks */}
      <div className="container max-w-3xl mx-auto px-4 py-6">
        {blocks.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: 'var(--theme-muted)' }}>
              Esta página ainda não tem conteúdo.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {blocks.map((block, index) => (
              <BlockRendererPremium
                key={block.id}
                block={block}
                profile={profile}
                userId={profile.id}
                userSlug={userSlug}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t mt-12" style={{ borderColor: 'var(--theme-surface)' }}>
        <div className="container max-w-3xl mx-auto px-4 py-8 text-center">
          <p className="text-sm" style={{ color: 'var(--theme-muted)' }}>
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
      {profile.show_whatsapp_bubble && profile.whatsapp && (
        <WhatsAppBubble phoneNumber={profile.whatsapp} />
      )}
    </SimpleThemeProvider>
  );
};

export default PublicProfilePage;
