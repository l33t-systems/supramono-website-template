# Supramono Website Template

Your product's website — **your code, your repo**, built and hosted by
Supramono. React 18 + TypeScript + Tailwind CSS + Vite, with the Supramono
SDK wired in so the site renders your product's content (blog, pages,
brand, lead capture) straight from the platform.

## How it works

1. **You own this repo.** Edit anything — it's a normal Vite app.
2. **Push to `main`** (or your configured branch) → Supramono builds it
   (`npm ci && npm run build`) and deploys `dist/` to the CDN.
3. **Preview** at `https://preview--<your-slug>.supramono.com` any time.
4. Flip **"Serve custom website"** in Product Settings → Website to replace
   the default Supramono landing page with this site.

## Setup

```bash
cp .env.example .env      # fill in your API URL + public site key
npm install
npm run dev               # local dev at http://localhost:5173
```

Get your **public site key** and a **product-scoped API token** from
Product Settings → Integrations in Supramono.

## Content: Supramono as your headless CMS

- `src/lib/supramono/` — the SDK. `supramono` (public client) is safe in
  browser code: blog posts, pages, brand, lead submission.
- Blog (`/blog`), CMS pages (`/:slug`) and the contact form are already
  wired. Marketing edits content in Supramono; your site renders it.
- `npm run build` also generates `sitemap.xml` + `robots.txt` from your
  published content.

## For AI coding agents

See `CLAUDE.md` / `AGENTS.md`. Copy `.mcp.json.example` to `.mcp.json` and
add your API token to give agents full Supramono access (blog, articles,
social posts, CRM, product data) while they build your site.

## The one iron rule

`VITE_`-prefixed env vars are **bundled into public JS**. The public site
key is designed for that. The API token (`SUPRAMONO_API_TOKEN`) is **not**
— it stays in `.env` (gitignored), used only at build time or by agents.
Never give it a `VITE_` prefix, never commit it.

## Paths that stay with the platform

`/api/*`, `/lead-capture*`, `/login*`, `/signup*`, `/logout*` keep routing
to Supramono on your domain (auth, lead funnels, API). Everything else —
including `/blog` and all content pages — is yours.
