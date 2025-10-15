import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { BlockCard } from "@/components/catalog/BlockCard";
import { AddBlockDrawer } from "@/components/catalog/AddBlockDrawer";
import { BlockSettingsDrawer } from "@/components/catalog/BlockSettingsDrawer";
import { publicProfileUrl } from "@/lib/urls";
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

interface ProfileBuilderProps {
  userSlug: string;
  userId: string;
}

export const ProfileBuilder = ({ userSlug, userId }: ProfileBuilderProps) => {
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadBlocks();
  }, [userId]);

  const loadBlocks = async () => {
    const { data, error } = await supabase
      .from("profile_blocks")
      .select("*")
      .eq("user_id", userId)
      .order("sort", { ascending: true });

    if (error) {
      console.error("Error loading blocks:", error);
      toast.error("Erro ao carregar blocos");
    } else {
      setBlocks(data || []);
    }
    setLoading(false);
  };

  const handleAddBlock = async (type: string) => {
    const newSort = blocks.length > 0 ? Math.max(...blocks.map(b => b.sort)) + 1 : 0;

    const { data, error } = await supabase
      .from("profile_blocks")
      .insert({
        user_id: userId,
        type,
        sort: newSort,
        data: {},
        visible: true,
      })
      .select()
      .single();

    if (error) {
      toast.error("Erro ao adicionar bloco");
      console.error(error);
    } else {
      setBlocks([...blocks, data]);
      setAddDrawerOpen(false);
      toast.success("Bloco adicionado ✓");
    }
  };

  const handleUpdateBlock = async (blockId: string, updates: any) => {
    const { error } = await supabase
      .from("profile_blocks")
      .update(updates)
      .eq("id", blockId);

    if (error) {
      toast.error("Erro ao atualizar");
      console.error(error);
    } else {
      setBlocks(blocks.map(b => b.id === blockId ? { ...b, ...updates } : b));
      toast.success("Salvo ✓");
    }
  };

  const handleToggleVisible = async (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    await handleUpdateBlock(blockId, { visible: !block.visible });
  };

  const handleDuplicate = async (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    const newSort = Math.max(...blocks.map(b => b.sort)) + 1;

    const { data, error } = await supabase
      .from("profile_blocks")
      .insert({
        user_id: userId,
        type: block.type,
        data: block.data,
        sort: newSort,
        visible: true,
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
      .from("profile_blocks")
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
        .from("profile_blocks")
        .update({ sort: update.sort })
        .eq("id", update.id);
    }

    toast.success("Ordem atualizada ✓");
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}${publicProfileUrl(userSlug)}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  };

  const handleViewPage = () => {
    window.open(publicProfileUrl(userSlug), "_blank");
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Montar Página Pública</h2>
          <p className="text-muted-foreground mt-1">
            Monte sua página pública com blocos, catálogos e redes sociais
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="gap-2"
          >
            <Copy className="w-4 h-4" />
            Copiar link
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewPage}
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            Ver página
          </Button>
        </div>
      </div>

      {/* URL Display */}
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sua página pública:</span>
          <span className="font-medium">cardapli.com.br{publicProfileUrl(userSlug)}</span>
        </div>
      </div>

      {/* Blocks List */}
      {blocks.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
          <h3 className="text-xl font-semibold mb-2">Comece adicionando blocos</h3>
          <p className="text-muted-foreground mb-6">
            Adicione blocos para construir sua página pública
          </p>
          <Button onClick={() => setAddDrawerOpen(true)} size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Adicionar Primeiro Bloco
          </Button>
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
    </div>
  );
};
