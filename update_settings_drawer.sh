#!/bin/bash

# 1. Add imports for the new settings components
sed -i '' '/import { ProductGridBlockSettings } from ".\/ProductGridBlockSettings";/a\
import { LocationBlockSettings } from "./settings/LocationBlockSettings";\
import { CategoryGridBlockSettings } from "./settings/CategoryGridBlockSettings";\
import { TagGridBlockSettings } from "./settings/TagGridBlockSettings";
' src/components/catalog/BlockSettingsDrawer.tsx

# 2. Add new cases to the renderFields function
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

# 3. Update the SheetTitle section
sed -i '' '/block.type === "product_grid" ? "Editar Grade de Produtos" :/a\
             block.type === "category_grid" ? "Editar Categorias" :\
             block.type === "tag_grid" ? "Editar Tags" :\
             block.type === "location" ? "Editar Localizações" :
' src/components/catalog/BlockSettingsDrawer.tsx

echo "BlockSettingsDrawer.tsx updated successfully!"
