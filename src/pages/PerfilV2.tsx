import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Eye, Copy, User, Palette, Layout } from "lucide-react";
import { debounce } from "@/lib/utils";
import { publicProfileUrl } from "@/lib/urls";
import { ProfileSection } from "@/components/profile/sections/ProfileSection";
import { PremiumThemeSettings } from "@/components/profile/PremiumThemeSettings";
import { ProfileBuilder } from "@/components/profile/ProfileBuilder";
import { UsernameSection } from "@/components/profile/sections/UsernameSection";

type Profile = {
  logo_url: string | null;
  business_name: string | null;
  slogan: string | null;
  about: string | null;
  whatsapp: string | null;
  phone: string | null;
  email_public: string | null;
  enable_whatsapp: boolean;
  enable_phone: boolean;
  socials: any;
  accent_color: string | null;
  background_color: string | null;
  theme_mode: string | null;
  font_theme: string | null;
  cta_shape: string | null;
  slug: string | null;
};

export default function PerfilV2() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>({
    logo_url: null,
    business_name: null,
    slogan: null,
    about: null,
    whatsapp: null,
    phone: null,
    email_public: null,
    enable_whatsapp: true,
    enable_phone: false,
    socials: {},
    accent_color: "#8B5CF6",
    background_color: null,
    theme_mode: "light",
    font_theme: "moderna",
    cta_shape: "rounded",
    slug: null,
  });
  const [saving, setSaving] = useState(false);
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

      if (data) {
        setProfile({
          logo_url: data.logo_url,
          business_name: data.business_name,
          slogan: data.slogan,
          about: data.about,
          whatsapp: data.whatsapp,
          phone: data.phone,
          email_public: data.email_public,
          enable_whatsapp: data.enable_whatsapp !== false,
          enable_phone: data.enable_phone === true,
          socials: data.socials || {},
          accent_color: data.accent_color || "#8B5CF6",
          background_color: data.background_color || null,
          theme_mode: data.theme_mode || "light",
          font_theme: data.font_theme || "moderna",
          cta_shape: data.cta_shape || "rounded",
          slug: data.slug,
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Erro ao carregar perfil");
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    debouncedUpdate({ [field]: value });
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Erro ao atualizar perfil");
    }
  };

  const debouncedUpdate = useCallback(
    debounce((updates: Partial<Profile>) => {
      updateProfile(updates);
    }, 1000),
    [userId]
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(profile);
      toast.success("Perfil salvo com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar perfil");
    } finally {
      setSaving(false);
    }
  };

  const copyLink = () => {
    if (profile.slug) {
      const url = `${window.location.origin}${publicProfileUrl(profile.slug)}`;
      navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  };

  const viewProfile = () => {
    if (profile.slug) {
      window.open(publicProfileUrl(profile.slug), '_blank');
    }
  };

  // If a section is active, show detailed view
  if (activeSection === 'username') {
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
          
          <UsernameSection
            userId={userId}
            currentSlug={profile.slug}
            onUpdate={fetchProfile}
          />
        </div>
      </div>
    );
  }

  if (activeSection === 'profile') {
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
          
          <Card>
            <CardHeader>
              <CardTitle>Perfil e Negócio</CardTitle>
              <CardDescription>
                Informações que aparecem nos seus catálogos e página pública
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileSection
                profile={profile}
                onChange={handleFieldChange}
              />
              <div className="flex gap-3 mt-6 pt-6 border-t">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
                <Button variant="outline" onClick={() => setActiveSection(null)}>
                  Voltar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (activeSection === 'theme') {
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
          
          <Card>
            <CardHeader>
              <CardTitle>Tema</CardTitle>
              <CardDescription>
                Personalize as cores, fontes e estilo da sua página
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PremiumThemeSettings
                profile={profile}
                onChange={(field, value) => {
                  setProfile((prev) => ({ ...prev, [field]: value }));
                  updateProfile({ [field]: value });
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (activeSection === 'builder') {
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
          
          <Card>
            <CardHeader>
              <CardTitle>Link in Bio</CardTitle>
              <CardDescription>
                Monte sua página pública e escolha o que aparece em{" "}
                <span className="font-mono text-foreground">
                  /u/{profile.slug || "seu-usuario"}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profile.slug && userId ? (
                <ProfileBuilder userSlug={profile.slug} userId={userId} />
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground mb-4">
                    Configure seu nome de usuário primeiro
                  </p>
                  <Button onClick={() => setActiveSection('username')}>
                    Escolher nome de usuário
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
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
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        {/* URL Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Nome de usuário</CardTitle>
            <CardDescription>
              Este é o seu link público que você pode compartilhar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
              <div className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-slate-100 dark:bg-slate-900 rounded-lg font-mono text-xs sm:text-sm break-all">
                cardapli.com.br/u/{profile.slug || 'seu-usuario'}
              </div>
              <Button variant="outline" onClick={() => setActiveSection('username')} className="sm:flex-shrink-0">
                Editar
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={viewProfile} className="flex-1" disabled={!profile.slug}>
                <Eye className="w-4 h-4 mr-2" />
                Ver página
              </Button>
              <Button variant="outline" onClick={copyLink} className="flex-1" disabled={!profile.slug}>
                <Copy className="w-4 h-4 mr-2" />
                Copiar link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Section Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveSection('profile')}>
            <CardHeader>
              {profile.logo_url ? (
                <div className="w-16 h-16 rounded-xl overflow-hidden mb-3 border-2 border-slate-200 dark:border-slate-800">
                  <img
                    src={profile.logo_url}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center mb-3">
                  <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              )}
              <CardTitle>Perfil</CardTitle>
              <CardDescription>
                Nome, logo, slogan, contato e redes sociais
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
