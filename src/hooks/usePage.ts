import { useEffect, useState } from "react";
import { supramono, PageContent } from "../lib/supramono";

export function usePage(slug: string) {
  const [page, setPage] = useState<PageContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setPage(null);
    setError(null);
    supramono
      .getPage(slug)
      .then((p) => alive && setPage(p))
      .catch((e) => alive && setError(String(e.message || e)));
    return () => {
      alive = false;
    };
  }, [slug]);

  return { page, error, loading: !page && !error };
}
