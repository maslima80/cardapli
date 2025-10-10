import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CategoriesSectionProps {
  categories: string[];
  tags: string[];
  onCategoriesChange: (value: string[]) => void;
  onTagsChange: (value: string[]) => void;
}

const SUGGESTED_TAGS = [
  "Vegano",
  "Natural",
  "Feito à mão",
  "Mais vendido",
  "Orgânico",
  "Premium",
  "Personalizado",
];

export function CategoriesSection({
  categories,
  tags,
  onCategoriesChange,
  onTagsChange,
}: CategoriesSectionProps) {
  const [categoryInput, setCategoryInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [existingCategories, setExistingCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchExistingCategories();
  }, []);

  const fetchExistingCategories = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("products")
        .select("categories")
        .eq("user_id", user.id);

      if (error) throw error;

      // Extract and flatten all unique categories
      const allCategories = data
        ?.flatMap(p => p.categories || [])
        .filter((cat, index, self) => cat && self.indexOf(cat) === index) || [];

      setExistingCategories(allCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const addCategory = (category: string) => {
    const trimmed = category.trim();
    if (trimmed && !categories.includes(trimmed)) {
      onCategoriesChange([...categories, trimmed]);
      setCategoryInput("");
    }
  };

  const removeCategory = (categoryToRemove: string) => {
    onCategoriesChange(categories.filter((c) => c !== categoryToRemove));
  };

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onTagsChange([...tags, trimmed]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((t) => t !== tagToRemove));
  };

  const handleCategoryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCategory(categoryInput);
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Categorias e Tags</h3>
        <p className="text-sm text-muted-foreground">
          Organize e destaque seu produto
        </p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Categories */}
        <div className="space-y-2">
          <Label htmlFor="categories">Categorias</Label>
          <Input
            id="categories"
            placeholder="Ex: Bolos, Doces, Festas... (pressione Enter para adicionar)"
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
            onKeyDown={handleCategoryKeyDown}
          />
          <p className="text-xs text-muted-foreground">
            Adicione múltiplas categorias pressionando Enter após cada uma
          </p>
        </div>

        {/* Selected categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge key={cat} variant="default" className="gap-1">
                {cat}
                <button
                  type="button"
                  onClick={() => removeCategory(cat)}
                  className="ml-1 hover:text-destructive-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Suggested categories from other products */}
        {existingCategories.filter((cat) => !categories.includes(cat)).length > 0 && (
          <div className="pt-2">
            <p className="text-sm font-medium mb-2">Categorias usadas em outros produtos:</p>
            <div className="flex flex-wrap gap-2">
              {existingCategories
                .filter((cat) => !categories.includes(cat))
                .map((cat) => (
                  <Badge
                    key={cat}
                    variant="outline"
                    className="cursor-pointer hover:bg-secondary"
                    onClick={() => addCategory(cat)}
                  >
                    + {cat}
                  </Badge>
                ))}
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="space-y-2 pt-4 border-t border-border">
          <Label htmlFor="tags">Tags de destaque</Label>
          <Input
            id="tags"
            placeholder="Digite uma tag e pressione Enter"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
          />
          <p className="text-xs text-muted-foreground">
            Adicione características especiais do produto
          </p>
        </div>

        {/* Selected tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Suggested tags */}
        <div>
          <p className="text-sm font-medium mb-2">Sugestões de tags:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_TAGS.filter((tag) => !tags.includes(tag)).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="cursor-pointer hover:bg-secondary"
                onClick={() => addTag(tag)}
              >
                + {tag}
              </Badge>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
