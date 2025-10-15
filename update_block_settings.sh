#!/bin/bash

# Make a backup of the original file
cp src/components/catalog/BlockSettingsDrawer.tsx src/components/catalog/BlockSettingsDrawer.tsx.bak

# Update imports
sed -i '' '1,17d' src/components/catalog/BlockSettingsDrawer.tsx
cat src/components/catalog/BlockSettingsDrawer.imports.tsx src/components/catalog/BlockSettingsDrawer.tsx > src/components/catalog/BlockSettingsDrawer.tmp
mv src/components/catalog/BlockSettingsDrawer.tmp src/components/catalog/BlockSettingsDrawer.tsx

# Update blocksWithAnchors
sed -i '' '155s/.*/ const blocksWithAnchors = ["cover", "text", "heading", "testimonials", "faq", "benefits", "product_grid", "category_grid", "tag_grid", "location"];/' src/components/catalog/BlockSettingsDrawer.tsx

# Add new block types to renderFields
sed -i '' '/case "divider":/,/return <p class.*<\/p>;/a\
\
      case "location":\
        return (\
          <LocationBlockSettings\
            data={formData}\
            onUpdate={(updatedData) => setFormData(updatedData)}\
          />\
        );\
        \
      case "category_grid":\
        return (\
          <CategoryGridBlockSettings\
            data={formData}\
            onUpdate={(updatedData) => setFormData(updatedData)}\
          />\
        );\
        \
      case "tag_grid":\
        return (\
          <TagGridBlockSettings\
            data={formData}\
            onUpdate={(updatedData) => setFormData(updatedData)}\
          />\
        );
' src/components/catalog/BlockSettingsDrawer.tsx

# Update SheetTitle section
sed -i '' '1760,1774s/.*block.type === "heading" || block.type === "text" ? "Editar Texto Livre" :\
             block.type === "cover" ? "Editar Capa" :\
             block.type === "image" ? "Editar Imagem" :\
             block.type === "video" ? "Editar Vídeo" :\
             block.type === "product_grid" ? "Editar Grade de Produtos" :\
             block.type === "category_grid" ? "Editar Categorias" :\
             block.type === "tag_grid" ? "Editar Tags" :\
             block.type === "location" ? "Editar Localizações" :\
             block.type === "about" ? "Editar Sobre" :\
             block.type === "about_business" ? "Editar Sobre o Negócio" :\
             block.type === "contact" ? "Editar Contato" :\
             block.type === "socials" ? "Editar Redes Sociais" :\
             block.type === "testimonials" ? "Editar Depoimentos" :\
             block.type === "benefits" ? "Editar Benefícios" :\
             block.type === "faq" ? "Editar Perguntas Frequentes" :\
             block.type === "important_info" ? "Editar Info Importante" :\
             block.type === "divider" ? "Editar Divisor" :\
             "Editar Bloco"/' src/components/catalog/BlockSettingsDrawer.tsx

echo "BlockSettingsDrawer.tsx has been updated!"
