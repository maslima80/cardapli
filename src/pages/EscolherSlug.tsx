import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

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
        description: `Seu link público: cardapli.com/@${slug}`,
      });

      navigate("/dashboard");
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Bem-vindo! 👋</h1>
          <p className="text-muted-foreground">
            Escolha seu nome de usuário para começar
          </p>
        </div>

        <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-lg border space-y-6">
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
                "Continuar"
              )}
            </Button>
            
            {slug && isAvailable && (
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-sm text-muted-foreground">Seu link será:</p>
                <p className="font-medium text-foreground mt-1">
                  cardapli.com/@{slug}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
