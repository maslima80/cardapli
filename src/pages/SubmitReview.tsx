/**
 * SubmitReview - Public page for customers to submit testimonials
 * Accessed via shareable link with review token
 */

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Star, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function SubmitReview() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [businessInfo, setBusinessInfo] = useState<{ name: string; logo?: string } | null>(null);
  
  const [formData, setFormData] = useState({
    author_name: '',
    author_role: '',
    content: '',
    rating: 0,
    author_photo_url: '',
    customer_email: '',
  });
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Link inválido');
      return;
    }
    loadBusinessInfo();
  }, [token]);

  async function loadBusinessInfo() {
    try {
      // Verify token exists and get business info
      const { data: tokenData, error: tokenError } = await supabase
        .from('testimonials')
        .select('user_id')
        .eq('review_token', token)
        .single();

      if (tokenError || !tokenData) {
        toast.error('Link inválido ou expirado');
        setLoading(false);
        return;
      }

      // Get business profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('business_name, logo_url')
        .eq('id', tokenData.user_id)
        .single();

      if (profileError) throw profileError;

      setBusinessInfo({
        name: profile.business_name || 'Este negócio',
        logo: profile.logo_url || undefined,
      });
    } catch (error) {
      console.error('Error loading business info:', error);
      toast.error('Erro ao carregar informações');
    } finally {
      setLoading(false);
    }
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
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

  async function uploadPhotoToImageKit(file: File, userId: string): Promise<string | null> {
    try {
      // Get signature from edge function
      const { data: signatureData, error: signatureError } = await supabase.functions.invoke(
        'imagekit-signature',
        { body: {} }
      );

      if (signatureError) throw signatureError;

      const { token: ikToken, expire, signature, publicKey, folder } = signatureData;

      // Prepare form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', `testimonial-${Date.now()}.${file.name.split('.').pop()}`);
      formData.append('publicKey', publicKey);
      formData.append('signature', signature);
      formData.append('expire', expire.toString());
      formData.append('token', ikToken);
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
      console.error('ImageKit upload error:', error);
      return null;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.author_name || !formData.content || formData.rating === 0) {
      toast.error('Preencha nome, depoimento e avaliação');
      return;
    }

    setSubmitting(true);

    try {
      let photoUrl = formData.author_photo_url;

      // Upload photo if provided
      if (photoFile) {
        setUploadingPhoto(true);
        
        // Get user_id from token
        const { data: tokenData } = await supabase
          .from('testimonials')
          .select('user_id')
          .eq('review_token', token)
          .single();

        if (tokenData) {
          const uploaded = await uploadPhotoToImageKit(photoFile, tokenData.user_id);
          if (uploaded) photoUrl = uploaded;
        }
        setUploadingPhoto(false);
      }

      // Update testimonial with customer data
      const { error } = await supabase
        .from('testimonials')
        .update({
          author_name: formData.author_name,
          author_role: formData.author_role || null,
          content: formData.content,
          rating: formData.rating,
          author_photo_url: photoUrl || null,
          customer_email: formData.customer_email || null,
          submitted_by: 'customer',
          status: 'pending', // Requires approval
          date_received: new Date().toISOString().split('T')[0],
        })
        .eq('review_token', token);

      if (error) throw error;

      setSubmitted(true);
      toast.success('Depoimento enviado com sucesso!');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Erro ao enviar depoimento');
    } finally {
      setSubmitting(false);
      setUploadingPhoto(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!businessInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Link inválido ou expirado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-12 pb-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Obrigado!</h2>
            <p className="text-muted-foreground">
              Seu depoimento foi enviado e será analisado em breve.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 py-8 px-4">
      <div className="container max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            {businessInfo.logo && (
              <img
                src={businessInfo.logo}
                alt={businessInfo.name}
                className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
              />
            )}
            <CardTitle className="text-2xl">Deixe seu depoimento</CardTitle>
            <CardDescription>
              {businessInfo.name} gostaria de saber sua opinião
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating */}
              <div className="space-y-2">
                <Label>Avaliação *</Label>
                <div className="flex gap-2 justify-center py-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: i + 1 })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={cn(
                          "w-10 h-10 cursor-pointer transition-colors",
                          i < formData.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300 hover:text-yellow-400"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="author_name">Seu nome *</Label>
                <Input
                  id="author_name"
                  value={formData.author_name}
                  onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                  placeholder="Ex: Maria Silva"
                  required
                />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="author_role">Cargo/Descrição (opcional)</Label>
                <Input
                  id="author_role"
                  value={formData.author_role}
                  onChange={(e) => setFormData({ ...formData, author_role: e.target.value })}
                  placeholder="Ex: Cliente desde 2023"
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Seu depoimento *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Conte sua experiência..."
                  rows={4}
                  required
                />
              </div>

              {/* Photo */}
              <div className="space-y-2">
                <Label htmlFor="photo">Sua foto (opcional)</Label>
                <div className="flex items-center gap-4">
                  {photoPreview && (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="customer_email">Seu email (opcional)</Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  placeholder="seu@email.com"
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full"
                disabled={submitting || uploadingPhoto}
                size="lg"
              >
                {uploadingPhoto ? 'Enviando foto...' : submitting ? 'Enviando...' : 'Enviar Depoimento'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
