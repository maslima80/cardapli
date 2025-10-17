import { ExternalLink, Link as LinkIcon } from "lucide-react";

interface ExternalLinksBlockProps {
  data: {
    title?: string;
    subtitle?: string;
    links?: Array<{
      url: string;
      title: string;
      description?: string;
      icon?: string; // emoji or icon name
      thumbnail?: string; // image URL
    }>;
    layout?: "cards" | "compact";
  };
}

export const ExternalLinksBlockPremium = ({ data }: ExternalLinksBlockProps) => {
  const links = data.links || [];
  const title = data.title || "";
  const subtitle = data.subtitle || "";
  const layout = data.layout || "cards";

  if (links.length === 0) {
    return (
      <div className="py-12">
        <div className="container max-w-3xl mx-auto px-4">
          {title && (
            <div className="mb-8">
              <h2 
                className="text-3xl font-bold text-slate-900 dark:text-slate-50"
                style={{ fontFamily: 'var(--font-heading, inherit)' }}
              >
                {title}
              </h2>
              {subtitle && (
                <p 
                  className="text-slate-600 dark:text-slate-400 mt-2"
                  style={{ fontFamily: 'var(--font-body, inherit)' }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          )}
          <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <LinkIcon className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-600 mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Nenhum link adicionado</p>
          </div>
        </div>
      </div>
    );
  }

  if (layout === "compact") {
    // Compact mode - simple list with icons
    return (
      <div className="py-12">
        <div className="container max-w-2xl mx-auto px-4">
          {title && (
            <div className="mb-6">
              <h2 
                className="text-3xl font-bold text-slate-900 dark:text-slate-50"
                style={{ fontFamily: 'var(--font-heading, inherit)' }}
              >
                {title}
              </h2>
              {subtitle && (
                <p 
                  className="text-slate-600 dark:text-slate-400 mt-2"
                  style={{ fontFamily: 'var(--font-body, inherit)' }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          )}
          
          <div className="space-y-3">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-md transition-all"
              >
                {/* Icon or Emoji */}
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--accent-color, #8B5CF6)' }}
                >
                  {link.icon ? (
                    <span className="text-2xl">{link.icon}</span>
                  ) : (
                    <LinkIcon className="w-6 h-6 text-white" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 
                    className="font-semibold text-slate-900 dark:text-slate-50 line-clamp-1"
                    style={{ fontFamily: 'var(--font-heading, inherit)' }}
                  >
                    {link.title}
                  </h3>
                  {link.description && (
                    <p 
                      className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1"
                      style={{ fontFamily: 'var(--font-body, inherit)' }}
                    >
                      {link.description}
                    </p>
                  )}
                </div>

                {/* Arrow */}
                <ExternalLink 
                  className="w-5 h-5 flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--accent-color, #8B5CF6)' }}
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Cards mode - rich cards with thumbnails
  return (
    <div className="py-12">
      <div className="container max-w-3xl mx-auto px-4">
        {title && (
          <div className="mb-8">
            <h2 
              className="text-3xl font-bold text-slate-900 dark:text-slate-50"
              style={{ fontFamily: 'var(--font-heading, inherit)' }}
            >
              {title}
            </h2>
            {subtitle && (
              <p 
                className="text-slate-600 dark:text-slate-400 mt-2"
                style={{ fontFamily: 'var(--font-body, inherit)' }}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}
        
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
                {/* Thumbnail or Icon */}
                {link.thumbnail ? (
                  <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={link.thumbnail}
                      alt={link.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div 
                    className="w-24 h-24 flex-shrink-0 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'var(--accent-color, #8B5CF6)' }}
                  >
                    {link.icon ? (
                      <span className="text-4xl">{link.icon}</span>
                    ) : (
                      <LinkIcon className="w-10 h-10 text-white" />
                    )}
                  </div>
                )}

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
                      className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2"
                      style={{ fontFamily: 'var(--font-body, inherit)' }}
                    >
                      {link.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-sm font-medium group-hover:gap-3 transition-all"
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
