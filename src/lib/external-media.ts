// External media helper utilities

export interface ExternalMediaObject {
  url: string;
  provider: string;
  videoId: string;
  title: string;
  thumbnail?: string;
  embedUrl: string;
}

/**
 * Extract video info from URL
 */
export function extractVideoInfo(url: string): { provider: string; videoId: string } | null {
  if (!url) return null;

  // YouTube (including Shorts)
  const youtubeRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return { provider: 'youtube', videoId: youtubeMatch[1] };
  }

  // TikTok (full and short links)
  const tiktokRegex = /(?:tiktok\.com\/@[^\/]+\/video\/(\d+)|vm\.tiktok\.com\/([a-zA-Z0-9]+))/;
  const tiktokMatch = url.match(tiktokRegex);
  if (tiktokMatch) {
    return { provider: 'tiktok', videoId: tiktokMatch[1] || tiktokMatch[2] };
  }

  // Instagram
  const instagramRegex = /instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/;
  const instagramMatch = url.match(instagramRegex);
  if (instagramMatch) {
    return { provider: 'instagram', videoId: instagramMatch[1] };
  }

  return null;
}

/**
 * Get thumbnail for external media
 */
export function getThumbnail(media: ExternalMediaObject): string {
  if (media.thumbnail) return media.thumbnail;
  
  switch (media.provider) {
    case 'youtube':
      return `https://img.youtube.com/vi/${media.videoId}/maxresdefault.jpg`;
    case 'tiktok':
      return ''; // TikTok doesn't provide direct thumbnail URLs
    case 'instagram':
      return ''; // Instagram requires OAuth for thumbnails
    default:
      return '';
  }
}

/**
 * Check if provider supports inline embed
 */
export function supportsInlineEmbed(provider: string): boolean {
  return provider === 'youtube' || provider === 'tiktok';
}
