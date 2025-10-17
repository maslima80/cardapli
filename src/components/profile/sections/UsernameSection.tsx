import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

interface UsernameSectionProps {
  userId: string;
  currentSlug: string | null;
  onUpdate: () => void;
}

export const UsernameSection = ({ userId, currentSlug, onUpdate }: UsernameSectionProps) => {
  const [slug, setSlug] = useState(currentSlug || "");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  const checkAvailability = async (value: string) => {
    if (!value || value === currentSlug) {
      setAvailable(null);
      return;
    }

    setChecking(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("slug", value)
        .single();

      setAvailable(!data);
    } catch (error) {
      setAvailable(true);
    } finally {
      setChecking(false);
    }
  };

  const handleSlugChange = (value: string) => {
    // Only allow lowercase letters, numbers, and hyphens
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(cleaned);
    
    if (cleaned.length >= 3) {
      checkAvailability(cleaned);
    } else {
      setAvailable(null);
    }
  };

  const handleSave = async () => {
    if (!slug || slug.length < 3) {
      toast.error("Nome de usuário deve ter pelo menos 3 caracteres");
      return;
    }

    if (available === false) {
      toast.error("Este nome de usuário não está disponível");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ slug })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Nome de usuário atualizado!");
      onUpdate();
    } catch (error) {
      console.error("Error updating slug:", error);
      toast.error("Erro ao atualizar nome de usuário");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nome de usuário</CardTitle>
        <CardDescription>
          Escolha um nome único para seu link público
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="slug">Nome de usuário</Label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                id="slug"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="seu-nome"
                className="pr-10"
              />
              {checking && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              )}
              {!checking && available === true && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
              )}
              {!checking && available === false && (
                <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-600" />
              )}
            </div>
            <Button 
              onClick={handleSave} 
              disabled={saving || !slug || available === false || slug === currentSlug}
            >
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
          {available === false && (
            <p className="text-sm text-red-600">Este nome já está em uso</p>
          )}
          {available === true && (
            <p className="text-sm text-green-600">Disponível!</p>
          )}
        </div>

        <div className="pt-4 border-t">
          <Label className="text-sm text-muted-foreground">Seu link público:</Label>
          <p className="font-mono text-sm mt-1">
            cardapli.com.br/u/{slug || 'seu-usuario'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
