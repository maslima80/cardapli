import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, ArrowLeft, Package, Share2 } from "lucide-react";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ExternalMedia } from "@/components/product/ExternalMedia";
import { VariantSelector } from "@/components/product/VariantSelector";
import { ProductInfoAccordion } from "@/components/product/ProductInfoAccordion";
import { ProductShareModal } from "@/components/product/ProductShareModal";
import { SimpleThemeProvider } from "@/components/theme/SimpleThemeProvider";
import { buildVariants, ProductVariant, getPriceRange } from "@/lib/variants";
import { publicProfileUrl, absolute, publicProductUrl, publicProductFullUrl } from "@/lib/urls";
import { toast } from "sonner";

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: string | null;
  price_unit: string | null;
  price_unit_custom: string | null;
  price_on_request: boolean;
  price_on_request_label: string | null;
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
  video_url: string | null;
  external_media: any[] | null;
  whatsapp: string | null;
}

interface Profile {
  id: string;
  slug: string;
  business_name: string | null;
  whatsapp: string | null;
}

export default function PublicProductPageNew() {
  const { userSlug, productSlug } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Variants state
  const [variantsData, setVariantsData] = useState<{ options: any[]; variants: any[] }>({ options: [], variants: [] });
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedCombination, setSelectedCombination] = useState<Record<string, string>>({});
  
  // Share modal state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  
  // Get referrer to determine back navigation
  const [backUrl, setBackUrl] = useState<string>("");

  useEffect(() => {
    loadProductAndProfile();
    
    // Detect if user came from a catalog
    const referrer = document.referrer;
    if (referrer && referrer.includes(`/u/${userSlug}/`)) {
      // Extract catalog slug from referrer if present
      const catalogMatch = referrer.match(/\/u\/[^/]+\/([^/?#]+)/);
      if (catalogMatch && catalogMatch[1] !== 'p') {
        // User came from a catalog, set back URL to that catalog
        setBackUrl(`/u/${userSlug}/${catalogMatch[1]}`);
        return;
      }
    }
    // Default: go back to profile
    setBackUrl(publicProfileUrl(userSlug || ""));
  }, [userSlug, productSlug]);

  // Set document title for SEO
  useEffect(() => {
    if (product && profile) {
      const displayName = profile.business_name || userSlug;
      document.title = `${product.title} — ${displayName}`;
    }
  }, [product, profile, userSlug]);

  const loadProductAndProfile = async () => {
    try {
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, slug, business_name, whatsapp")
        .eq("slug", userSlug)
        .single();

      if (profileError || !profileData) {
        console.error("Profile error:", profileError);
        setError("Perfil não encontrado");
        setLoading(false);
        return;
      }

      setProfile(profileData as any);

      // Load product
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", profileData.id)
        .eq("slug", productSlug)
        .single();

      if (productError || !productData) {
        setError("Produto não encontrado");
        setLoading(false);
        return;
      }

      // Check if product is publicly available
      if ((productData as any).public_link === false) {
        setError("unavailable");
        setProduct(productData as any);
        setLoading(false);
        return;
      }

      setProduct(productData as any);

      // Load variants
      const variants = await buildVariants(productData.id);
      setVariantsData(variants);

      setLoading(false);
    } catch (err) {
      console.error("Error loading product:", err);
      setError("Erro ao carregar produto");
      setLoading(false);
    }
  };

  const handleVariantChange = (variant: ProductVariant | null, combination: Record<string, string>) => {
    setSelectedVariant(variant);
    setSelectedCombination(combination);
  };


  const getWhatsAppUrl = () => {
    if (!product || !profile) return "#";

    const phone = profile.whatsapp || product.whatsapp;
    if (!phone) return "#";

    let message = `Oi! Tenho interesse no produto "${product.title}"`;

    // Add variant info if selected
    if (selectedVariant && variantsData.options.length > 0) {
      const variantDetails = variantsData.options.map(option => {
        const valueId = selectedCombination[option.id];
        const value = option.values.find((v: any) => v.id === valueId);
        return value ? `${option.name}: ${value.label}` : null;
      }).filter(Boolean).join(", ");

      if (variantDetails) {
        message += ` - ${variantDetails}`;
      }

      if (selectedVariant.sku) {
        message += ` (SKU: ${selectedVariant.sku})`;
      }
    }

    const productUrl = publicProductFullUrl(userSlug!, productSlug!);
    message += `\n\n${productUrl}`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const formatPrice = (priceValue?: number | string | null): string | null => {
    const price = selectedVariant?.price || priceValue;

    if (product?.price_on_request) {
      return product.price_on_request_label || "Sob consulta";
    }

    if (product?.price_hidden || !price) {
      return null;
    }

    const priceStr = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(price));

    const unit = product?.price_unit === "Outro" && product?.price_unit_custom
      ? product.price_unit_custom
      : product?.price_unit || "Unidade";

    return `${priceStr} / ${unit}`;
  };

  const getPriceDisplay = () => {
    if (!product) return null;

    // If variants exist and no variant selected, show range
    if (variantsData.variants.length > 0 && !selectedVariant) {
      const priceRange = getPriceRange(variantsData.variants, product.price ? Number(product.price) : null);
      
      if (priceRange.hasRange && priceRange.min && priceRange.max) {
        const minStr = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(priceRange.min);
        
        return `A partir de ${minStr}`;
      }
    }

    return formatPrice(product.price);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando produto...</p>
        </div>
      </div>
    );
  }

  // Error states
  if (error === "unavailable" && product) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto">
            <Package className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold">Produto indisponível</h2>
          <p className="text-muted-foreground">
            Este produto não está disponível para visualização pública no momento.
          </p>
          {userSlug && (
            <Link to={publicProfileUrl(userSlug)}>
              <Button className="gap-2">
                Ver perfil
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (error || !product || !profile) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <Package className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold">Produto não encontrado</h2>
          <p className="text-muted-foreground">
            {error || "O produto que você está procurando não existe ou foi removido."}
          </p>
          {userSlug && (
            <Link to={publicProfileUrl(userSlug)}>
              <Button className="gap-2">
                Ver perfil
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  const displayName = profile.business_name || userSlug;
  const photos = Array.isArray(product.photos) ? product.photos : [];
  const hasVariants = variantsData.options.length > 0;

  return (
    <SimpleThemeProvider userSlug={userSlug!}>
      <div className="pb-28 md:pb-8 w-full overflow-x-hidden bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="backdrop-blur border-b sticky top-0 z-40 w-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: 'var(--theme-surface)', color: 'var(--theme-foreground)' }}>
        <div className="w-full max-w-6xl mx-auto px-4 py-3 flex items-center justify-between min-w-0">
          <Link 
            to={backUrl || publicProfileUrl(profile.slug)} 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            style={{ color: 'var(--theme-foreground)' }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium truncate max-w-[200px]">{displayName}</span>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShareModalOpen(true)}
            className="gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Compartilhar</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-6xl mx-auto px-4 py-6 md:py-8 min-w-0">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 min-w-0">
          {/* Left Column - Gallery & Media */}
          <div className="space-y-6 min-w-0 w-full">
            <ProductGallery 
              photos={photos.map(p => ({ url: p.url, alt: p.alt }))} 
              productTitle={product.title}
            />

            {(product.video_url || (product.external_media && product.external_media.length > 0)) && (
              <ExternalMedia 
                videoUrl={product.video_url}
                externalMedia={product.external_media}
              />
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6 min-w-0 w-full">
            {/* Title & Price */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading, inherit)', color: 'var(--theme-foreground)' }}>{product.title}</h1>
              
              {getPriceDisplay() && (
                <p className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--accent-color, #8B5CF6)' }}>
                  {getPriceDisplay()}
                </p>
              )}
            </div>

            {/* Categories & Tags */}
            {(product.categories?.length || product.quality_tags?.length) && (
              <div className="space-y-2 min-w-0">
                {product.categories && product.categories.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Categorias:</span>
                    {product.categories.map((cat, i) => (
                      <Badge key={i} className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                )}

                {product.quality_tags && product.quality_tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Tags:</span>
                    {product.quality_tags.map((tag, i) => (
                      <Badge key={i} className="border-2 border-primary/50 text-primary bg-transparent">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Variant Selector */}
            {hasVariants && (
              <VariantSelector
                options={variantsData.options}
                variants={variantsData.variants}
                onVariantChange={handleVariantChange}
              />
            )}

            {/* Status & Availability */}
            {(selectedVariant || product.status) && (
              <div className="flex items-center gap-2">
                <Badge 
                  className={
                    (selectedVariant?.is_available !== false && product.status === "Disponível")
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  }
                >
                  {selectedVariant?.is_available === false ? "Indisponível" : product.status}
                </Badge>
              </div>
            )}

            {/* Product Details Grid */}
            {(product.sku || selectedVariant?.sku || product.min_qty || product.production_days) && (
              <div className="grid grid-cols-2 gap-3 p-4 bg-muted/50 rounded-lg text-sm">
                {(product.sku || selectedVariant?.sku) && (
                  <div>
                    <span className="text-muted-foreground block mb-1">SKU</span>
                    <span className="font-medium">{selectedVariant?.sku || product.sku}</span>
                  </div>
                )}
                {product.min_qty && (
                  <div>
                    <span className="text-muted-foreground block mb-1">Qtd. mínima</span>
                    <span className="font-medium">{product.min_qty}</span>
                  </div>
                )}
                {product.production_days && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground block mb-1">Prazo de produção</span>
                    <span className="font-medium">{product.production_days} dias</span>
                  </div>
                )}
              </div>
            )}

            {/* Customization Notice */}
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

            {/* Info Accordion */}
            <ProductInfoAccordion
              description={product.description}
              ingredients={product.ingredients}
              allergens={product.allergens}
              conservation={product.conservation}
            />
          </div>
        </div>
      </main>

      {/* Sticky WhatsApp CTA */}
      <div className="fixed inset-x-0 bottom-0 bg-background/95 backdrop-blur border-t border-border z-40 w-full">
        <div className="w-full max-w-6xl mx-auto px-4 py-4 pb-[max(env(safe-area-inset-bottom),16px)] min-w-0">
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button 
              size="lg" 
              className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
              disabled={selectedVariant?.is_available === false}
            >
              <MessageCircle className="w-5 h-5" />
              {selectedVariant?.is_available === false 
                ? "Produto indisponível"
                : "Entrar em contato no WhatsApp"
              }
            </Button>
          </a>
        </div>
      </div>

      {/* Share Modal */}
      <ProductShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        productTitle={product.title}
        productSlug={productSlug!}
        userSlug={userSlug!}
        publicLink={true}
      />
      </div>
    </SimpleThemeProvider>
  );
}
