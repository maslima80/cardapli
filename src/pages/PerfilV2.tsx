import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Eye, Copy, User, Briefcase, Palette, Layout, MessageCircle } from "lucide-react";
import { publicProfileUrl } from "@/lib/urls";

export default function PerfilV2() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [userId, setUserId] = useState<string>("");
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/entrar");
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Erro ao carregar perfil");
    }
  };

  const copyLink = () => {
    if (profile?.slug) {
      const url = publicProfileUrl(profile.slug);
      navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  };

  const viewProfile = () => {
    if (profile?.slug) {
      window.open(publicProfileUrl(profile.slug), '_blank');
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // If a section is active, render that section's detailed view
  if (activeSection) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="container max-w-4xl mx-auto p-6">
          <Button
            variant="ghost"
            onClick={() => setActiveSection(null)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          {/* Section content will go here */}
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Seção: {activeSection}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard view with cards
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="container max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Meu Perfil</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie seu perfil e link in bio
            </p>
          </div>
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        {/* URL Section - Always visible at top */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Nome de usuário</CardTitle>
            <CardDescription>
              Este é o seu link público que você pode compartilhar com seus clientes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-900 rounded-lg font-mono text-sm">
                cardapli.com.br/u/{profile.slug || 'seu-usuario'}
              </div>
              <Button variant="outline" onClick={() => setActiveSection('username')}>
                Editar
              </Button>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={viewProfile} className="flex-1">
                <Eye className="w-4 h-4 mr-2" />
                Ver página
              </Button>
              <Button variant="outline" onClick={copyLink} className="flex-1">
                <Copy className="w-4 h-4 mr-2" />
                Copiar link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Section Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Profile Card */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveSection('profile')}>
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center mb-3">
                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Perfil</CardTitle>
              <CardDescription>
                Nome, logo, slogan e redes sociais
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Business Card */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveSection('business')}>
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-950 flex items-center justify-center mb-3">
                <Briefcase className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Negócio</CardTitle>
              <CardDescription>
                Sobre, contato, WhatsApp e telefone
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Theme Card */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveSection('theme')}>
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center mb-3">
                <Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>Tema</CardTitle>
              <CardDescription>
                Cores, fontes e modo claro/escuro
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Link in Bio Builder Card */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveSection('builder')}>
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950 flex items-center justify-center mb-3">
                <Layout className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle>Link in Bio</CardTitle>
              <CardDescription>
                Blocos, conteúdo e WhatsApp bubble
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
