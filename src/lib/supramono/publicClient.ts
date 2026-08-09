// Browser-safe Supramono client over the public content API
// (/api/public/v1/). Authenticated only by the public site key, which
// identifies your product and can never write anything except lead
// submissions (rate-limited + honeypotted server-side).
import {
  Brand,
  BlogCategory,
  BlogPostDetail,
  BlogPostSummary,
  LeadSubmission,
  PageContent,
  Paginated,
  SiteManifest,
  SupramonoError,
} from "./types";

export interface PublicClientConfig {
  baseUrl: string;
  siteKey: string;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const resp = await fetch(url, init);
  if (!resp.ok) {
    let detail = resp.statusText;
    try {
      const body = await resp.json();
      detail = body.detail || body.error || detail;
    } catch {
      /* non-JSON error body */
    }
    throw new SupramonoError(resp.status, detail);
  }
  return resp.json() as Promise<T>;
}

export function createPublicClient({ baseUrl, siteKey }: PublicClientConfig) {
  const base = `${baseUrl.replace(/\/$/, "")}/api/public/v1`;
  // site_key rides as a query param on GETs so CDN caching works per-URL.
  const q = (path: string, params: Record<string, string | number | undefined> = {}) => {
    const search = new URLSearchParams({ site_key: siteKey });
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== "") search.set(k, String(v));
    }
    return `${base}/${path}?${search}`;
  };

  return {
    getManifest: () => request<SiteManifest>(q("site/manifest/")),
    getBrand: () => request<Brand>(q("brand/")),

    listBlogCategories: () =>
      request<{ results: BlogCategory[] }>(q("blog/categories/")),
    listBlogPosts: (opts: { category?: string; page?: number } = {}) =>
      request<Paginated<BlogPostSummary>>(q("blog/posts/", opts)),
    getBlogPost: (slug: string) =>
      request<BlogPostDetail>(q(`blog/posts/${encodeURIComponent(slug)}/`)),

    /** "home" (or empty) resolves the home landing page. */
    getPage: (slug = "home") =>
      request<PageContent>(q(`pages/${encodeURIComponent(slug)}/`)),

    submitLead: (data: LeadSubmission) =>
      request<{ ok: boolean; lead_id: number | null }>(`${base}/leads/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, site_key: siteKey }),
      }),
  };
}

export type PublicClient = ReturnType<typeof createPublicClient>;
