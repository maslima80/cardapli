import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Check, Upload, Instagram, Facebook, Youtube, Globe } from "lucide-react";
import { debounce } from "@/lib/utils";
import { LogoUploader } from "@/components/profile/LogoUploader";
import { ProfileBuilder } from "@/components/profile/ProfileBuilder";

type Profile = {
  logo_url: string | null;
  business_name: string | null;
  slogan: string | null;
  about: string | null;
  whatsapp: string | null;
  phone: string | null;
  email_public: string | null;
  address: string | null;
  socials: any;
  theme_mode: string | null;
  accent_color: string | null;
  font_theme: string | null;
  cta_shape: string | null;
  locations: any;
  slug: string | null;
};

type Location = {
  name: string;
  address: string;
  hours: string;
  notes: string;
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
    address: null,
    socials: {},
    theme_mode: "light",
    accent_color: "#8B5CF6",
    font_theme: "clean",
    cta_shape: "rounded",
    locations: [],
    slug: null,
  });
  const [saving, setSaving] = useState(false);
  const [showLocations, setShowLocations] = useState(false);
  const [uploading, setUploading] = useState(false);
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
          address: data.address,
          socials: data.socials || {},
          theme_mode: data.theme_mode || "light",
          accent_color: data.accent_color || "#8B5CF6",
          font_theme: data.font_theme || "clean",
          cta_shape: data.cta_shape || "rounded",
          locations: data.locations || [],
          slug: data.slug,
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Erro ao carregar perfil",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
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

      toast({
        title: "Salvo ✓",
        duration: 1500,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erro ao salvar",
        variant: "destructive",
      });
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

  const handleLogoChange = (url: string) => {
    handleFieldChange("logo_url", url);
  };

  const addLocation = () => {
    if (profile.locations.length >= 3) {
      toast({
        title: "Limite atingido",
        description: "Você pode adicionar até 3 localizações.",
        variant: "destructive",
      });
      return;
    }

    const newLocations = [
      ...profile.locations,
      { name: "", address: "", hours: "", notes: "" },
    ];
    setProfile((prev) => ({ ...prev, locations: newLocations }));
    debouncedUpdate({ locations: newLocations });
  };

  const updateLocation = (index: number, field: keyof Location, value: string) => {
    const newLocations = [...profile.locations];
    newLocations[index] = { ...newLocations[index], [field]: value };
    setProfile((prev) => ({ ...prev, locations: newLocations }));
    debouncedUpdate({ locations: newLocations });
  };

  const removeLocation = (index: number) => {
    const newLocations = profile.locations.filter((_: any, i: number) => i !== index);
    setProfile((prev) => ({ ...prev, locations: newLocations }));
    updateProfile({ locations: newLocations });
  };

  const getFontClass = () => {
    switch (profile.font_theme) {
      case "elegant":
        return "font-serif";
      case "modern":
        return "font-sans tracking-wide";
      default:
        return "font-sans";
    }
  };

  const getButtonClass = () => {
    switch (profile.cta_shape) {
      case "square":
        return "rounded-none";
      case "capsule":
        return "rounded-full";
      default:
        return "rounded-2xl";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Painel
          </Button>
          {saving && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-green-500" />
              Salvando...
            </div>
          )}
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Perfil & Design ✨</h1>
          <p className="text-muted-foreground">
            Personalize a identidade da sua marca — tudo aqui é salvo automaticamente.
          </p>
        </div>

        <div className="space-y-12">
          {/* 1. Identidade */}
          <section className="space-y-6">
            <h2 className="text-xl font-semibold border-b border-border pb-2">
              Identidade
            </h2>

            {/* Logo */}
            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-4">
                {profile.logo_url && (
                  <img
                    src={profile.logo_url}
                    alt="Logo"
                    className="w-20 h-20 rounded-xl object-cover border border-border"
                  />
                )}
                <div className="flex-1">
                  <LogoUploader
                    currentLogo={profile.logo_url}
                    onLogoChange={handleLogoChange}
                  />
                </div>
              </div>
            </div>

            {/* Business Name */}
            <div className="space-y-2">
              <Label htmlFor="business_name">
                Nome da marca <span className="text-destructive">*</span>
              </Label>
              <Input
                id="business_name"
                placeholder="Ateliê da Maria"
                value={profile.business_name || ""}
                onChange={(e) => handleFieldChange("business_name", e.target.value)}
              />
            </div>

            {/* Slogan */}
            <div className="space-y-2">
              <Label htmlFor="slogan">Slogan (opcional)</Label>
              <Input
                id="slogan"
                placeholder="Feito com amor."
                value={profile.slogan || ""}
                onChange={(e) => handleFieldChange("slogan", e.target.value)}
                className="italic"
              />
            </div>

            {/* Sobre nós */}
            <div className="space-y-2">
              <Label htmlFor="about">Sobre nós</Label>
              <Textarea
                id="about"
                placeholder="Conte um pouco sobre o seu negócio."
                value={profile.about || ""}
                onChange={(e) => handleFieldChange("about", e.target.value)}
                maxLength={400}
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground text-right">
                {(profile.about || "").length}/400
              </p>
            </div>
          </section>

          {/* Link Público */}
          <section className="space-y-6">
            <h2 className="text-xl font-semibold border-b border-border pb-2">
              Link Público
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slug">Nome de usuário</Label>
                <div className="flex items-center gap-2">
                  <div className="bg-muted/50 rounded-lg p-3 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">cardapli.com/u/</span>
                      <span className="font-medium">{profile.slug || '—'}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/escolher-slug?from=profile')}
                  >
                    Editar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Este é o seu link público que você pode compartilhar com seus clientes.
                </p>
              </div>
            </div>
          </section>

          {/* Profile Builder */}
          {profile.slug && userId && (
            <section className="space-y-6">
              <ProfileBuilder 
                userSlug={profile.slug} 
                userId={userId}
              />
            </section>
          )}

          {/* 2. Contato */}
          <section className="space-y-6">
            <h2 className="text-xl font-semibold border-b border-border pb-2">
              Contato
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="whatsapp">
                  WhatsApp <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="whatsapp"
                  placeholder="(11) 91234-5678"
                  value={profile.whatsapp || ""}
                  onChange={(e) => handleFieldChange("whatsapp", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone (opcional)</Label>
                <Input
                  id="phone"
                  placeholder="(11) 4002-8922"
                  value={profile.phone || ""}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email_public">E-mail público (opcional)</Label>
                <Input
                  id="email_public"
                  type="email"
                  placeholder="contato@seudominio.com"
                  value={profile.email_public || ""}
                  onChange={(e) => handleFieldChange("email_public", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* 3. Redes Sociais */}
          <section className="space-y-6">
            <h2 className="text-xl font-semibold border-b border-border pb-2">
              Redes Sociais
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="instagram" className="flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  Instagram
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">@</span>
                  <Input
                    id="instagram"
                    placeholder="seuperfil"
                    value={profile.socials?.instagram || ""}
                    onChange={(e) => handleSocialChange("instagram", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook" className="flex items-center gap-2">
                  <Facebook className="w-4 h-4" />
                  Facebook
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">/</span>
                  <Input
                    id="facebook"
                    placeholder="seuperfil"
                    value={profile.socials?.facebook || ""}
                    onChange={(e) => handleSocialChange("facebook", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tiktok" className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                  TikTok
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">@</span>
                  <Input
                    id="tiktok"
                    placeholder="seuperfil"
                    value={profile.socials?.tiktok || ""}
                    onChange={(e) => handleSocialChange("tiktok", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube" className="flex items-center gap-2">
                  <Youtube className="w-4 h-4" />
                  YouTube
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">@</span>
                  <Input
                    id="youtube"
                    placeholder="seucanal"
                    value={profile.socials?.youtube || ""}
                    onChange={(e) => handleSocialChange("youtube", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Site (opcional)
                </Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://seusite.com"
                  value={profile.socials?.website || ""}
                  onChange={(e) => handleSocialChange("website", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* 4. Localizações */}
          <section className="space-y-6">
            <h2 className="text-xl font-semibold border-b border-border pb-2">
              Localizações (opcional)
            </h2>

            {profile.locations.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <p className="text-muted-foreground">Sem endereços no momento.</p>
                <p className="text-sm text-muted-foreground/70">
                  Adicione um endereço se atender presencialmente.
                </p>
                <Button variant="outline" onClick={addLocation} className="mt-4">
                  + Adicionar localização
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {profile.locations.map((location: Location, index: number) => (
                  <div
                    key={index}
                    className="p-4 border border-border rounded-xl space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Localização {index + 1}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLocation(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        Excluir
                      </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Nome do local</Label>
                        <Input
                          placeholder="Loja Central"
                          value={location.name}
                          onChange={(e) =>
                            updateLocation(index, "name", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Endereço completo</Label>
                        <Input
                          placeholder="Rua das Flores, 123 – São Paulo"
                          value={location.address}
                          onChange={(e) =>
                            updateLocation(index, "address", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Horário de funcionamento</Label>
                        <Input
                          placeholder="Seg–Sex 10h–19h; Sáb 10h–13h"
                          value={location.hours}
                          onChange={(e) =>
                            updateLocation(index, "hours", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Observação (opcional)</Label>
                        <Input
                          placeholder="Entrada pela lateral"
                          value={location.notes}
                          onChange={(e) =>
                            updateLocation(index, "notes", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {profile.locations.length < 3 && (
                  <Button variant="outline" onClick={addLocation} className="w-full">
                    + Adicionar localização
                  </Button>
                )}
              </div>
            )}
          </section>

          {/* 5. Aparência */}
          <section className="space-y-6">
            <h2 className="text-xl font-semibold border-b border-border pb-2">
              Aparência
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Tema */}
              <div className="space-y-2">
                <Label>Tema</Label>
                <div className="flex gap-2">
                  <Button
                    variant={profile.theme_mode === "light" ? "default" : "outline"}
                    onClick={() => handleFieldChange("theme_mode", "light")}
                    className="flex-1"
                  >
                    Claro
                  </Button>
                  <Button
                    variant={profile.theme_mode === "dark" ? "default" : "outline"}
                    onClick={() => handleFieldChange("theme_mode", "dark")}
                    className="flex-1"
                  >
                    Escuro
                  </Button>
                </div>
              </div>

              {/* Cor principal */}
              <div className="space-y-2">
                <Label htmlFor="accent_color">Cor principal</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="accent_color"
                    value={profile.accent_color || "#8B5CF6"}
                    onChange={(e) => handleFieldChange("accent_color", e.target.value)}
                    className="w-12 h-12 rounded-xl border border-border cursor-pointer"
                  />
                  <Input
                    value={profile.accent_color || "#8B5CF6"}
                    onChange={(e) => handleFieldChange("accent_color", e.target.value)}
                    placeholder="#8B5CF6"
                  />
                </div>
              </div>

              {/* Fonte */}
              <div className="space-y-2">
                <Label htmlFor="font_theme">Fonte</Label>
                <select
                  id="font_theme"
                  value={profile.font_theme || "clean"}
                  onChange={(e) => handleFieldChange("font_theme", e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-border bg-background"
                >
                  <option value="clean">Clean (Inter)</option>
                  <option value="elegant">Elegante (Playfair + Inter)</option>
                  <option value="modern">Moderna (Poppins + Nunito)</option>
                </select>
              </div>

              {/* Forma dos botões */}
              <div className="space-y-2">
                <Label>Forma dos botões</Label>
                <div className="flex gap-2">
                  <Button
                    variant={profile.cta_shape === "rounded" ? "default" : "outline"}
                    onClick={() => handleFieldChange("cta_shape", "rounded")}
                    className="flex-1 rounded-2xl"
                  >
                    Rounded
                  </Button>
                  <Button
                    variant={profile.cta_shape === "square" ? "default" : "outline"}
                    onClick={() => handleFieldChange("cta_shape", "square")}
                    className="flex-1 rounded-none"
                  >
                    Square
                  </Button>
                  <Button
                    variant={profile.cta_shape === "capsule" ? "default" : "outline"}
                    onClick={() => handleFieldChange("cta_shape", "capsule")}
                    className="flex-1 rounded-full"
                  >
                    Capsule
                  </Button>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div
              className={`mt-6 p-8 rounded-2xl border border-border ${
                profile.theme_mode === "dark" ? "bg-gray-900 text-white" : "bg-white"
              } ${getFontClass()}`}
            >
              <div className="text-center space-y-4">
                {profile.logo_url && (
                  <img
                    src={profile.logo_url}
                    alt="Logo preview"
                    className="w-16 h-16 mx-auto rounded-xl object-cover"
                  />
                )}
                <h3 className="text-2xl font-bold">
                  {profile.business_name || "Nome da sua marca"}
                </h3>
                {profile.slogan && (
                  <p className="text-sm italic opacity-70">{profile.slogan}</p>
                )}
                <button
                  className={`px-6 py-3 text-white font-medium transition-all ${getButtonClass()}`}
                  style={{ backgroundColor: profile.accent_color || "#8B5CF6" }}
                >
                  Ver Catálogo
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
