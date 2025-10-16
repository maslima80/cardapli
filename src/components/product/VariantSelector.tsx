import { useState, useEffect } from "react";
import { ProductOption, ProductVariant, findMatchingVariant } from "@/lib/variants";
import { Badge } from "@/components/ui/badge";

interface VariantSelectorProps {
  options: ProductOption[];
  variants: ProductVariant[];
  onVariantChange: (variant: ProductVariant | null, combination: Record<string, string>) => void;
}

export const VariantSelector = ({ options, variants, onVariantChange }: VariantSelectorProps) => {
  const [selectedCombination, setSelectedCombination] = useState<Record<string, string>>({});

  // Initialize with first available variant or first values
  useEffect(() => {
    if (options.length === 0) return;

    const initialCombination: Record<string, string> = {};
    
    // Try to find first available variant
    const availableVariant = variants.find(v => v.is_available);
    
    if (availableVariant) {
      // Use the available variant's combination
      Object.assign(initialCombination, availableVariant.combination);
    } else {
      // Use first value of each option
      options.forEach(option => {
        if (option.values.length > 0) {
          initialCombination[option.id] = option.values[0].id;
        }
      });
    }

    setSelectedCombination(initialCombination);
  }, [options, variants]);

  // Notify parent when combination changes
  useEffect(() => {
    if (Object.keys(selectedCombination).length === options.length) {
      const matchingVariant = findMatchingVariant(variants, selectedCombination);
      onVariantChange(matchingVariant, selectedCombination);
    }
  }, [selectedCombination, variants, options.length, onVariantChange]);

  const handleValueSelect = (optionId: string, valueId: string) => {
    setSelectedCombination(prev => ({
      ...prev,
      [optionId]: valueId,
    }));
  };

  if (options.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {options.map(option => (
        <div key={option.id} className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            {option.name}
          </label>
          
          {/* Segmented Control for Single Option */}
          {option.values.length <= 5 ? (
            <div className="flex flex-wrap gap-2">
              {option.values.map(value => {
                const isSelected = selectedCombination[option.id] === value.id;
                
                // Check if this value would result in an available variant
                const testCombination = { ...selectedCombination, [option.id]: value.id };
                const testVariant = findMatchingVariant(variants, testCombination);
                const isAvailable = testVariant?.is_available !== false;

                return (
                  <button
                    key={value.id}
                    onClick={() => handleValueSelect(option.id, value.id)}
                    disabled={!isAvailable}
                    className={`
                      px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all
                      ${isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : isAvailable
                        ? "border-border hover:border-primary hover:bg-accent"
                        : "border-border bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                      }
                    `}
                  >
                    {value.label}
                  </button>
                );
              })}
            </div>
          ) : (
            /* Dropdown for Many Options */
            <select
              value={selectedCombination[option.id] || ""}
              onChange={(e) => handleValueSelect(option.id, e.target.value)}
              className="w-full px-4 py-2 border-2 border-border rounded-lg bg-background focus:border-primary focus:outline-none"
            >
              {option.values.map(value => (
                <option key={value.id} value={value.id}>
                  {value.label}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}
    </div>
  );
};
