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
      className="group"
      aria-label={`Visitar ${label}`}
    >
      {useAccentColor ? (
        // Subtle accent color style (linktree/stan.store inspired)
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 hover:opacity-80"
          style={{
            backgroundColor: 'var(--accent-color, #8B5CF6)',
          }}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
      ) : (
        // Original brand colors
        <div
          className={cn(
            "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:opacity-80",
            colors.bg,
            colors.hover
          )}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
      )}
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
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6">
      {/* Only show header if title exists */}
      {data.title && (
        <SectionHeader 
          title={data.title}
          subtitle={data.subtitle}
        />
      )}
      
      <div className={cn(
        "flex items-center justify-center gap-4",
        data.title ? "mt-6" : ""
      )}>
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
