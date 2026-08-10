"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supramono, BlogPostDetail, PageContent } from "@/src/lib/supramono";

/** Client-side dynamic content fallback, rendered from the 404 page.
    Content published AFTER the last build has no pre-rendered HTML yet —
    this component fetches it live from the public content API, so new
    blog posts and CMS pages are viewable immediately without a rebuild.
    (The next rebuild upgrades them to pre-rendered HTML for SEO.) */
export default function DynamicFallback() {
  const [state, setState] = useState<"loading" | "notfound">("loading");
  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [page, setPage] = useState<PageContent | null>(null);

  useEffect(() => {
    const path = window.location.pathname.replace(/\/+$/, "");
    const blogMatch = path.match(/^\/blog\/([^/]+)$/);
    const pageMatch = path.match(/^\/([^/]+)$/);
    (async () => {
      try {
        if (blogMatch) {
          const p = await supramono.getBlogPost(decodeURIComponent(blogMatch[1]));
          setPost(p);
          if (p.seo?.meta_title) document.title = p.seo.meta_title;
          return;
        }
        if (pageMatch) {
          const p = await supramono.getPage(decodeURIComponent(pageMatch[1]));
          setPage(p);
          if (p.title) document.title = p.title;
          return;
        }
      } catch {
        /* fall through to not-found */
      }
      setState("notfound");
    })();
  }, []);

  if (post) {
    return (
      <article className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/blog/" className="text-sm text-muted-foreground hover:text-foreground">
          ← All posts
        </Link>
        <h1 className="text-3xl font-bold mt-2 mb-2">{post.title}</h1>
        {post.published_at && (
          <p className="text-sm text-muted-foreground mb-6">
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
  if (page) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="prose-cms" dangerouslySetInnerHTML={{ __html: page.html }} />
      </div>
    );
  }
  if (state === "loading") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center text-muted-foreground">
        Loading…
      </div>
    );
  }
  return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center">
      <h1 className="text-3xl font-bold mb-2">Page not found</h1>
      <Link href="/" className="text-brand-primary underline">Go home</Link>
    </div>
  );
}
