import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Search, Package } from "lucide-react";
import { toast } from "sonner";

interface ProductPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onSave: (ids: string[]) => void;
}

export function ProductPickerModal({
  open,
  onOpenChange,
  selectedIds,
  onSave,
}: ProductPickerModalProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]);

  const ITEMS_PER_PAGE = 24;

  useEffect(() => {
    if (open) {
      setTempSelectedIds(selectedIds);
      loadCategories();
      loadProducts();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      loadProducts();
    }
  }, [search, category, page]);

  const loadCategories = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("products")
      .select("category")
      .eq("user_id", user.id)
      .not("category", "is", null);

    if (data) {
      const uniqueCategories = [...new Set(data.map((p) => p.category).filter(Boolean))];
      setCategories(uniqueCategories as string[]);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase
      .from("products")
      .select("id, title, photos, category, price", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    const { data, error, count } = await query.range(
      (page - 1) * ITEMS_PER_PAGE,
      page * ITEMS_PER_PAGE - 1
    );

    if (error) {
      toast.error("Erro ao carregar produtos");
      console.error(error);
    } else {
      setProducts(data || []);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
    }

    setLoading(false);
  };

  const toggleProduct = (productId: string) => {
    setTempSelectedIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSave = () => {
    onSave(tempSelectedIds);
    onOpenChange(false);
  };

  const getFirstImage = (photos: any) => {
    if (!photos || !Array.isArray(photos) || photos.length === 0) return null;
    return photos[0]?.url || null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Selecionar Produtos</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produtos..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9"
                />
              </div>
            </div>
            <Select
              value={category}
              onValueChange={(value) => {
                setCategory(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Products List */}
          <div className="min-h-[400px] max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {search || category !== "all"
                    ? "Tente ajustar os filtros"
                    : "Adicione produtos para poder selecioná-los"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {products.map((product) => {
                  const imageUrl = getFirstImage(product.photos);
                  const isSelected = tempSelectedIds.includes(product.id);

                  return (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleProduct(product.id)}
                      />
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt={product.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{product.title}</p>
                        {product.category && (
                          <p className="text-sm text-muted-foreground">
                            {product.category}
                          </p>
                        )}
                      </div>
                      {product.price && (
                        <p className="font-semibold">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(product.price)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Próxima
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar ({tempSelectedIds.length} selecionados)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
