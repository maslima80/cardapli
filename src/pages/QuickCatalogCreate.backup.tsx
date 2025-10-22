import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function QuickCatalogCreate() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'products' | 'categories' | 'tags'>('products');
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [coverLayout, setCoverLayout] = useState<"logo-title-image" | "image-top" | "carousel-top" | "full-background">("image-top");
  const [showLogo, setShowLogo] = useState(false);
  const [layout, setLayout] = useState<"grid" | "list" | "grid_cinematic">("grid");
  
  // Profile sections to include
  const [addAbout, setAddAbout] = useState(false);
  const [addSocials, setAddSocials] = useState(false);
  const [addLocation, setAddLocation] = useState(false);

  useEffect(() => {
    // Get mode from sessionStorage
    const storedMode = sessionStorage.getItem('quickCatalogMode') as 'products' | 'categories' | 'tags' | null;
    if (!storedMode) {
      toast.error("Modo não especificado");
      navigate("/compartilhar");
      return;
    }
    setMode(storedMode);

    // Auto-fill title with date
    const today = new Date();
    const dateStr = today.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });

    if (storedMode === 'products') {
      // Get selected products from sessionStorage
      const stored = sessionStorage.getItem('quickCatalogProducts');
      if (!stored) {
        toast.error("Nenhum produto selecionado");
        navigate("/compartilhar");
        return;
      }

      const selectedProducts = JSON.parse(stored);
      console.log('QuickCatalogCreate - Received products:', selectedProducts.length, selectedProducts.map((p: any) => p.title));
      setProducts(selectedProducts);
      setTitle(`Sugestões – ${dateStr}`);

      // Auto-use first product image as cover
      const firstImage = selectedProducts[0]?.photos?.[0]?.url || 
                         selectedProducts[0]?.photos?.[0]?.image_url;
      if (firstImage) {
        setCoverImage(firstImage);
      }
    } else if (storedMode === 'categories') {
      // Get selected categories
      const storedCategories = sessionStorage.getItem('quickCatalogCategories');
      const storedProducts = sessionStorage.getItem('quickCatalogAllProducts');
      if (!storedCategories || !storedProducts) {
        toast.error("Dados não encontrados");
        navigate("/compartilhar");
        return;
      }

      const categories = JSON.parse(storedCategories);
      const allProducts = JSON.parse(storedProducts);
      setSelectedCategories(categories);
      setProducts(allProducts);
      setTitle(`Catálogo por Categorias – ${dateStr}`);

      // Use first product image from first category
      const firstCategoryProducts = allProducts.filter((p: any) => 
        p.category === categories[0] || 
        (Array.isArray(p.categories) && p.categories.includes(categories[0]))
      );
      const firstImage = firstCategoryProducts[0]?.photos?.[0]?.url || 
                         firstCategoryProducts[0]?.photos?.[0]?.image_url;
      if (firstImage) {
        setCoverImage(firstImage);
      }
    } else if (storedMode === 'tags') {
      // Get selected tags
      const storedTags = sessionStorage.getItem('quickCatalogTags');
      const storedProducts = sessionStorage.getItem('quickCatalogAllProducts');
      if (!storedTags || !storedProducts) {
        toast.error("Dados não encontrados");
        navigate("/compartilhar");
        return;
      }

      const tags = JSON.parse(storedTags);
      const allProducts = JSON.parse(storedProducts);
      setSelectedTags(tags);
      setProducts(allProducts);
      setTitle(`Catálogo por Tags – ${dateStr}`);

      // Use first product image from first tag
      const firstTagProducts = allProducts.filter((p: any) => {
        const productTags = p.quality_tags;
        if (typeof productTags === 'string') {
          return productTags.split(',').map((t: string) => t.trim()).includes(tags[0]);
        }
        if (Array.isArray(productTags)) {
          return productTags.includes(tags[0]);
        }
        return false;
      });
      const firstImage = firstTagProducts[0]?.photos?.[0]?.url || 
                         firstTagProducts[0]?.photos?.[0]?.image_url;
      if (firstImage) {
        setCoverImage(firstImage);
      }
    }
  }, [navigate]);

  const generateSlug = (title: string): string => {
    const base = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Add timestamp to ensure uniqueness
    const timestamp = Date.now().toString(36);
    return `${base}-${timestamp}`;
  };

  const handleCreateCatalog = async () => {
    if (!title.trim()) {
      toast.error("Digite um título para o catálogo");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/entrar");
        return;
      }

      // Get user's slug and logo
      const { data: profile } = await supabase
        .from("profiles")
        .select("slug, logo_url")
        .eq("id", user.id)
        .single();

      if (!profile?.slug) {
        toast.error("Configure seu nome de usuário primeiro");
        navigate("/escolher-slug?from=compartilhar");
        return;
      }

      const catalogSlug = generateSlug(title);

      // Create catalog
      const { data: catalog, error: catalogError } = await supabase
        .from("catalogs")
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          slug: catalogSlug,
          status: 'publicado',
          link_ativo: true,
          // no_perfil: deprecated - visibility controlled by profile_blocks 'catalogs' block
          cover: coverImage ? { url: coverImage } : null,
        })
        .select()
        .single();

      if (catalogError) throw catalogError;

      // Collect images for carousel layout
      const coverImages: string[] = [];
      if (coverLayout === 'carousel-top') {
        // Get first 3 images from products
        for (const product of products.slice(0, 3)) {
          const img = product.photos?.[0]?.url || product.photos?.[0]?.image_url;
          if (img) coverImages.push(img);
        }
      }

      // Create Capa block
      const coverData: any = {
        title: title.trim(),
        subtitle: description.trim() || '',
        layout: coverLayout,
        align: 'center',
        use_profile_logo: showLogo,
        logo_url: showLogo ? profile.logo_url : null,
      };

      // Add images based on layout
      if (coverLayout === 'carousel-top') {
        coverData.images = coverImages;
      } else {
        coverData.image_url = coverImage || '';
      }

      console.log('Creating cover block with data:', coverData);
      console.log('Profile logo_url:', profile.logo_url);
      console.log('Show logo:', showLogo);

      const { error: capaError } = await supabase
        .from("catalog_blocks")
        .insert({
          catalog_id: catalog.id,
          type: 'cover',
          sort: 0,
          visible: true,
          data: coverData,
        });

      if (capaError) throw capaError;

      // Generate blocks based on mode
      let currentSort = 1;
      const blocksToInsert: any[] = [];

      if (mode === 'products') {
        // Simple product grid for "few products" mode
        const productIds = products.map(p => p.id);
        console.log('Creating catalog with product IDs:', productIds);
        blocksToInsert.push({
          catalog_id: catalog.id,
          type: 'product_grid',
          sort: currentSort++,
          visible: true,
          data: {
            source_type: 'manual',
            selected_product_ids: productIds,
            layout: layout,
            show_price: true,
            show_tags: false,
            show_button: true,
            limit: productIds.length,
          },
        });
      } else if (mode === 'categories') {
        // For each category: create section cover + product grid
        for (const category of selectedCategories) {
          // Get products for this category
          const categoryProducts = products.filter(p => {
            if (p.category === category) return true;
            const cats = (p as any).categories;
            if (Array.isArray(cats) && cats.includes(category)) return true;
            if (cats && typeof cats === 'object' && Object.values(cats).includes(category)) return true;
            return false;
          });

          if (categoryProducts.length === 0) continue;

          const firstImage = categoryProducts[0]?.photos?.[0]?.url || categoryProducts[0]?.photos?.[0]?.image_url;

          // Category cover block
          blocksToInsert.push({
            catalog_id: catalog.id,
            type: 'cover',
            sort: currentSort++,
            visible: true,
            data: {
              title: category,
              subtitle: `${categoryProducts.length} produto${categoryProducts.length !== 1 ? 's' : ''}`,
              layout: 'image-top',
              align: 'center',
              image_url: firstImage || '',
            },
          });

          // Category products grid
          blocksToInsert.push({
            catalog_id: catalog.id,
            type: 'product_grid',
            sort: currentSort++,
            visible: true,
            data: {
              source_type: 'manual',
              selected_product_ids: categoryProducts.map(p => p.id),
              layout: layout,
              show_price: true,
              show_tags: false,
              show_button: true,
              limit: categoryProducts.length,
            },
          });
        }
      } else if (mode === 'tags') {
        // For each tag: create section cover + product grid
        for (const tag of selectedTags) {
          // Get products for this tag
          const tagProducts = products.filter(p => {
            const productTags = (p as any).quality_tags;
            if (typeof productTags === 'string') {
              return productTags.split(',').map((t: string) => t.trim()).includes(tag);
            }
            if (Array.isArray(productTags)) {
              return productTags.includes(tag);
            }
            return false;
          });

          if (tagProducts.length === 0) continue;

          const firstImage = tagProducts[0]?.photos?.[0]?.url || tagProducts[0]?.photos?.[0]?.image_url;

          // Tag cover block
          blocksToInsert.push({
            catalog_id: catalog.id,
            type: 'cover',
            sort: currentSort++,
            visible: true,
            data: {
              title: tag,
              subtitle: `${tagProducts.length} produto${tagProducts.length !== 1 ? 's' : ''}`,
              layout: 'image-top',
              align: 'center',
              image_url: firstImage || '',
            },
          });

          // Tag products grid
          blocksToInsert.push({
            catalog_id: catalog.id,
            type: 'product_grid',
            sort: currentSort++,
            visible: true,
            data: {
              source_type: 'manual',
              selected_product_ids: tagProducts.map(p => p.id),
              layout: layout,
              show_price: true,
              show_tags: false,
              show_button: true,
              limit: tagProducts.length,
            },
          });
        }
      }

      // Add profile sections if requested (only for categories/tags)
      // Note: These will be inserted BEFORE product sections, then re-sorted
      const profileBlocks: any[] = [];
      
      if (mode === 'categories' || mode === 'tags') {
        if (addAbout) {
          profileBlocks.push({
            catalog_id: catalog.id,
            type: 'about_business',
            sort: 1, // Will be inserted right after main cover
            visible: true,
            data: {
              use_profile: true, // Automatically use text from profile
            },
          });
        }

        if (addSocials) {
          profileBlocks.push({
            catalog_id: catalog.id,
            type: 'socials',
            sort: 999, // Will go at the end
            visible: true,
            data: {},
          });
        }

        if (addLocation) {
          // Get user's locations from profile.locations JSONB column
          let locationIds: string[] = [];
          try {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("locations")
              .eq("id", user.id)
              .single();
            
            if (profileData?.locations && Array.isArray(profileData.locations)) {
              // Extract IDs from locations array (or generate them if missing)
              locationIds = profileData.locations
                .filter((loc: any) => loc && loc.name) // Only include locations with names
                .map((loc: any, index: number) => loc.id || `location-${index}`);
            }
          } catch (e) {
            console.log("Could not fetch locations:", e);
          }

          if (locationIds.length > 0) {
            profileBlocks.push({
              catalog_id: catalog.id,
              type: 'location',
              sort: 998, // Will go at the end, before social
              visible: true,
              data: {
                title: "Nossas Localizações",
                description: "Conheça nossas unidades e onde nos encontrar",
                layout: "list",
                show_map: true,
                selected_locations: locationIds, // All location IDs
              },
            });
          }
        }
      }

      // Now we need to properly order blocks:
      // 1. Main cover (sort: 0) - already inserted
      // 2. Sobre block (sort: 1) - if selected
      // 3. Category/Tag sections (sort: 2+)
      // 4. Location block (sort: end-1)
      // 5. Social block (sort: end)
      
      const finalBlocks: any[] = [];
      let finalSort = 1;
      
      // Add "Sobre" first if selected
      const aboutBlock = profileBlocks.find(b => b.type === 'about_business');
      if (aboutBlock) {
        finalBlocks.push({ ...aboutBlock, sort: finalSort++ });
      }
      
      // Add all product blocks (categories/tags sections)
      for (const block of blocksToInsert) {
        finalBlocks.push({ ...block, sort: finalSort++ });
      }
      
      // Add location block if exists
      const locationBlock = profileBlocks.find(b => b.type === 'location');
      if (locationBlock) {
        finalBlocks.push({ ...locationBlock, sort: finalSort++ });
      }
      
      // Add social block last if exists
      const socialBlock = profileBlocks.find(b => b.type === 'socials');
      if (socialBlock) {
        finalBlocks.push({ ...socialBlock, sort: finalSort++ });
      }

      // Insert all blocks in correct order
      if (finalBlocks.length > 0) {
        const { error: blocksError } = await supabase
          .from("catalog_blocks")
          .insert(finalBlocks);

        if (blocksError) throw blocksError;
      }

      // Clear sessionStorage
      sessionStorage.removeItem('quickCatalogProducts');
      sessionStorage.removeItem('quickCatalogCategories');
      sessionStorage.removeItem('quickCatalogTags');
      sessionStorage.removeItem('quickCatalogAllProducts');
      sessionStorage.removeItem('quickCatalogMode');

      // Store catalog info for ShareModal
      sessionStorage.setItem('newCatalog', JSON.stringify({
        id: catalog.id,
        title: catalog.title,
        slug: catalogSlug,
        userSlug: profile.slug,
      }));

      // Navigate to share page
      navigate("/compartilhar/sucesso");

    } catch (error: any) {
      console.error("Error creating catalog:", error);
      toast.error(error.message || "Erro ao criar catálogo");
    } finally {
      setLoading(false);
    }
  };

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/compartilhar")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Criar Catálogo Rápido</h1>
            <p className="text-muted-foreground">
              {mode === 'products' && `${products.length} produto${products.length !== 1 ? "s" : ""} selecionado${products.length !== 1 ? "s" : ""}`}
              {mode === 'categories' && `${selectedCategories.length} categoria${selectedCategories.length !== 1 ? "s" : ""} selecionada${selectedCategories.length !== 1 ? "s" : ""}`}
              {mode === 'tags' && `${selectedTags.length} tag${selectedTags.length !== 1 ? "s" : ""} selecionada${selectedTags.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Catálogo</CardTitle>
            <CardDescription>
              Seu catálogo será publicado automaticamente e pronto para compartilhar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Título <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Sugestões de Natal"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                {title.length}/100 caracteres
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Adicione uma descrição para o catálogo..."
                maxLength={200}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {description.length}/200 caracteres
              </p>
            </div>

            {/* Cover Layout */}
            <div className="space-y-3">
              <Label>Estilo da Capa</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCoverLayout("logo-title-image")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    coverLayout === "logo-title-image"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="text-2xl">🏆</div>
                    <p className="text-sm font-medium">Logo + Título</p>
                    <p className="text-xs text-muted-foreground">Elegante</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCoverLayout("image-top")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    coverLayout === "image-top"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="text-2xl">📸</div>
                    <p className="text-sm font-medium">Imagem Grande</p>
                    <p className="text-xs text-muted-foreground">Impactante</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCoverLayout("carousel-top")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    coverLayout === "carousel-top"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="text-2xl">🎠</div>
                    <p className="text-sm font-medium">Galeria</p>
                    <p className="text-xs text-muted-foreground">3 fotos</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCoverLayout("full-background")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    coverLayout === "full-background"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="text-2xl">🖼️</div>
                    <p className="text-sm font-medium">Fundo</p>
                    <p className="text-xs text-muted-foreground">Moderno</p>
                  </div>
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {coverLayout === "logo-title-image" && "Logo do perfil + título + foto principal"}
                {coverLayout === "image-top" && "Imagem grande com título embaixo"}
                {coverLayout === "carousel-top" && "3 fotos deslizáveis (usa primeiras 3 fotos dos produtos)"}
                {coverLayout === "full-background" && "Foto de fundo com texto sobreposto"}
              </p>
            </div>

            {/* Show Logo Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label>Mostrar logo do perfil</Label>
                <p className="text-xs text-muted-foreground">
                  {coverLayout === "logo-title-image" && "Aparece no topo da capa"}
                  {coverLayout === "image-top" && "Aparece acima do título"}
                  {coverLayout === "carousel-top" && "Aparece no topo, acima das fotos"}
                  {coverLayout === "full-background" && "Aparece sobre a imagem"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLogo(!showLogo)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showLogo ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showLogo ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Cover Image Preview */}
            {coverImage && (
              <div className="space-y-2">
                <Label>Prévia da Imagem</Label>
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  <img
                    src={coverImage}
                    alt="Capa"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Usando a primeira imagem dos produtos selecionados
                </p>
              </div>
            )}

            {/* Product Grid Layout */}
            <div className="space-y-3">
              <Label>Layout dos produtos</Label>
              <div className="space-y-3">
                {/* Grid */}
                <button
                  type="button"
                  onClick={() => setLayout("grid")}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    layout === "grid"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold mb-1">Grade</p>
                      <p className="text-xs text-muted-foreground">
                        Deslize horizontal com detalhes completos
                      </p>
                    </div>
                  </div>
                </button>

                {/* Cinematic */}
                <button
                  type="button"
                  onClick={() => setLayout("grid_cinematic")}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    layout === "grid_cinematic"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="2" y="3" width="20" height="14" rx="2" />
                        <path d="M8 21h8M12 17v4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold">Grade Cinemática</p>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          Premium
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Grade visual só com fotos (2 colunas mobile, 3 desktop)
                      </p>
                    </div>
                  </div>
                </button>

                {/* List */}
                <button
                  type="button"
                  onClick={() => setLayout("list")}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    layout === "list"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <line x1="8" y1="6" x2="21" y2="6" />
                        <line x1="8" y1="12" x2="21" y2="12" />
                        <line x1="8" y1="18" x2="21" y2="18" />
                        <line x1="3" y1="6" x2="3.01" y2="6" />
                        <line x1="3" y1="12" x2="3.01" y2="12" />
                        <line x1="3" y1="18" x2="3.01" y2="18" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold mb-1">Lista</p>
                      <p className="text-xs text-muted-foreground">
                        Cards verticais completos empilhados
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Profile Sections - Only for categories/tags */}
            {(mode === 'categories' || mode === 'tags') && (
              <div className="space-y-3">
                <Label>Seções do Perfil (opcional)</Label>
                <p className="text-sm text-muted-foreground">
                  Adicione informações do seu perfil automaticamente
                </p>
                <div className="space-y-2">
                  {/* About */}
                  <button
                    type="button"
                    onClick={() => setAddAbout(!addAbout)}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                      addAbout
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">ℹ️</div>
                        <div>
                          <p className="text-sm font-medium">Sobre o negócio</p>
                          <p className="text-xs text-muted-foreground">Descrição e história</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        addAbout ? "bg-primary border-primary" : "border-muted-foreground"
                      }`}>
                        {addAbout && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Social */}
                  <button
                    type="button"
                    onClick={() => setAddSocials(!addSocials)}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                      addSocials
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">📱</div>
                        <div>
                          <p className="text-sm font-medium">Redes sociais</p>
                          <p className="text-xs text-muted-foreground">Instagram, Facebook, etc.</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        addSocials ? "bg-primary border-primary" : "border-muted-foreground"
                      }`}>
                        {addSocials && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Location */}
                  <button
                    type="button"
                    onClick={() => setAddLocation(!addLocation)}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                      addLocation
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">📍</div>
                        <div>
                          <p className="text-sm font-medium">Localização</p>
                          <p className="text-xs text-muted-foreground">Endereço e mapa</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        addLocation ? "bg-primary border-primary" : "border-muted-foreground"
                      }`}>
                        {addLocation && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  💡 O botão flutuante do WhatsApp pode ser ativado depois no editor do catálogo
                </p>
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                💡 <strong>Dica:</strong> Seu catálogo será publicado automaticamente. 
                Você pode editá-lo depois no painel principal.
              </p>
            </div>

            {/* Action Button */}
            <Button
              onClick={handleCreateCatalog}
              disabled={loading || !title.trim()}
              size="lg"
              className="w-full gap-2 transition-all hover:scale-105"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Criando catálogo...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  Gerar Catálogo
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
