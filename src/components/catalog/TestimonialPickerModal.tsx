/**
 * TestimonialPickerModal - Select testimonials from global table
 * Similar to ProductPickerModal but for testimonials
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Testimonial } from '@/components/testimonials/TestimonialsManager';

interface TestimonialPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onConfirm: (selectedIds: string[]) => void;
}

export function TestimonialPickerModal({
  open,
  onOpenChange,
  selectedIds,
  onConfirm,
}: TestimonialPickerModalProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>(selectedIds);

  useEffect(() => {
    if (open) {
      loadTestimonials();
      setSelected(selectedIds);
    }
  }, [open, selectedIds]);

  async function loadTestimonials() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Only load approved testimonials
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'approved')
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

  function toggleSelection(id: string) {
    setSelected(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  }

  function handleConfirm() {
    onConfirm(selected);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Selecionar Depoimentos</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">Carregando...</div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Você ainda não tem depoimentos aprovados
            </p>
            <p className="text-sm text-muted-foreground">
              Vá para Perfil → Informações do Negócio → Depoimentos para adicionar
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className={cn(
                    "p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent",
                    selected.includes(testimonial.id) && "border-primary bg-accent"
                  )}
                  onClick={() => toggleSelection(testimonial.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selected.includes(testimonial.id)}
                      onCheckedChange={() => toggleSelection(testimonial.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                          <h4 className="font-semibold truncate">{testimonial.author_name}</h4>
                          {testimonial.author_role && (
                            <p className="text-sm text-muted-foreground truncate">
                              {testimonial.author_role}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {testimonial.featured && (
                            <Badge variant="secondary" className="text-xs">
                              Destaque
                            </Badge>
                          )}
                          {testimonial.submitted_by === 'customer' && (
                            <Badge variant="outline" className="text-xs">
                              Cliente
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Rating */}
                      {testimonial.rating && (
                        <div className="flex gap-0.5 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "w-3 h-3",
                                i < testimonial.rating!
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              )}
                            />
                          ))}
                        </div>
                      )}

                      {/* Testimonial text */}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        "{testimonial.content}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {selected.length} depoimento(s) selecionado(s)
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleConfirm}>
                  Confirmar Seleção
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
