import type { Metadata } from "next";
import Link from "next/link";
import { buildNav } from "@/src/lib/nav";
import { brandCssVars, getBrand, getManifest } from "@/src/lib/supramono/content";
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
  const nav = buildNav(await getManifest());
  const cta = nav.buttons[nav.buttons.length - 1];

  return (
    <html lang="en" style={brandCssVars(brand)}>
      <body className="min-h-screen flex flex-col bg-white text-brand-text antialiased">
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
          <div className="max-w-5xl mx-auto px-4 py-8 text-sm text-gray-500 flex flex-wrap justify-between gap-2">
            <span>© {new Date().getFullYear()} {name}</span>
            <span>{brand.product.tagline}</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
