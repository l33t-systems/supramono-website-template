import type { Metadata } from "next";
import BlogList from "@/components/BlogList";
import { getAllPosts } from "@/src/lib/supramono/content";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogIndex() {
  const posts = await getAllPosts();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>
      <BlogList initial={posts} />
    </div>
  );
}
