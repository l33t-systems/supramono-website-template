/* Dynamic section renderer — the heart of CMS-driven pages.
 *
 * Every CMS page arrives as ordered sections `{type, content, html}`:
 * `content` is structured data (edit it in Supramono), `html` is the
 * platform's server-side rendering of the same section. Types registered
 * here render NATIVELY with your design system (Tailwind/shadcn tokens);
 * anything unregistered falls back to the server HTML — so pages never
 * break, and you upgrade sections to native components one at a time.
 *
 * To take over a section type: add a component, register it in SECTIONS.
 */
import Link from "next/link";
import type { JSX } from "react";
import LeadForm from "@/components/LeadForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { PageSection } from "@/src/lib/supramono";

type Data = Record<string, unknown>;

/** First non-empty of several alias keys — CMS section shapes vary. */
function pick(data: Data | undefined, ...keys: string[]): string {
  for (const key of keys) {
    const v = data?.[key];
    if (typeof v === "string" && v.trim()) return v;
  }
  return "";
}

function items(data: Data | undefined, ...keys: string[]): Data[] {
  for (const key of keys) {
    const v = data?.[key];
    if (Array.isArray(v) && v.length) return v as Data[];
  }
  return [];
}

function asData(content: unknown): Data | undefined {
  return content && typeof content === "object" && !Array.isArray(content)
    ? (content as Data)
    : undefined;
}

// ---------------------------------------------------------------------------

function Hero({ data }: { data?: Data }) {
  const title = pick(data, "title", "hero_title", "headline", "heading");
  if (!title) return null;
  const subtitle = pick(data, "subtitle", "hero_subtitle", "subheadline", "description");
  const ctaText = pick(data, "cta", "cta_text", "hero_cta", "button_text");
  const ctaLink = pick(data, "cta_link", "hero_cta_link", "button_link") || "/contact/";
  return (
    <section className="bg-brand-bg">
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
        )}
        {ctaText && (
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href={ctaLink}>{ctaText}</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

function FeatureGrid({ data }: { data?: Data }) {
  const features = items(data, "items", "features", "cards", "list");
  if (!features.length) return null;
  const title = pick(data, "title", "heading");
  return (
    <section className="max-w-5xl mx-auto px-4 py-16">
      {title && <h2 className="text-3xl font-bold text-center mb-10">{title}</h2>}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <Card key={i}>
            <CardHeader>
              {pick(f, "icon_url") && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pick(f, "icon_url")} alt="" className="size-10 mb-2" />
              )}
              <CardTitle>{pick(f, "title", "name", "heading")}</CardTitle>
              {pick(f, "description", "body", "text") && (
                <CardDescription>{pick(f, "description", "body", "text")}</CardDescription>
              )}
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Faq({ data }: { data?: Data }) {
  const faqs = items(data, "faqs", "items", "questions");
  if (!faqs.length) return null;
  const title = pick(data, "title", "faq_title") || "Frequently asked questions";
  return (
    <section className="max-w-3xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-8">{title}</h2>
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <details key={i} className="rounded-lg border border-border p-4 group">
            <summary className="font-medium cursor-pointer list-none flex justify-between items-center">
              {pick(f, "question", "title", "q")}
              <span className="text-muted-foreground group-open:rotate-45 transition-transform">+</span>
            </summary>
            <div className="mt-3 text-muted-foreground prose-cms"
                 dangerouslySetInnerHTML={{ __html: pick(f, "answer", "body", "a") }} />
          </details>
        ))}
      </div>
    </section>
  );
}

function CtaBanner({ data }: { data?: Data }) {
  const heading = pick(data, "title", "heading", "headline", "cta");
  if (!heading) return null;
  const ctaText = pick(data, "button_text", "cta_text", "cta") || "Get started";
  const ctaLink = pick(data, "button_link", "cta_link") || "/contact/";
  return (
    <section className="bg-brand-bg">
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold">{heading}</h2>
        {pick(data, "subtitle", "description") && (
          <p className="mt-3 text-muted-foreground">{pick(data, "subtitle", "description")}</p>
        )}
        <div className="mt-6">
          <Button size="lg" asChild>
            <Link href={ctaLink}>{ctaText}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function LeadCapture({ data }: { data?: Data }) {
  const title = pick(data, "title", "heading") || "Get in touch";
  return (
    <section className="max-w-3xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold mb-2">{title}</h2>
      {pick(data, "subtitle", "description") && (
        <p className="text-muted-foreground mb-8">{pick(data, "subtitle", "description")}</p>
      )}
      <LeadForm />
    </section>
  );
}

function Logos({ data }: { data?: Data }) {
  const logos = items(data, "logos", "items", "images");
  if (!logos.length) return null;
  return (
    <section className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex flex-wrap items-center justify-center gap-10 opacity-70">
        {logos.map((l, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={pick(l, "url", "image_url", "src")}
               alt={pick(l, "name", "alt")} className="h-8 w-auto" />
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------

const SECTIONS: Record<string, (props: { data?: Data }) => JSX.Element | null> = {
  hero: Hero,
  feature_grid: FeatureGrid,
  feature_spotlight: FeatureGrid,
  benefits: FeatureGrid,
  faq: Faq,
  cta_banner: CtaBanner,
  cta: CtaBanner,
  lead_capture: LeadCapture,
  contact_form: LeadCapture,
  logos: Logos,
};

export function SectionRenderer({ section }: { section: PageSection }) {
  // "hero__2" style keys carry a repeat suffix — the base key is the type.
  const type = section.type.split("__")[0];
  const Native = SECTIONS[type];
  if (Native) {
    const rendered = Native({ data: asData(section.content) });
    if (rendered) return rendered;
  }
  // Unregistered type or unusable data: platform-rendered HTML fallback.
  if (section.html) {
    return (
      <section className="prose-cms max-w-5xl mx-auto px-4"
               dangerouslySetInnerHTML={{ __html: section.html }} />
    );
  }
  return null;
}
