import { ArrowRight } from "lucide-react";
import Link from "next/link";
import DynamicPage from "@/components/DynamicPage";
import FadeIn from "@/components/FadeIn";
import { Button } from "@/components/ui/button";
import { getBrand, getPage } from "@/src/lib/supramono/content";

/** Brand-driven hero + the CMS home page content underneath, all baked at
    build time. Replace freely — this is YOUR site; the CMS block is optional. */
export default async function Home() {
  const brand = await getBrand();
  const home = await getPage("home");

  return (
    <div>
      <section className="bg-brand-bg">
        <div className="max-w-5xl mx-auto px-4 py-24 text-center">
          <FadeIn>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              {brand.product.name}
            </h1>
            {brand.product.tagline && (
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                {brand.product.tagline}
              </p>
            )}
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="mt-8 flex justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/contact/">
                  Get in touch
                  <ArrowRight />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/blog/">Read the blog</Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {home && (
        <FadeIn>
          <DynamicPage page={home} />
        </FadeIn>
      )}
    </div>
  );
}
