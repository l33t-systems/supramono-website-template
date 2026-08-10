import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPost } from "@/src/lib/supramono/content";

// Static export: pre-render every published post; unknown slugs 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.seo.meta_title,
    description: post.seo.meta_description,
  };
}

export default async function BlogPostPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/blog/" className="text-sm text-gray-500 hover:text-gray-700">
        ← All posts
      </Link>
      <h1 className="text-3xl font-bold mt-2 mb-2">{post.title}</h1>
      {post.published_at && (
        <p className="text-sm text-gray-400 mb-6">
          {new Date(post.published_at).toLocaleDateString()}
        </p>
      )}
      {post.featured_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.featured_image_url} alt="" className="rounded-lg mb-6 w-full" />
      )}
      <div className="prose-cms" dangerouslySetInnerHTML={{ __html: post.html }} />
    </article>
  );
}
