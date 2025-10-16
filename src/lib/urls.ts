/**
 * URL builders for public pages
 * Single source of truth for all public URLs
 */

// Get base URL from environment or default
export const getBaseUrl = () => {
  return import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin;
};

// Convert relative path to absolute URL
export const absolute = (path: string) => {
  return getBaseUrl() + path;
};

// Public profile URL
export const publicProfileUrl = (userSlug: string) => `/u/${userSlug}`;

// Public catalog URL
export const publicCatalogUrl = (userSlug: string, catalogSlug: string) => 
  `/u/${userSlug}/${catalogSlug}`;

// Public product URL
export const publicProductUrl = (userSlug: string, productSlug: string) => 
  `/u/${userSlug}/p/${productSlug}`;

// Legacy product URL (backwards compatibility)
export const legacyProductUrl = (userSlug: string, productId: string) => 
  `/u/${userSlug}/produto/${productId}`;

// Full URLs (with domain)
export const publicCatalogFullUrl = (userSlug: string, catalogSlug: string) => 
  absolute(publicCatalogUrl(userSlug, catalogSlug));

export const publicProductFullUrl = (userSlug: string, productSlug: string) => 
  absolute(publicProductUrl(userSlug, productSlug));

// WhatsApp share helpers
export const whatsappShareUrl = (message: string, url: string) =>
  `https://wa.me/?text=${encodeURIComponent(`${message} ${url}`)}`;

export const whatsappShareCatalog = (userSlug: string, catalogSlug: string, customMessage?: string) => {
  const url = publicCatalogFullUrl(userSlug, catalogSlug);
  const message = customMessage || "Oi! Separei essas sugestões para você 👉";
  return whatsappShareUrl(message, url);
};

// WhatsApp share for product (from seller to customer)
export const whatsappShareProduct = (userSlug: string, productSlug: string, productTitle: string) => {
  const url = publicProductFullUrl(userSlug, productSlug);
  const message = `Olá! Confira este produto: "${productTitle}"`;
  return whatsappShareUrl(message, url);
};

// WhatsApp CTA for customer to contact seller
export const whatsappContactSeller = (phone: string, productTitle: string, productUrl: string) => {
  const message = `Oi! Tenho interesse no produto "${productTitle}". ${productUrl}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};
