/**
 * MobileSheet - Native-feeling bottom sheet for mobile devices
 * 
 * Features:
 * - Slides up from bottom (iOS/Android style)
 * - Swipe down to close
 * - Respects keyboard and safe areas
 * - Smooth spring animations
 * - Auto-focus first input
 * - Sticky header and footer
 */

import * as React from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MobileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  size?: "auto" | "tall" | "full";
  safeClose?: boolean; // Confirm before closing if there are unsaved changes
  children: React.ReactNode;
  className?: string;
}

export const MobileSheet = ({
  open,
  onOpenChange,
  title,
  description,
  size = "tall",
  safeClose = false,
  children,
  className,
}: MobileSheetProps) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, safeClose]);

  // Prevent body scroll when sheet is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleClose = () => {
    if (safeClose) {
      const confirmed = window.confirm(
        "Tem alterações não salvas. Deseja sair mesmo assim?"
      );
      if (!confirmed) return;
    }
    onOpenChange(false);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);
    
    // If dragged down more than 100px, close the sheet
    if (info.offset.y > 100) {
      handleClose();
    }
  };

  const sizeClasses = {
    auto: "max-h-[90dvh]",
    tall: "h-[85dvh]",
    full: "h-[95dvh]",
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Sheet */}
          <motion.div
            ref={contentRef}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 40,
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-background rounded-t-2xl shadow-xl",
              sizeClasses[size],
              "sheet-content",
              className
            )}
            style={{
              touchAction: "none", // Prevent default touch behaviors during drag
            }}
          >
            {/* Drag handle */}
            <div className="flex-shrink-0 flex items-center justify-center py-3 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 rounded-full bg-muted-foreground/20" />
            </div>

            {/* Header */}
            {(title || description) && (
              <div className="flex-shrink-0 sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {title && (
                    <h2 className="text-lg font-semibold truncate">{title}</h2>
                  )}
                  {description && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleClose}
                  className="ml-4 p-2 rounded-full hover:bg-muted transition-colors flex-shrink-0"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Content - scrollable */}
            <div className="flex-1 overflow-y-auto sheet-scrollable">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Sheet Section - for organizing content
export const SheetSection = ({
  children,
  className,
  title,
  description,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}) => {
  return (
    <div className={cn("px-4 py-4 space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="text-sm font-semibold">{title}</h3>}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

// Sheet Header - for custom headers
export const SheetHeader = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex-shrink-0 sticky top-0 z-10 bg-background border-b px-4 py-3",
        className
      )}
    >
      {children}
    </div>
  );
};

// Sheet Actions - sticky footer with action buttons
export interface SheetActionsProps {
  primary?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
  };
  secondary?: {
    label: string;
    onClick?: () => void;
  };
  showUnsavedDot?: boolean;
  className?: string;
}

export const SheetActions = ({
  primary,
  secondary,
  showUnsavedDot = false,
  className,
}: SheetActionsProps) => {
  return (
    <div
      className={cn(
        "sticky-actions flex gap-2 items-center",
        className
      )}
    >
      {showUnsavedDot && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span>Não salvo</span>
        </div>
      )}
      
      <div className="flex-1" />
      
      {secondary && (
        <button
          onClick={secondary.onClick}
          className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {secondary.label}
        </button>
      )}
      
      {primary && (
        <button
          onClick={primary.onClick}
          disabled={primary.disabled || primary.loading}
          className={cn(
            "px-6 py-2.5 rounded-lg font-medium text-sm transition-all",
            "bg-primary text-primary-foreground",
            "hover:bg-primary/90 active:scale-95",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "min-h-[44px]" // iOS tap target size
          )}
        >
          {primary.loading ? "Salvando..." : primary.label}
        </button>
      )}
    </div>
  );
};

// Help tip component for in-context help
export const SheetHelpTip = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3",
        className
      )}
    >
      <p className="text-xs text-blue-900 dark:text-blue-200">{children}</p>
    </div>
  );
};
