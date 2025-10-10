import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";

const recoverySchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
});

const Recuperar = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validatedData = recoverySchema.parse({ email });
      setLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(validatedData.email, {
        redirectTo: `${window.location.origin}/`,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setSent(true);
      toast.success("Link de recuperação enviado! Verifique seu email.");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Erro ao enviar link de recuperação. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar showAuthButtons={false} />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-md">
          <div className="bg-card rounded-3xl shadow-medium p-8 border border-border animate-scale-in">
            <Link 
              to="/entrar" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para login
            </Link>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Recuperar senha</h1>
              <p className="text-muted-foreground">
                Digite seu email para receber um link de recuperação
              </p>
            </div>

            {!sent ? (
              <form onSubmit={handleRecovery} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 rounded-xl"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={loading}
                >
                  {loading ? "Enviando..." : "Enviar link de recuperação"}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6">
                  <p className="text-foreground">
                    Link de recuperação enviado para{" "}
                    <span className="font-semibold">{email}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Verifique sua caixa de entrada e spam
                  </p>
                </div>

                <Link to="/entrar">
                  <Button variant="outline" className="w-full" size="lg">
                    Voltar para login
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recuperar;
