import type { Metadata } from "next";
import Link from "next/link";
import { buildNav, localHref, siteSlugs } from "@/src/lib/nav";
import { brandCssVars, getBrand, getManifest, scopedThemeCss } from "@/src/lib/supramono/content";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  return {
    title: {
      default: brand.product.name,
      template: `%s · ${brand.product.name}`,
    },
    description: brand.product.tagline || brand.product.description,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const brand = await getBrand();
  const name = brand.product.name;
  // CMS-driven menu: the live Supramono navbar (manifest.nav), see
  // src/lib/nav.ts. Dropdowns open on hover and on keyboard focus.
  const manifest = await getManifest();
  const nav = buildNav(manifest);
  // The live footer (manifest.footer); its page links are local paths too.
  const footer = manifest.footer;
  const slugs = siteSlugs(manifest);
  const themeCss = scopedThemeCss(brand);
  const cta = nav.buttons[nav.buttons.length - 1];

  return (
    <html lang="en" style={brandCssVars(brand)}>
      <body className="min-h-screen flex flex-col bg-white text-brand-text antialiased">
        {/* The platform theme, scoped to fallback section html (.cms-section). */}
        {themeCss && <style dangerouslySetInnerHTML={{ __html: themeCss }} />}
        <header className="border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              {brand.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={brand.logo_url} alt={name} className="h-8 w-auto" />
              ) : (
                <span className="text-lg font-bold">{name}</span>
              )}
            </Link>
            <nav className="flex flex-wrap items-center gap-6 text-sm font-medium text-gray-600">
              {nav.items.map((item) =>
                item.children.length ? (
                  <div key={item.label} className="group relative">
                    {item.href ? (
                      <Link href={item.href} className="hover:text-gray-900">{item.label}</Link>
                    ) : (
                      <button type="button" className="hover:text-gray-900">{item.label}</button>
                    )}
                    <ul className="invisible absolute left-0 top-full z-20 min-w-56 rounded-md border border-gray-100 bg-white p-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                      {item.children.map((c) => (
                        <li key={c.href}>
                          <Link href={c.href} className="block rounded px-3 py-2 hover:bg-gray-50 hover:text-gray-900">
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <Link key={item.href} href={item.href} className="hover:text-gray-900">{item.label}</Link>
                ),
              )}
              {nav.buttons.slice(0, -1).map((b) => (
                <Link key={b.href} href={b.href} className="hover:text-gray-900">{b.label}</Link>
              ))}
              {cta && (
                <Link href={cta.href} className="rounded-md bg-brand-primary px-3 py-1.5 text-white hover:opacity-90">
                  {cta.label}
                </Link>
              )}
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-gray-100 mt-16">
          <div className="max-w-5xl mx-auto px-4 py-8 text-sm text-gray-500 space-y-4">
            {!!footer?.links.length && (
              <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
                {footer.links.map((l) => (
                  <Link key={l.href} href={localHref(l.href, slugs)} className="hover:text-gray-900">{l.label}</Link>
                ))}
              </nav>
            )}
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
              <span>{footer?.copyright || `© ${new Date().getFullYear()} ${name}`}</span>
              <span>{footer?.tagline || brand.product.tagline}</span>
              {footer?.legal.map((l) => (
                <a key={l.href} href={l.href} className="hover:text-gray-900">{l.label}</a>
              ))}
              {footer?.social.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer"
                   className="hover:text-gray-900">{s.label}</a>
              ))}
              {footer?.text.map((t) => <span key={t}>{t}</span>)}
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
