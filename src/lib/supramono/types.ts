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

export interface PageSection {
  type: string;
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
