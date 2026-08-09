# Supramono Custom Website — Agent Guide (AGENTS.md)

You are working on a customer-owned website for a product hosted on
**Supramono** (an agentic venture engine). Supramono is this site's
headless CMS and CRM: blog posts, pages, brand identity, social content
and leads all live there and are reachable through APIs described below.

## Project shape

- Vite + React 18 + TypeScript + **Tailwind CSS**. SPA with react-router;
  the CDN rewrites extensionless paths to `index.html`, so deep links work.
- `npm run dev` to develop, `npm run build` to build (`dist/`). Every push
  to the configured branch triggers a Supramono build+deploy automatically.
- `src/lib/supramono/` is the vendored SDK — read it before writing any
  API call by hand. Extend it in place; the customer owns this code.

## The two credentials (iron rule)

| Credential | Env var | Where it may appear |
|---|---|---|
| Public site key (`pk_…`) | `VITE_SUPRAMONO_PUBLIC_KEY` | Anywhere, including browser bundles. Identifies the product; read-only published content + rate-limited lead intake. |
| Product-scoped API token | `SUPRAMONO_API_TOKEN` (NO `VITE_` prefix) | `.env` (gitignored), build scripts, `.mcp.json`, server contexts ONLY. Read/write access to the product's data. |

**Never** put the API token in browser-reachable code, never commit it,
never rename it with a `VITE_` prefix. `src/lib/supramono/adminClient.ts`
throws if imported in the browser — do not remove that guard.

## APIs

### Public content API (browser-safe) — `/api/public/v1/`
Used by `createPublicClient` (`src/lib/supramono/publicClient.ts`):

- `GET site/manifest/` — all published pages + posts (used for sitemap)
- `GET brand/` — name, tagline, colors, theme, logo (drives Tailwind brand vars)
- `GET blog/posts/`, `GET blog/posts/<slug>/`, `GET blog/categories/`
- `GET pages/<slug>/` — landing/CMS page content (structured sections + HTML)
- `POST leads/` — contact form → CRM lead (honeypot field `website_url`)

All requests carry `?site_key=<pk_…>`.

### Full API (token; build/server/agent only) — `/api/v1/`
DRF-style REST, `Authorization: Bearer <token>`. The token is scoped to
this product — you see and write only this product's data. Key endpoints:
`blog-posts`, `blog-categories`, `pages`, `landing-pages`, `leads`,
`campaigns`, `campaign-posts`, `products/<id>/brand-context/`, plus the
full platform surface (strategy, personas, pricing tiers, email,
social accounts…). Standard CRUD verbs, `?product=<id>` filters,
paginated `{count, next, previous, results}` responses.

### MCP (recommended for you)
Copy `.mcp.json.example` → `.mcp.json`, insert the API token. You then get
typed tools (`list_blog_posts`, `create_blog_post`, `update_landing_page`,
`list_leads`, `generate_asset`, …) for the entire platform — use them to
read real content while building UI, or to create content the site needs.

## Conventions

- Brand colors are CSS variables (`--brand-primary`, `--brand-bg`,
  `--brand-text`) set at runtime by `useBrand()`; use the `brand-*`
  Tailwind utilities instead of hardcoding colors.
- CMS HTML renders inside `.prose-cms` (styles in `src/index.css`).
- Keep `/blog` and page routes SDK-driven so marketing edits flow through
  without code changes; hardcode only what's truly bespoke.
- `scripts/generate-sitemap.mjs` runs in `npm run build` — new route types
  should be added there too.
- Paths `/api/*`, `/lead-capture*`, `/login*`, `/signup*`, `/logout*` are
  reserved (they route to the Supramono platform on the live domain).
  Do not create site routes under them.
