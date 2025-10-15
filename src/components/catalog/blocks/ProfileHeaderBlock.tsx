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
  };
}

export const ProfileHeaderBlock = ({ data, profile }: ProfileHeaderBlockProps) => {
  const {
    show_logo = true,
    show_name = true,
    show_slogan = true,
    alignment = "center",
  } = data;

  const alignmentClass = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  }[alignment];

  return (
    <div className={`flex flex-col gap-4 ${alignmentClass}`}>
      {show_logo && profile.logo_url && (
        <img
          src={profile.logo_url}
          alt={profile.business_name || "Logo"}
          className="w-24 h-24 rounded-full object-cover border-4 border-border"
        />
      )}
      {show_name && profile.business_name && (
        <h1 className="text-3xl font-bold">{profile.business_name}</h1>
      )}
      {show_slogan && profile.slogan && (
        <p className="text-lg text-muted-foreground">{profile.slogan}</p>
      )}
    </div>
  );
};
