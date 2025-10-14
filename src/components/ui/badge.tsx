import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = "Badge";
