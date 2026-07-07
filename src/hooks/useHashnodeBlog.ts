// src/hooks/useHashnodeBlog.ts
//
// NOTE: despite the filename (kept for backward compatibility with every
// component that imports from here), this no longer talks to Hashnode.
//
// WHY IT CHANGED: the blog was silently empty/broken in production because
// every page render depended on a client-side fetch to
// https://gql.hashnode.com for the "recruitlygroup.hashnode.dev" publication.
// Any hiccup there (CORS, the publication having no posts, Hashnode being
// slow/down, an ad-blocker, etc.) meant the blog page showed nothing but
// stale localStorage cache or an error state — with no way to add a new post
// from inside this app.
//
// NOW: posts come from two local, always-available sources merged together —
//   1. `src/data/staticBlogPosts.ts` — the original hand-written posts (kept
//      as-is, zero data loss).
//   2. `src/content/blogs/*.md` — Markdown files with YAML frontmatter,
//      written by the new GitHub-backed admin panel (see
//      src/lib/blog-frontmatter.ts, src/lib/blog-bundled.ts,
//      src/pages/admin/Blog*.tsx). These are inlined into the JS bundle at
//      BUILD TIME (see blog-bundled.ts), so there is still zero runtime
//      network dependency for public visitors — the blog renders even if
//      GitHub is unreachable.
//
// Because everything is available synchronously at import time, `loading`
// resolves on the next tick and `error` is always null.

import { useState, useEffect, useCallback } from 'react';
import { marked } from 'marked';
import { listPublishedPostsBundled, estimateReadTimeMinutes } from '@/lib/blog-bundled';
import type { BlogPost as MarkdownBlogPost } from '@/lib/blog-frontmatter';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  brief: string;
  content: {
    html: string;
  };
  coverImage?: {
    url: string;
  };
  publishedAt: string;
  readTimeInMinutes: number;
  author: {
    name: string;
    profilePicture?: string;
  };
  tags?: string[];
}

/** Converts a Markdown-sourced (admin panel) post into the display shape used across the blog UI. */
function toDisplayPost(post: MarkdownBlogPost): BlogPost {
  return {
    id: `md-${post.slug}`,
    title: post.title,
    slug: post.slug,
    brief: post.excerpt ?? '',
    content: {
      html: marked.parse(post.body, { async: false }) as string,
    },
    coverImage: post.cover_image_url ? { url: post.cover_image_url } : undefined,
    publishedAt: post.date ?? new Date().toISOString(),
    readTimeInMinutes: estimateReadTimeMinutes(post.body),
    author: {
      name: 'Recruitly Group',
      profilePicture: undefined,
    },
    tags: post.category ? [post.category, ...post.tags] : post.tags,
  };
}

let cachedMergedPosts: BlogPost[] | null = null;

async function getMergedPosts(): Promise<BlogPost[]> {
  if (cachedMergedPosts) return cachedMergedPosts;

  const { staticBlogPosts } = await import('@/data/staticBlogPosts');
  const markdownPosts = listPublishedPostsBundled().map(toDisplayPost);

  const merged = [...markdownPosts, ...staticBlogPosts];
  merged.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  cachedMergedPosts = merged;
  return merged;
}

export const useHashnodeBlog = (limit: number = 10) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const all = await getMergedPosts();
    setPosts(all.slice(0, limit));
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, error, refetch: fetchPosts };
};

export const useHashnodePost = (slug: string) => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      const all = await getMergedPosts();
      const found = all.find((p) => p.slug === slug) ?? null;
      if (!cancelled) {
        setPost(found);
        setError(found ? null : 'Post not found');
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { post, loading, error };
};
