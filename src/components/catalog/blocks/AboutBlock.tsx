interface AboutBlockProps {
  data: {
    sync_profile?: boolean;
    heading?: string;
    content?: string;
  };
  profileAbout?: string;
}

export const AboutBlock = ({ data, profileAbout }: AboutBlockProps) => {
  const content = data.sync_profile !== false ? profileAbout : data.content;
  const heading = data.heading || "Sobre nós";

  return (
    <div className="py-8 px-6 sm:px-8">
      <h2 className="text-2xl font-bold mb-4">{heading}</h2>
      <div className="prose prose-lg max-w-none text-muted-foreground whitespace-pre-wrap">
        {content || "Configure seu texto 'Sobre' no perfil."}
      </div>
    </div>
  );
};
