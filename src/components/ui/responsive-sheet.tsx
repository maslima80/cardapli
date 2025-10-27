/**
 * ResponsiveSheet - Automatically uses Dialog on desktop, MobileSheet on mobile
 * 
 * This provides the best UX for both form factors:
 * - Desktop: Centered modal dialog
 * - Mobile: Bottom sheet that slides up
 */

import * as React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  MobileSheet,
  SheetSection,
  SheetActions,
  SheetActionsProps,
} from "@/components/ui/mobile-sheet";

export interface ResponsiveSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  size?: "auto" | "tall" | "full";
  safeClose?: boolean;
  children: React.ReactNode;
  className?: string;
  actions?: SheetActionsProps;
}

export const ResponsiveSheet = ({
  open,
  onOpenChange,
  title,
  description,
  size = "tall",
  safeClose = false,
  children,
  className,
  actions,
}: ResponsiveSheetProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (isMobile) {
    return (
      <MobileSheet
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        description={description}
        size={size}
        safeClose={safeClose}
        className={className}
      >
        {children}
        {actions && <SheetActions {...actions} />}
      </MobileSheet>
    );
  }

  // Desktop: Use regular Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={className}>
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        {children}
        {actions && (
          <div className="flex gap-2 justify-end pt-4 border-t">
            {actions.secondary && (
              <button
                onClick={actions.secondary.onClick}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {actions.secondary.label}
              </button>
            )}
            {actions.primary && (
              <button
                onClick={actions.primary.onClick}
                disabled={actions.primary.disabled || actions.primary.loading}
                className="px-6 py-2.5 rounded-lg font-medium text-sm transition-all bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {actions.primary.loading
                  ? "Salvando..."
                  : actions.primary.label}
              </button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Export SheetSection for use with ResponsiveSheet
export { SheetSection };
