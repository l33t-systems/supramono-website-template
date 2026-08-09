import { Link, useParams } from "react-router-dom";
import Seo from "../components/Seo";
import { usePage } from "../hooks/usePage";

/** Generic CMS page by slug (landing pages + legacy pages). */
export default function Page() {
  const { slug = "" } = useParams();
  const { page, error, loading } = usePage(slug);

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-12 text-gray-500">Loading…</div>;
  if (error || !page) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <Link to="/" className="text-brand-primary underline">Go home</Link>
      </div>
    );
  }
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Seo title={page.seo?.meta_title || page.title}
           description={page.seo?.meta_description} />
      <div className="prose-cms" dangerouslySetInnerHTML={{ __html: page.html }} />
    </div>
  );
}
