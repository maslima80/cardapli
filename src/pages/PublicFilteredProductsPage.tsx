import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SimpleThemeProvider } from "@/components/theme/SimpleThemeProvider";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { publicProfileUrl } from "@/lib/urls";
import PublicProfilePage from "./PublicProfilePage";
import PublicCatalogPage from "./PublicCatalogPage";

const PublicFilteredProductsPage = () => {
  const { userSlug, catalogSlug } = useParams();
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");
  const tag = searchParams.get("tag");
  
  // Declare all hooks first (Rules of Hooks)
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [catalog, setCatalog] = useState<any>(null);
  
  // If no filters, show normal page (after all hooks are declared)
  if (!category && !tag) {
    return catalogSlug ? <PublicCatalogPage /> : <PublicProfilePage />;
  }

  useEffect(() => {
    loadFilteredProducts();
  }, [userSlug, catalogSlug, category, tag]);

  const loadFilteredProducts = async () => {
    try {
      // Get profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("slug", userSlug)
        .single();

      if (profileError || !profileData) {
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // Get catalog if catalogSlug exists
      if (catalogSlug) {
        const { data: catalogData } = await supabase
          .from("catalogs")
          .select("*")
          .eq("user_id", profileData.id)
          .eq("slug", catalogSlug)
          .single();
        
        setCatalog(catalogData);
      }

      // Get products
      let query = supabase
        .from("products")
        .select("*")
        .eq("user_id", profileData.id);

      const { data: productsData, error: productsError } = await query;

      if (productsError) throw productsError;

      // Filter products by category or tag
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
      setLoading(false);
    } catch (error) {
      console.error("Error loading filtered products:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const backUrl = catalogSlug 
    ? `/u/${userSlug}/${catalogSlug}`
    : publicProfileUrl(userSlug!);

  const filterTitle = category || tag;
  const filterType = category ? "Categoria" : "Tag";

  return (
    <SimpleThemeProvider 
      userSlug={userSlug!}
      catalogThemeOverrides={catalog?.theme_overrides}
    >
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to={backUrl}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </Link>
            
            <Link to={publicProfileUrl(userSlug!)}>
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="w-4 h-4" />
                Início
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-12">
        <div className="container max-w-6xl mx-auto px-4">
          {/* Title */}
          <div className="mb-8">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              {filterType}
            </p>
            <h1 
              className="text-4xl font-bold text-slate-900 dark:text-slate-50"
              style={{ fontFamily: 'var(--font-heading, inherit)' }}
            >
              {filterTitle}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              {products.length} {products.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
            </p>
          </div>

          {/* Products - List on mobile, Grid on desktop */}
          {products.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-slate-600 dark:text-slate-400">
                Nenhum produto encontrado nesta {filterType.toLowerCase()}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile: List View */}
              <div className="md:hidden space-y-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    layout="list"
                    showPrice={true}
                    showTags={true}
                    showButton={true}
                    userSlug={userSlug}
                  />
                ))}
              </div>

              {/* Desktop: Grid View */}
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    layout="grid"
                    showPrice={true}
                    showTags={true}
                    showButton={true}
                    userSlug={userSlug}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 dark:border-slate-800 mt-12">
        <div className="container max-w-6xl mx-auto px-4 py-8 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
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
                className="text-violet-600 dark:text-violet-400 hover:underline"
              >
                Cardapli
              </a>
            </span>
          </p>
        </div>
      </div>
    </SimpleThemeProvider>
  );
};

export default PublicFilteredProductsPage;
