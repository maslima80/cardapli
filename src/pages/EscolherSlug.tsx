import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Loader2, ArrowLeft, Sparkles, Info } from "lucide-react";
import { motion } from "framer-motion";

export default function EscolherSlug() {
  const navigate = useNavigate();
  const [slug, setSlug] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/entrar");
      return;
    }
    
    // Check if user already has a slug
    const { data } = await supabase
      .from("profiles")
      .select("slug")
      .eq("id", session.user.id)
      .single();
      
    if (data?.slug) {
      setSlug(data.slug);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (slug.length >= 3) {
        checkAvailability(slug);
      } else {
        setIsAvailable(null);
        setError("");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [slug]);

  const validateSlug = (value: string): boolean => {
    const slugRegex = /^[a-z0-9_]{3,20}$/;
    return slugRegex.test(value);
  };

  const handleSlugChange = (value: string) => {
    const lowercased = value.toLowerCase();
    setSlug(lowercased);
    
    if (value.length > 0 && value.length < 3) {
      setError("Mínimo de 3 caracteres");
      setIsAvailable(null);
    } else if (value.length > 20) {
      setError("Máximo de 20 caracteres");
      setIsAvailable(null);
    } else if (value.length >= 3 && !validateSlug(lowercased)) {
      setError("Use apenas letras minúsculas, números e _");
      setIsAvailable(null);
    } else {
      setError("");
    }
  };

  const checkAvailability = async (slugToCheck: string) => {
    if (!validateSlug(slugToCheck)) {
      setIsAvailable(null);
      return;
    }

    setIsChecking(true);
    try {
      const { data, error } = await supabase.rpc('is_slug_available', {
        check_slug: slugToCheck
      });

      if (error) throw error;
      setIsAvailable(data);
    } catch (err) {
      console.error("Error checking slug:", err);
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSave = async () => {
    if (!slug || !isAvailable || error) return;

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ slug })
        .eq("id", user.id);

      if (updateError) throw updateError;

      toast({
        title: "Nome de usuário definido!",
        description: `Seu link público: cardapli.com/u/${slug}`,
      });

      // Check if we came from the profile page
      const fromProfile = new URLSearchParams(window.location.search).get('from') === 'profile';
      
      // If new user (not from profile), go to dashboard which will show welcome modal
      navigate(fromProfile ? "/perfil" : "/inicio");
    } catch (err: any) {
      console.error("Error saving slug:", err);
      toast({
        title: "Erro ao salvar",
        description: err.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Check if we came from the profile page
  const fromProfile = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('from') === 'profile';
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-6"
      >
        {fromProfile && (
          <div className="flex justify-start">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/perfil')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar ao Perfil
            </Button>
          </div>
        )}
        
        {/* Icon */}
        {!fromProfile && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: 'spring', delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </motion.div>
        )}
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {fromProfile ? 'Alterar Nome de Usuário' : 'Vamos começar! 🚀'}
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            {fromProfile 
              ? 'Atualize seu nome de usuário para o link público' 
              : 'Escolha seu nome de usuário para criar seu link personalizado'
            }
          </p>
        </div>

        {/* Context Card */}
        {!fromProfile && (
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 p-4">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Por que isso importa?
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  Seu nome de usuário será usado no link que você compartilha com seus clientes. Escolha algo fácil de lembrar!
                </p>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6 sm:p-8 shadow-xl border-2 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="slug" className="text-base">
              Nome de usuário
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                @
              </div>
              <Input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="seu_nome"
                className="pl-8 pr-10 h-12 text-base"
                maxLength={20}
                disabled={isSaving}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isChecking && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                {!isChecking && isAvailable === true && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
                {!isChecking && isAvailable === false && (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
              </div>
            </div>
            
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            
            {!error && isAvailable === true && (
              <p className="text-sm text-green-600 dark:text-green-500 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Disponível!
              </p>
            )}
            
            {!error && isAvailable === false && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <XCircle className="h-4 w-4" />
                Já está em uso
              </p>
            )}
            
            <p className="text-xs text-muted-foreground">
              3 a 20 caracteres • letras, números e _
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleSave}
              disabled={!slug || !isAvailable || !!error || isSaving}
              className="w-full h-12 text-base font-medium"
              size="lg"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                fromProfile ? "Salvar alterações" : "Continuar"
              )}
            </Button>
            
            {slug && isAvailable && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center"
              >
                <p className="text-sm text-green-800 dark:text-green-200 mb-1">Seu link será:</p>
                <p className="font-semibold text-green-900 dark:text-green-100 text-lg">
                  cardapli.com/u/{slug}
                </p>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
