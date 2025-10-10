import { Instagram, Youtube, Facebook, Globe } from "lucide-react";

interface SocialsBlockProps {
  data: {
    sync_profile?: boolean;
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

const SocialIcon = ({ platform, url }: { platform: string; url: string }) => {
  const icons: Record<string, any> = {
    instagram: Instagram,
    youtube: Youtube,
    facebook: Facebook,
    website: Globe,
  };

  const Icon = icons[platform];

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="w-12 h-12 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors flex items-center justify-center"
    >
      <Icon className="w-6 h-6 text-primary" />
    </a>
  );
};

export const SocialsBlock = ({ data, profile }: SocialsBlockProps) => {
  const socials = profile?.socials || {};
  const showInstagram = data.show_instagram !== false;
  const showYoutube = data.show_youtube !== false;
  const showFacebook = data.show_facebook !== false;
  const showWebsite = data.show_website !== false;

  const displayedSocials = [];
  if (showInstagram && socials.instagram) displayedSocials.push({ platform: "instagram", url: socials.instagram });
  if (showYoutube && socials.youtube) displayedSocials.push({ platform: "youtube", url: socials.youtube });
  if (showFacebook && socials.facebook) displayedSocials.push({ platform: "facebook", url: socials.facebook });
  if (showWebsite && socials.website) displayedSocials.push({ platform: "website", url: socials.website });

  if (displayedSocials.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Configure suas redes sociais no perfil
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex items-center justify-center gap-4">
        {displayedSocials.map(({ platform, url }) => (
          <SocialIcon key={platform} platform={platform} url={url} />
        ))}
      </div>
    </div>
  );
};
