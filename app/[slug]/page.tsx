import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getManifest, getPage } from "@/src/lib/supramono/content";

// Generic CMS page by slug (published landing pages + legacy pages),
// pre-rendered at build. Static routes (/blog, /contact) take precedence
// over this dynamic segment.
export const dynamicParams = false;

const RESERVED = new Set(["blog", "contact", "home", ""]);

export async function generateStaticParams() {
  const manifest = await getManifest();
  const slugs = new Set<string>();
  for (const lp of manifest.landing_pages) {
    if (!lp.is_home) slugs.add(lp.slug);
  }
  for (const page of manifest.pages) slugs.add(page.slug);
  return [...slugs]
    .filter((slug) => !RESERVED.has(slug))
    .map((slug) => ({ slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return {};
  return {
    title: page.seo?.meta_title || page.title,
    description: page.seo?.meta_description,
  };
}

export default async function CmsPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="prose-cms" dangerouslySetInnerHTML={{ __html: page.html }} />
    </div>
  );
}
