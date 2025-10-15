import React from "react";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LocationBlockProps {
  data: {
    title?: string;
    description?: string;
    selected_locations?: string[];
    layout?: "grid" | "list";
    show_map?: boolean;
  };
  profile?: any;
}

export function LocationBlock({ data, profile }: LocationBlockProps) {
  // Default title if not provided
  const title = data?.title || "Nossas Localizações";
  
  // Get all locations from profile
  const allLocations = profile?.locations || [];
  
  // Filter locations if specific ones are selected
  const locations = data?.selected_locations?.length
    ? allLocations.filter((loc: any) => data.selected_locations?.includes(loc.id))
    : allLocations;

  // If no locations, show empty state
  if (!locations.length) {
    return (
      <div className="py-8 text-center">
        <MapPin className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhuma localização disponível</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Adicione localizações ao seu perfil para exibi-las aqui.
        </p>
      </div>
    );
  }

  // Render grid layout
  if (data?.layout === "grid") {
    return (
      <div className="space-y-6">
        {data?.title && (
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            {data?.description && (
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {data.description}
              </p>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location: any) => (
            <Card key={location.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-full p-3">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-lg mb-1">{location.name}</h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      {location.address}
                    </p>
                    {location.phone && (
                      <p className="text-sm mb-1">
                        <span className="font-medium">Telefone:</span> {location.phone}
                      </p>
                    )}
                    {location.hours && (
                      <p className="text-sm">
                        <span className="font-medium">Horário:</span> {location.hours}
                      </p>
                    )}
                    
                    {location.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {location.tags.map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {location.maps_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 w-full"
                        asChild
                      >
                        <a href={location.maps_url} target="_blank" rel="noopener noreferrer">
                          Ver no mapa
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  // Default list layout
  return (
    <div className="space-y-6">
      {data?.title && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          {data?.description && (
            <p className="text-muted-foreground">
              {data.description}
            </p>
          )}
        </div>
      )}
      
      <div className="space-y-4">
        {locations.map((location: any) => (
          <Card key={location.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 rounded-full p-3">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg mb-1">{location.name}</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    {location.address}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {location.phone && (
                      <p className="text-sm">
                        <span className="font-medium">Telefone:</span> {location.phone}
                      </p>
                    )}
                    {location.hours && (
                      <p className="text-sm">
                        <span className="font-medium">Horário:</span> {location.hours}
                      </p>
                    )}
                  </div>
                  
                  {location.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {location.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {location.maps_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      asChild
                    >
                      <a href={location.maps_url} target="_blank" rel="noopener noreferrer">
                        Ver no mapa
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
