import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Eye, Settings, Navigation, MessageCircle, Palette } from "lucide-react";
import { toast } from "sonner";
import { BlockCard } from "@/components/catalog/BlockCard";
import { AddBlockDrawer } from "@/components/catalog/AddBlockDrawer";
import { BlockSettingsDrawer } from "@/components/catalog/BlockSettingsDrawer";
import { BlockRendererPremium } from "@/components/catalog/BlockRendererPremium";
import { SimpleThemeProvider } from "@/components/theme/SimpleThemeProvider";
import { PublishModal } from "@/components/catalog/PublishModal";
import { PublishSuccessModal } from "@/components/catalog/PublishSuccessModal";
import { CatalogSettingsDialog } from "@/components/catalog/CatalogSettingsDialog";
import { NavigationManagerDialog } from "@/components/catalog/NavigationManagerDialog";
import { WhatsAppSettingsDialog } from "@/components/catalog/WhatsAppSettingsDialog";
import { MenuSettingsDialog } from "@/components/catalog/MenuSettingsDialog";
import { ColorsSettingsDialog } from "@/components/catalog/ColorsSettingsDialog";
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
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [settingsDefaultTab, setSettingsDefaultTab] = useState<"general" | "navigation" | "theme">("general");
  const [navManagerOpen, setNavManagerOpen] = useState(false);
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);
  const [menuDialogOpen, setMenuDialogOpen] = useState(false);
  const [colorsDialogOpen, setColorsDialogOpen] = useState(false);
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

  // Apply dark mode class when in preview mode
  useEffect(() => {
    if (previewMode && profile?.theme_mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (!previewMode) {
      document.documentElement.classList.remove('dark');
    }
    
    return () => {
      if (previewMode) {
        document.documentElement.classList.remove('dark');
      }
    };
  }, [previewMode, profile?.theme_mode]);

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

    // Set default data based on block type
    const defaultData = type === "cover" ? { layout: "full" } : {};

    const { data, error } = await supabase
      .from("catalog_blocks")
      .insert({
        catalog_id: id,
        type,
        sort: newSort,
        visible: true,
        data: defaultData,
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
    
    // Special handling for location blocks - DEBUG
    if (block?.type === "location") {
      console.log("🗺️ LOCATION BLOCK UPDATE:");
      console.log("  - Block ID:", blockId);
      console.log("  - Updates:", JSON.stringify(updates, null, 2));
      console.log("  - Selected locations:", updates.data?.selected_locations);
      console.log("  - Title:", updates.data?.title);
      console.log("  - Description:", updates.data?.description);
    }
    
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

  const handlePublish = async (data: { status: string; link_ativo: boolean }) => {
    // no_perfil: deprecated - visibility controlled by profile_blocks 'catalogs' block
    const { error } = await supabase
      .from("catalogs")
      .update(data)
      .eq("id", id);

    if (error) {
      toast.error("Erro ao publicar");
    } else {
      setCatalog({ ...catalog, ...data });
      
      // If publishing with active link, show success modal
      if (data.status === "publicado" && data.link_ativo) {
        setSuccessModalOpen(true);
      } else {
        const message = data.status === "publicado" 
          ? "Catálogo publicado! ✨" 
          : "Salvo como rascunho";
        toast.success(message);
      }
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

  // Calculate effective theme (only for preview mode)
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

  // Publish requirements: must have a Capa block AND at least 1 additional block
  const hasCapa = blocks.some(b => b.type === "cover");
  const hasAdditionalBlock = blocks.filter(b => b.type !== "cover").length > 0;
  const canPublish = hasCapa && hasAdditionalBlock;
  const publishTooltip = !hasCapa 
    ? "Adicione uma Capa para publicar"
    : !hasAdditionalBlock
    ? "Adicione pelo menos um bloco além da Capa"
    : "";

  // Apply font family based on theme (only in preview mode)
  const fontClass =
    effectiveTheme.font === "elegant"
      ? "font-playfair"
      : effectiveTheme.font === "modern"
      ? "font-poppins"
      : "font-inter";

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Top Bar */}
      <div className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          {/* Mobile: Stacked Layout */}
          <div className="sm:hidden space-y-3">
            {/* First Row: Back + Title */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/catalogos")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-lg font-semibold truncate flex-1">{catalog?.title}</h1>
            </div>
            
            {/* Second Row: Main Actions */}
            <div className="flex items-center gap-2 pl-11">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
                className="gap-2 flex-1"
              >
                <Eye className="w-4 h-4" />
                {previewMode ? "Editar" : "Preview"}
              </Button>
              <Button
                size="sm"
                onClick={() => setPublishModalOpen(true)}
                disabled={!canPublish}
                title={publishTooltip}
                className="flex-1"
              >
                Publicar
              </Button>
            </div>

            {/* Third Row: Quick Settings Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pl-11">
              {/* WhatsApp Button */}
              <button
                onClick={() => setWhatsappDialogOpen(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  catalog?.settings?.show_whatsapp_bubble
                    ? "bg-[#25D366] text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <MessageCircle className="w-3 h-3" />
                <span>WhatsApp</span>
              </button>

              {/* Menu Button */}
              <button
                onClick={() => setMenuDialogOpen(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  catalog?.settings?.show_bottom_nav
                    ? "bg-purple-600 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Navigation className="w-3 h-3" />
                <span>Menu</span>
              </button>

              {/* Colors Button */}
              <button
                onClick={() => setColorsDialogOpen(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  catalog?.theme_overrides?.use_brand !== false
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Palette className="w-3 h-3" />
                <span>Cores</span>
              </button>
            </div>
          </div>

          {/* Desktop: Horizontal Layout */}
          <div className="hidden sm:block">
            {/* First Row: Title and Main Actions */}
            <div className="flex items-center justify-between gap-4 mb-3">
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
                  title={publishTooltip}
                >
                  Publicar
                </Button>
              </div>
            </div>

            {/* Second Row: Quick Settings Buttons */}
            <div className="flex items-center gap-3 pb-2">
              {/* WhatsApp Button */}
              <button
                onClick={() => setWhatsappDialogOpen(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  catalog?.settings?.show_whatsapp_bubble
                    ? "bg-[#25D366] text-white shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                } cursor-pointer`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>

              {/* Menu Button */}
              <button
                onClick={() => setMenuDialogOpen(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  catalog?.settings?.show_bottom_nav
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                } cursor-pointer`}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Menu</span>
              </button>

              {/* Colors Button */}
              <button
                onClick={() => setColorsDialogOpen(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  catalog?.theme_overrides?.use_brand !== false
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                } cursor-pointer`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Cores</span>
              </button>
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
          <SimpleThemeProvider 
            userSlug={profile?.slug}
            catalogThemeOverrides={catalog?.theme_overrides}
          >
            <div className="rounded-2xl shadow-lg overflow-hidden">
              {blocks.filter(b => b.visible).map((block, index) => (
                <BlockRendererPremium
                  key={block.id}
                  block={block}
                  profile={profile}
                  userId={catalog?.user_id}
                  userSlug={profile?.slug}
                  catalogSlug={catalog?.slug}
                  catalogTitle={catalog?.title}
                  index={index}
                />
              ))}
            </div>
          </SimpleThemeProvider>
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

            {/* Navigation Setup Prompt */}
            {blocks.length >= 2 && !blocks.some(b => b.navigation_label) && (
              <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-2 border-purple-200 dark:border-purple-800 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                    <Navigation className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-1">
                      🚀 Facilite a navegação dos seus clientes!
                    </h3>
                    <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
                      Adicione um menu de navegação para que seus clientes possam pular rapidamente entre as seções do catálogo.
                    </p>
                    <Button
                      onClick={() => setNavManagerOpen(true)}
                      className="bg-purple-600 hover:bg-purple-700 gap-2"
                    >
                      <Navigation className="w-4 h-4" />
                      Configurar Menu de Navegação
                    </Button>
                  </div>
                </div>
              </div>
            )}

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
        context="catalog"
      />

      <BlockSettingsDrawer
        open={!!editingBlock}
        onOpenChange={(open) => !open && setEditingBlock(null)}
        block={editingBlock}
        onSave={(data) => handleUpdateBlock(editingBlock.id, { data })}
        onUpdate={(updatedBlock) => handleUpdateBlock(updatedBlock.id, updatedBlock)}
      />

      <NavigationManagerDialog
        open={navManagerOpen}
        onOpenChange={setNavManagerOpen}
        blocks={blocks}
        onUpdate={loadCatalog}
      />

      <CatalogSettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
        settings={catalog?.settings || {}}
        themeOverrides={catalog?.theme_overrides}
        profile={profile}
        hasWhatsApp={!!profile?.whatsapp}
        defaultTab={settingsDefaultTab}
        onSave={handleSaveSettings}
        onThemeChange={handleThemeChange}
      />

      <PublishModal
        open={publishModalOpen}
        onOpenChange={setPublishModalOpen}
        catalogSlug={catalog?.slug}
        profileSlug={profile?.slug}
        currentStatus={catalog?.status || "rascunho"}
        linkAtivo={catalog?.link_ativo || false}
        onPublish={handlePublish}
      />

      <PublishSuccessModal
        open={successModalOpen}
        onOpenChange={setSuccessModalOpen}
        userSlug={profile?.slug || ""}
        catalogSlug={catalog?.slug || ""}
        catalogTitle={catalog?.title || ""}
      />

      {/* New Settings Dialogs */}
      <WhatsAppSettingsDialog
        open={whatsappDialogOpen}
        onOpenChange={setWhatsappDialogOpen}
        enabled={catalog?.settings?.show_whatsapp_bubble || false}
        hasWhatsApp={!!profile?.whatsapp}
        whatsappNumber={profile?.whatsapp}
        onToggle={(enabled) => handleSaveSettings({ ...catalog?.settings, show_whatsapp_bubble: enabled })}
      />

      <MenuSettingsDialog
        open={menuDialogOpen}
        onOpenChange={setMenuDialogOpen}
        enabled={catalog?.settings?.show_bottom_nav || false}
        onToggle={(enabled) => handleSaveSettings({ ...catalog?.settings, show_bottom_nav: enabled })}
        onConfigure={() => setNavManagerOpen(true)}
      />

      <ColorsSettingsDialog
        open={colorsDialogOpen}
        onOpenChange={setColorsDialogOpen}
        useBrandColors={catalog?.theme_overrides?.use_brand !== false}
        themeOverrides={catalog?.theme_overrides}
        profile={profile}
        onToggle={(useBrand) => handleThemeChange({ ...catalog?.theme_overrides, use_brand: useBrand })}
        onThemeChange={handleThemeChange}
      />
    </div>
  );
};

export default CatalogoEditor;
