import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import { useBrand } from "../hooks/useBrand";
import { usePage } from "../hooks/usePage";

/** Brand-driven hero + the CMS home page content underneath.
    Replace freely — this is YOUR site; the CMS content is optional. */
export default function Home() {
  const brand = useBrand();
  const { page } = usePage("home");

  return (
    <div>
      <Seo title={brand?.product.name} description={brand?.product.tagline} />
      <section className="bg-brand-bg">
        <div className="max-w-5xl mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            {brand?.product.name ?? "Welcome"}
          </h1>
          {brand?.product.tagline && (
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              {brand.product.tagline}
            </p>
          )}
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/contact"
                  className="bg-brand-primary text-white font-medium px-5 py-2.5 rounded-lg">
              Get in touch
            </Link>
            <Link to="/blog"
                  className="bg-white border border-gray-200 font-medium px-5 py-2.5 rounded-lg">
              Read the blog
            </Link>
          </div>
        </div>
      </section>

      {page && page.html && (
        <section className="max-w-3xl mx-auto px-4 py-12 prose-cms"
                 dangerouslySetInnerHTML={{ __html: page.html }} />
      )}
    </div>
  );
}
