import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/src/lib/supramono/content";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogIndex() {
  const posts = await getAllPosts();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>
      <div className="space-y-8">
        {posts.map((post) => (
          <article key={post.id}>
            <Link href={`/blog/${post.slug}/`} className="group block">
              {post.featured_image_url && (
                // eslint-disable-next-line @next/next/no-img-element
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
        {posts.length === 0 && <p className="text-gray-500">No posts yet.</p>}
      </div>
    </div>
  );
}
