// ============================================================================
// SERVER / BUILD-TIME ONLY. NEVER SHIPS TO THE BROWSER.
// ============================================================================
// Full product-scoped Supramono API client (/api/v1/) authenticated with a
// bearer token. The token can READ AND WRITE your product's data (blog,
// pages, leads, campaigns...). Bundling it into browser JS would hand that
// power to every visitor — the runtime guard below makes that a hard crash
// instead of a silent leak.
//
// Where the token lives: .env (SUPRAMONO_API_TOKEN, no VITE_ prefix),
// injected by the Supramono build pipeline or your shell. Create/revoke
// tokens in Product Settings -> Integrations -> API Tokens.
// ============================================================================
import { SupramonoError } from "./types";

if (typeof window !== "undefined") {
  throw new Error(
    "supramono adminClient imported in browser code. It is build/server-only — " +
    "use createPublicClient for anything that runs in the browser.",
  );
}

export interface AdminClientConfig {
  baseUrl: string;
  token: string;
}

interface ListParams {
  product?: number;
  page?: number;
  [key: string]: string | number | undefined;
}

export function createAdminClient({ baseUrl, token }: AdminClientConfig) {
  const base = `${baseUrl.replace(/\/$/, "")}/api/v1`;

  async function request<T>(
    method: string, path: string, body?: unknown, params?: ListParams,
  ): Promise<T> {
    const search = params
      ? "?" + new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)]),
        )
      : "";
    const resp = await fetch(`${base}/${path}${search}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!resp.ok) {
      let detail = resp.statusText;
      try {
        detail = JSON.stringify(await resp.json());
      } catch { /* ignore */ }
      throw new SupramonoError(resp.status, detail);
    }
    if (resp.status === 204) return undefined as T;
    return resp.json() as Promise<T>;
  }

  const crud = (resource: string) => ({
    list: (params?: ListParams) => request<any>("GET", `${resource}/`, undefined, params),
    get: (id: number) => request<any>("GET", `${resource}/${id}/`),
    create: (data: object) => request<any>("POST", `${resource}/`, data),
    update: (id: number, data: object) => request<any>("PATCH", `${resource}/${id}/`, data),
  });

  return {
    // Content (the headless-CMS surface)
    blogPosts: crud("blog-posts"),
    blogCategories: crud("blog-categories"),
    pages: crud("pages"),
    landingPages: crud("landing-pages"),
    // CRM
    leads: crud("leads"),
    // Social/campaigns (read what marketing published)
    campaignPosts: crud("campaign-posts"),
    campaigns: crud("campaigns"),
    // Brand
    getBrandContext: (productId: number) =>
      request<any>("GET", `products/${productId}/brand-context/`),
    // Escape hatch for any other /api/v1/ endpoint.
    raw: request,
  };
}

export type AdminClient = ReturnType<typeof createAdminClient>;
