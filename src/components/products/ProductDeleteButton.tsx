import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { Product } from "@/pages/Produtos";

interface ProductDeleteButtonProps {
  product: Product;
  onDeleted: () => void;
}

export function ProductDeleteButton({ product, onDeleted }: ProductDeleteButtonProps) {
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);

    try {
      // Delete photos from ImageKit
      if (product.photos && product.photos.length > 0) {
        for (const photo of product.photos) {
          if (photo.fileId) {
            try {
              await supabase.functions.invoke('imagekit-delete', {
                body: { fileId: photo.fileId, productId: product.id },
              });
            } catch (error) {
              console.error('Failed to delete photo from ImageKit:', error);
              // Continue with deletion even if ImageKit delete fails
            }
          }
        }
      }

      // Delete product from database
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;

      toast({
        title: "Produto excluído",
        description: "O produto foi excluído com sucesso",
      });

      onDeleted();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir produto",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="gap-2"
          disabled={deleting}
        >
          <Trash2 className="h-4 w-4" />
          Excluir produto
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. O produto "{product.title}" e todas as suas fotos serão excluídos permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleting}
          >
            {deleting ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
