import { useEffect } from "react";

interface MetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const useMetaTags = ({
  title,
  description,
  image,
  url,
  type = "website",
}: MetaTagsProps) => {
  useEffect(() => {
    // Set document title
    if (title) {
      document.title = title;
    }

    // Helper function to set or update meta tag
    const setMetaTag = (property: string, content: string) => {
      if (!content) return;

      let element = document.querySelector(`meta[property="${property}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute("property", property);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Helper function to set or update meta tag with name attribute
    const setMetaTagByName = (name: string, content: string) => {
      if (!content) return;

      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute("name", name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Set canonical link
    const setCanonicalLink = (href: string) => {
      if (!href) return;

      let element = document.querySelector('link[rel="canonical"]');
      if (!element) {
        element = document.createElement("link");
        element.setAttribute("rel", "canonical");
        document.head.appendChild(element);
      }
      element.setAttribute("href", href);
    };

    // Set Open Graph tags
    if (title) {
      setMetaTag("og:title", title);
      setMetaTagByName("twitter:title", title);
    }

    if (description) {
      setMetaTag("og:description", description);
      setMetaTagByName("description", description);
      setMetaTagByName("twitter:description", description);
    }

    if (image) {
      setMetaTag("og:image", image);
      setMetaTagByName("twitter:image", image);
      setMetaTagByName("twitter:card", "summary_large_image");
    }

    if (url) {
      setMetaTag("og:url", url);
      setCanonicalLink(url);
    }

    if (type) {
      setMetaTag("og:type", type);
    }

    // Set Twitter card type
    setMetaTagByName("twitter:card", image ? "summary_large_image" : "summary");

    // Cleanup function (optional - removes tags on unmount)
    return () => {
      // We don't remove tags on unmount as they should persist for the page
    };
  }, [title, description, image, url, type]);
};
