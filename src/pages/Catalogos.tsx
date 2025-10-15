import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, ExternalLink, Copy, Files, Trash2, Edit, ArrowLeft, Share2, Eye, Zap, UserPlus, UserMinus } from "lucide-react";
import { CreateCatalogDialog } from "@/components/catalog/CreateCatalogDialog";
import { PublishSuccessModal } from "@/components/catalog/PublishSuccessModal";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { publicCatalogUrl, whatsappShareCatalog } from "@/lib/urls";
import { addCatalogToProfile, removeCatalogFromProfile, isCatalogInProfile } from "@/lib/profileBlockHelpers";

interface Catalog {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  status: "draft" | "public" | "unlisted" | "rascunho" | "publicado";
  updated_at: string;
  cover: any;
}

const Catalogos = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [filteredCatalogs, setFilteredCatalogs] = useState<Catalog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [catalogCovers, setCatalogCovers] = useState<Record<string, string>>({});
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null);
  const [userSlug, setUserSlug] = useState<string>("");
  const [catalogsInProfile, setCatalogsInProfile] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    loadCatalogs();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredCatalogs(
        catalogs.filter((c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredCatalogs(catalogs);
    }
  }, [searchQuery, catalogs]);

  const loadCatalogs = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/entrar");
      return;
    }

    setUserId(session.user.id);

    // Load user profile slug
    const { data: profileData } = await supabase
      .from("profiles")
      .select("slug")
      .eq("id", session.user.id)
      .single();
    
    if (profileData?.slug) {
      setUserSlug(profileData.slug);
    }

    const { data, error } = await supabase
      .from("catalogs")
      .select("*")
      .eq("user_id", session.user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar catálogos");
      console.error(error);
    } else {
      setCatalogs((data || []) as Catalog[]);
      
      // Load cover images for each catalog
      if (data && data.length > 0) {
        const catalogIds = data.map(c => c.id);
        const { data: blocks } = await supabase
          .from("catalog_blocks")
          .select("catalog_id, data")
          .in("catalog_id", catalogIds)
          .eq("type", "cover")
          .eq("sort", 0);
        
        if (blocks) {
          const covers: Record<string, string> = {};
          blocks.forEach(block => {
            const blockData = block.data as any;
            if (blockData?.image_url) {
              covers[block.catalog_id] = blockData.image_url;
            }
          });
          setCatalogCovers(covers);
        }
      }
    }

    // Load which catalogs are in profile
    await loadProfileCatalogs(session.user.id);
    
    setLoading(false);
  };

  const loadProfileCatalogs = async (uid: string) => {
    const { data: profileBlock } = await supabase
      .from("profile_blocks")
      .select("data")
      .eq("user_id", uid)
      .eq("type", "catalogs")
      .single();

    if (profileBlock) {
      const catalogIds = (profileBlock.data as any)?.catalog_ids || [];
      setCatalogsInProfile(new Set(catalogIds));
    }
  };

  const handleDuplicate = async (catalog: Catalog) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newSlug = `${catalog.slug}-copia-${Date.now()}`;
    const { error } = await supabase
      .from("catalogs")
      .insert({
        user_id: user.id,
        title: `${catalog.title} (Cópia)`,
        description: catalog.description,
        slug: newSlug,
        status: "draft",
        cover: catalog.cover,
      });

    if (error) {
      toast.error("Erro ao duplicar catálogo");
    } else {
      toast.success("Catálogo duplicado");
      loadCatalogs();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este catálogo?")) return;

    const { error } = await supabase.from("catalogs").delete().eq("id", id);

    if (error) {
      toast.error("Erro ao excluir catálogo");
    } else {
      toast.success("Catálogo excluído");
      setCatalogs((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleShare = (catalog: Catalog) => {
    if (!userSlug) {
      toast.error("Configure seu nome de usuário primeiro");
      return;
    }
    setSelectedCatalog(catalog);
    setShareModalOpen(true);
  };

  const handleCopyLink = async (catalog: Catalog) => {
    if (!userSlug) {
      toast.error("Configure seu nome de usuário primeiro");
      return;
    }
    
    const url = `${window.location.origin}${publicCatalogUrl(userSlug, catalog.slug)}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  };

  const handleToggleProfile = async (catalog: Catalog) => {
    const isInProfile = catalogsInProfile.has(catalog.id);
    const isEligible = catalog.status === "publicado" && (catalog as any).link_ativo === true;

    if (!isInProfile) {
      // Adding to profile
      if (!isEligible) {
        // Show guard modal - for now just show toast
        toast.error("⚠️ Para adicionar ao perfil, o catálogo precisa estar publicado e com link ativo.");
        return;
      }

      const success = await addCatalogToProfile(userId, catalog.id);
      if (success) {
        setCatalogsInProfile(new Set([...catalogsInProfile, catalog.id]));
        toast.success("Adicionado à sua página pública. Veja em /perfil → Página Pública.");
      } else {
        toast.error("Erro ao adicionar ao perfil");
      }
    } else {
      // Removing from profile
      const success = await removeCatalogFromProfile(userId, catalog.id);
      if (success) {
        const newSet = new Set(catalogsInProfile);
        newSet.delete(catalog.id);
        setCatalogsInProfile(newSet);
        toast.success("Removido do seu perfil");
      } else {
        toast.error("Erro ao remover do perfil");
      }
    }
  };

  const getStatusBadge = (status: Catalog["status"]) => {
    const variants: Record<string, { label: string; className: string }> = {
      // New Portuguese values
      rascunho: { label: "Em edição", className: "bg-yellow-100 text-yellow-800" },
      publicado: { label: "Publicado", className: "bg-green-100 text-green-800" },
      // Old English values (for backward compatibility)
      draft: { label: "Em edição", className: "bg-yellow-100 text-yellow-800" },
      public: { label: "Publicado", className: "bg-green-100 text-green-800" },
      unlisted: { label: "Publicado", className: "bg-green-100 text-green-800" },
    };
    const statusInfo = variants[status] || { label: "Desconhecido", className: "bg-gray-100 text-gray-800" };
    return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>;
  };

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

  return (
    <div className="min-h-screen bg-gradient-subtle p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back to Dashboard Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Painel
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Meus Catálogos</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Crie e gerencie seus catálogos digitais
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              onClick={() => navigate("/compartilhar")} 
              variant="outline"
              className="gap-2 flex-1 sm:flex-initial"
            >
              <Zap className="w-4 h-4" />
              Catálogo Rápido
            </Button>
            <Button 
              onClick={() => setCreateDialogOpen(true)} 
              className="gap-2 flex-1 sm:flex-initial"
            >
              <Plus className="w-4 h-4" />
              Novo Catálogo
            </Button>
          </div>
        </div>

        {catalogs.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar catálogos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {filteredCatalogs.length === 0 ? (
          <div className="bg-card rounded-3xl shadow-soft p-8 md:p-12 border border-border text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg md:text-xl font-semibold mb-2">
                {searchQuery ? "Nenhum catálogo encontrado" : "Você ainda não tem catálogos"}
              </h3>
              <p className="text-muted-foreground text-sm md:text-base mb-6">
                {searchQuery
                  ? "Tente buscar por outro termo"
                  : "Comece criando seu primeiro catálogo digital agora mesmo"}
              </p>
              {!searchQuery && (
                <Button onClick={() => setCreateDialogOpen(true)} size="lg">
                  Criar primeiro catálogo
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCatalogs.map((catalog) => {
              const isPublished = catalog.status === "publicado" || catalog.status === "public" || catalog.status === "unlisted";
              
              return (
                <div
                  key={catalog.id}
                  className="bg-card rounded-xl shadow-soft border border-border overflow-hidden hover:shadow-md transition-all"
                >
                  <div className="flex gap-4 p-4">
                    {/* Thumbnail */}
                    <div
                      className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg cursor-pointer relative overflow-hidden flex-shrink-0"
                      onClick={() => navigate(`/catalogos/${catalog.id}/editor`)}
                    >
                      {catalogCovers[catalog.id] ? (
                        <img
                          src={catalogCovers[catalog.id]}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Eye className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3
                          className="font-semibold text-base sm:text-lg leading-tight cursor-pointer hover:text-primary transition-colors line-clamp-2"
                          onClick={() => navigate(`/catalogos/${catalog.id}/editor`)}
                        >
                          {catalog.title}
                        </h3>
                        {getStatusBadge(catalog.status)}
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        Atualizado{" "}
                        {formatDistanceToNow(new Date(catalog.updated_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/catalogos/${catalog.id}/editor`)}
                          className="gap-1.5"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Editar</span>
                        </Button>
                        
                        {isPublished && (
                          <>
                            {/* Profile Toggle Button */}
                            <Button
                              size="sm"
                              variant={catalogsInProfile.has(catalog.id) ? "default" : "outline"}
                              onClick={() => handleToggleProfile(catalog)}
                              className="gap-1.5"
                            >
                              {catalogsInProfile.has(catalog.id) ? (
                                <>
                                  <UserMinus className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Remover do perfil</span>
                                </>
                              ) : (
                                <>
                                  <UserPlus className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Adicionar ao perfil</span>
                                </>
                              )}
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleShare(catalog)}
                              className="gap-1.5"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Compartilhar</span>
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (userSlug) {
                                  window.open(publicCatalogUrl(userSlug, catalog.slug), "_blank");
                                }
                              }}
                              className="gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Ver</span>
                            </Button>
                          </>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDuplicate(catalog)}
                          className="gap-1.5"
                        >
                          <Files className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Duplicar</span>
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(catalog.id)}
                          className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Excluir</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <CreateCatalogDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={loadCatalogs}
        />

        {selectedCatalog && (
          <PublishSuccessModal
            open={shareModalOpen}
            onOpenChange={setShareModalOpen}
            userSlug={userSlug}
            catalogSlug={selectedCatalog.slug}
            catalogTitle={selectedCatalog.title}
          />
        )}
      </div>
    </div>
  );
};

export default Catalogos;
