// Typed models for the Supramono content API.

export interface BlogPostSummary {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string | null;
  featured_image_url: string;
  published_at: string | null;
}

export interface BlogPostDetail extends BlogPostSummary {
  content: string;
  html: string;
  format: "html" | "markdown";
  seo: { meta_title: string; meta_description: string };
  media: string[];
}

export interface BlogCategory {
  slug: string;
  name: string;
  description: string;
}

/** An image or video a section shows, as the live page renders it. Every
 *  section's `content.media` lists them; `content.background_url` is the
 *  section's background, when it has one. */
export interface SectionMedia {
  url: string;
  kind: "image" | "video";
  alt: string;
  role: "background" | "inline";
}

export interface PageSection {
  type: string;
  /** Structured copy. Besides the section's own fields it carries
   *  `media: SectionMedia[]` and `background_url` when the section shows
   *  images; items carry `image_url` (or `icon_url` / `logo_url`). */
  content?: unknown;
  html: string;
}

export interface PageContent {
  kind: "landing" | "page";
  id: number;
  slug: string;
  title: string;
  sections: PageSection[];
  html: string;
  media: string[];
  is_home?: boolean;
  seo?: { meta_title: string; meta_description: string };
}

export interface Brand {
  product: { name: string; tagline: string; description: string };
  color_palette: Array<{ name?: string; hex?: string } | string>;
  theme: {
    brand_name?: string;
    accent_color?: string;
    accent_bg?: string;
    accent_text?: string;
    /** Palette colours by role (primary, accent, ...). */
    colors?: Record<string, string>;
    /** The :root tokens the platform's section html reads (--h2-size ...). */
    css_vars?: Record<string, string>;
    /** The platform's theme stylesheet, to inline where fallback html renders. */
    css?: string;
  };
  logo_url: string;
}

export interface SiteManifest {
  product: { name: string; slug: string };
  landing_pages: Array<{
    kind: "landing"; id: number; slug: string; path: string;
    title: string; is_home: boolean;
  }>;
  pages: Array<{ kind: "page"; id: number; slug: string; title: string; page_type: string }>;
  posts: BlogPostSummary[];
  /** The live site's navbar (Supramono #852). Absent on older API versions. */
  nav?: SiteNav;
  /** The live site footer (Supramono #860). */
  footer?: SiteFooter;
}

export interface SiteFooter {
  tagline: string;
  copyright: string;
  links: Array<{ label: string; href: string; group: string }>;
  legal: Array<{ label: string; href: string }>;
  social: Array<{ network: string; label: string; url: string }>;
  text: string[];
  login_url: string;
  show_powered_by: boolean;
  html: string;
}

export interface SiteNavItem {
  label: string;
  /** null for a group that is only a dropdown. */
  href: string | null;
  children?: Array<{ label: string; href: string }>;
}

export interface SiteNav {
  items: SiteNavItem[];
  buttons: Array<{ kind: string; label: string; href: string }>;
}

export interface LeadSubmission {
  email: string;
  name?: string;
  message?: string;
  phone?: string;
  company_name?: string;
  /** "newsletter" creates a subscriber only (no CRM lead). */
  intent?: "newsletter";
}

export interface Paginated<T> {
  count: number;
  page: number;
  page_size: number;
  results: T[];
}

export class SupramonoError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "SupramonoError";
  }
}
