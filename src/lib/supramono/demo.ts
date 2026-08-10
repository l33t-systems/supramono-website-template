// Demo content used ONLY when no public site key is configured — it makes
// the template build and preview nicely out of the box (and satisfies
// Next's static-export requirement that dynamic routes pre-render at
// least one path). The moment NEXT_PUBLIC_SUPRAMONO_PUBLIC_KEY (or the
// pipeline's SUPRAMONO_PUBLIC_KEY) is set, real content replaces all of
// this at build time.
import type { BlogPostSummary, BlogPostDetail, PageContent, SiteManifest } from "./types";

export const DEMO_POSTS: BlogPostSummary[] = [
  {
    id: -1,
    slug: "welcome-to-your-site",
    title: "Welcome to your new site",
    excerpt:
      "This is demo content — connect your Supramono product and your real blog posts appear here on the next build.",
    category: null,
    featured_image_url: "",
    published_at: "2026-01-01T00:00:00Z",
  },
];

export const DEMO_POST_DETAILS: Record<string, BlogPostDetail> = {
  "welcome-to-your-site": {
    ...DEMO_POSTS[0],
    content: "",
    html: [
      "<p>This post is <strong>demo content</strong> baked into the template.</p>",
      "<p>Set <code>NEXT_PUBLIC_SUPRAMONO_PUBLIC_KEY</code> in your <code>.env</code> (or just push — the Supramono build pipeline provides it automatically) and your published Supramono blog posts will replace this on the next build.</p>",
      "<p>Publishing a post in Supramono triggers a rebuild, so content goes live in minutes — no server anywhere.</p>",
    ].join("\n"),
    format: "html",
    seo: {
      meta_title: "Welcome to your new site",
      meta_description: "Demo post from the Supramono website template.",
    },
    media: [],
  },
};

export const DEMO_PAGES: Record<string, PageContent> = {
  about: {
    kind: "page",
    id: -2,
    slug: "about",
    title: "About",
    sections: [],
    html: [
      "<h1>About</h1>",
      "<p>This is a <strong>demo CMS page</strong>. Pages you publish in Supramono are pre-rendered here at build time.</p>",
    ].join("\n"),
    media: [],
  },
};

export const DEMO_MANIFEST: SiteManifest = {
  product: { name: "Your Product", slug: "demo" },
  landing_pages: [],
  pages: [{ kind: "page", id: -2, slug: "about", title: "About", page_type: "page" }],
  posts: DEMO_POSTS,
};

export function demoMode(): boolean {
  return !process.env.NEXT_PUBLIC_SUPRAMONO_PUBLIC_KEY;
}
