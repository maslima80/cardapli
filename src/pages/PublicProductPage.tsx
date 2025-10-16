import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, ExternalLink, ArrowLeft, Package } from "lucide-react";
// SEO will be handled via document.title and meta tags
import { whatsappShareProduct, publicProfileUrl, absolute, publicProductUrl } from "@/lib/urls";

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: string | null;
  price_unit: string | null;
  price_on_request: boolean;
  price_hidden: boolean;
  photos: any[];
  status: string;
  accepts_customization: boolean;
  customization_instructions: string | null;
  categories: string[] | null;
  quality_tags: string[] | null;
  sku: string | null;
  min_qty: number | null;
  production_days: number | null;
  ingredients: string | null;
  allergens: string | null;
  conservation: string | null;
  public_link: boolean;
  slug: string;
}

interface Profile {
  slug: string;
  business_name: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export default function PublicProductPage() {
  const { userSlug, productSlug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProductAndProfile();
  }, [userSlug, productSlug]);

  const loadProductAndProfile = async () => {
    try {
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("slug, business_name, full_name, avatar_url")
        .eq("slug", userSlug)
        .single();

      if (profileError || !profileData) {
        setError("Perfil não encontrado");
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // Load product
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", (await supabase.from("profiles").select("id").eq("slug", userSlug).single()).data?.id)
        .eq("slug", productSlug)
        .single();

      if (productError || !productData) {
        setError("Produto não encontrado");
        setLoading(false);
        return;
      }

      // Check if product is publicly available
      if (!productData.public_link) {
        setError("unavailable");
        setProduct(productData);
        setLoading(false);
        return;
      }

      setProduct(productData);
      setLoading(false);
    } catch (err) {
      console.error("Error loading product:", err);
      setError("Erro ao carregar produto");
      setLoading(false);
    }
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

  if (error === "unavailable" && product && profile) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-xl border border-border p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-2">Produto indisponível</h1>
          <p className="text-muted-foreground mb-6">
            Este produto não está disponível no momento.
          </p>
          <Link to={publicProfileUrl(profile.slug)}>
            <Button className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Ver outros produtos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (error || !product || !profile) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-xl border border-border p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-2">{error || "Produto não encontrado"}</h1>
          <p className="text-muted-foreground mb-6">
            O produto que você está procurando não existe ou foi removido.
          </p>
          {userSlug && (
            <Link to={publicProfileUrl(userSlug)}>
              <Button className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Ver perfil
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  const mainImage = product.photos?.[selectedImage]?.url || product.photos?.[0]?.url;
  const displayName = profile.business_name || profile.full_name || userSlug;
  const whatsappUrl = whatsappShareProduct(profile.slug, product.slug, product.title);
  const absoluteUrl = absolute(publicProductUrl(profile.slug, product.slug));

  return (
    <>
      <Helmet>
        <title>{product.title} — {displayName}</title>
        <meta name="description" content={product.description?.substring(0, 160) || `Produto ${product.title}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${product.title} — ${displayName}`} />
        <meta property="og:description" content={product.description?.substring(0, 160) || `Produto ${product.title}`} />
        <meta property="og:image" content={mainImage || ""} />
        <meta property="og:url" content={absoluteUrl} />
        <meta property="og:type" content="product" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${product.title} — ${displayName}`} />
        <meta name="twitter:description" content={product.description?.substring(0, 160) || `Produto ${product.title}`} />
        <meta name="twitter:image" content={mainImage || ""} />
        
        {/* Canonical */}
        <link rel="canonical" href={absoluteUrl} />
      </Helmet>

      <div className="min-h-screen bg-gradient-subtle">
        {/* Header */}
        <div className="bg-background border-b border-border sticky top-0 z-10">
          <div className="container max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link to={publicProfileUrl(profile.slug)} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">{displayName}</span>
            </Link>
          </div>
        </div>

        <div className="container max-w-4xl mx-auto px-4 py-6 md:py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-muted rounded-xl overflow-hidden">
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Package className="w-16 h-16" />
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.photos && product.photos.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? "border-primary"
                          : "border-transparent hover:border-border"
                      }`}
                    >
                      <img
                        src={photo.url}
                        alt={`${product.title} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
                
                {/* Price */}
                {!product.price_hidden && (
                  <div className="mb-4">
                    {product.price_on_request ? (
                      <p className="text-xl font-semibold text-muted-foreground">
                        Preço sob consulta
                      </p>
                    ) : product.price ? (
                      <p className="text-3xl font-bold text-primary">
                        R$ {product.price}
                        {product.price_unit && (
                          <span className="text-base font-normal text-muted-foreground ml-2">
                            / {product.price_unit}
                          </span>
                        )}
                      </p>
                    ) : null}
                  </div>
                )}

                {/* Tags */}
                {(product.categories || product.quality_tags) && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.categories?.map((cat, i) => (
                      <Badge key={`cat-${i}`} variant="secondary">{cat}</Badge>
                    ))}
                    {product.quality_tags?.map((tag, i) => (
                      <Badge key={`tag-${i}`} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: product.description }} />
                </div>
              )}

              {/* Additional Info */}
              <div className="space-y-3 text-sm">
                {product.sku && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SKU:</span>
                    <span className="font-medium">{product.sku}</span>
                  </div>
                )}
                {product.min_qty && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantidade mínima:</span>
                    <span className="font-medium">{product.min_qty}</span>
                  </div>
                )}
                {product.production_days && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prazo de produção:</span>
                    <span className="font-medium">{product.production_days} dias</span>
                  </div>
                )}
                {product.status && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={product.status === "Disponível" ? "default" : "secondary"}>
                      {product.status}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Customization */}
              {product.accepts_customization && (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    ✨ Aceita personalização
                  </p>
                  {product.customization_instructions && (
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {product.customization_instructions}
                    </p>
                  )}
                </div>
              )}

              {/* Food-specific info */}
              {(product.ingredients || product.allergens || product.conservation) && (
                <div className="space-y-3 border-t border-border pt-4">
                  {product.ingredients && (
                    <div>
                      <h3 className="font-semibold mb-1">Ingredientes:</h3>
                      <p className="text-sm text-muted-foreground">{product.ingredients}</p>
                    </div>
                  )}
                  {product.allergens && (
                    <div>
                      <h3 className="font-semibold mb-1">Alérgenos:</h3>
                      <p className="text-sm text-muted-foreground">{product.allergens}</p>
                    </div>
                  )}
                  {product.conservation && (
                    <div>
                      <h3 className="font-semibold mb-1">Conservação:</h3>
                      <p className="text-sm text-muted-foreground">{product.conservation}</p>
                    </div>
                  )}
                </div>
              )}

              {/* WhatsApp CTA */}
              <div className="sticky bottom-4 md:static">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button size="lg" className="w-full gap-2 bg-green-600 hover:bg-green-700">
                    <MessageCircle className="w-5 h-5" />
                    Enviar mensagem no WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
