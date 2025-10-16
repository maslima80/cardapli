import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionProps {
  children: ReactNode;
  className?: string;
  altBackground?: boolean;
  noPadding?: boolean;
  fullWidth?: boolean;
  id?: string;
}

export function Section({ 
  children, 
  className, 
  altBackground = false,
  noPadding = false,
  fullWidth = false,
  id
}: SectionProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        altBackground && "bg-slate-50",
        !noPadding && "py-8 sm:py-12",
        className
      )}
    >
      <div className={cn(
        !fullWidth && "container max-w-[1120px] mx-auto px-4 sm:px-6"
      )}>
        {children}
      </div>
    </motion.section>
  );
}

interface SectionHeaderProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeader({ title, subtitle, className }: SectionHeaderProps) {
  if (!title && !subtitle) return null;
  
  return (
    <div className={cn("mb-6 sm:mb-8", className)}>
      {title && (
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="text-muted-foreground mt-2">
          {subtitle}
        </p>
      )}
    </div>
  );
}
