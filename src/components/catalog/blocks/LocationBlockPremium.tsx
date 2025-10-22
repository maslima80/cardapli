import React, { useEffect, useState, useMemo } from "react";
import { MapPin, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

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

const LocationCard = ({ location, showMap }: { location: Location; showMap: boolean }) => {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 h-full flex flex-col">
      {/* Icon and Name */}
      <div className="flex items-start gap-4 mb-4">
        <div 
          className="rounded-full p-3 flex-shrink-0"
          style={{ backgroundColor: 'var(--accent-color, #8B5CF6)' }}
        >
          <MapPin className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 
            className="font-bold text-lg text-slate-900 dark:text-slate-50 mb-1"
            style={{ fontFamily: 'var(--font-heading, inherit)' }}
          >
            {location.name}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {location.address}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4 flex-1">
        {location.phone && (
          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <Phone className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent-color, #8B5CF6)' }} />
            <span>{location.phone}</span>
          </div>
        )}
        {location.hours && (
          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <Clock className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent-color, #8B5CF6)' }} />
            <span>{location.hours}</span>
          </div>
        )}
      </div>

      {/* Map Button */}
      {location.maps_url && showMap && (
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-auto"
          asChild
        >
          <a href={location.maps_url} target="_blank" rel="noopener noreferrer">
            <MapPin className="h-4 w-4 mr-2" />
            Ver no mapa
          </a>
        </Button>
      )}
    </div>
  );
};

export function LocationBlockPremium({ data, profile }: LocationBlockProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  
  const title = data?.title || "Nossas Localizações";
  const description = data?.description || "";
  const showMap = data?.show_map !== false;
  
  const selectedIdsString = useMemo(() => {
    const ids = Array.isArray(data?.selected_locations) 
      ? data.selected_locations.filter(id => typeof id === 'string' && id.trim() !== '')
      : [];
    return JSON.stringify(ids.sort());
  }, [data?.selected_locations]);
  
  useEffect(() => {
    async function fetchProfileLocations() {
      setLoading(true);
      try {
        const selectedLocationIds = JSON.parse(selectedIdsString);
        
        // Use profile prop if available (public view), otherwise get authenticated user
        let profileData = profile;
        
        if (!profileData) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            setLoading(false);
            return;
          }
          
          const { data: fetchedProfile } = await supabase
            .from("profiles")
            .select("locations")
            .eq("id", user.id)
            .single();
          
          profileData = fetchedProfile;
        }
        
        if (profileData?.locations && Array.isArray(profileData.locations)) {
          const locationsWithIds = profileData.locations
            .filter((loc: any) => loc && loc.name)
            .map((loc: any, index: number) => ({
              ...loc,
              id: loc.id || `location-${index}`,
            }));
          
          if (selectedLocationIds.length > 0) {
            // Show only selected locations
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
  }, [selectedIdsString, profile]);

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div 
          className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
          style={{ borderColor: 'var(--accent-color, #8B5CF6)', borderTopColor: 'transparent' }}
        />
        <p className="text-slate-600 dark:text-slate-400">Carregando localizações...</p>
      </div>
    );
  }

  if (!locations.length) {
    return (
      <div className="py-8 text-center">
        <MapPin className="h-12 w-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50 mb-2">
          Nenhuma localização disponível
        </h3>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          Adicione localizações no seu perfil para exibi-las aqui.
        </p>
      </div>
    );
  }

  // List layout - one below the other
  if (data?.layout === "list") {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h2 
            className="text-2xl sm:text-3xl font-bold mb-2 text-slate-900 dark:text-slate-50"
            style={{ fontFamily: 'var(--font-heading, inherit)' }}
          >
            {title}
          </h2>
          {description && (
            <p 
              className="text-slate-600 dark:text-slate-400"
              style={{ fontFamily: 'var(--font-body, inherit)' }}
            >
              {description}
            </p>
          )}
        </div>
        
        {/* Stacked Cards */}
        <div className="space-y-4 max-w-2xl">
          {locations.map((location, index) => (
            <LocationCard key={`list-loc-${location.id || index}`} location={location} showMap={showMap} />
          ))}
        </div>
      </div>
    );
  }

  // Grid/Swipe layout (default)
  // Single location - show as centered card
  if (locations.length === 1) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 
            className="text-2xl sm:text-3xl font-bold mb-2 text-slate-900 dark:text-slate-50"
            style={{ fontFamily: 'var(--font-heading, inherit)' }}
          >
            {title}
          </h2>
          {description && (
            <p 
              className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
              style={{ fontFamily: 'var(--font-body, inherit)' }}
            >
              {description}
            </p>
          )}
        </div>
        
        {/* Single Card */}
        <div className="max-w-md mx-auto">
          <LocationCard location={locations[0]} showMap={showMap} />
        </div>
      </div>
    );
  }

  // Multiple locations - horizontal scroll
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 
          className="text-2xl sm:text-3xl font-bold mb-2 text-slate-900 dark:text-slate-50"
          style={{ fontFamily: 'var(--font-heading, inherit)' }}
        >
          {title}
        </h2>
        {description && (
          <p 
            className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
            style={{ fontFamily: 'var(--font-body, inherit)' }}
          >
            {description}
          </p>
        )}
      </div>
      
      {/* Horizontal Scroll Container */}
      <div className="relative -mx-4 sm:-mx-6">
        <div 
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 sm:px-6 pb-4 scrollbar-hide cursor-grab active:cursor-grabbing"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
          onMouseDown={(e) => {
            const ele = e.currentTarget;
            const startX = e.pageX - ele.offsetLeft;
            const scrollLeft = ele.scrollLeft;
            
            const handleMouseMove = (e: MouseEvent) => {
              const x = e.pageX - ele.offsetLeft;
              const walk = (x - startX) * 2; // Scroll speed multiplier
              ele.scrollLeft = scrollLeft - walk;
            };
            
            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        >
          {locations.map((location, index) => (
            <div 
              key={`loc-${location.id || index}`}
              className="flex-shrink-0 w-[85%] sm:w-[400px] snap-start"
            >
              <LocationCard location={location} showMap={showMap} />
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Hint */}
      {locations.length > 1 && (
        <p className="text-center text-xs text-slate-500 dark:text-slate-500">
          ← Deslize para ver mais →
        </p>
      )}
    </div>
  );
}
