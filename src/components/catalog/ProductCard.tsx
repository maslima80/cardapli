import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    slug?: string;
    title: string;
    price?: number;
    price_hidden?: boolean;
    price_on_request?: boolean;
    price_on_request_label?: string;
    price_unit?: string;
    price_unit_custom?: string;
    photos?: Array<{ url: string; alt?: string }>;
    categories?: string[];
    quality_tags?: string[];
    variants_count?: number;
    variantPrices?: number[];
  };
  layout?: "grid" | "list";
  showPrice?: boolean;
  showTags?: boolean;
  showButton?: boolean;
  userSlug?: string;
  catalogSlug?: string;
}

export function ProductCard({
  product,
  layout = "grid",
  showPrice = true,
  showTags = false,
  showButton = true,
  userSlug,
  catalogSlug,
}: ProductCardProps) {
  const productUrl = userSlug 
    ? `/u/${userSlug}/p/${product.slug || product.id}`
    : `/p/${product.slug || product.id}`;
  
  // Store catalog context when clicking product
  const handleClick = () => {
    if (catalogSlug) {
      sessionStorage.setItem('lastCatalog', catalogSlug);
    }
  };
  
  const thumbnail = product.photos?.[0];
  const imageUrl = thumbnail?.url;
  
  // ImageKit transform for optimal loading
  const getImageUrl = (url: string, size: number) => {
    if (!url) return "";
    if (url.includes("ik.imagekit.io")) {
      return `${url}?tr=w-${size},h-${size},fo-auto`;
    }
    return url;
  };

  const displayPrice = () => {
    if (!showPrice || product.price_hidden) return null;
    
    if (product.price_on_request) {
      return (
        <p className="text-sm text-muted-foreground mt-1">
          {product.price_on_request_label || "Preço sob consulta"}
        </p>
      );
    }
    
    if (product.price) {
      // Check if product has variants with different prices
      const variantPrices = product.variantPrices || [];
      const allPrices = [
        Number(product.price),
        ...variantPrices.map(p => Number(p))
      ].filter(p => !isNaN(p) && p > 0);

      const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : product.price;
      const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : product.price;
      const hasRange = minPrice !== maxPrice;

      const priceStr = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(minPrice);

      const unit = product.price_unit === "Outro" && product.price_unit_custom
        ? product.price_unit_custom
        : product.price_unit || "Unidade";

      return (
        <div className="flex items-baseline gap-1 mt-1">
          {hasRange && variantPrices.length > 0 && (
            <span className="text-[11px] text-slate-500">A partir de</span>
          )}
          <span className="text-[15px] font-semibold text-emerald-600">
            {priceStr}
          </span>
          <span className="text-[11px] text-slate-500">
            / {unit}
          </span>
        </div>
      );
    }
    
    return null;
  };

  if (layout === "list") {
    return (
      <Link
        to={productUrl}
        onClick={handleClick}
        className="group block rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
      >
        <div className="grid grid-cols-[96px,1fr] gap-3 items-start p-3">
          {/* Thumbnail - Square */}
          <div className="w-24 h-24 bg-muted rounded-xl overflow-hidden flex-shrink-0">
            {imageUrl ? (
              <img
                src={getImageUrl(imageUrl, 320)}
                alt={thumbnail?.alt || product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                width={96}
                height={96}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-8 h-8 text-muted-foreground opacity-50" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium leading-tight line-clamp-2">
              {product.title}
            </h3>

            {/* Badges */}
            {showTags && (product.categories?.length || product.quality_tags?.length) && (
              <div className="flex flex-wrap gap-1 mt-2">
                {product.categories?.[0] && (
                  <Badge variant="secondary" className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {product.categories[0]}
                  </Badge>
                )}
                {product.quality_tags?.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {displayPrice()}

            {product.variants_count && product.variants_count > 0 && (
              <p className="text-[11px] text-slate-500 mt-1">
                {product.variants_count} {product.variants_count === 1 ? "variação" : "variações"}
              </p>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // Grid layout
  return (
    <Link
      to={productUrl}
      onClick={handleClick}
      className="group block rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
    >
      <div className="p-3 md:p-4">
        {/* Image */}
        <div className="aspect-square overflow-hidden rounded-xl bg-muted mb-3">
          {imageUrl ? (
            <img
              src={getImageUrl(imageUrl, 600)}
              alt={thumbnail?.alt || product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              width={600}
              height={600}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-12 h-12 text-muted-foreground opacity-50" />
            </div>
          )}
        </div>

        {/* Badges */}
        {showTags && (product.categories?.length || product.quality_tags?.length) && (
          <div className="flex flex-wrap gap-1 mb-2">
            {product.categories?.[0] && (
              <Badge variant="secondary" className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {product.categories[0]}
              </Badge>
            )}
            {product.quality_tags?.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="text-sm font-medium leading-tight line-clamp-2">
          {product.title}
        </h3>

        {/* Price */}
        {displayPrice()}

        {/* Variants info */}
        {product.variants_count && product.variants_count > 0 && (
          <p className="text-[11px] text-slate-500 mt-1">
            {product.variants_count} {product.variants_count === 1 ? "variação" : "variações"}
          </p>
        )}

        {/* CTA Button */}
        {showButton && (
          <Button
            variant="ghost"
            size="sm"
            className="btn-accent w-full mt-3 h-9 rounded-lg text-sm font-medium"
            aria-label={`Ver produto ${product.title}`}
            asChild
          >
            <span>Ver produto</span>
          </Button>
        )}
      </div>
    </Link>
  );
}

// Skeleton for loading state
export function ProductCardSkeleton({ layout = "grid" }: { layout?: "grid" | "list" }) {
  if (layout === "list") {
    return (
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-3">
        <div className="grid grid-cols-[96px,1fr] gap-3">
          <Skeleton className="w-24 h-24 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-5 w-20 mt-2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-3 md:p-4">
      <Skeleton className="aspect-square rounded-xl mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-2" />
      <Skeleton className="h-5 w-20" />
    </div>
  );
}
