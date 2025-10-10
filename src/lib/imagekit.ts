// ImageKit helper utilities

export interface PhotoObject {
  url: string;
  width?: number;
  height?: number;
  alt: string;
  is_cover: boolean;
  fileId: string;
  lqip?: string; // Low Quality Image Placeholder
}

export interface ImageKitTransformOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | number;
  format?: 'auto' | 'jpg' | 'png' | 'webp';
  crop?: 'maintain_ratio' | 'force';
  focus?: 'auto' | 'center';
}

/**
 * Build responsive ImageKit URL with transformations
 */
export function getResponsiveImageUrl(
  baseUrl: string,
  size: 'thumb' | 'grid' | 'detail' | 'lqip',
  options: Partial<ImageKitTransformOptions> = {}
): string {
  if (!baseUrl) return '';

  // Default transformation based on size
  const sizeTransforms = {
    thumb: { width: 400, quality: 'auto' as const, format: 'auto' as const },
    grid: { width: 800, quality: 'auto' as const, format: 'auto' as const },
    detail: { width: 1600, quality: 'auto' as const, format: 'auto' as const },
    lqip: { width: 50, quality: 10, format: 'auto' as const }, // Low quality placeholder
  };

  const transforms = { ...sizeTransforms[size], ...options };

  // Build transformation string
  const params: string[] = [];
  if (transforms.width) params.push(`w-${transforms.width}`);
  if (transforms.height) params.push(`h-${transforms.height}`);
  if (transforms.quality) params.push(`q-${transforms.quality}`);
  if (transforms.format) params.push(`fo-${transforms.format}`);
  if (transforms.crop) params.push(`c-${transforms.crop}`);
  if (transforms.focus) params.push(`f-${transforms.focus}`);

  const transformString = params.join(',');

  // Check if URL already has transformations
  const url = new URL(baseUrl);
  if (url.searchParams.has('tr')) {
    // Replace existing transformation
    url.searchParams.set('tr', transformString);
    return url.toString();
  }

  // Add new transformation
  return `${baseUrl}?tr=${transformString}`;
}

/**
 * Generate LQIP (Low Quality Image Placeholder) URL
 */
export function getLqipUrl(baseUrl: string): string {
  return getResponsiveImageUrl(baseUrl, 'lqip');
}

/**
 * Extract fileId from ImageKit URL
 */
export function extractFileId(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const filenamePart = pathParts[pathParts.length - 1];
    // Remove extension and return as fileId
    return filenamePart.replace(/\.[^.]+$/, '');
  } catch {
    return '';
  }
}

/**
 * Validate file size (max 10MB)
 */
export function validateFileSize(file: File): boolean {
  const maxSize = 10 * 1024 * 1024; // 10MB
  return file.size <= maxSize;
}

/**
 * Validate file type (images only)
 */
export function validateFileType(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return allowedTypes.includes(file.type);
}
