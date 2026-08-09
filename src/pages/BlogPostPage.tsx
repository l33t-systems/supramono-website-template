import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Seo from "../components/Seo";
import { supramono, BlogPostDetail } from "../lib/supramono";

export default function BlogPostPage() {
  const { slug = "" } = useParams();
  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setPost(null);
    setError(false);
    supramono.getBlogPost(slug).then(setPost).catch(() => setError(true));
  }, [slug]);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-gray-600">Post not found. <Link to="/blog" className="text-brand-primary underline">Back to blog</Link></p>
      </div>
    );
  }
  if (!post) return <div className="max-w-3xl mx-auto px-4 py-12 text-gray-500">Loading…</div>;

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <Seo title={post.seo.meta_title} description={post.seo.meta_description} />
      <Link to="/blog" className="text-sm text-gray-500 hover:text-gray-700">← All posts</Link>
      <h1 className="text-3xl font-bold mt-2 mb-2">{post.title}</h1>
      {post.published_at && (
        <p className="text-sm text-gray-400 mb-6">
          {new Date(post.published_at).toLocaleDateString()}
        </p>
      )}
      {post.featured_image_url && (
        <img src={post.featured_image_url} alt="" className="rounded-lg mb-6 w-full" />
      )}
      <div className="prose-cms" dangerouslySetInnerHTML={{ __html: post.html }} />
    </article>
  );
}
