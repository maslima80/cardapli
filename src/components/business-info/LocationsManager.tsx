/**
 * Locations Manager - Manage physical business locations
 * 
 * Features:
 * - Add/edit/delete multiple locations
 * - Each location has: name, address, hours, notes
 * - Select which locations to show in catalog blocks
 * - Clean, professional interface
 */

import { useState, useEffect } from 'react';
import { MapPin, Plus, Pencil, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Location {
  id: string;
  name: string;
  address: string;
  hours?: string;
  notes?: string;
}

interface LocationsManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LocationsManager({ open, onOpenChange }: LocationsManagerProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadLocations();
    }
  }, [open]);

  const loadLocations = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('locations')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const locs = data?.locations || [];
      setLocations(locs);
    } catch (error) {
      console.error('Error loading locations:', error);
      toast.error('Erro ao carregar localizações');
    } finally {
      setLoading(false);
    }
  };

  const saveLocations = async (updatedLocations: Location[]) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ locations: updatedLocations })
        .eq('id', user.id);

      if (error) throw error;

      setLocations(updatedLocations);
      toast.success('Localizações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving locations:', error);
      toast.error('Erro ao salvar localizações');
    } finally {
      setSaving(false);
    }
  };

  const handleAddLocation = () => {
    setEditingLocation({
      id: crypto.randomUUID(),
      name: '',
      address: '',
      hours: '',
      notes: '',
    });
    setIsAddingNew(true);
  };

  const handleSaveLocation = async () => {
    if (!editingLocation) return;

    if (!editingLocation.name || !editingLocation.address) {
      toast.error('Nome e endereço são obrigatórios');
      return;
    }

    let updatedLocations: Location[];
    if (isAddingNew) {
      updatedLocations = [...locations, editingLocation];
    } else {
      updatedLocations = locations.map(loc =>
        loc.id === editingLocation.id ? editingLocation : loc
      );
    }

    await saveLocations(updatedLocations);
    setEditingLocation(null);
    setIsAddingNew(false);
  };

  const handleDeleteLocation = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta localização?')) return;

    const updatedLocations = locations.filter(loc => loc.id !== id);
    await saveLocations(updatedLocations);
  };


  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <MapPin className="w-6 h-6" />
              Localizações Físicas
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Adicione os endereços das suas lojas ou pontos de atendimento
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900 dark:text-blue-100 mb-2">
              💡 <strong>Dica:</strong> Adicione todas as suas localizações físicas
            </p>
            <p className="text-xs text-blue-900 dark:text-blue-100">
              Ao criar catálogos, você poderá escolher quais localizações mostrar em cada um
            </p>
          </div>

          {/* Editing Form */}
          {editingLocation && (
            <Card className="mb-6 border-primary">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">
                  {isAddingNew ? 'Nova Localização' : 'Editar Localização'}
                </h3>

                <div className="space-y-2">
                  <Label>Nome da Localização *</Label>
                  <Input
                    value={editingLocation.name}
                    onChange={(e) => setEditingLocation({ ...editingLocation, name: e.target.value })}
                    placeholder="Ex: Loja Centro, Ateliê Principal"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Endereço Completo *</Label>
                  <Textarea
                    value={editingLocation.address}
                    onChange={(e) => setEditingLocation({ ...editingLocation, address: e.target.value })}
                    placeholder="Ex: Rua das Flores, 123 - Centro, São Paulo - SP, 01234-567"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Horário de Funcionamento (opcional)</Label>
                  <Input
                    value={editingLocation.hours || ''}
                    onChange={(e) => setEditingLocation({ ...editingLocation, hours: e.target.value })}
                    placeholder="Ex: Seg-Sex 9h-18h, Sáb 9h-13h"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Observações (opcional)</Label>
                  <Textarea
                    value={editingLocation.notes || ''}
                    onChange={(e) => setEditingLocation({ ...editingLocation, notes: e.target.value })}
                    placeholder="Ex: Retirada apenas com agendamento prévio"
                    rows={2}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveLocation} disabled={saving}>
                    {saving ? 'Salvando...' : 'Salvar Localização'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingLocation(null);
                      setIsAddingNew(false);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Locations List */}
          {!editingLocation && (
            <>
              {locations.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Nenhuma localização ainda</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Adicione os endereços das suas lojas ou pontos de atendimento
                  </p>
                  <Button onClick={handleAddLocation}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeira Localização
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">
                      Localizações ({locations.length})
                    </h3>
                    <Button onClick={handleAddLocation} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Nova
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {locations.map((location) => (
                      <Card key={location.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">{location.name}</h4>
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">
                                📍 {location.address}
                              </p>
                              {location.hours && (
                                <p className="text-sm text-muted-foreground mb-1">
                                  🕒 {location.hours}
                                </p>
                              )}
                              {location.notes && (
                                <p className="text-sm text-muted-foreground">
                                  💬 {location.notes}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingLocation(location);
                                  setIsAddingNew(false);
                                }}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteLocation(location.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
