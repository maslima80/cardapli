import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
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
import { Loader2, Search, Package } from "lucide-react";
import { toast } from "sonner";

interface ProductImagePickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectImage: (url: string) => void;
}

export function ProductImagePickerModal({
  open,
  onOpenChange,
  onSelectImage,
}: ProductImagePickerModalProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);

  const ITEMS_PER_PAGE = 24;

  useEffect(() => {
    if (open) {
      loadCategories();
      loadProducts();
    }
  }, [open, search, category, page]);

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
      .select("id, title, photos, category", { count: "exact" })
      .eq("user_id", user.id)
      .not("photos", "eq", "[]")
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

  const handleSelectImage = (imageUrl: string) => {
    onSelectImage(imageUrl);
    onOpenChange(false);
  };

  // Flatten all photos from all products
  const allPhotos = products.flatMap((product) => {
    if (!product.photos || !Array.isArray(product.photos)) return [];
    return product.photos.map((photo: any) => ({
      url: photo.url,
      productTitle: product.title,
      productId: product.id,
    }));
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Escolher Imagem de Produto</DialogTitle>
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

          {/* Products Grid */}
          <div className="min-h-[400px] max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : allPhotos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma imagem encontrada</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {search || category !== "all"
                    ? "Tente ajustar os filtros"
                    : "Adicione produtos com imagens para poder selecioná-los aqui"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {allPhotos.map((photo, index) => (
                  <button
                    key={`${photo.productId}-${index}`}
                    onClick={() => handleSelectImage(photo.url)}
                    className="group relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-muted"
                  >
                    <img
                      src={photo.url}
                      alt={photo.productTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        // Hide broken images
                        e.currentTarget.style.display = 'none';
                        // Show a placeholder icon
                        const parent = e.currentTarget.parentElement;
                        if (parent && !parent.querySelector('.broken-image-icon')) {
                          const icon = document.createElement('div');
                          icon.className = 'broken-image-icon absolute inset-0 flex items-center justify-center text-muted-foreground';
                          icon.innerHTML = '<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
                          parent.appendChild(icon);
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end p-2">
                      <p className="text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity line-clamp-2">
                        {photo.productTitle}
                      </p>
                    </div>
                  </button>
                ))}
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
      </DialogContent>
    </Dialog>
  );
}
