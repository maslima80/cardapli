import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { GripVertical, X } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface CatalogosBlockSettingsProps {
  data: {
    mode?: "all" | "manual";
    catalog_ids?: string[];
    layout?: string;
    columns?: number;
  };
  onUpdate: (data: any) => void;
  userId: string;
}

interface Catalog {
  id: string;
  title: string;
  slug: string;
  status: string;
  link_ativo: boolean;
}

const SortableCatalogItem = ({ catalog, onRemove }: { catalog: Catalog; onRemove: () => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: catalog.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 bg-muted rounded-lg"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{catalog.title}</p>
        <p className="text-xs text-muted-foreground">{catalog.slug}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};

export const CatalogosBlockSettings = ({
  data,
  onUpdate,
  userId,
}: CatalogosBlockSettingsProps) => {
  const [mode, setMode] = useState<"all" | "manual">(data.mode || "all");
  const [selectedIds, setSelectedIds] = useState<string[]>(data.catalog_ids || []);
  const [availableCatalogs, setAvailableCatalogs] = useState<Catalog[]>([]);
  const [selectedCatalogs, setSelectedCatalogs] = useState<Catalog[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadCatalogs();
  }, [userId]);

  useEffect(() => {
    // Update selected catalogs when IDs change
    const selected = availableCatalogs.filter(c => selectedIds.includes(c.id));
    // Maintain order from selectedIds
    const ordered = selectedIds
      .map(id => selected.find(c => c.id === id))
      .filter(Boolean) as Catalog[];
    setSelectedCatalogs(ordered);
  }, [selectedIds, availableCatalogs]);

  const loadCatalogs = async () => {
    const { data: catalogs, error } = await supabase
      .from("catalogs")
      .select("id, title, slug, status, link_ativo")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (!error && catalogs) {
      setAvailableCatalogs(catalogs);
    }
  };

  const handleModeChange = (newMode: "all" | "manual") => {
    setMode(newMode);
    updateParent(newMode, selectedIds);
  };

  const handleToggleCatalog = (catalogId: string) => {
    const newIds = selectedIds.includes(catalogId)
      ? selectedIds.filter(id => id !== catalogId)
      : [...selectedIds, catalogId];
    
    setSelectedIds(newIds);
    updateParent(mode, newIds);
  };

  const handleRemoveCatalog = (catalogId: string) => {
    const newIds = selectedIds.filter(id => id !== catalogId);
    setSelectedIds(newIds);
    updateParent(mode, newIds);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = selectedIds.indexOf(active.id as string);
    const newIndex = selectedIds.indexOf(over.id as string);
    const newIds = arrayMove(selectedIds, oldIndex, newIndex);
    
    setSelectedIds(newIds);
    updateParent(mode, newIds);
  };

  const updateParent = (newMode: "all" | "manual", newIds: string[]) => {
    onUpdate({
      mode: newMode,
      catalog_ids: newIds,
      layout: data.layout || "grid",
      columns: data.columns || 2,
    });
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="space-y-3">
        <Label>Modo de exibição</Label>
        <div className="space-y-2">
          <div
            className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              mode === "all"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
            onClick={() => handleModeChange("all")}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    mode === "all" ? "border-primary" : "border-muted-foreground"
                  }`}
                >
                  {mode === "all" && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
              </div>
              <div>
                <p className="font-medium">Mostrar todos</p>
                <p className="text-sm text-muted-foreground">
                  Exibe automaticamente todos os catálogos publicados com link ativo
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              mode === "manual"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
            onClick={() => handleModeChange("manual")}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    mode === "manual" ? "border-primary" : "border-muted-foreground"
                  }`}
                >
                  {mode === "manual" && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
              </div>
              <div>
                <p className="font-medium">Selecionar manualmente</p>
                <p className="text-sm text-muted-foreground">
                  Escolha quais catálogos exibir e defina a ordem
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Selection */}
      {mode === "manual" && (
        <div className="space-y-4">
          {/* Available Catalogs */}
          <div className="space-y-2">
            <Label>Catálogos disponíveis</Label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableCatalogs.map((catalog) => (
                <div
                  key={catalog.id}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <Checkbox
                    checked={selectedIds.includes(catalog.id)}
                    onCheckedChange={() => handleToggleCatalog(catalog.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{catalog.title}</p>
                    <p className="text-xs text-muted-foreground">{catalog.slug}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Catalogs (Reorderable) */}
          {selectedCatalogs.length > 0 && (
            <div className="space-y-2">
              <Label>Ordem de exibição ({selectedCatalogs.length})</Label>
              <p className="text-sm text-muted-foreground">
                Arraste para reordenar
              </p>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={selectedCatalogs.map(c => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {selectedCatalogs.map((catalog) => (
                      <SortableCatalogItem
                        key={catalog.id}
                        catalog={catalog}
                        onRemove={() => handleRemoveCatalog(catalog.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Dica:</strong> Apenas catálogos publicados com link ativo serão exibidos na página pública.
          {mode === "manual" && " Catálogos que voltarem para rascunho serão ocultados automaticamente."}
        </p>
      </div>
    </div>
  );
};
