import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { publicCatalogUrl } from "@/lib/urls";
import { ExternalLink } from "lucide-react";

interface CatalogosBlockProps {
  data: {
    mode?: "all" | "manual";
    catalog_ids?: string[];
    layout?: string;
    columns?: number;
  };
  profile: {
    slug: string;
    id: string;
  };
}

interface Catalog {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover: any;
  status: string;
  link_ativo: boolean;
  updated_at: string;
}

export const CatalogosBlock = ({ data, profile }: CatalogosBlockProps) => {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCatalogs();
  }, [data.mode, data.catalog_ids, profile.id]);

  const loadCatalogs = async () => {
    try {
      let query = supabase
        .from("catalogs")
        .select("*")
        .eq("user_id", profile.id)
        .eq("status", "publicado")
        .eq("link_ativo", true);

      if (data.mode === "manual" && data.catalog_ids && data.catalog_ids.length > 0) {
        query = query.in("id", data.catalog_ids);
      }

      const { data: catalogsData, error } = await query.order("updated_at", { ascending: false });

      if (error) {
        console.error("Error loading catalogs:", error);
        setCatalogs([]);
      } else {
        let orderedCatalogs = catalogsData || [];
        
        // If manual mode, maintain the order from catalog_ids
        if (data.mode === "manual" && data.catalog_ids) {
          orderedCatalogs = data.catalog_ids
            .map(id => orderedCatalogs.find(c => c.id === id))
            .filter(Boolean) as Catalog[];
        }
        
        setCatalogs(orderedCatalogs);
      }
    } catch (error) {
      console.error("Error:", error);
      setCatalogs([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">Carregando catálogos...</p>
      </div>
    );
  }

  if (catalogs.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">
          {data.mode === "manual"
            ? "Nenhum catálogo selecionado"
            : "Nenhum catálogo publicado ainda"}
        </p>
      </div>
    );
  }

  const columns = data.columns || 2;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Catálogos</h2>
      <div className={`grid grid-cols-1 ${columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-1'} gap-4`}>
        {catalogs.map((catalog) => {
          const coverUrl = catalog.cover?.url || catalog.cover?.image_url;
          
          return (
            <a
              key={catalog.id}
              href={publicCatalogUrl(profile.slug, catalog.slug)}
              className="group block bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all"
            >
              {/* Cover Image */}
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={catalog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ExternalLink className="w-12 h-12 text-muted-foreground opacity-50" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-2">
                  {catalog.title}
                </h3>
                {catalog.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {catalog.description}
                  </p>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};
