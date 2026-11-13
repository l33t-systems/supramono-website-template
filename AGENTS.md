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

## Supramono context for agents

Before doing anything content- or data-related here, load the Supramono
agent context: **https://supramono.com/supramono.md** (same document at
https://mcp.supramono.com/supramono.md, and as the `get_supramono_context`
tool / `supramono://context` resource on the hosted MCP server). It defines
the platform, its data model (products, campaigns, posts, assets, CRM,
client collaboration), the rules (drafts only, never publish, client-safe
copy) and how to work through the tools. Playbooks: the `help(topic)` tool.

Hosted MCP (no repo needed): `https://mcp.supramono.com/mcp` — Claude
(Settings → Connectors), ChatGPT (Connectors → Create), Claude Code
(`claude mcp add --transport http supramono https://mcp.supramono.com/mcp`).
The stdio `.mcp.json` route below still works for this repo's product token.

## APIs

### Public content API (used at build AND in the browser) — `/api/public/v1/`
Via `supramono` (`src/lib/supramono/publicClient.ts`):

- `GET site/manifest/` — all published pages + posts (drives `generateStaticParams` + sitemap),
  `nav` (the live navbar, see `src/lib/nav.ts`) and `footer` (`{tagline, copyright,
  links[{label, href, group}], legal[{label, href}], social[{network, label, url}], text[],
  login_url, show_powered_by, html}`, the live footer)
- `GET brand/` — name, tagline, colors, theme, logo (baked into `<html>` CSS vars in `app/layout.tsx`).
  `theme.css` is the stylesheet the platform's section `html` is styled with (`:root` tokens
  such as `--h2-size`, the `theme-*` classes); inline it once when you render fallback `html`.
  `theme.css_vars` has the same tokens as a dict, `theme.colors` the palette by role.
- `GET blog/posts/`, `GET blog/posts/<slug>/`, `GET blog/categories/`
- `GET pages/<slug>/` — the page as the platform renders it: only the visible
  sections, in live order, each `{type, position, visible, content, html}`,
  plus `seo` (`meta_title`, `meta_description`, `og_image`, `canonical`)
- `POST leads/` — contact form → CRM lead (honeypot field `website_url`). Takes `name`,
  `email`, `company_name`, `phone` and `message` (or the live form's `idea_description`).
  Form sections carry `content.fields` / `submit_label` / `secondary_cta` exactly as the
  live form renders them; build the form from those.

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
break. Fallback `html` is wrapped in `.cms-section`, and `app/layout.tsx`
inlines `brand.theme.css` scoped to it (`scopedThemeCss`), so it is styled as
on the live page without the platform's `:root` tokens touching this site.
Form sections build `LeadForm` from `content.fields` / `submit_label` /
`secondary_cta`; the footer renders `manifest.footer`. To take over a section
type natively, add a component and register it in `SECTIONS`. The nav menu is CMS-driven too: `src/lib/nav.ts` builds
it from `manifest.nav`, the live Supramono navbar (labels, order, dropdown
groups, Log in / Sign up), mapping nested live paths onto this site's
`/<slug>/` routes. Edit the menu in Supramono, not in code. `components/DynamicPage.tsx` is the page
loader used by `/[slug]`, the home CMS block, and the dynamic 404
fallback.

### Where page copy lives

A page that exists as a `landing_page` row (the home page, and every page
of a product on the v2 website) renders from that row, not from a `page`
row of the same slug. Its copy is layered: `brand_data.landing_page_copy`
(dotted keys such as `pricing.title`, `lead-capture.title`), then
`landing_page.page_overrides`, then `component_instance.overrides` for the
sections that have one. Read the result with
`call_action("landing_page", "resolved", <id>, method="GET")` — the same
payload `GET pages/<slug>/` serves — and edit the layer that sets the key.
A `page` row that shares a landing page's slug is an old mirror: edits
there never reach the site, and the manifest leaves it out.

### Images in sections

Every section's `content` carries `media` — each image/video the live page
shows, `{url, kind, alt, role: "background" | "inline"}` — and
`background_url` when it has a background. Items carry `image_url`
(`icon_url` / `logo_url` in some sections). The registry's `Backdrop`,
`itemImage()` and `backgroundUrl()` read them, so a native component shows
the same pictures as the platform page. To change an image, use the
Supramono MCP `place_section_image(product_id, section, slot, prompt |
asset_id | image_url)` — `slot` is `background` / `left` / `right` /
`center` for the section's own image, or `item` with `item_index` — then
rebuild.

### Authoring a new CMS page (the /features example)

A page with no `landing_page` row is authored as structured sections on a
Supramono `Page` row (`create_page`/`update_page` via MCP, or
`POST /api/v1/pages/`). Example — this exact shape renders natively through
the section registry:

```json
{
  "product": 177, "title": "Features", "slug": "features", "page_type": "landing",
  "sections": [
    {"type": "hero", "title": "Everything ships itself",
     "subtitle": "…", "cta": "Talk to us", "cta_link": "/contact/"},
    {"type": "feature_grid", "title": "What this page proves",
     "items": [{"title": "…", "description": "…"}]},
    {"type": "faq", "title": "How does it work?",
     "faqs": [{"question": "…", "answer": "…"}]},
    {"type": "lead_capture", "title": "Want this for your product?",
     "subtitle": "…"}
  ]
}
```

The page is instantly viewable at `/<slug>/` (dynamic fallback) and gets
pre-rendered on the next build. Section `type` values map to registry
components; unknown types fall back to platform HTML.

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
