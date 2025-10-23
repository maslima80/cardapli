/**
 * CatalogBlocksLayout - Cinematic catalog experience
 * 
 * Features:
 * - Premium adaptive spacing (48px → 96px)
 * - Visual grouping with unified sections
 * - Narrative flow over blocky cards
 * - Editorial design hierarchy
 */

import { ReactNode } from 'react';
import { BlockRendererPremium } from './BlockRendererPremium';
import { CinematicSection, SectionDivider } from './CatalogThemeLayoutPremium';
import { DeliveryShippingGroupPremium } from '../blocks/DeliveryShippingGroupPremium';

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

function getGroupSpacing(group: string): 'tight' | 'normal' | 'loose' | 'extra-loose' {
  // Cinematic adaptive spacing based on content type
  const spacing: Record<string, 'tight' | 'normal' | 'loose' | 'extra-loose'> = {
    cover: 'tight',        // 48px - Cover to content connection
    about: 'tight',        // 48px - Story flows naturally
    products: 'normal',    // 64px - Breathing room after products
    buying_process: 'normal', // 64px - Clear section start
    payment_policy: 'loose',  // 80px - Separate trust section
    trust: 'normal',       // 64px - Standard flow
    contact: 'extra-loose', // 96px - Footer separation
    other: 'normal',       // 64px - Default
  };
  return spacing[group] || 'normal';
}

function getGroupBackground(group: string): 'none' | 'soft' | 'accent' | 'trust' {
  // Premium background variants for visual grouping
  const backgrounds: Record<string, 'none' | 'soft' | 'accent' | 'trust'> = {
    buying_process: 'none',  // Handled by individual blocks
    payment_policy: 'none',  // Handled by individual blocks
    trust: 'soft',           // Subtle background for trust elements
  };
  return backgrounds[group] || 'none';
}

function renderGroupBlocks(
  blocks: any[],
  groupType: string,
  profile: any,
  userId?: string,
  userSlug?: string,
  catalogSlug?: string,
  catalogTitle?: string,
  groupIndex?: number
) {
  // Special handling for buying_process group: combine delivery + shipping
  if (groupType === 'buying_process') {
    const deliveryBlock = blocks.find(b => b.type === 'delivery_pickup');
    const shippingBlock = blocks.find(b => b.type === 'shipping_info');
    const otherBlocks = blocks.filter(b => b.type !== 'delivery_pickup' && b.type !== 'shipping_info');

    return (
      <>
        {/* Render other blocks (like how_to_buy) first */}
        {otherBlocks.map((block, blockIndex) => (
          <BlockRendererPremium
            key={block.id}
            block={block}
            profile={profile}
            userId={userId}
            userSlug={userSlug}
            catalogSlug={catalogSlug}
            catalogTitle={catalogTitle}
            index={(groupIndex || 0) * 100 + blockIndex}
          />
        ))}

        {/* Render combined delivery + shipping if either exists */}
        {(deliveryBlock || shippingBlock) && (
          <DeliveryShippingGroupPremium
            userId={userId}
            deliveryProps={deliveryBlock?.data || {}}
            shippingProps={shippingBlock?.data || {}}
          />
        )}
      </>
    );
  }

  // Default rendering for other groups
  return blocks.map((block, blockIndex) => (
    <BlockRendererPremium
      key={block.id}
      block={block}
      profile={profile}
      userId={userId}
      userSlug={userSlug}
      catalogSlug={catalogSlug}
      catalogTitle={catalogTitle}
      index={(groupIndex || 0) * 100 + blockIndex}
    />
  ));
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
    <div className="max-w-3xl mx-auto px-6 md:px-8 pb-20">
      {groupedBlocks.map((group, groupIndex) => {
        const spacing = getGroupSpacing(group.group);
        const background = getGroupBackground(group.group);
        const isLastGroup = groupIndex === groupedBlocks.length - 1;

        return (
          <CinematicSection
            key={`group-${groupIndex}`}
            spacing={spacing}
            background={background}
            className={isLastGroup ? 'mb-16' : ''}
          >
            {/* Blocks within group */}
            <div className={group.blocks.length > 1 ? 'space-y-6' : ''}>
              {renderGroupBlocks(
                group.blocks,
                group.group,
                profile,
                userId,
                userSlug,
                catalogSlug,
                catalogTitle,
                groupIndex
              )}
            </div>
          </CinematicSection>
        );
      })}
    </div>
  );
}
