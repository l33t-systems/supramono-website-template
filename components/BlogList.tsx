"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supramono, BlogPostSummary } from "@/src/lib/supramono";

/** Blog listing with live refresh: renders the build-time snapshot
    instantly, then refreshes from the public content API in the browser —
    so posts published AFTER the last build appear without a rebuild. */
export default function BlogList({ initial }: { initial: BlogPostSummary[] }) {
  const [posts, setPosts] = useState(initial);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const all: BlogPostSummary[] = [];
        let page = 1;
        for (;;) {
          const batch = await supramono.listBlogPosts({ page });
          all.push(...batch.results);
          if (page * batch.page_size >= batch.count) break;
          page += 1;
        }
        if (alive && all.length) setPosts(all);
      } catch {
        /* offline / no key — keep the snapshot */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      {posts.map((post) => (
        <article key={post.slug}>
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
          {post.excerpt && <p className="text-muted-foreground mt-1">{post.excerpt}</p>}
          {post.published_at && (
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(post.published_at).toLocaleDateString()}
            </p>
          )}
        </article>
      ))}
      {posts.length === 0 && <p className="text-muted-foreground">No posts yet.</p>}
    </div>
  );
}
