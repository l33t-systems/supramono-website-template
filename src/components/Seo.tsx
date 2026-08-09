import { useEffect } from "react";

/** Minimal SPA head manager — title + meta description per page. */
export default function Seo({ title, description }: { title?: string; description?: string }) {
  useEffect(() => {
    if (title) document.title = title;
    if (description !== undefined) {
      let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!tag) {
        tag = document.createElement("meta");
        tag.name = "description";
        document.head.appendChild(tag);
      }
      tag.content = description;
    }
  }, [title, description]);
  return null;
}
