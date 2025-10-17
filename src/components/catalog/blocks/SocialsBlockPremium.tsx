import { Instagram, Youtube, Facebook, Globe } from "lucide-react";
import { SectionHeader } from "../Section";
import { cn } from "@/lib/utils";

interface SocialsBlockProps {
  data: {
    title?: string;
    subtitle?: string;
    show_instagram?: boolean;
    show_youtube?: boolean;
    show_facebook?: boolean;
    show_website?: boolean;
    use_accent_color?: boolean; // New: use theme accent color instead of brand colors
  };
  profile?: {
    socials?: {
      instagram?: string;
      youtube?: string;
      facebook?: string;
      website?: string;
    };
    accent_color?: string;
  };
}

const socialColors = {
  instagram: {
    bg: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500",
    hover: "hover:scale-110",
  },
  youtube: {
    bg: "bg-red-600",
    hover: "hover:scale-110",
  },
  facebook: {
    bg: "bg-blue-600",
    hover: "hover:scale-110",
  },
  website: {
    bg: "bg-slate-700",
    hover: "hover:scale-110",
  },
};

const socialLabels = {
  instagram: "Instagram",
  youtube: "YouTube",
  facebook: "Facebook",
  website: "Website",
};

const SocialIcon = ({ 
  platform, 
  url, 
  useAccentColor = false 
}: { 
  platform: keyof typeof socialColors; 
  url: string;
  useAccentColor?: boolean;
}) => {
  const icons = {
    instagram: Instagram,
    youtube: Youtube,
    facebook: Facebook,
    website: Globe,
  };

  const Icon = icons[platform];
  const colors = socialColors[platform];
  const label = socialLabels[platform];

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col items-center gap-3"
      aria-label={`Visitar ${label}`}
    >
      {useAccentColor ? (
        // Premium accent color style
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
          style={{
            backgroundColor: 'var(--accent-color, #8B5CF6)',
          }}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>
      ) : (
        // Original brand colors
        <div
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 hover:shadow-lg",
            colors.bg,
            colors.hover
          )}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>
      )}
      <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
        {label}
      </span>
    </a>
  );
};

export function SocialsBlockPremium({ data, profile }: SocialsBlockProps) {
  const socials = profile?.socials || {};
  const showInstagram = data.show_instagram !== false;
  const showYoutube = data.show_youtube !== false;
  const showFacebook = data.show_facebook !== false;
  const showWebsite = data.show_website !== false;
  const useAccentColor = data.use_accent_color || false;

  const displayedSocials: Array<{ platform: keyof typeof socialColors; url: string }> = [];
  if (showInstagram && socials.instagram) displayedSocials.push({ platform: "instagram", url: socials.instagram });
  if (showYoutube && socials.youtube) displayedSocials.push({ platform: "youtube", url: socials.youtube });
  if (showFacebook && socials.facebook) displayedSocials.push({ platform: "facebook", url: socials.facebook });
  if (showWebsite && socials.website) displayedSocials.push({ platform: "website", url: socials.website });

  if (displayedSocials.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
      <SectionHeader 
        title={data.title || "Redes Sociais"}
        subtitle={data.subtitle}
      />
      
      <div className="flex items-center justify-center gap-10 sm:gap-12 mt-8">
        {displayedSocials.map(({ platform, url }) => (
          <SocialIcon 
            key={platform} 
            platform={platform} 
            url={url} 
            useAccentColor={useAccentColor}
          />
        ))}
      </div>
    </div>
  );
}
