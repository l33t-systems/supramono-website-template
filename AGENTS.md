# Supramono Custom Website — Agent Guide (AGENTS.md)

You are working on a customer-owned website for a product hosted on
**Supramono** (an agentic venture engine). Supramono is this site's
headless CMS and CRM: blog posts, pages, brand identity, social content
and leads all live there and are reachable through APIs described below.

## Project shape

- **Next.js (app router) in static-export mode** (`output: 'export'`,
  `trailingSlash: true`) + TypeScript + **Tailwind CSS**. Every route is
  pre-rendered to HTML at **build time** — there is NO server runtime.
  The CDN maps extensionless paths to `<path>/index.html`.
- Content is fetched **during the build** in server components
  (`generateStaticParams` + async pages, helpers in
  `src/lib/supramono/content.ts` — all fail-soft so the template builds
  before the product is wired). Publishing content in Supramono triggers
  an automatic rebuild, so pages stay fresh without a server.
- `npm run dev` to develop, `npm run build` → `out/`. Every push to the
  configured branch triggers a Supramono build+deploy automatically.
- `src/lib/supramono/` is the vendored SDK — read it before writing any
  API call by hand. Extend it in place; the customer owns this code.
- Because there is no runtime server: no API routes, no middleware, no
  ISR/revalidate, no server actions, no `cookies()`/`headers()`. Dynamic
  behavior belongs in client components (like `components/LeadForm.tsx`)
  calling the public content API.

## The two credentials (iron rule)

| Credential | Env var | Where it may appear |
|---|---|---|
| Public site key (`pk_…`) | `NEXT_PUBLIC_SUPRAMONO_PUBLIC_KEY` (pipeline provides `SUPRAMONO_PUBLIC_KEY`; next.config.mjs bridges both) | Anywhere, including browser bundles. Identifies the product; read-only published content + rate-limited lead intake. |
| Product-scoped API token | `SUPRAMONO_API_TOKEN` (NO `NEXT_PUBLIC_` prefix) | `.env` (gitignored), build scripts, `.mcp.json`, server contexts ONLY. Read/write access to the product's data. |

**Never** put the API token in browser-reachable code, never commit it,
never rename it with a `NEXT_PUBLIC_` prefix. `src/lib/supramono/
adminClient.ts` throws if imported in the browser — keep that guard.

## APIs

### Public content API (used at build AND in the browser) — `/api/public/v1/`
Via `supramono` (`src/lib/supramono/publicClient.ts`):

- `GET site/manifest/` — all published pages + posts (drives `generateStaticParams` + sitemap)
- `GET brand/` — name, tagline, colors, theme, logo (baked into `<html>` CSS vars in `app/layout.tsx`)
- `GET blog/posts/`, `GET blog/posts/<slug>/`, `GET blog/categories/`
- `GET pages/<slug>/` — landing/CMS page content (structured sections + HTML)
- `POST leads/` — contact form → CRM lead (honeypot field `website_url`)

All requests carry `?site_key=<pk_…>`.

### Full API (token; build/agent only) — `/api/v1/`
DRF-style REST, `Authorization: Bearer <token>`. The token is scoped to
this product — you see and write only this product's data. Key endpoints:
`blog-posts`, `blog-categories`, `pages`, `landing-pages`, `leads`,
`campaigns`, `campaign-posts`, `products/<id>/brand-context/`, plus the
full platform surface (strategy, personas, pricing tiers, email, social
accounts…). Standard CRUD verbs, `?product=<id>` filters, paginated
`{count, next, previous, results}` responses.

### MCP (recommended for you)
Copy `.mcp.json.example` → `.mcp.json`, insert the API token. You then get
typed tools (`list_blog_posts`, `create_blog_post`, `update_landing_page`,
`list_leads`, `generate_asset`, …) for the entire platform — use them to
read real content while building UI, or to create content the site needs.

## Dynamic CMS pages (section registry)

CMS pages render through `components/sections/registry.tsx`: each section
`{type, content, html}` maps to a native React component (hero,
feature_grid, faq, cta_banner, lead_capture, logos, ...); unregistered
types fall back to the platform's server-rendered `html`, so pages never
break. To take over a section type natively, add a component and register
it in `SECTIONS`. The nav menu is CMS-driven too (`app/layout.tsx` builds
it from the site manifest). `components/DynamicPage.tsx` is the page
loader used by `/[slug]`, the home CMS block, and the dynamic 404
fallback.

## Conventions

- Brand colors are CSS variables (`--brand-primary`, `--brand-bg`,
  `--brand-text`) inlined at build by `app/layout.tsx`; use the `brand-*`
  Tailwind utilities instead of hardcoding colors.
- CMS HTML renders inside `.prose-cms` (styles in `app/globals.css`).
- New content-driven routes need three things: a `generateStaticParams`
  sourced from the manifest, `dynamicParams = false`, and an entry in
  `scripts/generate-sitemap.mjs` if the URL shape is new.
- Internal links keep the trailing slash (`/blog/`, `/blog/<slug>/`) to
  match `trailingSlash: true`.
- Keep `/blog` and CMS pages SDK-driven so marketing edits flow through
  without code changes; hardcode only what's truly bespoke.
- Paths `/api/*`, `/lead-capture*`, `/login*`, `/signup*`, `/logout*` are
  reserved (they route to the Supramono platform on the live domain).
  Do not create site routes under them.
