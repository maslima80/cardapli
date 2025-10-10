import { Phone, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContactBlockProps {
  data: {
    sync_profile?: boolean;
    show_whatsapp?: boolean;
    show_email?: boolean;
    show_phone?: boolean;
    whatsapp_label?: string;
    email_label?: string;
    phone_label?: string;
  };
  profile?: {
    whatsapp?: string;
    email_public?: string;
    phone?: string;
  };
}

export const ContactBlock = ({ data, profile }: ContactBlockProps) => {
  const showWhatsapp = data.show_whatsapp !== false;
  const showEmail = data.show_email !== false;
  const showPhone = data.show_phone !== false;

  return (
    <div className="py-8 px-6 sm:px-8">
      <h2 className="text-2xl font-bold mb-6">Entre em contato</h2>
      <div className="flex flex-col gap-3 max-w-md">
        {showWhatsapp && profile?.whatsapp && (
          <Button
            variant="outline"
            size="lg"
            className="justify-start gap-3"
            onClick={() => window.open(`https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`, "_blank")}
          >
            <MessageCircle className="w-5 h-5" />
            {data.whatsapp_label || "Falar no WhatsApp"}
          </Button>
        )}
        {showEmail && profile?.email_public && (
          <Button
            variant="outline"
            size="lg"
            className="justify-start gap-3"
            onClick={() => window.open(`mailto:${profile.email_public}`, "_blank")}
          >
            <Mail className="w-5 h-5" />
            {data.email_label || "Enviar email"}
          </Button>
        )}
        {showPhone && profile?.phone && (
          <Button
            variant="outline"
            size="lg"
            className="justify-start gap-3"
            onClick={() => window.open(`tel:${profile.phone}`, "_blank")}
          >
            <Phone className="w-5 h-5" />
            {data.phone_label || "Ligar"}
          </Button>
        )}
      </div>
    </div>
  );
};
