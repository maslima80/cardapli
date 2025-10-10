import { Product } from "@/pages/Produtos";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageIcon, Edit, Copy, Trash2, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDuplicate: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductCard({ product, onEdit, onDuplicate, onDelete }: ProductCardProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const coverPhoto = Array.isArray(product.photos) && product.photos.length > 0
    ? product.photos[0].url
    : null;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = `${window.location.origin}/produto/${product.id}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiado!",
      description: "O link do produto foi copiado para a área de transferência.",
    });
  };

  const formatPrice = () => {
    if (product.price_on_request) {
      return product.price_on_request_label || "Sob consulta";
    }

    if (product.price_hidden || !product.price) {
      return null;
    }

    const priceStr = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(product.price));

    const unit = product.price_unit === "Outro" && product.price_unit_custom
      ? product.price_unit_custom
      : product.price_unit;

    return `${priceStr} / ${unit}`;
  };

  const getStatusColor = () => {
    switch (product.status) {
      case "Disponível":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Sob encomenda":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Indisponível":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  // Mobile: horizontal layout
  if (isMobile) {
    return (
      <Card
        className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer bg-card"
        onClick={() => onEdit(product)}
      >
        <div className="flex gap-3 p-3">
          {/* Thumbnail - Left */}
          <div className="w-24 h-24 flex-shrink-0 bg-secondary relative overflow-hidden rounded-lg">
            {coverPhoto ? (
              <img
                src={coverPhoto}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Content - Right */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Title */}
            <h3 className="font-semibold text-sm line-clamp-1 mb-1">
              {product.title}
            </h3>

            {/* Price */}
            <p className="text-xs font-medium text-primary mb-2">
              {formatPrice() || "—"}
            </p>

            {/* Status, Categories & Tags */}
            <div className="flex flex-wrap gap-1 mb-2">
              <Badge className={`${getStatusColor()} text-xs`} variant="secondary">
                {product.status}
              </Badge>
              
              {/* Categories */}
              {product.categories && product.categories.length > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
                  {product.categories[0]}
                </Badge>
              )}
              
              {/* Tags */}
              {product.quality_tags && product.quality_tags.slice(0, 1).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-1 mt-auto" onClick={(e) => e.stopPropagation()}>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs flex-1"
                onClick={() => onEdit(product)}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(product);
                }}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs flex-1"
                onClick={handleCopyLink}
              >
                <LinkIcon className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs flex-1 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(product);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Desktop: vertical layout
  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer bg-card"
      onClick={() => onEdit(product)}
    >
      {/* Cover Photo */}
      <div className="aspect-square bg-secondary relative overflow-hidden">
        {coverPhoto ? (
          <img
            src={coverPhoto}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        {/* Title */}
        <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">
          {product.title}
        </h3>

        {/* Price */}
        <p className="text-sm font-medium text-primary">
          {formatPrice() || "—"}
        </p>

        {/* Status, Categories & Tags */}
        <div className="flex flex-wrap gap-1.5 min-h-[1.75rem]">
          <Badge className={`${getStatusColor()} text-xs`} variant="secondary">
            {product.status}
          </Badge>
          
          {/* Categories */}
          {product.categories && product.categories.length > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
              {product.categories[0]}
            </Badge>
          )}
          
          {/* Tags */}
          {product.quality_tags && product.quality_tags.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-1 pt-1" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-xs flex-1"
            onClick={() => onEdit(product)}
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-xs flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(product);
            }}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-xs flex-1"
            onClick={handleCopyLink}
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-xs flex-1 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(product);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
