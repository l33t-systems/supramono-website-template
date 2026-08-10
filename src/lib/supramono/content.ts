// Build-time content helpers for server components. Every function is
// fail-soft: a missing site key or unreachable API yields demo/fallback
// content instead of a broken build, so the template compiles and previews
// before the product is wired up. Once the public site key is set (the
// Supramono build pipeline always sets it), real content is baked into
// every page.
import { supramono } from "./index";
import {
  DEMO_MANIFEST,
  DEMO_PAGES,
  DEMO_POSTS,
  DEMO_POST_DETAILS,
  demoMode,
} from "./demo";
import type {
  Brand,
  BlogPostDetail,
  BlogPostSummary,
  PageContent,
  SiteManifest,
} from "./types";

const FALLBACK_BRAND: Brand = {
  product: {
    name: "Your Product",
    tagline: "Connect your Supramono product to bring this site to life.",
    description: "",
  },
  color_palette: [],
  theme: {},
  logo_url: "",
};

export async function getBrand(): Promise<Brand> {
  if (demoMode()) return FALLBACK_BRAND;
  try {
    return await supramono.getBrand();
  } catch {
    return FALLBACK_BRAND;
  }
}

export async function getManifest(): Promise<SiteManifest> {
  if (demoMode()) return DEMO_MANIFEST;
  try {
    return await supramono.getManifest();
  } catch {
    return DEMO_MANIFEST;
  }
}

export async function getAllPosts(): Promise<BlogPostSummary[]> {
  if (demoMode()) return DEMO_POSTS;
  try {
    const posts: BlogPostSummary[] = [];
    let page = 1;
    for (;;) {
      const batch = await supramono.listBlogPosts({ page });
      posts.push(...batch.results);
      if (page * batch.page_size >= batch.count) break;
      page += 1;
    }
    return posts.length ? posts : DEMO_POSTS;
  } catch {
    return DEMO_POSTS;
  }
}

export async function getPost(slug: string): Promise<BlogPostDetail | null> {
  if (demoMode()) return DEMO_POST_DETAILS[slug] ?? null;
  try {
    return await supramono.getBlogPost(slug);
  } catch {
    return DEMO_POST_DETAILS[slug] ?? null;
  }
}

export async function getPage(slug: string): Promise<PageContent | null> {
  if (demoMode()) return DEMO_PAGES[slug] ?? null;
  try {
    return await supramono.getPage(slug);
  } catch {
    return DEMO_PAGES[slug] ?? null;
  }
}

/** CSS custom properties for the brand — inlined on <html> at build. */
export function brandCssVars(brand: Brand): Record<string, string> {
  const vars: Record<string, string> = {};
  if (brand.theme.accent_color) vars["--brand-primary"] = brand.theme.accent_color;
  if (brand.theme.accent_bg) vars["--brand-bg"] = brand.theme.accent_bg;
  if (brand.theme.accent_text) vars["--brand-text"] = brand.theme.accent_text;
  return vars;
}
