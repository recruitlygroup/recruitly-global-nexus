// src/lib/blog-bundled.ts
//
// Public blog reads. These are inlined into the JS bundle at BUILD TIME via
// Vite's import.meta.glob, so the public /blog and /blog/:slug pages never
// make a runtime network call and render even if GitHub is unreachable.
//
// IMPORTANT: because this is build-time, a new post only appears on the live
// site after the site is rebuilt/redeployed. If your host auto-deploys on
// every push to the configured branch (Vercel/Netlify/etc.), publishing a
// post from the admin panel triggers that rebuild automatically — the post
// shows up ~1-2 minutes later once the deploy finishes.

import { normalizePost, type BlogPost } from "./blog-frontmatter";

const modules = import.meta.glob("../content/blogs/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function slugFromPath(path: string): string {
  const file = path.split("/").pop() ?? "";
  return file.replace(/\.md$/, "");
}

let cachedAllPosts: BlogPost[] | null = null;

function getAllBundledPosts(): BlogPost[] {
  if (cachedAllPosts) return cachedAllPosts;
  cachedAllPosts = Object.entries(modules).map(([path, raw]) =>
    normalizePost(slugFromPath(path), raw)
  );
  return cachedAllPosts;
}

function sortByDateDesc(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => {
    const aTime = a.date ? new Date(a.date).getTime() : 0;
    const bTime = b.date ? new Date(b.date).getTime() : 0;
    return bTime - aTime;
  });
}

/** All published posts, newest first. Safe to call anywhere (no network). */
export function listPublishedPostsBundled(): BlogPost[] {
  return sortByDateDesc(getAllBundledPosts().filter((p) => p.status === "published"));
}

/** A single published post by slug, or null if it doesn't exist / isn't published. */
export function getPublishedPostBundled(slug: string): BlogPost | null {
  const post = getAllBundledPosts().find((p) => p.slug === slug && p.status === "published");
  return post ?? null;
}

/** Roughly estimate reading time in minutes from the markdown body. */
export function estimateReadTimeMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
