import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Tag } from "lucide-react";

interface TagGridBlockSettingsProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function TagGridBlockSettings({ data, onUpdate }: TagGridBlockSettingsProps) {
  const [title, setTitle] = useState(data?.title || "Tags");
  const [description, setDescription] = useState(data?.description || "");
  const [showCount, setShowCount] = useState(data?.show_count !== false);
  const [selectedTags, setSelectedTags] = useState<string[]>(data?.selected_tags || []);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync state with data prop when it changes (when dialog reopens)
  useEffect(() => {
    setTitle(data?.title || "Tags");
    setDescription(data?.description || "");
    setShowCount(data?.show_count !== false);
    setSelectedTags(data?.selected_tags || []);
  }, [data]);

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

  // Helper function to update parent with current state
  const updateParent = (overrides = {}) => {
    const updatedData = {
      title,
      description,
      show_count: showCount,
      selected_tags: selectedTags,
      ...overrides,
    };
    onUpdate(updatedData);
  };

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const newTags = prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag];
      updateParent({ selected_tags: newTags });
      return newTags;
    });
  };

  // Select all tags
  const selectAllTags = () => {
    const allTags = [...tags];
    setSelectedTags(allTags);
    updateParent({ selected_tags: allTags });
  };

  // Clear all selected tags
  const clearSelectedTags = () => {
    setSelectedTags([]);
    updateParent({ selected_tags: [] });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => {
            const newTitle = e.target.value;
            setTitle(newTitle);
            updateParent({ title: newTitle });
          }}
          placeholder="Tags"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição (opcional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => {
            const newDesc = e.target.value;
            setDescription(newDesc);
            updateParent({ description: newDesc });
          }}
          placeholder="Explore nossos produtos por tag"
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="show-count"
          checked={showCount}
          onCheckedChange={(checked) => {
            const newShowCount = checked === true;
            setShowCount(newShowCount);
            updateParent({ show_count: newShowCount });
          }}
        />
        <Label htmlFor="show-count">Mostrar contagem de produtos</Label>
      </div>

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
