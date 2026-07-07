// src/lib/blog-admin-client.ts
//
// Thin client for the `blog-admin` Supabase Edge Function. Never talks to
// GitHub directly and never sees GITHUB_TOKEN — the Supabase client attaches
// the logged-in user's session JWT automatically, and the edge function
// re-verifies admin status server-side before touching GitHub.

import { supabase } from "@/integrations/supabase/client";
import type { BlogFrontmatter } from "./blog-frontmatter";

export interface AdminBlogListItem extends BlogFrontmatter {
  sha: string;
}

export interface AdminBlogPost extends BlogFrontmatter {
  body: string;
  sha?: string;
}

export interface BlogPostInput {
  originalSlug: string | null; // null when creating a new post
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  category: string | null;
  tags: string[];
  body: string;
  status: "draft" | "published";
}

class BlogAdminError extends Error {
  details?: unknown;
  constructor(message: string, details?: unknown) {
    super(message);
    this.details = details;
  }
}

async function invoke<T>(action: string, extra: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke("blog-admin", {
    body: { action, ...extra },
  });

  if (error) {
    // Supabase wraps non-2xx responses in `error`; the actual JSON payload
    // (with our decoded GitHub error details) is on error.context if present.
    const message = (error as any)?.context?.error || error.message || "Blog admin request failed";
    throw new BlogAdminError(message, (error as any)?.context);
  }
  if (data?.error) {
    throw new BlogAdminError(data.error, data);
  }
  return data as T;
}

export async function listAdminPosts(): Promise<AdminBlogListItem[]> {
  const { posts } = await invoke<{ posts: AdminBlogListItem[] }>("list");
  return posts.sort((a, b) => {
    const at = a.date ? new Date(a.date).getTime() : 0;
    const bt = b.date ? new Date(b.date).getTime() : 0;
    return bt - at;
  });
}

export async function getAdminPost(slug: string): Promise<AdminBlogPost> {
  const { post } = await invoke<{ post: AdminBlogPost }>("get", { id: slug });
  return post;
}

export async function saveAdminPost(input: BlogPostInput): Promise<AdminBlogPost> {
  const { post } = await invoke<{ post: AdminBlogPost }>("upsert", { input });
  return post;
}

export async function deleteAdminPost(slug: string): Promise<void> {
  await invoke<{ ok: true }>("delete", { id: slug });
}

export { BlogAdminError };
