import React from "react";
import SimpleProductPicker from "./SimpleProductPicker";

type Status = "disponivel" | "sob_encomenda" | "ambos";

export type ProductPickerModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  /** NEW API expected by settings */
  value: string[];                             // selected product IDs
  onConfirm: (ids: string[]) => void;          // called on save/confirm
  initialFilters?: {
    categories?: string[];
    tags?: string[];
    status?: Status;
  };

  /** Pass-through props you might already have (optional) */
  title?: string;
  className?: string;
  userId?: string;
};

// This adapter maps the *new* API to the *old* props used by the current Refactored modal
export default function ProductPickerModalBridge(props: ProductPickerModalProps) {
  const {
    open,
    onOpenChange,
    value,
    onConfirm,
    userId,
  } = props;

  return (
    <SimpleProductPicker
      open={open}
      onOpenChange={onOpenChange}
      value={value}
      onConfirm={onConfirm}
      userId={userId}
    />
  );
}
