import { Phone, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cloneElement, ReactElement } from "react";

interface ContactChannelConfig {
  enabled?: boolean;
  label?: string;
}

interface ContactBlockProps {
  data: {
    use_profile?: boolean;
    show_title?: boolean;
    title?: string;
    whatsapp?: ContactChannelConfig;
    email?: ContactChannelConfig;
    phone?: ContactChannelConfig;
  };
  profile?: {
    whatsapp?: string;
    email_public?: string;
    phone?: string;
  };
}

export const ContactBlock = ({ data, profile }: ContactBlockProps) => {
  // Default title handling
  const showTitle = data.show_title !== false;
  const title = data.title || "Entre em contato";

  // Get channel configurations with defaults
  const whatsappConfig = data.whatsapp || {};
  const emailConfig = data.email || {};
  const phoneConfig = data.phone || {};

  // Determine if channels are enabled
  const showWhatsapp = whatsappConfig.enabled !== false;
  const showEmail = emailConfig.enabled !== false;
  const showPhone = phoneConfig.enabled !== false;

  // Always use profile data
  const whatsappValue = profile?.whatsapp;
  const emailValue = profile?.email_public;
  const phoneValue = profile?.phone;

  // Check if we have any contact information to display
  const hasWhatsapp = showWhatsapp && !!whatsappValue;
  const hasEmail = showEmail && !!emailValue;
  const hasPhone = showPhone && !!phoneValue;

  // If no contact info, don't render the block
  if (!hasWhatsapp && !hasEmail && !hasPhone) {
    return null;
  }

  // Helper function to render contact button
  const renderContactButton = (
    icon: React.ReactNode,
    label: string,
    action: () => void,
    iconColor: string
  ) => {
    return (
      <Button
        variant="outline"
        size="icon"
        className="rounded-full w-14 h-14 transition-all duration-300 hover:shadow-lg active:scale-[0.95] group border-2"
        style={{ 
          backgroundColor: iconColor === "primary" ? "var(--primary-light)" : iconColor === "green-500" ? "#e6f7ed" : "#e6f1fc",
          borderColor: iconColor === "primary" ? "var(--primary-300)" : iconColor === "green-500" ? "#a3e0b5" : "#a3c8f0"
        }}
        onClick={action}
        title={label}
      >
        <div className={`text-${iconColor} group-hover:scale-125 transition-all duration-300 transform`}>
          {cloneElement(icon as ReactElement, { className: "w-6 h-6" })}
        </div>
      </Button>
    );
  };

  return (
    <div className="py-10 px-6 sm:px-8">
      {showTitle && <h2 className="text-2xl font-bold mb-8 text-center">{title}</h2>}
      
      {/* Show contact buttons - always icon-only */}
      <div className="flex justify-center gap-8 items-center bg-background/50 backdrop-blur-sm rounded-2xl py-8 px-6 shadow-sm border">
        {hasWhatsapp && (
          <div className="flex flex-col items-center">
            {renderContactButton(
              <MessageCircle className="w-5 h-5" />,
              whatsappConfig.label || "Falar no WhatsApp",
              () => {
                if (whatsappValue) {
                  // Clean up the number for WhatsApp
                  const cleanNumber = whatsappValue.replace(/\D/g, '');
                  window.open(`https://wa.me/${cleanNumber}?text=Olá!`, "_blank");
                }
              },
              "green-500"
            )}
            <div className="text-xs mt-3 font-medium">
              {whatsappConfig.label || "Falar no WhatsApp"}
            </div>
          </div>
        )}

        {hasEmail && (
          <div className="flex flex-col items-center">
            {renderContactButton(
              <Mail className="w-5 h-5" />,
              emailConfig.label || "Enviar email",
              () => {
                if (emailValue) {
                  window.open(`mailto:${emailValue}`, "_blank");
                }
              },
              "blue-500"
            )}
            <div className="text-xs mt-3 font-medium">
              {emailConfig.label || "Enviar email"}
            </div>
          </div>
        )}

        {hasPhone && (
          <div className="flex flex-col items-center">
            {renderContactButton(
              <Phone className="w-5 h-5" />,
              phoneConfig.label || "Ligar",
              () => {
                if (phoneValue) {
                  window.open(`tel:${phoneValue}`, "_blank");
                }
              },
              "primary"
            )}
            <div className="text-xs mt-3 font-medium">
              {phoneConfig.label || "Ligar"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};