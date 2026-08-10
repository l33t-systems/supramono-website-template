# Supramono Website Template

Your product's website — **your code, your repo**, built and hosted by
Supramono. **Next.js** (static export) + TypeScript + Tailwind CSS, with
the Supramono SDK wired in so the site pre-renders your product's content
(blog, pages, brand) at build time and captures leads into your CRM.

## How it works

1. **You own this repo.** Edit anything — it's a normal Next.js app in
   static-export mode (`output: 'export'` — no server runtime needed).
2. **Push to `main`** (or your configured branch) → Supramono builds it
   (`npm ci && npm run build`) and deploys `out/` to the CDN.
   **Publishing content in Supramono also triggers a rebuild**, so blog
   posts go live minutes after you hit Publish.
3. **Preview** at `https://preview--<your-slug>.supramono.com` any time.
4. Flip **"Serve custom website"** in Product Settings → Website to replace
   the default Supramono landing page with this site.

## Setup

```bash
cp .env.example .env      # fill in your API URL + public site key
npm install
npm run dev               # local dev at http://localhost:3000
```

Get your **public site key** and a **product-scoped API token** from
Product Settings → Integrations in Supramono.

## Content: Supramono as your headless CMS

- `src/lib/supramono/` — the SDK. Content is fetched at **build time** in
  server components, so every page ships as real HTML (great SEO).
- Blog (`/blog`), CMS pages (`/<slug>`) and the contact form are already
  wired. Marketing edits content in Supramono; your site rebuilds and
  re-renders it automatically.
- `npm run build` also generates `sitemap.xml` + `robots.txt` from your
  published content.

## For AI coding agents

See `CLAUDE.md` / `AGENTS.md`. Copy `.mcp.json.example` to `.mcp.json` and
add your API token to give agents full Supramono access (blog, articles,
social posts, CRM, product data) while they build your site.

## The one iron rule

`NEXT_PUBLIC_`-prefixed env vars are **inlined into public JS**. The
public site key is designed for that. The API token
(`SUPRAMONO_API_TOKEN`) is **not** — it stays in `.env` (gitignored),
used only at build time or by agents. Never give it a `NEXT_PUBLIC_`
prefix, never commit it.

## No server runtime

This template deliberately avoids SSR features (API routes, middleware,
ISR, server actions) — the site is pure static files on a CDN. Dynamic
behavior lives in client components calling the public content API (see
`components/LeadForm.tsx`). If you outgrow static, you can host full
Next.js SSR anywhere (e.g. Vercel) against the same Supramono APIs.

## Paths that stay with the platform

`/api/*`, `/lead-capture*`, `/login*`, `/signup*`, `/logout*` keep routing
to Supramono on your domain (auth, lead funnels, API). Everything else —
including `/blog` and all content pages — is yours.
