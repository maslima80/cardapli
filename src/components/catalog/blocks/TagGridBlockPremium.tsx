import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SectionHeader } from "../Section";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Tag } from "lucide-react";

interface TagGridBlockProps {
  data: any;
  userId?: string;
  userSlug?: string;
  catalogSlug?: string;
}

export function TagGridBlockPremium({ data, userId, userSlug, catalogSlug }: TagGridBlockProps) {
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTags();
  }, [userId]);

  const loadTags = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      // Get all products to extract tags
      const { data: products, error } = await supabase
        .from("products")
        .select("quality_tags")
        .eq("user_id", userId)
        .not("quality_tags", "is", null);

      if (error) throw error;

      // Extract unique tags with counts
      const tagMap = new Map<string, { name: string; count: number }>();
      
      products?.forEach((product) => {
        if (Array.isArray(product.quality_tags)) {
          product.quality_tags.forEach((tag: string) => {
            const existing = tagMap.get(tag);
            if (existing) {
              existing.count++;
            } else {
              tagMap.set(tag, {
                name: tag,
                count: 1,
              });
            }
          });
        }
      });

      const tagsArray = Array.from(tagMap.values())
        .sort((a, b) => b.count - a.count); // Sort by count descending

      setTags(tagsArray);
    } catch (error) {
      console.error("Error loading tags:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTagUrl = (tagName: string) => {
    if (userSlug && catalogSlug) {
      return `/u/${userSlug}/${catalogSlug}?tag=${encodeURIComponent(tagName)}`;
    }
    return "#";
  };

  if (loading) {
    return (
      <div>
        <SectionHeader title={data?.title} subtitle={data?.subtitle} />
        <div className="flex flex-wrap gap-2">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div>
        <SectionHeader title={data?.title} subtitle={data?.subtitle} />
        <div className="text-center py-12 border-2 border-dashed rounded-2xl">
          <Tag className="mx-auto h-10 w-10 text-muted-foreground opacity-50 mb-3" />
          <p className="text-muted-foreground">Nenhuma tag encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title={data?.title} subtitle={data?.subtitle} />
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link
            key={tag.name}
            to={getTagUrl(tag.name)}
            className="group"
          >
            <Badge
              variant="secondary"
              className="rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm px-3 py-1 transition-colors cursor-pointer"
            >
              {tag.name}
              {data.show_count !== false && (
                <span className="ml-1.5 text-[11px] text-slate-500">
                  {tag.count}
                </span>
              )}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
