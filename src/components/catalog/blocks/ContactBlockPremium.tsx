import { Phone, Mail, MessageCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "../Section";

interface ContactBlockProps {
  data: {
    title?: string;
    subtitle?: string;
    message?: string;
    whatsapp?: {
      enabled?: boolean;
      label?: string;
    };
    email?: {
      enabled?: boolean;
      label?: string;
    };
    phone?: {
      enabled?: boolean;
      label?: string;
    };
  };
  profile?: {
    whatsapp?: string;
    email_public?: string;
    phone?: string;
    business_name?: string;
  };
  catalogTitle?: string;
}

export function ContactBlockPremium({ data, profile, catalogTitle }: ContactBlockProps) {
  const whatsappValue = profile?.whatsapp;
  const emailValue = profile?.email_public;
  const phoneValue = profile?.phone;

  const showWhatsapp = data.whatsapp?.enabled !== false && !!whatsappValue;
  const showEmail = data.email?.enabled !== false && !!emailValue;
  const showPhone = data.phone?.enabled !== false && !!phoneValue;

  if (!showWhatsapp && !showEmail && !showPhone) {
    return null;
  }

  const handleWhatsAppClick = () => {
    if (!whatsappValue) return;
    const cleanNumber = whatsappValue.replace(/\D/g, '');
    const message = catalogTitle 
      ? `Oi! Vim pelo seu catálogo: ${catalogTitle}`
      : "Oi! Vim pelo seu catálogo";
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleEmailClick = () => {
    if (!emailValue) return;
    const subject = catalogTitle ? `Contato via catálogo: ${catalogTitle}` : "Contato via catálogo";
    window.location.href = `mailto:${emailValue}?subject=${encodeURIComponent(subject)}`;
  };

  const handlePhoneClick = () => {
    if (!phoneValue) return;
    window.location.href = `tel:${phoneValue}`;
  };

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 sm:p-6">
      <SectionHeader 
        title={data.title || "Entre em contato"}
        subtitle={data.subtitle}
      />

      <div className="space-y-3">
        {/* Primary WhatsApp CTA */}
        {showWhatsapp && (
          <Button
            onClick={handleWhatsAppClick}
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center justify-center gap-2 transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            {data.whatsapp?.label || "Enviar mensagem no WhatsApp"}
          </Button>
        )}

        {/* Secondary actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {showEmail && (
            <Button
              onClick={handleEmailClick}
              variant="outline"
              className="h-11 rounded-xl font-medium flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              {data.email?.label || "E-mail"}
            </Button>
          )}

          {showPhone && (
            <Button
              onClick={handlePhoneClick}
              variant="secondary"
              className="h-11 rounded-xl font-medium flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              {data.phone?.label || "Telefone"}
            </Button>
          )}
        </div>
      </div>

      {/* Optional message at bottom */}
      {data.message && (
        <p className="text-sm text-center text-muted-foreground mt-4">
          {data.message}
        </p>
      )}

    </div>
  );
}
