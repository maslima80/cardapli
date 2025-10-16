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
  };
  profile?: {
    socials?: {
      instagram?: string;
      youtube?: string;
      facebook?: string;
      website?: string;
    };
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

const SocialIcon = ({ platform, url }: { platform: keyof typeof socialColors; url: string }) => {
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
      className="group flex flex-col items-center gap-2"
      aria-label={`Visitar ${label}`}
    >
      <div
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-200",
          colors.bg,
          colors.hover
        )}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
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

  const displayedSocials: Array<{ platform: keyof typeof socialColors; url: string }> = [];
  if (showInstagram && socials.instagram) displayedSocials.push({ platform: "instagram", url: socials.instagram });
  if (showYoutube && socials.youtube) displayedSocials.push({ platform: "youtube", url: socials.youtube });
  if (showFacebook && socials.facebook) displayedSocials.push({ platform: "facebook", url: socials.facebook });
  if (showWebsite && socials.website) displayedSocials.push({ platform: "website", url: socials.website });

  if (displayedSocials.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 sm:p-6">
      <SectionHeader 
        title={data.title || "Redes Sociais"}
        subtitle={data.subtitle}
      />
      
      <div className="flex items-center justify-center gap-8 mt-6">
        {displayedSocials.map(({ platform, url }) => (
          <SocialIcon key={platform} platform={platform} url={url} />
        ))}
      </div>
    </div>
  );
}
