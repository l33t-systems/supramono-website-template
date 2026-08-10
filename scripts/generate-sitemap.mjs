// Build-time sitemap + robots.txt generation from the Supramono public
// content API. Runs as part of `npm run build` (see package.json).
//
// Your custom site OWNS sitemap.xml and robots.txt on its domain — the
// Supramono platform stops serving them once the site is live.
const API_URL =
  process.env.SUPRAMONO_API_URL ||
  process.env.NEXT_PUBLIC_SUPRAMONO_API_URL ||
  "https://supramono.com";
const SITE_KEY =
  process.env.SUPRAMONO_PUBLIC_KEY || process.env.NEXT_PUBLIC_SUPRAMONO_PUBLIC_KEY;
const SITE_ORIGIN = process.env.SITE_ORIGIN || ""; // e.g. https://acme.supramono.com

import { mkdirSync, writeFileSync } from "node:fs";

async function main() {
  if (!SITE_KEY) {
    console.warn("generate-sitemap: no SUPRAMONO_PUBLIC_KEY — skipping");
    return;
  }
  const resp = await fetch(
    `${API_URL.replace(/\/$/, "")}/api/public/v1/site/manifest/?site_key=${SITE_KEY}`,
  );
  if (!resp.ok) {
    console.warn(`generate-sitemap: manifest fetch failed (${resp.status}) — skipping`);
    return;
  }
  const manifest = await resp.json();
  const origin =
    SITE_ORIGIN || `https://${manifest.product.slug}.supramono.com`;

  const urls = new Set(["/", "/blog", "/contact"]);
  for (const page of manifest.landing_pages) {
    if (!page.is_home) urls.add(`/${page.slug}`);
  }
  for (const page of manifest.pages) urls.add(`/${page.slug}`);
  for (const post of manifest.posts) urls.add(`/blog/${post.slug}`);

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    [...urls]
      .map((u) => `  <url><loc>${origin}${u}</loc></url>`)
      .join("\n") +
    `\n</urlset>\n`;

  mkdirSync("out", { recursive: true });
  writeFileSync("out/sitemap.xml", xml);
  writeFileSync(
    "out/robots.txt",
    `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`,
  );
  console.log(`generate-sitemap: ${urls.size} URLs -> out/sitemap.xml`);
}

main().catch((e) => {
  console.warn("generate-sitemap failed (non-fatal):", e.message);
});
