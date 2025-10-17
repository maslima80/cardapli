import { ExternalLink, Link as LinkIcon, Mail, Phone, MapPin, ShoppingBag, Calendar, FileText, Video, Music } from "lucide-react";

// Icon mapping
const ICON_MAP: Record<string, any> = {
  "Link": LinkIcon,
  "Website": ExternalLink,
  "Email": Mail,
  "Telefone": Phone,
  "Local": MapPin,
  "Loja": ShoppingBag,
  "Evento": Calendar,
  "Documento": FileText,
  "Vídeo": Video,
  "Música": Music,
};

interface ExternalLinksBlockProps {
  data: {
    links?: Array<{
      url: string;
      title: string;
      description?: string;
      icon?: string;
      iconType?: "emoji" | "icon" | "image";
      thumbnail?: string;
    }>;
  };
}

export const ExternalLinksBlockPremium = ({ data }: ExternalLinksBlockProps) => {
  const links = data.links || [];

  if (links.length === 0) {
    return null; // Don't show empty block
  }

  const renderIcon = (link: any) => {
    // Image/thumbnail
    if (link.thumbnail) {
      return (
        <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={link.thumbnail}
            alt={link.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      );
    }

    // Emoji
    if (link.iconType === 'emoji' && link.icon) {
      return (
        <div 
          className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--accent-color, #8B5CF6)' }}
        >
          <span className="text-4xl sm:text-5xl">{link.icon}</span>
        </div>
      );
    }

    // Icon
    if (link.iconType === 'icon' && link.icon) {
      const IconComponent = ICON_MAP[link.icon] || LinkIcon;
      return (
        <div 
          className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--accent-color, #8B5CF6)' }}
        >
          <IconComponent className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
        </div>
      );
    }

    // Default
    return (
      <div 
        className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: 'var(--accent-color, #8B5CF6)' }}
      >
        <LinkIcon className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
      </div>
    );
  };

  return (
    <div className="py-12">
      <div className="container max-w-3xl mx-auto px-4">
        <div className="space-y-4">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="flex gap-4 p-4">
                {/* Icon/Image */}
                {renderIcon(link)}

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h3 
                    className="font-semibold text-lg mb-1 text-slate-900 dark:text-slate-50 line-clamp-2"
                    style={{ fontFamily: 'var(--font-heading, inherit)' }}
                  >
                    {link.title}
                  </h3>
                  {link.description && (
                    <p 
                      className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2"
                      style={{ fontFamily: 'var(--font-body, inherit)' }}
                    >
                      {link.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all"
                    style={{ color: 'var(--accent-color, #8B5CF6)' }}
                  >
                    <span>Visitar</span>
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
