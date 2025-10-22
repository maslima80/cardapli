/**
 * CatalogThemeLayoutPremium - Cinematic catalog experience
 * 
 * Philosophy:
 * - From "blocks" to "narrative flow"
 * - Adaptive spacing based on content type
 * - Visual grouping of related information
 * - Premium editorial design
 * 
 * Inspired by: Apple product pages × Canva layouts × Magazine storytelling
 */

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CatalogThemeLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * Main layout wrapper with premium spacing and flow
 */
export function CatalogThemeLayout({ children, className }: CatalogThemeLayoutProps) {
  return (
    <main className={cn(
      "min-h-screen bg-background",
      className
    )}>
      {/* Premium container with optimal reading width */}
      <div className="max-w-3xl mx-auto px-6 md:px-8">
        {children}
      </div>
    </main>
  );
}

/**
 * Section wrapper with adaptive spacing
 */
interface SectionProps {
  children: ReactNode;
  spacing?: 'tight' | 'normal' | 'loose' | 'extra-loose';
  background?: 'none' | 'soft' | 'accent' | 'trust';
  className?: string;
  id?: string;
}

export function CinematicSection({ 
  children, 
  spacing = 'normal',
  background = 'none',
  className,
  id 
}: SectionProps) {
  // Adaptive spacing based on content type
  const spacingClasses = {
    tight: 'mt-12',      // 48px - For connected content
    normal: 'mt-16',     // 64px - Standard flow
    loose: 'mt-20',      // 80px - Clear separation
    'extra-loose': 'mt-24', // 96px - Major transitions
  };

  // Background variants
  const backgroundClasses = {
    none: '',
    soft: 'bg-muted/5 -mx-6 md:-mx-8 px-6 md:px-8 py-8 rounded-2xl',
    accent: 'bg-primary/5 -mx-6 md:-mx-8 px-6 md:px-8 py-8 rounded-2xl',
    trust: 'bg-sky-50/50 dark:bg-sky-950/20 -mx-6 md:-mx-8 px-6 md:px-8 py-8 rounded-2xl',
  };

  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        spacingClasses[spacing],
        backgroundClasses[background],
        className
      )}
    >
      {children}
    </motion.section>
  );
}

/**
 * Section divider with optional label
 */
interface SectionDividerProps {
  label?: string;
  className?: string;
}

export function SectionDivider({ label, className }: SectionDividerProps) {
  if (!label) {
    return <div className={cn("mt-16 border-t border-border/50", className)} />;
  }

  return (
    <div className={cn("mt-20 mb-8 flex items-center gap-4", className)}>
      <div className="flex-1 border-t border-border/50" />
      <h3 className="text-sm uppercase tracking-wider font-medium text-muted-foreground">
        {label}
      </h3>
      <div className="flex-1 border-t border-border/50" />
    </div>
  );
}

/**
 * Group container for related blocks
 */
interface BlockGroupProps {
  children: ReactNode;
  title?: string;
  spacing?: 'tight' | 'normal';
  background?: boolean;
  className?: string;
}

export function BlockGroup({ 
  children, 
  title,
  spacing = 'normal',
  background = false,
  className 
}: BlockGroupProps) {
  const spacingClass = spacing === 'tight' ? 'space-y-4' : 'space-y-6';
  
  return (
    <div className={cn(
      background && 'bg-muted/5 -mx-6 md:-mx-8 px-6 md:px-8 py-8 rounded-2xl',
      className
    )}>
      {title && (
        <h3 className="text-sm uppercase tracking-wider font-medium text-muted-foreground mb-6">
          {title}
        </h3>
      )}
      <div className={spacingClass}>
        {children}
      </div>
    </div>
  );
}

/**
 * Premium section header
 */
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  accent?: boolean;
  className?: string;
}

export function SectionHeader({ 
  title, 
  subtitle, 
  align = 'left',
  accent = false,
  className 
}: SectionHeaderProps) {
  return (
    <div className={cn(
      "mb-8",
      align === 'center' && 'text-center',
      className
    )}>
      <h2 className={cn(
        "text-2xl md:text-3xl font-bold tracking-tight",
        accent && "text-primary"
      )}>
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-base text-muted-foreground leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/**
 * Info grid for side-by-side content
 */
interface InfoGridProps {
  children: ReactNode;
  columns?: 1 | 2;
  gap?: 'normal' | 'large';
  className?: string;
}

export function InfoGrid({ children, columns = 2, gap = 'normal', className }: InfoGridProps) {
  return (
    <div className={cn(
      "grid gap-6",
      columns === 2 && "md:grid-cols-2",
      gap === 'large' && "gap-8",
      className
    )}>
      {children}
    </div>
  );
}

/**
 * Premium card (minimal, no heavy borders)
 */
interface PremiumCardProps {
  children: ReactNode;
  variant?: 'minimal' | 'soft' | 'bordered';
  hover?: boolean;
  className?: string;
}

export function PremiumCard({ 
  children, 
  variant = 'minimal',
  hover = false,
  className 
}: PremiumCardProps) {
  const variantClasses = {
    minimal: 'bg-transparent',
    soft: 'bg-muted/5 rounded-2xl p-6',
    bordered: 'bg-card border border-border/50 rounded-2xl p-6',
  };

  return (
    <div className={cn(
      variantClasses[variant],
      hover && 'transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5',
      className
    )}>
      {children}
    </div>
  );
}

/**
 * Staggered animation container for lists
 */
interface StaggeredListProps {
  children: ReactNode;
  className?: string;
}

export function StaggeredList({ children, className }: StaggeredListProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggeredItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggeredItem({ children, className }: StaggeredItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
      }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
