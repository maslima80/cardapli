import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { GripVertical, X, AlertCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
    title?: string;
    catalog_ids?: string[];
    layout?: "grid" | "swipe";
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
  const [selectedIds, setSelectedIds] = useState<string[]>(data.catalog_ids || []);
  const [availableCatalogs, setAvailableCatalogs] = useState<Catalog[]>([]);
  const [selectedCatalogs, setSelectedCatalogs] = useState<Catalog[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sync selectedIds when data.catalog_ids changes (when drawer opens with existing data)
  useEffect(() => {
    if (data.catalog_ids && data.catalog_ids.length > 0) {
      setSelectedIds(data.catalog_ids);
    }
  }, [data.catalog_ids]);

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

  const handleToggleCatalog = (catalogId: string, catalog: Catalog) => {
    // Check if catalog is eligible
    if (!isEligible(catalog)) return;
    
    const newIds = selectedIds.includes(catalogId)
      ? selectedIds.filter(id => id !== catalogId)
      : [...selectedIds, catalogId];
    
    setSelectedIds(newIds);
    updateParent(newIds);
  };

  const isEligible = (catalog: Catalog) => {
    return catalog.status === 'publicado' && catalog.link_ativo === true;
  };

  const getIneligibilityReason = (catalog: Catalog) => {
    if (catalog.status !== 'publicado') {
      return 'Precisa estar publicado';
    }
    if (!catalog.link_ativo) {
      return 'Precisa ter link ativo';
    }
    return '';
  };

  const handleRemoveCatalog = (catalogId: string) => {
    const newIds = selectedIds.filter(id => id !== catalogId);
    setSelectedIds(newIds);
    updateParent(newIds);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = selectedIds.indexOf(active.id as string);
    const newIndex = selectedIds.indexOf(over.id as string);
    const newIds = arrayMove(selectedIds, oldIndex, newIndex);
    
    setSelectedIds(newIds);
    updateParent(newIds);
  };

  const updateParent = (newIds: string[], newLayout?: "grid" | "swipe", newTitle?: string) => {
    onUpdate({
      title: newTitle !== undefined ? newTitle : data.title,
      catalog_ids: newIds,
      layout: newLayout || data.layout || "grid",
    });
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Label className="text-base">Catálogos no perfil</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Escolha quais catálogos exibir na sua página pública e defina a ordem
          </p>
        </div>

        {/* Title Field */}
        <div className="space-y-2">
          <Label>Título do Bloco</Label>
          <input
            type="text"
            className="w-full border rounded-xl p-2"
            value={data.title || "Catálogos"}
            onChange={(e) => updateParent(selectedIds, data.layout, e.target.value)}
            placeholder="Catálogos"
          />
          <p className="text-xs text-muted-foreground">
            Deixe vazio para ocultar o título
          </p>
        </div>

        {/* Layout Option */}
        <div className="space-y-2">
          <Label>Layout</Label>
          <select
            className="w-full border rounded-xl p-2"
            value={data.layout || "grid"}
            onChange={(e) => updateParent(selectedIds, e.target.value as "grid" | "swipe")}
          >
            <option value="grid">Lista (um abaixo do outro)</option>
            <option value="swipe">Cartões lado a lado</option>
          </select>
          <p className="text-xs text-muted-foreground">
            Lista: empilhados verticalmente, fácil leitura<br />
            Cartões: deslize horizontalmente, visual moderno
          </p>
        </div>

        {/* Available Catalogs */}
        <div className="space-y-2">
          <Label>Catálogos disponíveis</Label>
          {availableCatalogs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              Nenhum catálogo disponível. Crie um catálogo primeiro.
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableCatalogs.map((catalog) => {
                const eligible = isEligible(catalog);
                const reason = getIneligibilityReason(catalog);
                
                return (
                  <Tooltip key={catalog.id}>
                    <TooltipTrigger asChild>
                      <div
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          eligible
                            ? "bg-muted/50 cursor-pointer hover:bg-muted"
                            : "bg-muted/30 opacity-60 cursor-not-allowed"
                        }`}
                      >
                        <Checkbox
                          checked={selectedIds.includes(catalog.id)}
                          onCheckedChange={() => handleToggleCatalog(catalog.id, catalog)}
                          disabled={!eligible}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{catalog.title}</p>
                            {!eligible && (
                              <AlertCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{catalog.slug}</p>
                        </div>
                      </div>
                    </TooltipTrigger>
                    {!eligible && (
                      <TooltipContent>
                        <p>{reason}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Catalogs (Reorderable) */}
        {selectedCatalogs.length > 0 ? (
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
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
            <p className="text-muted-foreground">
              Nenhum catálogo adicionado. Selecione catálogos acima para exibir no seu perfil.
            </p>
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            💡 <strong>Dica:</strong> Apenas catálogos publicados com link ativo serão exibidos. 
            Catálogos que voltarem para rascunho serão ocultados automaticamente.
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
};
