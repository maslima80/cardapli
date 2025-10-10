import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, ExternalLink, Copy, Files, Trash2, Edit, ArrowLeft } from "lucide-react";
import { CreateCatalogDialog } from "@/components/catalog/CreateCatalogDialog";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Catalog {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  status: "draft" | "public" | "unlisted";
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
    setLoading(false);
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

  const handleCopyLink = (catalog: Catalog) => {
    const url = `${window.location.origin}/@/${catalog.slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado");
  };

  const getStatusBadge = (status: Catalog["status"]) => {
    const variants = {
      draft: { label: "Rascunho", variant: "secondary" as const },
      public: { label: "Público", variant: "default" as const },
      unlisted: { label: "Não listado", variant: "outline" as const },
    };
    const { label, variant } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
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
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Novo Catálogo
          </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCatalogs.map((catalog) => (
              <div
                key={catalog.id}
                className="bg-card rounded-2xl shadow-soft border border-border overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div
                  className="h-32 bg-gradient-to-br from-primary/10 to-primary/5 cursor-pointer relative overflow-hidden"
                  onClick={() => navigate(`/catalogos/${catalog.id}/editor`)}
                >
                  {catalogCovers[catalog.id] && (
                    <img
                      src={catalogCovers[catalog.id]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3
                      className="font-semibold text-base leading-tight cursor-pointer hover:text-primary transition-colors line-clamp-2"
                      onClick={() => navigate(`/catalogos/${catalog.id}/editor`)}
                    >
                      {catalog.title}
                    </h3>
                    {getStatusBadge(catalog.status)}
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Atualizado{" "}
                    {formatDistanceToNow(new Date(catalog.updated_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/catalogos/${catalog.id}/editor`)}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    {(catalog.status === "public" || catalog.status === "unlisted") && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/@/${catalog.slug}`, "_blank")}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyLink(catalog)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDuplicate(catalog)}
                    >
                      <Files className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(catalog.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <CreateCatalogDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={loadCatalogs}
        />
      </div>
    </div>
  );
};

export default Catalogos;
