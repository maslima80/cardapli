const fs = require('fs');

// Read the file
const filePath = 'src/components/catalog/BlockSettingsDrawer.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add imports for the new settings components
content = content.replace(
  `import { ProductGridBlockSettings } from "./ProductGridBlockSettings";`,
  `import { ProductGridBlockSettings } from "./ProductGridBlockSettings";
import { LocationBlockSettings } from "./settings/LocationBlockSettings";
import { CategoryGridBlockSettings } from "./settings/CategoryGridBlockSettings";
import { TagGridBlockSettings } from "./settings/TagGridBlockSettings";`
);

// 2. Add new cases to the renderFields function
content = content.replace(
  `      case "divider":
        return <p className="text-sm text-muted-foreground">Este bloco não tem configurações.</p>;`,
  `      case "divider":
        return <p className="text-sm text-muted-foreground">Este bloco não tem configurações.</p>;
        
      case "location":
        return (
          <LocationBlockSettings
            data={formData}
            onUpdate={(updatedData) => setFormData(updatedData)}
          />
        );
        
      case "category_grid":
        return (
          <CategoryGridBlockSettings
            data={formData}
            onUpdate={(updatedData) => setFormData(updatedData)}
          />
        );
        
      case "tag_grid":
        return (
          <TagGridBlockSettings
            data={formData}
            onUpdate={(updatedData) => setFormData(updatedData)}
          />
        );`
);

// 3. Update the SheetTitle section
content = content.replace(
  `            {block.type === "heading" || block.type === "text" ? "Editar Texto Livre" :
             block.type === "cover" ? "Editar Capa" :
             block.type === "image" ? "Editar Imagem" :
             block.type === "video" ? "Editar Vídeo" :
             block.type === "product_grid" ? "Editar Grade de Produtos" :
             block.type === "about" ? "Editar Sobre" :
             block.type === "about_business" ? "Editar Sobre o Negócio" :
             block.type === "contact" ? "Editar Contato" :
             block.type === "socials" ? "Editar Redes Sociais" :
             block.type === "testimonials" ? "Editar Depoimentos" :
             block.type === "benefits" ? "Editar Benefícios" :
             block.type === "faq" ? "Editar Perguntas Frequentes" :
             block.type === "important_info" ? "Editar Info Importante" :
             block.type === "divider" ? "Editar Divisor" :
             "Editar Bloco"}`,
  `            {block.type === "heading" || block.type === "text" ? "Editar Texto Livre" :
             block.type === "cover" ? "Editar Capa" :
             block.type === "image" ? "Editar Imagem" :
             block.type === "video" ? "Editar Vídeo" :
             block.type === "product_grid" ? "Editar Grade de Produtos" :
             block.type === "category_grid" ? "Editar Categorias" :
             block.type === "tag_grid" ? "Editar Tags" :
             block.type === "location" ? "Editar Localizações" :
             block.type === "about" ? "Editar Sobre" :
             block.type === "about_business" ? "Editar Sobre o Negócio" :
             block.type === "contact" ? "Editar Contato" :
             block.type === "socials" ? "Editar Redes Sociais" :
             block.type === "testimonials" ? "Editar Depoimentos" :
             block.type === "benefits" ? "Editar Benefícios" :
             block.type === "faq" ? "Editar Perguntas Frequentes" :
             block.type === "important_info" ? "Editar Info Importante" :
             block.type === "divider" ? "Editar Divisor" :
             "Editar Bloco"}`
);

// Write the updated content back to the file
fs.writeFileSync(filePath, content);

console.log('BlockSettingsDrawer.tsx updated successfully!');
