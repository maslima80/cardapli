import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface MultiSelectChipsProps {
  availableOptions: string[];
  selectedOptions: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export const MultiSelectChips = ({ 
  availableOptions, 
  selectedOptions, 
  onChange,
  placeholder = "Digite para buscar..."
}: MultiSelectChipsProps) => {
  const [search, setSearch] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredOptions(availableOptions.filter(opt => !selectedOptions.includes(opt)));
    } else {
      setFilteredOptions(
        availableOptions
          .filter(opt => !selectedOptions.includes(opt))
          .filter(opt => opt.toLowerCase().includes(search.toLowerCase()))
      );
    }
  }, [search, availableOptions, selectedOptions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange([...selectedOptions, option]);
    setSearch("");
    setIsOpen(false);
  };

  const handleRemove = (option: string) => {
    onChange(selectedOptions.filter(opt => opt !== option));
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <Badge key={option} variant="secondary" className="pr-1">
              {option}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1 hover:bg-transparent"
                onClick={() => handleRemove(option)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
      
      <div className="relative">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
        />
        
        {isOpen && filteredOptions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-background border rounded-xl shadow-lg max-h-48 overflow-y-auto">
            {filteredOptions.slice(0, 10).map((option) => (
              <button
                key={option}
                className="w-full px-4 py-2 text-left hover:bg-muted transition-colors"
                onClick={() => handleSelect(option)}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {isOpen && filteredOptions.length === 0 && availableOptions.length === 0 && (
          <div className="absolute z-10 w-full mt-1 bg-background border rounded-xl shadow-lg p-4 text-center text-sm text-muted-foreground">
            Nenhuma opção disponível. Crie produtos com categorias/tags primeiro.
          </div>
        )}
      </div>
    </div>
  );
};
