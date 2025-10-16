import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PremiumThemeSettings } from "@/components/profile/PremiumThemeSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Eye, Copy, Instagram, Facebook, Youtube, Globe } from "lucide-react";
import { debounce } from "@/lib/utils";
import { LogoUploader } from "@/components/profile/LogoUploader";
import { ProfileBuilder } from "@/components/profile/ProfileBuilder";
import { publicProfileUrl } from "@/lib/urls";

type Profile = {
  logo_url: string | null;
  business_name: string | null;
  slogan: string | null;
  about: string | null;
  whatsapp: string | null;
  phone: string | null;
  email_public: string | null;
  socials: any;
  accent_color: string | null;
  background_color: string | null;
  theme_mode: string | null;
  font_theme: string | null;
  cta_shape: string | null;
  slug: string | null;
};

export default function Perfil() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>({
    logo_url: null,
    business_name: null,
    slogan: null,
    about: null,
    whatsapp: null,
    phone: null,
    email_public: null,
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

  const updateProfile = async (updates: Partial<Profile>) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Salvo ✓");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const debouncedUpdate = useCallback(
    debounce((updates: Partial<Profile>) => {
      updateProfile(updates);
    }, 500),
    []
  );

  const handleFieldChange = (field: keyof Profile, value: any) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    debouncedUpdate({ [field]: value });
  };

  const handleSocialChange = (platform: string, value: string) => {
    const newSocials = { ...profile.socials, [platform]: value };
    setProfile((prev) => ({ ...prev, socials: newSocials }));
    debouncedUpdate({ socials: newSocials });
  };

  const handleCopyLink = () => {
    if (!profile.slug) {
      toast.error("Configure seu nome de usuário primeiro");
      return;
    }
    const url = `${window.location.origin}${publicProfileUrl(profile.slug)}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  };

  const handleViewPage = () => {
    if (!profile.slug) {
      toast.error("Configure seu nome de usuário primeiro");
      return;
    }
    window.open(publicProfileUrl(profile.slug), "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Perfil</h1>
            <p className="text-muted-foreground">
              Configure seu negócio e página pública
            </p>
          </div>
        </div>

        {/* Section 1: Business Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Negócio</CardTitle>
            <CardDescription>
              Dados básicos que aparecem nos seus catálogos e página pública
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo */}
            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-4">
                {profile.logo_url && (
                  <div className="flex-shrink-0">
                    <img
                      src={profile.logo_url}
                      alt="Logo"
                      className="w-16 h-16 rounded-lg object-cover border border-border"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <LogoUploader
                    currentLogo={profile.logo_url}
                    onLogoChange={(url) => {
                      setProfile((prev) => ({ ...prev, logo_url: url }));
                      updateProfile({ logo_url: url });
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Business Name */}
            <div className="space-y-2">
              <Label htmlFor="business_name">
                Nome do negócio <span className="text-destructive">*</span>
              </Label>
              <Input
                id="business_name"
                value={profile.business_name || ""}
                onChange={(e) => handleFieldChange("business_name", e.target.value)}
                placeholder="Ex: Doces da Maria"
              />
            </div>

            {/* Slogan */}
            <div className="space-y-2">
              <Label htmlFor="slogan">Slogan</Label>
              <Input
                id="slogan"
                value={profile.slogan || ""}
                onChange={(e) => handleFieldChange("slogan", e.target.value)}
                placeholder="Ex: Doces artesanais feitos com amor"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground text-right">
                {(profile.slogan || "").length}/100
              </p>
            </div>

            {/* About */}
            <div className="space-y-2">
              <Label htmlFor="about">Sobre o negócio</Label>
              <Textarea
                id="about"
                value={profile.about || ""}
                onChange={(e) => handleFieldChange("about", e.target.value)}
                placeholder="Conte um pouco sobre o seu negócio..."
                maxLength={400}
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground text-right">
                {(profile.about || "").length}/400
              </p>
            </div>

            {/* Contact */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="whatsapp">
                  WhatsApp <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="whatsapp"
                  value={profile.whatsapp || ""}
                  onChange={(e) => handleFieldChange("whatsapp", e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={profile.phone || ""}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                  placeholder="(11) 3333-3333"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_public">E-mail público</Label>
              <Input
                id="email_public"
                type="email"
                value={profile.email_public || ""}
                onChange={(e) => handleFieldChange("email_public", e.target.value)}
                placeholder="contato@seunegocio.com"
              />
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <Label>Redes sociais</Label>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Instagram className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <Input
                    value={profile.socials?.instagram || ""}
                    onChange={(e) => handleSocialChange("instagram", e.target.value)}
                    placeholder="@seunegocio"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Facebook className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <Input
                    value={profile.socials?.facebook || ""}
                    onChange={(e) => handleSocialChange("facebook", e.target.value)}
                    placeholder="facebook.com/seunegocio"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Youtube className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <Input
                    value={profile.socials?.youtube || ""}
                    onChange={(e) => handleSocialChange("youtube", e.target.value)}
                    placeholder="youtube.com/@seunegocio"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <Input
                    value={profile.socials?.website || ""}
                    onChange={(e) => handleSocialChange("website", e.target.value)}
                    placeholder="https://seunegocio.com"
                  />
                </div>
              </div>
            </div>

            {/* Theme Settings - Premium */}
            <div className="pt-4 border-t">
              <Label className="text-base font-semibold mb-4 block">Tema</Label>
              <PremiumThemeSettings
                profile={profile}
                onChange={handleFieldChange}
              />
            </div>

            {/* Username */}
            <div className="space-y-2 pt-4 border-t">
              <Label>Nome de usuário</Label>
              <div className="flex items-center gap-2">
                <div className="bg-muted/50 rounded-lg p-3 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground text-sm">cardapli.com.br/u/</span>
                    <span className="font-medium">{profile.slug || "—"}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/escolher-slug?from=profile")}
                >
                  Editar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Este é o seu link público que você pode compartilhar com seus clientes.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <Button
                onClick={() => updateProfile(profile)}
                disabled={saving}
                className="gap-2"
              >
                {saving ? "Salvando..." : "Salvar"}
              </Button>
              <Button
                variant="outline"
                onClick={handleViewPage}
                className="gap-2"
                disabled={!profile.slug}
              >
                <Eye className="w-4 h-4" />
                Ver página
              </Button>
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="gap-2"
                disabled={!profile.slug}
              >
                <Copy className="w-4 h-4" />
                Copiar link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Public Page Builder */}
        <Card>
          <CardHeader>
            <CardTitle>Página Pública (Link na bio)</CardTitle>
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
                  Configure seu nome de usuário primeiro para montar sua página pública
                </p>
                <Button onClick={() => navigate("/escolher-slug?from=profile")}>
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
