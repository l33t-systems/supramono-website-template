import { useState } from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import { useBlogPosts } from "../hooks/useBlogPosts";

export default function BlogIndex() {
  const [page, setPage] = useState(1);
  const { data, loading, error } = useBlogPosts({ page });

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Seo title="Blog" />
      <h1 className="text-3xl font-bold mb-8">Blog</h1>
      {loading && <p className="text-gray-500">Loading…</p>}
      {error && <p className="text-red-600 text-sm">Could not load posts.</p>}
      <div className="space-y-8">
        {data?.results.map((post) => (
          <article key={post.id}>
            <Link to={`/blog/${post.slug}`} className="group block">
              {post.featured_image_url && (
                <img src={post.featured_image_url} alt=""
                     className="rounded-lg mb-3 w-full object-cover max-h-64" />
              )}
              <h2 className="text-xl font-semibold group-hover:text-brand-primary">
                {post.title}
              </h2>
            </Link>
            {post.excerpt && <p className="text-gray-600 mt-1">{post.excerpt}</p>}
            {post.published_at && (
              <p className="text-xs text-gray-400 mt-1">
                {new Date(post.published_at).toLocaleDateString()}
              </p>
            )}
          </article>
        ))}
        {data && data.results.length === 0 && (
          <p className="text-gray-500">No posts yet.</p>
        )}
      </div>
      {data && data.count > data.page_size && (
        <div className="flex gap-2 mt-10">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40">
            Newer
          </button>
          <button disabled={page * data.page_size >= data.count}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40">
            Older
          </button>
        </div>
      )}
    </div>
  );
}
