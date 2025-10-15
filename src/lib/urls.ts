/**
 * URL builders for public pages
 * Single source of truth for all public URLs
 */

export const publicProfileUrl = (userSlug: string) => `/u/${userSlug}`;

export const publicCatalogUrl = (userSlug: string, catalogSlug: string) => 
  `/u/${userSlug}/${catalogSlug}`;

export const publicCatalogFullUrl = (userSlug: string, catalogSlug: string) => 
  `https://cardapli.com.br/u/${userSlug}/${catalogSlug}`;

export const whatsappShareUrl = (message: string, url: string) =>
  `https://wa.me/?text=${encodeURIComponent(`${message} ${url}`)}`;

export const whatsappShareCatalog = (userSlug: string, catalogSlug: string, customMessage?: string) => {
  const url = publicCatalogFullUrl(userSlug, catalogSlug);
  const message = customMessage || "Oi! Separei essas sugestões para você 👉";
  return whatsappShareUrl(message, url);
};
