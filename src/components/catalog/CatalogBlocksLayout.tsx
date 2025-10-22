/**
 * CatalogBlocksLayout - Smart layout for catalog blocks
 * 
 * Features:
 * - Groups related blocks visually
 * - Progressive spacing (not equal gaps)
 * - Subtle section backgrounds
 * - Proper hierarchy and flow
 */

import { ReactNode } from 'react';
import { BlockRendererPremium } from './BlockRendererPremium';

interface CatalogBlocksLayoutProps {
  blocks: any[];
  profile: any;
  userId?: string;
  userSlug?: string;
  catalogSlug?: string;
  catalogTitle?: string;
}

// Block type categories for grouping
const BLOCK_GROUPS = {
  cover: ['cover'],
  about: ['about', 'about_business', 'profile_header'],
  products: ['product_grid', 'category_grid', 'tag_grid'],
  buying_process: ['how_to_buy', 'delivery_pickup', 'shipping_info'],
  payment_policy: ['payments_info', 'policy_info'],
  trust: ['testimonials', 'faq', 'benefits', 'informacoes'],
  contact: ['location', 'socials'],
  other: ['catalogs', 'external_links', 'divider', 'video', 'image', 'text'],
};

function getBlockGroup(blockType: string): string {
  for (const [group, types] of Object.entries(BLOCK_GROUPS)) {
    if (types.includes(blockType)) {
      return group;
    }
  }
  return 'other';
}

function groupBlocks(blocks: any[]) {
  const grouped: { group: string; blocks: any[]; title?: string }[] = [];
  let currentGroup: string | null = null;
  let currentBlocks: any[] = [];

  blocks.forEach((block, index) => {
    const group = getBlockGroup(block.type);

    // Start new group if group changes
    if (group !== currentGroup) {
      if (currentBlocks.length > 0) {
        grouped.push({
          group: currentGroup!,
          blocks: currentBlocks,
          title: getGroupTitle(currentGroup!),
        });
      }
      currentGroup = group;
      currentBlocks = [block];
    } else {
      currentBlocks.push(block);
    }
  });

  // Add last group
  if (currentBlocks.length > 0) {
    grouped.push({
      group: currentGroup!,
      blocks: currentBlocks,
      title: getGroupTitle(currentGroup!),
    });
  }

  return grouped;
}

function getGroupTitle(group: string): string | undefined {
  const titles: Record<string, string> = {
    buying_process: 'Como comprar e receber',
    payment_policy: 'Pagamentos e políticas',
    contact: 'Localização e contato',
    trust: 'Confiança e qualidade',
  };
  return titles[group];
}

function getGroupSpacing(group: string): string {
  // Different spacing for different group types
  const spacing: Record<string, string> = {
    cover: 'mb-8',
    about: 'mb-8',
    products: 'mb-12',
    buying_process: 'mb-8',
    payment_policy: 'mb-8',
    trust: 'mb-8',
    contact: 'mb-6',
    other: 'mb-6',
  };
  return spacing[group] || 'mb-6';
}

function shouldHaveBackground(group: string): boolean {
  // Add subtle background to operational/info groups
  return ['buying_process', 'payment_policy'].includes(group);
}

export function CatalogBlocksLayout({
  blocks,
  profile,
  userId,
  userSlug,
  catalogSlug,
  catalogTitle,
}: CatalogBlocksLayoutProps) {
  const groupedBlocks = groupBlocks(blocks);

  return (
    <div className="space-y-0">
      {groupedBlocks.map((group, groupIndex) => {
        const hasBackground = shouldHaveBackground(group.group);
        const spacing = getGroupSpacing(group.group);
        const showTitle = group.title && group.blocks.length > 1;

        return (
          <div key={`group-${groupIndex}`} className={spacing}>
            {/* Optional group title */}
            {showTitle && (
              <div className="container max-w-[1120px] mx-auto px-4 mb-4">
                <h3 className="text-sm text-muted-foreground uppercase tracking-wide font-medium">
                  {group.title}
                </h3>
              </div>
            )}

            {/* Group container with optional background */}
            <div
              className={`
                ${hasBackground ? 'bg-muted/20 py-6' : ''}
                ${group.blocks.length > 1 ? 'space-y-3' : ''}
              `}
            >
              {group.blocks.map((block, blockIndex) => (
                <div
                  key={block.id}
                  className={`
                    ${blockIndex > 0 && !hasBackground ? 'pt-4' : ''}
                  `}
                >
                  <BlockRendererPremium
                    block={block}
                    profile={profile}
                    userId={userId}
                    userSlug={userSlug}
                    catalogSlug={catalogSlug}
                    catalogTitle={catalogTitle}
                    index={groupIndex * 100 + blockIndex}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
