          <SheetTitle>
            {block.type === "heading" || block.type === "text" ? "Editar Texto Livre" :
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
             "Editar Bloco"}
          </SheetTitle>
