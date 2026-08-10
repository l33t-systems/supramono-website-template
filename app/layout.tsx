import type { Metadata } from "next";
import Link from "next/link";
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
  // CMS-driven menu: pages published in Supramono appear in the nav.
  const manifest = await getManifest();
  const cmsNav = [
    ...manifest.landing_pages.filter((p) => !p.is_home),
    ...manifest.pages,
  ]
    .filter((p) => !["blog", "contact", "home"].includes(p.slug))
    .slice(0, 4);

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
            <nav className="flex items-center gap-6 text-sm font-medium text-gray-600">
              <Link href="/" className="hover:text-gray-900">Home</Link>
              {cmsNav.map((p) => (
                <Link key={p.slug} href={`/${p.slug}/`} className="hover:text-gray-900">
                  {p.title}
                </Link>
              ))}
              <Link href="/blog/" className="hover:text-gray-900">Blog</Link>
              <Link href="/contact/" className="hover:text-gray-900">Contact</Link>
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
