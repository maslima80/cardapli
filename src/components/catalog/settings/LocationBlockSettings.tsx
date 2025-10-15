import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

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

interface LocationBlockSettingsProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function LocationBlockSettings({ data, onUpdate }: LocationBlockSettingsProps) {
  // Initialize state with default values
  const [title, setTitle] = useState(data?.title || "Nossas Localizações");
  const [description, setDescription] = useState(data?.description || "");
  const [layout, setLayout] = useState(data?.layout || "list");
  const [showMap, setShowMap] = useState(data?.show_map !== false);
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>(
    Array.isArray(data?.selected_locations) ? data.selected_locations.filter(Boolean) : []
  );
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync state with data prop when it changes (when dialog reopens)
  useEffect(() => {
    console.log("🗺️ LocationBlockSettings - Data prop changed:", data);
    console.log("  - Title:", data?.title);
    console.log("  - Description:", data?.description);
    console.log("  - Selected locations:", data?.selected_locations);
    console.log("  - Layout:", data?.layout);
    console.log("  - Show map:", data?.show_map);
    
    setTitle(data?.title || "Nossas Localizações");
    setDescription(data?.description || "");
    setLayout(data?.layout || "list");
    setShowMap(data?.show_map !== false);
    setSelectedLocationIds(
      Array.isArray(data?.selected_locations) ? data.selected_locations.filter(Boolean) : []
    );
  }, [data]);

  // Load locations from user profile
  useEffect(() => {
    async function loadLocations() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profileData } = await supabase
          .from("profiles")
          .select("locations")
          .eq("id", user.id)
          .single();

        if (profileData?.locations && Array.isArray(profileData.locations)) {
          // Add IDs to locations if they don't have them (using index as ID)
          const locationsWithIds = profileData.locations
            .filter((loc: any) => loc && loc.name) // Only include locations with names
            .map((loc: any, index: number) => ({
              ...loc,
              id: loc.id || `location-${index}`, // Use existing ID or generate one
            }));
          
          setLocations(locationsWithIds);
        }
      } catch (error) {
        console.error("Error loading locations:", error);
      } finally {
        setLoading(false);
      }
    }

    loadLocations();
  }, []);

  // Helper function to update parent with current state
  const updateParent = (overrides = {}) => {
    const updatedData = {
      title: title || "Nossas Localizações",
      description: description || "",
      layout: layout || "list",
      show_map: showMap !== false,
      selected_locations: selectedLocationIds,
      ...overrides,
    };
    onUpdate(updatedData);
  };

  // Toggle location selection
  const toggleLocation = (locationId: string) => {
    if (!locationId) return; // Skip if ID is undefined
    
    setSelectedLocationIds(prev => {
      const newIds = prev.includes(locationId)
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId];
      
      // Update parent immediately with new selection
      updateParent({ selected_locations: newIds });
      return newIds;
    });
  };

  // Select all locations
  const selectAllLocations = () => {
    // Only select locations with valid IDs
    const validIds = locations
      .filter(loc => loc && typeof loc.id === 'string' && loc.id.trim() !== '')
      .map(loc => loc.id);
      
    setSelectedLocationIds(validIds);
    updateParent({ selected_locations: validIds });
  };

  // Clear all selected locations
  const clearSelectedLocations = () => {
    setSelectedLocationIds([]);
    updateParent({ selected_locations: [] });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => {
            const newTitle = e.target.value;
            setTitle(newTitle);
            updateParent({ title: newTitle });
          }}
          placeholder="Nossas Localizações"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição (opcional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => {
            const newDesc = e.target.value;
            setDescription(newDesc);
            updateParent({ description: newDesc });
          }}
          placeholder="Conheça nossas unidades e onde nos encontrar"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Layout</Label>
        <RadioGroup
          value={layout}
          onValueChange={(value) => {
            setLayout(value);
            updateParent({ layout: value });
          }}
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="list" id="layout-list" />
            <Label htmlFor="layout-list">Lista (uma abaixo da outra)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="grid" id="layout-grid" />
            <Label htmlFor="layout-grid">Grade (lado a lado)</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="show-map"
          checked={showMap}
          onCheckedChange={(checked) => {
            const newShowMap = checked === true;
            setShowMap(newShowMap);
            updateParent({ show_map: newShowMap });
          }}
        />
        <Label htmlFor="show-map">Mostrar mapa</Label>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Selecionar localizações</Label>
          <div className="space-x-2 text-xs">
            <button
              type="button"
              onClick={selectAllLocations}
              className="text-primary hover:underline"
            >
              Selecionar todas
            </button>
            <span>|</span>
            <button
              type="button"
              onClick={clearSelectedLocations}
              className="text-primary hover:underline"
            >
              Limpar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : locations.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <MapPin className="h-10 w-10 mx-auto text-muted-foreground opacity-50 mb-2" />
              <p className="text-muted-foreground">
                Nenhuma localização encontrada. Adicione localizações no seu perfil.
              </p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-60 border rounded-md">
            <div className="p-4 space-y-2">
              {locations.map((location, index) => {
                // Skip rendering if location has no valid ID
                if (!location || !location.id) return null;
                
                return (
                  <div
                    key={`location-${location.id || index}`}
                    className="flex items-start space-x-2 p-2 hover:bg-muted/50 rounded-md"
                  >
                    <Checkbox
                      id={`location-check-${location.id || index}`}
                      checked={selectedLocationIds.includes(location.id)}
                      onCheckedChange={() => toggleLocation(location.id)}
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={`location-check-${location.id || index}`}
                        className="font-medium cursor-pointer"
                      >
                        {location.name || "Localização sem nome"}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {location.address || "Sem endereço"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
