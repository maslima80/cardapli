/**
 * TestimonialsManager - Global testimonials management
 * 
 * Features:
 * - Add, edit, delete testimonials
 * - Mark testimonials as featured
 * - Reusable across catalogs and wizard
 * - Photo upload support
 * - Star rating
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Plus, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface Testimonial {
  id: string;
  user_id: string;
  author_name: string;
  author_role?: string;
  author_photo_url?: string;
  content: string;
  rating?: number;
  featured: boolean;
  source?: string;
  date_received?: string;
  created_at: string;
  updated_at: string;
}

interface TestimonialsManagerProps {
  onSelect?: (testimonial: Testimonial) => void;
  selectionMode?: boolean;
}

export function TestimonialsManager({ onSelect, selectionMode = false }: TestimonialsManagerProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<Testimonial> | null>(null);

  useEffect(() => {
    loadTestimonials();
  }, []);

  async function loadTestimonials() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('user_id', user.id)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error loading testimonials:', error);
      toast.error('Erro ao carregar depoimentos');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!editingTestimonial?.author_name || !editingTestimonial?.content) {
      toast.error('Preencha nome e depoimento');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (editingTestimonial.id) {
        // Update
        const { error } = await supabase
          .from('testimonials')
          .update({
            author_name: editingTestimonial.author_name,
            author_role: editingTestimonial.author_role,
            author_photo_url: editingTestimonial.author_photo_url,
            content: editingTestimonial.content,
            rating: editingTestimonial.rating,
            featured: editingTestimonial.featured,
            source: editingTestimonial.source,
            date_received: editingTestimonial.date_received,
          })
          .eq('id', editingTestimonial.id);

        if (error) throw error;
        toast.success('Depoimento atualizado');
      } else {
        // Insert
        const { error } = await supabase
          .from('testimonials')
          .insert({
            user_id: user.id,
            author_name: editingTestimonial.author_name,
            author_role: editingTestimonial.author_role,
            author_photo_url: editingTestimonial.author_photo_url,
            content: editingTestimonial.content,
            rating: editingTestimonial.rating,
            featured: editingTestimonial.featured || false,
            source: editingTestimonial.source,
            date_received: editingTestimonial.date_received,
          });

        if (error) throw error;
        toast.success('Depoimento adicionado');
      }

      setEditDialogOpen(false);
      setEditingTestimonial(null);
      loadTestimonials();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast.error('Erro ao salvar depoimento');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este depoimento?')) return;

    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Depoimento excluído');
      loadTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast.error('Erro ao excluir depoimento');
    }
  }

  async function toggleFeatured(testimonial: Testimonial) {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ featured: !testimonial.featured })
        .eq('id', testimonial.id);

      if (error) throw error;
      loadTestimonials();
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast.error('Erro ao atualizar depoimento');
    }
  }

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Depoimentos</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie depoimentos para usar em seus catálogos
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingTestimonial({});
            setEditDialogOpen(true);
          }}
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar
        </Button>
      </div>

      {/* Testimonials List */}
      {testimonials.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Nenhum depoimento ainda</p>
            <Button
              onClick={() => {
                setEditingTestimonial({});
                setEditDialogOpen(true);
              }}
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Depoimento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className={cn(
                "transition-all",
                selectionMode && "cursor-pointer hover:border-primary"
              )}
              onClick={() => selectionMode && onSelect?.(testimonial)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Photo */}
                  {testimonial.author_photo_url ? (
                    <img
                      src={testimonial.author_photo_url}
                      alt={testimonial.author_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-lg font-semibold">
                        {testimonial.author_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <h4 className="font-semibold">{testimonial.author_name}</h4>
                        {testimonial.author_role && (
                          <p className="text-sm text-muted-foreground">{testimonial.author_role}</p>
                        )}
                      </div>
                      {testimonial.featured && (
                        <Badge variant="secondary" className="flex-shrink-0">
                          Destaque
                        </Badge>
                      )}
                    </div>

                    {/* Rating */}
                    {testimonial.rating && (
                      <div className="flex gap-0.5 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-4 h-4",
                              i < testimonial.rating!
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            )}
                          />
                        ))}
                      </div>
                    )}

                    {/* Testimonial text */}
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      "{testimonial.content}"
                    </p>

                    {/* Actions */}
                    {!selectionMode && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFeatured(testimonial)}
                        >
                          <Star
                            className={cn(
                              "w-4 h-4",
                              testimonial.featured && "fill-yellow-400 text-yellow-400"
                            )}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingTestimonial(testimonial);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(testimonial.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>
              {editingTestimonial?.id ? 'Editar Depoimento' : 'Adicionar Depoimento'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Author Name */}
            <div className="space-y-2">
              <Label htmlFor="author_name">Nome do Cliente *</Label>
              <Input
                id="author_name"
                value={editingTestimonial?.author_name || ''}
                onChange={(e) =>
                  setEditingTestimonial({ ...editingTestimonial, author_name: e.target.value })
                }
                placeholder="Ex: Maria Silva"
              />
            </div>

            {/* Author Role */}
            <div className="space-y-2">
              <Label htmlFor="author_role">Cargo/Descrição (opcional)</Label>
              <Input
                id="author_role"
                value={editingTestimonial?.author_role || ''}
                onChange={(e) =>
                  setEditingTestimonial({ ...editingTestimonial, author_role: e.target.value })
                }
                placeholder="Ex: Cliente desde 2023"
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Depoimento *</Label>
              <Textarea
                id="content"
                value={editingTestimonial?.content || ''}
                onChange={(e) =>
                  setEditingTestimonial({ ...editingTestimonial, content: e.target.value })
                }
                placeholder="Escreva o depoimento do cliente..."
                rows={4}
              />
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label>Avaliação (opcional)</Label>
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() =>
                      setEditingTestimonial({
                        ...editingTestimonial,
                        rating: i + 1 === editingTestimonial?.rating ? undefined : i + 1,
                      })
                    }
                  >
                    <Star
                      className={cn(
                        "w-6 h-6 cursor-pointer transition-colors",
                        editingTestimonial?.rating && i < editingTestimonial.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300 hover:text-yellow-400"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Photo URL */}
            <div className="space-y-2">
              <Label htmlFor="author_photo_url">URL da Foto (opcional)</Label>
              <Input
                id="author_photo_url"
                value={editingTestimonial?.author_photo_url || ''}
                onChange={(e) =>
                  setEditingTestimonial({ ...editingTestimonial, author_photo_url: e.target.value })
                }
                placeholder="https://..."
              />
            </div>

            {/* Source */}
            <div className="space-y-2">
              <Label htmlFor="source">Origem (opcional)</Label>
              <Input
                id="source"
                value={editingTestimonial?.source || ''}
                onChange={(e) =>
                  setEditingTestimonial({ ...editingTestimonial, source: e.target.value })
                }
                placeholder="Ex: Google Reviews, Instagram"
              />
            </div>

            {/* Featured Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={editingTestimonial?.featured || false}
                onChange={(e) =>
                  setEditingTestimonial({ ...editingTestimonial, featured: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="featured" className="cursor-pointer">
                Marcar como destaque
              </Label>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="flex-1 w-full">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="flex-1 w-full">
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
