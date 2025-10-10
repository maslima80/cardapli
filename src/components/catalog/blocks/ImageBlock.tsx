interface ImageBlockProps {
  data: {
    image_url?: string;
    caption?: string;
    width?: "auto" | "full";
  };
}

export const ImageBlock = ({ data }: ImageBlockProps) => {
  if (!data.image_url) return null;

  const width = data.width || "auto";

  return (
    <div className="py-6">
      <div className={width === "full" ? "w-full" : "max-w-3xl mx-auto"}>
        <img
          src={data.image_url}
          alt={data.caption || ""}
          className="w-full h-auto rounded-xl"
          loading="lazy"
        />
        {data.caption && (
          <p className="text-sm text-muted-foreground text-center mt-3">
            {data.caption}
          </p>
        )}
      </div>
    </div>
  );
};
