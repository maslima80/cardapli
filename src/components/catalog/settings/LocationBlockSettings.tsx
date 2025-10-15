import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface LocationBlockSettingsProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function LocationBlockSettings({ data, onUpdate }: LocationBlockSettingsProps) {
  const [title, setTitle] = useState(data?.title || "Nossas Localizações");
  const [description, setDescription] = useState(data?.description || "");
  const [layout, setLayout] = useState(data?.layout || "list");
  const [showMap, setShowMap] = useState(data?.show_map !== false);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(data?.selected_locations || []);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

        if (profileData?.locations) {
          setLocations(profileData.locations);
          
          // If no locations are selected yet, select all by default
          if (!data?.selected_locations?.length) {
            setSelectedLocations(profileData.locations.map((loc: any) => loc.id));
          }
        }
      } catch (error) {
        console.error("Error loading locations:", error);
      } finally {
        setLoading(false);
      }
    }

    loadLocations();
  }, []);

  // Update parent component when settings change
  useEffect(() => {
    const updatedData = {
      ...data,
      title,
      description,
      layout,
      show_map: showMap,
      selected_locations: selectedLocations,
    };
    onUpdate(updatedData);
  }, [title, description, layout, showMap, selectedLocations]);

  // Toggle location selection
  const toggleLocation = (locationId: string) => {
    setSelectedLocations(prev => {
      if (prev.includes(locationId)) {
        return prev.filter(id => id !== locationId);
      } else {
        return [...prev, locationId];
      }
    });
  };

  // Select all locations
  const selectAllLocations = () => {
    setSelectedLocations(locations.map(loc => loc.id));
  };

  // Clear all selected locations
  const clearSelectedLocations = () => {
    setSelectedLocations([]);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nossas Localizações"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição (opcional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Conheça nossas unidades e onde nos encontrar"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Layout</Label>
        <RadioGroup
          value={layout}
          onValueChange={setLayout}
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
          onCheckedChange={(checked) => setShowMap(checked === true)}
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
              {locations.map((location) => (
                <div
                  key={location.id}
                  className="flex items-start space-x-2 p-2 hover:bg-muted/50 rounded-md"
                >
                  <Checkbox
                    id={`location-${location.id}`}
                    checked={selectedLocations.includes(location.id)}
                    onCheckedChange={() => toggleLocation(location.id)}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={`location-${location.id}`}
                      className="font-medium cursor-pointer"
                    >
                      {location.name}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {location.address}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
