import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tag } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface TagGridBlockSettingsProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function TagGridBlockSettings({ data, onUpdate }: TagGridBlockSettingsProps) {
  const [title, setTitle] = useState(data?.title || "Tags");
  const [description, setDescription] = useState(data?.description || "");
  const [columns, setColumns] = useState(data?.columns || 3);
  const [showCount, setShowCount] = useState(data?.show_count !== false);
  const [showButton, setShowButton] = useState(data?.show_button !== false);
  const [buttonText, setButtonText] = useState(data?.button_text || "Ver produtos");
  const [style, setStyle] = useState(data?.style || "card");
  const [selectedTags, setSelectedTags] = useState<string[]>(data?.selected_tags || []);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all unique tags from products
  useEffect(() => {
    async function loadTags() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: productsData } = await supabase
          .from("products")
          .select("quality_tags")
          .eq("user_id", user.id);

        if (productsData) {
          // Extract unique tags
          const uniqueTags = new Set<string>();
          productsData.forEach(product => {
            if (product.quality_tags && Array.isArray(product.quality_tags)) {
              product.quality_tags.forEach((tag: string) => {
                if (tag) uniqueTags.add(tag);
              });
            }
          });

          const tagsArray = Array.from(uniqueTags);
          setTags(tagsArray);
          
          // If no tags are selected yet, select all by default
          if (!data?.selected_tags?.length) {
            setSelectedTags(tagsArray);
          }
        }
      } catch (error) {
        console.error("Error loading tags:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTags();
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
      style,
      selected_tags: selectedTags,
    };
    onUpdate(updatedData);
  }, [title, description, columns, showCount, showButton, buttonText, style, selectedTags]);

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  // Select all tags
  const selectAllTags = () => {
    setSelectedTags([...tags]);
  };

  // Clear all selected tags
  const clearSelectedTags = () => {
    setSelectedTags([]);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tags"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição (opcional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Explore nossos produtos por tag"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Estilo</Label>
        <RadioGroup
          value={style}
          onValueChange={setStyle}
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="card" id="style-card" />
            <Label htmlFor="style-card">Cards</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="badge" id="style-badge" />
            <Label htmlFor="style-badge">Badges</Label>
          </div>
        </RadioGroup>
      </div>

      {style === "card" && (
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
      )}

      <div className="flex items-center space-x-2">
        <Checkbox
          id="show-count"
          checked={showCount}
          onCheckedChange={(checked) => setShowCount(checked === true)}
        />
        <Label htmlFor="show-count">Mostrar contagem de produtos</Label>
      </div>

      {style === "card" && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="show-button"
            checked={showButton}
            onCheckedChange={(checked) => setShowButton(checked === true)}
          />
          <Label htmlFor="show-button">Mostrar botão</Label>
        </div>
      )}

      {showButton && style === "card" && (
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
          <Label>Selecionar tags</Label>
          <div className="space-x-2 text-xs">
            <button
              type="button"
              onClick={selectAllTags}
              className="text-primary hover:underline"
            >
              Selecionar todas
            </button>
            <span>|</span>
            <button
              type="button"
              onClick={clearSelectedTags}
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
        ) : tags.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Tag className="h-10 w-10 mx-auto text-muted-foreground opacity-50 mb-2" />
              <p className="text-muted-foreground">
                Nenhuma tag encontrada. Adicione produtos com tags primeiro.
              </p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-60 border rounded-md">
            <div className="p-4 space-y-2">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-start space-x-2 p-2 hover:bg-muted/50 rounded-md"
                >
                  <Checkbox
                    id={`tag-${tag}`}
                    checked={selectedTags.includes(tag)}
                    onCheckedChange={() => toggleTag(tag)}
                  />
                  <Label
                    htmlFor={`tag-${tag}`}
                    className="font-medium cursor-pointer"
                  >
                    {tag}
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
