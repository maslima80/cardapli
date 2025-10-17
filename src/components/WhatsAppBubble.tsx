import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhatsAppBubbleProps {
  phoneNumber: string | number;
  message?: string;
  position?: "bottom-right" | "bottom-left";
}

export const WhatsAppBubble = ({ 
  phoneNumber, 
  message = "Olá! Gostaria de mais informações.",
  position = "bottom-right" 
}: WhatsAppBubbleProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show bubble after a short delay for smooth entrance
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!phoneNumber) return null;

  // Format phone number (remove non-digits) - handle both string and number
  const cleanPhone = String(phoneNumber).replace(/\D/g, '');
  
  // Create WhatsApp URL
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  const handleClick = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* Bubble Button */}
      <div
        className={cn(
          "fixed z-50 transition-all duration-500",
          position === "bottom-right" ? "bottom-6 right-6" : "bottom-6 left-6",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
        )}
      >
        {/* Tooltip */}
        {isOpen && (
          <div
            className={cn(
              "absolute bottom-20 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-4 w-64 animate-in fade-in slide-in-from-bottom-4 duration-300",
              position === "bottom-right" ? "right-0" : "left-0"
            )}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900 dark:text-slate-50 mb-1">
                  WhatsApp
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Clique para conversar
                </p>
              </div>
            </div>
            
            <button
              onClick={handleClick}
              className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Iniciar Conversa
            </button>
          </div>
        )}

        {/* Main Bubble */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group"
          aria-label="WhatsApp"
        >
          {/* Pulse animation */}
          <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-20" />
          
          {/* Main button */}
          <div className="relative w-16 h-16 bg-[#25D366] hover:bg-[#20BA5A] rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>

          {/* Notification badge (optional) */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">1</span>
          </div>
        </button>
      </div>

      {/* Backdrop when tooltip is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
