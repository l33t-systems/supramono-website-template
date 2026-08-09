import { useEffect, useState } from "react";
import { supramono, BlogPostSummary, Paginated } from "../lib/supramono";

export function useBlogPosts(opts: { category?: string; page?: number } = {}) {
  const [data, setData] = useState<Paginated<BlogPostSummary> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    supramono
      .listBlogPosts(opts)
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(String(e.message || e)));
    return () => {
      alive = false;
    };
  }, [opts.category, opts.page]);

  return { data, error, loading: !data && !error };
}
