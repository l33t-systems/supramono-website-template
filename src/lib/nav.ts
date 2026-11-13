// Site navigation, built at BUILD time from the Supramono site manifest.
// manifest.nav is the live Supramono site's navbar (labels, order, dropdown
// groups, Log in / Sign up), so the menu is edited in Supramono, not here.
// Without it (older API) the menu falls back to the first published pages.
import type { SiteManifest } from "@/src/lib/supramono";

export interface NavLink {
  label: string;
  href: string;
}

export interface NavItem extends NavLink {
  /** Dropdown entries; empty for a plain link. */
  children: NavLink[];
}

export interface Nav {
  items: NavItem[];
  /** Log in / Sign up etc.; the last one is the call-to-action button. */
  buttons: NavLink[];
}

/** Slugs this static site serves at /<slug>/. */
function siteSlugs(manifest: SiteManifest): Set<string> {
  return new Set([
    ...manifest.landing_pages.filter((p) => !p.is_home).map((p) => p.slug),
    ...manifest.pages.map((p) => p.slug),
    "blog",
    "contact",
  ]);
}

/**
 * Map a live-site href onto this site's routes: the live site nests pages
 * (/product-overview/asset-management/), this one serves every page at
 * /<slug>/. External links, anchors and unknown paths pass through.
 */
export function localHref(href: string, slugs: Set<string>): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("#")) return href;
  const [path, hash] = href.split("#");
  const parts = path.split("/").filter(Boolean);
  const last = parts[parts.length - 1];
  const local = !parts.length ? "/" : slugs.has(last) ? `/${last}/` : path;
  return hash ? `${local}#${hash}` : local;
}

export function buildNav(manifest: SiteManifest): Nav {
  const slugs = siteSlugs(manifest);
  if (manifest.nav?.items?.length) {
    const link = (label: string, href: string): NavLink => ({ label, href: localHref(href, slugs) });
    return {
      items: manifest.nav.items.map((item) => ({
        ...link(item.label, item.href || ""),
        children: (item.children || []).map((c) => link(c.label, c.href)),
      })),
      buttons: manifest.nav.buttons.map((b) => link(b.label, b.href)),
    };
  }
  const pages = [...manifest.landing_pages.filter((p) => !p.is_home), ...manifest.pages]
    .filter((p) => !["blog", "contact", "home"].includes(p.slug))
    .slice(0, 4);
  return {
    items: [
      { label: "Home", href: "/", children: [] },
      ...pages.map((p) => ({ label: p.title, href: `/${p.slug}/`, children: [] })),
      { label: "Blog", href: "/blog/", children: [] },
    ],
    buttons: [{ label: "Contact", href: "/contact/" }],
  };
}
