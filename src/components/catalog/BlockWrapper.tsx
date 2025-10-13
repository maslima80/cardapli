import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BlockBackground = "surface" | "tint" | "elevated" | "media";

interface BlockWrapperProps {
  children: ReactNode;
  background?: BlockBackground;
  fullBleed?: boolean;
  className?: string;
  id?: string;
  ariaLabelledby?: string;
}

export const BlockWrapper = ({
  children,
  background = "surface",
  fullBleed = false,
  className,
  id,
  ariaLabelledby
}: BlockWrapperProps) => {
  return (
    <section 
      id={id}
      aria-labelledby={ariaLabelledby}
      data-bg={background}
      className={cn(
        "block-wrapper transition-all duration-300",
        !fullBleed && "px-4 sm:px-6",
        className
      )}
    >
      <div className={cn(
        !fullBleed && "container mx-auto max-w-[1120px]",
      )}>
        {children}
      </div>
    </section>
  );
};
