interface ProfileHeaderBlockProps {
  data: {
    show_logo?: boolean;
    show_name?: boolean;
    show_slogan?: boolean;
    alignment?: "left" | "center" | "right";
  };
  profile: {
    logo_url?: string | null;
    business_name?: string | null;
    slogan?: string | null;
    font_theme?: string | null;
  };
}

export const ProfileHeaderBlock = ({ data, profile }: ProfileHeaderBlockProps) => {
  const {
    show_logo = true,
    show_name = true,
    show_slogan = true,
    alignment = "center",
  } = data;

  const alignmentClasses = {
    left: "items-start text-left",
    center: "items-center text-center",
    right: "items-end text-right",
  };

  return (
    <div className={`flex flex-col gap-6 py-12 ${alignmentClasses[alignment]}`}>
      {/* Logo - Premium presentation */}
      {show_logo && profile.logo_url && (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <img
            src={profile.logo_url}
            alt={profile.business_name || "Logo"}
            className="relative w-32 h-32 rounded-full object-cover shadow-xl ring-4 ring-white/10 dark:ring-slate-800/50"
          />
        </div>
      )}
      
      {/* Business Name - Uses heading font */}
      {show_name && profile.business_name && (
        <h1 
          className="text-4xl md:text-5xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-heading, inherit)' }}
        >
          {profile.business_name}
        </h1>
      )}
      
      {/* Slogan - Uses body font with proper hierarchy */}
      {show_slogan && profile.slogan && (
        <p 
          className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed"
          style={{ fontFamily: 'var(--font-body, inherit)' }}
        >
          {profile.slogan}
        </p>
      )}
    </div>
  );
};
