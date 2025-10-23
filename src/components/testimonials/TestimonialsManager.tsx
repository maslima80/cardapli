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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Plus, Pencil, Trash2, Send, Check, X, Upload, Copy, Clock, Mail } from 'lucide-react';
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
  status: 'pending' | 'approved' | 'rejected';
  submitted_by?: 'owner' | 'customer';
  review_token?: string;
  customer_email?: string;
  customer_phone?: string;
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
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [generatedReviewLink, setGeneratedReviewLink] = useState('');
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<Testimonial> | null>(null);
  const [activeTab, setActiveTab] = useState<'approved' | 'pending'>('approved');
  
  // Photo upload
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useState<HTMLInputElement | null>(null)[0];

  const [copied, setCopied] = useState(false);

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
        .order('status', { ascending: true }) // pending first
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

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande (máx 5MB)');
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function uploadPhoto(userId: string): Promise<string | null> {
    if (!photoFile) return null;

    try {
      setUploadingPhoto(true);
      
      // Get signature from edge function
      const { data: signatureData, error: signatureError } = await supabase.functions.invoke(
        'imagekit-signature',
        { body: {} }
      );

      if (signatureError) throw signatureError;

      const { token, expire, signature, publicKey, folder } = signatureData;

      // Prepare form data
      const formData = new FormData();
      formData.append('file', photoFile);
      formData.append('fileName', `testimonial-${Date.now()}.${photoFile.name.split('.').pop()}`);
      formData.append('publicKey', publicKey);
      formData.append('signature', signature);
      formData.append('expire', expire.toString());
      formData.append('token', token);
      formData.append('folder', folder);

      // Upload to ImageKit
      const uploadResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadData = await uploadResponse.json();
      return uploadData.url;
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Erro ao enviar foto');
      return null;
    } finally {
      setUploadingPhoto(false);
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

      let photoUrl = editingTestimonial.author_photo_url;

      // Upload new photo if selected
      if (photoFile) {
        const uploaded = await uploadPhoto(user.id);
        if (uploaded) photoUrl = uploaded;
      }

      const testimonialData = {
        author_name: editingTestimonial.author_name,
        author_role: editingTestimonial.author_role || null,
        author_photo_url: photoUrl || null,
        content: editingTestimonial.content,
        rating: editingTestimonial.rating || null,
        featured: editingTestimonial.featured || false,
        source: editingTestimonial.source || null,
        date_received: editingTestimonial.date_received || null,
        status: 'approved',
        submitted_by: 'owner',
      };

      if (editingTestimonial.id) {
        // Update
        const { error } = await supabase
          .from('testimonials')
          .update(testimonialData)
          .eq('id', editingTestimonial.id);

        if (error) throw error;
        toast.success('Depoimento atualizado');
      } else {
        // Insert
        const { error } = await supabase
          .from('testimonials')
          .insert({
            ...testimonialData,
            user_id: user.id,
          });

        if (error) throw error;
        toast.success('Depoimento adicionado');
      }

      setEditDialogOpen(false);
      setEditingTestimonial(null);
      setPhotoFile(null);
      setPhotoPreview('');
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

  async function handleApprove(id: string) {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ status: 'approved' })
        .eq('id', id);

      if (error) throw error;
      toast.success('Depoimento aprovado');
      loadTestimonials();
    } catch (error) {
      console.error('Error approving testimonial:', error);
      toast.error('Erro ao aprovar depoimento');
    }
  }

  async function handleReject(id: string) {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;
      toast.success('Depoimento rejeitado');
      loadTestimonials();
    } catch (error) {
      console.error('Error rejecting testimonial:', error);
      toast.error('Erro ao rejeitar depoimento');
    }
  }

  async function handleGenerateReviewLink() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Generate unique token
      const token = `${user.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create placeholder testimonial with token
      const { error } = await supabase
        .from('testimonials')
        .insert({
          user_id: user.id,
          author_name: 'Aguardando resposta',
          content: 'Aguardando depoimento do cliente',
          status: 'pending',
          review_token: token,
          submitted_by: 'customer',
        });

      if (error) throw error;

      // Generate review link
      const reviewUrl = `${window.location.origin}/avaliar?token=${token}`;
      setGeneratedReviewLink(reviewUrl);
      setShareDialogOpen(true);
      
      loadTestimonials();
    } catch (error) {
      console.error('Error generating review link:', error);
      toast.error('Erro ao gerar link');
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(generatedReviewLink);
    setCopied(true);
    toast.success('Link copiado!');
    setTimeout(() => setCopied(false), 2000);
  }

  function handleWhatsAppShare() {
    const message = encodeURIComponent(
      `Olá! Gostaria muito de saber sua opinião sobre nosso serviço. Por favor, deixe seu depoimento aqui: ${generatedReviewLink}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  }

  function handleEmailShare() {
    const subject = encodeURIComponent('Deixe seu depoimento');
    const body = encodeURIComponent(
      `Olá!\n\nGostaria muito de saber sua opinião sobre nosso serviço.\n\nPor favor, deixe seu depoimento aqui:\n${generatedReviewLink}\n\nObrigado!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  }

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  const approvedTestimonials = testimonials.filter(t => t.status === 'approved');
  const pendingTestimonials = testimonials.filter(t => t.status === 'pending');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">Depoimentos</h3>
          <p className="text-sm text-muted-foreground">
            Adicione manualmente ou solicite aos clientes
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={handleGenerateReviewLink}
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-initial"
          >
            <Send className="w-4 h-4 mr-2" />
            Solicitar
          </Button>
          <Button
            onClick={() => {
              setEditingTestimonial({});
              setPhotoFile(null);
              setPhotoPreview('');
              setEditDialogOpen(true);
            }}
            size="sm"
            className="flex-1 sm:flex-initial"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="approved">
            Aprovados ({approvedTestimonials.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pendentes ({pendingTestimonials.length})
            {pendingTestimonials.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {pendingTestimonials.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Approved Tab */}
        <TabsContent value="approved" className="space-y-4 mt-4">
          {approvedTestimonials.length === 0 ? (
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
          {approvedTestimonials.map((testimonial) => (
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
        </TabsContent>

        {/* Pending Tab */}
        <TabsContent value="pending" className="space-y-4 mt-4">
          {pendingTestimonials.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma solicitação pendente</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingTestimonials.map((testimonial) => {
                const isAwaitingResponse = testimonial.author_name === 'Aguardando resposta';
                
                return (
                  <Card key={testimonial.id} className="border-orange-200 dark:border-orange-800">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Photo or Icon */}
                        {isAwaitingResponse ? (
                          <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                          </div>
                        ) : testimonial.author_photo_url ? (
                          <img
                            src={testimonial.author_photo_url}
                            alt={testimonial.author_name}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <span className="text-lg font-semibold">
                              {testimonial.author_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="min-w-0">
                              <h4 className="font-semibold truncate">{testimonial.author_name}</h4>
                              {testimonial.customer_email && (
                                <p className="text-xs text-muted-foreground truncate">{testimonial.customer_email}</p>
                              )}
                              {testimonial.customer_phone && (
                                <p className="text-xs text-muted-foreground truncate">{testimonial.customer_phone}</p>
                              )}
                            </div>
                            <Badge variant="outline" className="flex-shrink-0">Pendente</Badge>
                          </div>

                          {!isAwaitingResponse && (
                            <>
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
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                "{testimonial.content}"
                              </p>

                              {/* Approval Actions */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(testimonial.id)}
                                  className="flex-1 sm:flex-initial"
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  Aprovar
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleReject(testimonial.id)}
                                  className="flex-1 sm:flex-initial"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Rejeitar
                                </Button>
                              </div>
                            </>
                          )}

                          {isAwaitingResponse && (
                            <div className="flex items-center gap-2 mt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const reviewUrl = `${window.location.origin}/avaliar?token=${testimonial.review_token}`;
                                  navigator.clipboard.writeText(reviewUrl);
                                  toast.success('Link copiado!');
                                }}
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                Copiar Link
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
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

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

            {/* Photo Upload */}
            <div className="space-y-2">
              <Label>Foto do Cliente (opcional)</Label>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                )}
                <div className="flex-1 w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    id="photo-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {photoPreview ? 'Trocar Foto' : 'Enviar Foto'}
                  </Button>
                </div>
              </div>
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
              <Button
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false);
                  setPhotoFile(null);
                  setPhotoPreview('');
                }}
                className="flex-1 w-full"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={uploadingPhoto}
                className="flex-1 w-full"
              >
                {uploadingPhoto ? 'Enviando foto...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Review Link Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center space-y-4">
            {/* Success Icon */}
            <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-950 rounded-full flex items-center justify-center">
              <span className="text-4xl">📝</span>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-2xl font-bold mb-2">Link gerado!</h2>
              <p className="text-muted-foreground">
                Compartilhe com seu cliente para ele deixar um depoimento
              </p>
            </div>

            {/* URL Display */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input 
                  value={generatedReviewLink} 
                  readOnly 
                  className="flex-1 text-sm" 
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  title="Copiar link"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <Button
                onClick={handleWhatsAppShare}
                className="w-full gap-2 bg-green-600 hover:bg-green-700"
                size="lg"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Enviar no WhatsApp
              </Button>

              <Button
                onClick={handleEmailShare}
                variant="outline"
                className="w-full gap-2"
                size="lg"
              >
                <Mail className="w-4 h-4" />
                Enviar Email
              </Button>
            </div>

            {/* Close Button */}
            <Button
              onClick={() => setShareDialogOpen(false)}
              variant="ghost"
              className="w-full"
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
