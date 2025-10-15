      case "divider":
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
        );
