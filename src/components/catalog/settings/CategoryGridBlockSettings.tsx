import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Layers } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface CategoryGridBlockSettingsProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function CategoryGridBlockSettings({ data, onUpdate }: CategoryGridBlockSettingsProps) {
  const [title, setTitle] = useState(data?.title || "Categorias");
  const [description, setDescription] = useState(data?.description || "");
  const [columns, setColumns] = useState(data?.columns || 3);
  const [showCount, setShowCount] = useState(data?.show_count !== false);
  const [showButton, setShowButton] = useState(data?.show_button !== false);
  const [buttonText, setButtonText] = useState(data?.button_text || "Ver produtos");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(data?.selected_categories || []);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all unique categories from products
  useEffect(() => {
    async function loadCategories() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: productsData } = await supabase
          .from("products")
          .select("categories")
          .eq("user_id", user.id);

        if (productsData) {
          // Extract unique categories
          const uniqueCategories = new Set<string>();
          productsData.forEach(product => {
            if (product.categories && Array.isArray(product.categories)) {
              product.categories.forEach((category: string) => {
                if (category) uniqueCategories.add(category);
              });
            }
          });

          const categoriesArray = Array.from(uniqueCategories);
          setCategories(categoriesArray);
          
          // If no categories are selected yet, select all by default
          if (!data?.selected_categories?.length) {
            setSelectedCategories(categoriesArray);
          }
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  // Update parent component when settings change
  useEffect(() => {
    const updatedData = {
      ...data,
      title,
      description,
      columns,
      show_count: showCount,
      show_button: showButton,
      button_text: buttonText,
      selected_categories: selectedCategories,
    };
    onUpdate(updatedData);
  }, [title, description, columns, showCount, showButton, buttonText, selectedCategories]);

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Select all categories
  const selectAllCategories = () => {
    setSelectedCategories([...categories]);
  };

  // Clear all selected categories
  const clearSelectedCategories = () => {
    setSelectedCategories([]);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Categorias"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição (opcional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Explore nossos produtos por categoria"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="columns">Colunas: {columns}</Label>
        </div>
        <Slider
          id="columns"
          min={1}
          max={4}
          step={1}
          value={[columns]}
          onValueChange={(value) => setColumns(value[0])}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="show-count"
          checked={showCount}
          onCheckedChange={(checked) => setShowCount(checked === true)}
        />
        <Label htmlFor="show-count">Mostrar contagem de produtos</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="show-button"
          checked={showButton}
          onCheckedChange={(checked) => setShowButton(checked === true)}
        />
        <Label htmlFor="show-button">Mostrar botão</Label>
      </div>

      {showButton && (
        <div className="space-y-2">
          <Label htmlFor="button-text">Texto do botão</Label>
          <Input
            id="button-text"
            value={buttonText}
            onChange={(e) => setButtonText(e.target.value)}
            placeholder="Ver produtos"
          />
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Selecionar categorias</Label>
          <div className="space-x-2 text-xs">
            <button
              type="button"
              onClick={selectAllCategories}
              className="text-primary hover:underline"
            >
              Selecionar todas
            </button>
            <span>|</span>
            <button
              type="button"
              onClick={clearSelectedCategories}
              className="text-primary hover:underline"
            >
              Limpar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : categories.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Layers className="h-10 w-10 mx-auto text-muted-foreground opacity-50 mb-2" />
              <p className="text-muted-foreground">
                Nenhuma categoria encontrada. Adicione produtos com categorias primeiro.
              </p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-60 border rounded-md">
            <div className="p-4 space-y-2">
              {categories.map((category) => (
                <div
                  key={category}
                  className="flex items-start space-x-2 p-2 hover:bg-muted/50 rounded-md"
                >
                  <Checkbox
                    id={`category-${category}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => toggleCategory(category)}
                  />
                  <Label
                    htmlFor={`category-${category}`}
                    className="font-medium cursor-pointer"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
