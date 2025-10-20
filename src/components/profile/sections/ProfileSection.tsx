import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { LogoUploader } from "@/components/profile/LogoUploader";
import { Instagram, Facebook, Youtube, Globe, Phone, MessageCircle } from "lucide-react";

interface ProfileSectionProps {
  profile: any;
  onChange: (field: string, value: any) => void;
}

export const ProfileSection = ({ profile, onChange }: ProfileSectionProps) => {
  return (
    <div className="space-y-6">
      {/* Logo */}
      <div className="space-y-2">
        <Label>Logo</Label>
        <LogoUploader
          currentLogo={profile.logo_url}
          onLogoChange={(url) => onChange('logo_url', url)}
        />
      </div>

      {/* Business Name */}
      <div className="space-y-2">
        <Label htmlFor="business_name">
          Nome do negócio <span className="text-destructive">*</span>
        </Label>
        <Input
          id="business_name"
          value={profile.business_name || ""}
          onChange={(e) => onChange('business_name', e.target.value)}
          placeholder="Ex: Doces da Maria"
        />
      </div>

      {/* Slogan */}
      <div className="space-y-2">
        <Label htmlFor="slogan">Slogan</Label>
        <Input
          id="slogan"
          value={profile.slogan || ""}
          onChange={(e) => onChange('slogan', e.target.value)}
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
          onChange={(e) => onChange('about', e.target.value)}
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
            onChange={(e) => onChange('whatsapp', e.target.value)}
            placeholder="(11) 99999-9999"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            value={profile.phone || ""}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="(11) 3333-3333"
          />
        </div>
      </div>

      {/* Contact Preferences */}
      <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <MessageCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <Label className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              Como seus clientes podem entrar em contato?
            </Label>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Escolha as opções que aparecerão nas páginas dos seus produtos
            </p>
          </div>
        </div>
        
        <div className="space-y-3 ml-10">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="enable_whatsapp"
              checked={profile.enable_whatsapp !== false}
              onCheckedChange={(checked) => onChange('enable_whatsapp', checked)}
            />
            <label
              htmlFor="enable_whatsapp"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-green-600" />
              <span>WhatsApp - Conversar pelo app</span>
            </label>
          </div>
          
          <div className="flex items-center space-x-3">
            <Checkbox
              id="enable_phone"
              checked={profile.enable_phone === true}
              onCheckedChange={(checked) => onChange('enable_phone', checked)}
            />
            <label
              htmlFor="enable_phone"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-blue-600" />
              <span>Telefone - Ligar diretamente</span>
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email_public">E-mail público</Label>
        <Input
          id="email_public"
          type="email"
          value={profile.email_public || ""}
          onChange={(e) => onChange('email_public', e.target.value)}
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
              onChange={(e) => onChange('socials', { ...profile.socials, instagram: e.target.value })}
              placeholder="@seuusuario"
            />
          </div>
          <div className="flex items-center gap-2">
            <Facebook className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <Input
              value={profile.socials?.facebook || ""}
              onChange={(e) => onChange('socials', { ...profile.socials, facebook: e.target.value })}
              placeholder="facebook.com/seuperfil"
            />
          </div>
          <div className="flex items-center gap-2">
            <Youtube className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <Input
              value={profile.socials?.youtube || ""}
              onChange={(e) => onChange('socials', { ...profile.socials, youtube: e.target.value })}
              placeholder="youtube.com/@seucanal"
            />
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <Input
              value={profile.socials?.website || ""}
              onChange={(e) => onChange('socials', { ...profile.socials, website: e.target.value })}
              placeholder="https://seusite.com"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
