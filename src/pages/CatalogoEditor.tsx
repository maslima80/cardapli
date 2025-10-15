import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Eye, Settings } from "lucide-react";
import { toast } from "sonner";
import { BlockCard } from "@/components/catalog/BlockCard";
import { AddBlockDrawer } from "@/components/catalog/AddBlockDrawer";
import { BlockSettingsDrawer } from "@/components/catalog/BlockSettingsDrawer";
import { BlockRenderer } from "@/components/catalog/BlockRenderer";
import { PublishModal } from "@/components/catalog/PublishModal";
import { CatalogSettingsDialog } from "@/components/catalog/CatalogSettingsDialog";
import { getEffectiveTheme, generateThemeVariables } from "@/lib/theme-utils";
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
} from "@dnd-kit/sortable";

const CatalogoEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [catalog, setCatalog] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadCatalog();
  }, [id]);

  const loadCatalog = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/entrar");
      return;
    }

    const { data: catalogData, error: catalogError } = await supabase
      .from("catalogs")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (catalogError || !catalogData) {
      toast.error("Catálogo não encontrado");
      navigate("/catalogos");
      return;
    }

    const { data: blocksData } = await supabase
      .from("catalog_blocks")
      .select("*")
      .eq("catalog_id", id)
      .order("sort", { ascending: true });

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setCatalog(catalogData);
    setBlocks(blocksData || []);
    setProfile(profileData);
    setLoading(false);
  };

  const handleAddBlock = async (type: string) => {
    const newSort = blocks.length > 0 ? Math.max(...blocks.map(b => b.sort)) + 1 : 0;

    const { data, error } = await supabase
      .from("catalog_blocks")
      .insert({
        catalog_id: id,
        type,
        sort: newSort,
        visible: true,
        data: {},
      })
      .select()
      .single();

    if (error) {
      toast.error("Erro ao adicionar bloco");
    } else {
      setBlocks([...blocks, data]);
      toast.success("Bloco adicionado ✓");
    }
  };

  const handleUpdateBlock = async (blockId: string, updates: any) => {
    console.log("Updating block:", blockId, "with updates:", updates);
    
    // Find the block to check its type
    const block = blocks.find(b => b.id === blockId);
    console.log("Found block:", block);
    
    // Special handling for testimonials blocks
    const isTestimonialBlock = block?.type === "testimonials" || updates.type === "testimonials";
    console.log("Is testimonial block?", isTestimonialBlock);
    
    if (isTestimonialBlock) {
      console.log("Testimonial block detected, checking data structure");
      
      // Make sure updates.data exists
      if (!updates.data) {
        console.log("updates.data doesn't exist, creating it");
        updates.data = {};
      }
      
      // Make sure items array exists and is properly initialized
      if (!updates.data.items) {
        console.log("updates.data.items doesn't exist, initializing empty array");
        updates.data.items = [];
      } else {
        console.log("updates.data.items exists:", updates.data.items);
      }
      
      // Ensure items is an array
      if (!Array.isArray(updates.data.items)) {
        console.log("updates.data.items is not an array, converting to array");
        updates.data.items = Object.values(updates.data.items);
      }
    }
    
    const { error } = await supabase
      .from("catalog_blocks")
      .update(updates)
      .eq("id", blockId);

    if (error) {
      console.error("Error updating block:", error);
      toast.error("Erro ao atualizar");
    } else {
      console.log("Block updated successfully");
      setBlocks(blocks.map(b => b.id === blockId ? { ...b, ...updates } : b));
      toast.success("Salvo ✓");
    }
  };

  const handleToggleVisible = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    handleUpdateBlock(blockId, { visible: !block.visible });
  };

  const handleDuplicate = async (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    const newSort = Math.max(...blocks.map(b => b.sort)) + 1;

    const { data, error } = await supabase
      .from("catalog_blocks")
      .insert({
        catalog_id: id,
        type: block.type,
        sort: newSort,
        visible: block.visible,
        data: block.data,
      })
      .select()
      .single();

    if (error) {
      toast.error("Erro ao duplicar");
    } else {
      setBlocks([...blocks, data]);
      toast.success("Bloco duplicado ✓");
    }
  };

  const handleDelete = async (blockId: string) => {
    const { error } = await supabase
      .from("catalog_blocks")
      .delete()
      .eq("id", blockId);

    if (error) {
      toast.error("Erro ao excluir");
    } else {
      setBlocks(blocks.filter(b => b.id !== blockId));
      toast.success("Bloco excluído");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = blocks.findIndex(b => b.id === active.id);
    const newIndex = blocks.findIndex(b => b.id === over.id);
    const reordered = arrayMove(blocks, oldIndex, newIndex);

    // Update sort order
    const updates = reordered.map((block, index) => ({
      id: block.id,
      sort: index,
    }));

    setBlocks(reordered.map((block, index) => ({ ...block, sort: index })));

    // Update in DB
    for (const update of updates) {
      await supabase
        .from("catalog_blocks")
        .update({ sort: update.sort })
        .eq("id", update.id);
    }

    toast.success("Ordem atualizada ✓");
  };

  const handlePublish = async (status: "public" | "unlisted") => {
    const { error } = await supabase
      .from("catalogs")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao publicar");
    } else {
      setCatalog({ ...catalog, status });
      toast.success("Catálogo publicado! ✨");
    }
  };

  const handleSaveSettings = async (settings: any) => {
    const { error } = await supabase
      .from("catalogs")
      .update({ settings })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao salvar configurações");
    } else {
      setCatalog({ ...catalog, settings });
      toast.success("Configurações salvas ✓");
    }
  };

  const handleThemeChange = async (themeOverrides: any) => {
    const { error } = await supabase
      .from("catalogs")
      .update({ theme_overrides: themeOverrides })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao salvar tema");
    } else {
      setCatalog({ ...catalog, theme_overrides: themeOverrides });
    }
  };

  // Calculate effective theme
  const effectiveTheme = getEffectiveTheme(catalog?.theme_overrides, profile);
  const themeVars = generateThemeVariables(effectiveTheme);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const canPublish = catalog?.title && blocks.length > 0;

  // Apply font family based on theme
  const fontClass =
    effectiveTheme.font === "elegant"
      ? "font-playfair"
      : effectiveTheme.font === "modern"
      ? "font-poppins"
      : "font-inter";

  return (
    <div className={`min-h-screen bg-gradient-subtle ${fontClass}`} style={themeVars as any}>
      {/* Top Bar */}
      <div className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/catalogos")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-lg font-semibold truncate">{catalog?.title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSettingsDialogOpen(true)}
                title="Configurações"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
                className="gap-2"
              >
                <Eye className="w-4 h-4" />
                {previewMode ? "Editar" : "Preview"}
              </Button>
              <Button
                size="sm"
                onClick={() => setPublishModalOpen(true)}
                disabled={!canPublish}
              >
                Publicar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="max-w-3xl mx-auto p-4 sm:p-6 pb-24">
        {blocks.length === 0 ? (
          <div className="text-center py-12 space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Comece com o primeiro bloco</h3>
              <p className="text-muted-foreground mb-6">
                Adicione uma Capa para dar cara profissional ao seu catálogo
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                size="lg" 
                onClick={() => handleAddBlock("cover")}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar Capa
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => handleAddBlock("text")}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar Texto
              </Button>
            </div>
          </div>
        ) : previewMode ? (
          <div className="space-y-6 bg-background rounded-2xl shadow-lg overflow-hidden">
            {blocks.filter(b => b.visible).map((block) => (
              <div key={block.id} className="catalog-preview-block">
                <BlockRenderer
                  block={block}
                  profile={profile}
                  userId={catalog?.user_id}
                />
              </div>
            ))}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={blocks.map(b => b.id)}
              strategy={verticalListSortingStrategy}
            >
              {blocks.map((block) => (
                <BlockCard
                  key={block.id}
                  block={block}
                  onEdit={() => setEditingBlock(block)}
                  onToggleVisible={() => handleToggleVisible(block.id)}
                  onDuplicate={() => handleDuplicate(block.id)}
                  onDelete={() => handleDelete(block.id)}
                />
              ))}
            </SortableContext>

            {/* Add Block Placeholder */}
            <button
              onClick={() => setAddDrawerOpen(true)}
              className="w-full py-8 border-2 border-dashed border-border rounded-2xl hover:border-primary/50 hover:bg-secondary/30 transition-all duration-300 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground mt-6"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Adicionar Bloco</span>
            </button>
          </DndContext>
        )}
      </div>

      {/* FAB */}
      {!previewMode && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            size="lg"
            className="rounded-full h-14 w-14 shadow-glow"
            onClick={() => setAddDrawerOpen(true)}
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      )}

      {/* Drawers */}
      <AddBlockDrawer
        open={addDrawerOpen}
        onOpenChange={setAddDrawerOpen}
        onSelectType={handleAddBlock}
      />

      <BlockSettingsDrawer
        open={!!editingBlock}
        onOpenChange={(open) => !open && setEditingBlock(null)}
        block={editingBlock}
        onSave={(data) => handleUpdateBlock(editingBlock.id, { data })}
        onUpdate={(updatedBlock) => handleUpdateBlock(updatedBlock.id, updatedBlock)}
      />

      <CatalogSettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
        settings={catalog?.settings || {}}
        themeOverrides={catalog?.theme_overrides}
        onSave={handleSaveSettings}
        onThemeChange={handleThemeChange}
      />

      <PublishModal
        open={publishModalOpen}
        onOpenChange={setPublishModalOpen}
        catalogSlug={catalog?.slug}
        profileSlug={profile?.slug}
        currentStatus={catalog?.status}
        onPublish={handlePublish}
      />
    </div>
  );
};

export default CatalogoEditor;
