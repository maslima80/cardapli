import React, { useEffect, useState, useMemo } from "react";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

// Define types for better type safety
type Location = { 
  id: string; 
  name: string; 
  address?: string; 
  phone?: string; 
  hours?: string; 
  maps_url?: string; 
  tags?: string[] 
};

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
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Default title if not provided
  const title = data?.title || "Nossas Localizações";
  const description = data?.description || "";
  
  // Create a stable string representation of selected IDs for dependency tracking
  const selectedIdsString = useMemo(() => {
    const ids = Array.isArray(data?.selected_locations) 
      ? data.selected_locations.filter(id => typeof id === 'string' && id.trim() !== '')
      : [];
    return JSON.stringify(ids.sort());
  }, [data?.selected_locations]);
  
  // Load profile locations
  useEffect(() => {
    async function fetchProfileLocations() {
      setLoading(true);
      try {
        // Parse the selected IDs from the string
        const selectedLocationIds = JSON.parse(selectedIdsString);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }
        
        const { data: profileData } = await supabase
          .from("profiles")
          .select("locations")
          .eq("id", user.id)
          .single();
        
        if (profileData?.locations && Array.isArray(profileData.locations)) {
          // Add IDs to locations if they don't have them
          const locationsWithIds = profileData.locations
            .filter((loc: any) => loc && loc.name)
            .map((loc: any, index: number) => ({
              ...loc,
              id: loc.id || `location-${index}`,
            }));
          
          // Filter to show only selected locations
          if (selectedLocationIds.length > 0) {
            const filtered = locationsWithIds.filter(loc => 
              selectedLocationIds.includes(loc.id)
            );
            setLocations(filtered);
          } else {
            // Show ALL locations when none are specifically selected
            setLocations(locationsWithIds);
          }
        }
      } catch (error) {
        console.error("Error loading profile locations:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfileLocations();
  }, [selectedIdsString]);

  // If loading, show loading state
  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Carregando localizações...</p>
      </div>
    );
  }

  // If no locations selected or found, show empty state
  if (!locations.length) {
    return (
      <div className="py-8 text-center">
        <MapPin className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhuma localização disponível</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Adicione localizações no seu perfil para exibi-las aqui.
        </p>
      </div>
    );
  }

  // Render grid layout
  if (data?.layout === "grid") {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          {description && (
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location, index) => (
            <Card 
              key={`grid-loc-${location.id || index}`} 
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
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
                        {location.tags.map((tag, tagIndex) => (
                          <Badge 
                            key={`${location.id || index}-tag-${tagIndex}`} 
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {location.maps_url && data?.show_map !== false && (
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
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        {description && (
          <p className="text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      
      <div className="space-y-4">
        {locations.map((location, index) => (
          <Card 
            key={`list-loc-${location.id || index}`} 
            className="overflow-hidden hover:shadow-lg transition-shadow"
          >
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
                      {location.tags.map((tag, tagIndex) => (
                        <Badge 
                          key={`${location.id || index}-tag-${tagIndex}`} 
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {location.maps_url && data?.show_map !== false && (
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
