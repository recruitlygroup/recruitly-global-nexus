// supabase/functions/blog-admin/index.ts
//
// Server-side only. Writes/reads blog posts as Markdown files with YAML
// frontmatter directly into the GitHub repo (src/content/blogs/<slug>.md).
// GITHUB_TOKEN never leaves this function — the browser only ever talks to
// this edge function via the Supabase client (which attaches the user's
// session JWT), never to GitHub directly.
//
// Mirrors the auth pattern used by supabase/functions/admin-actions:
// verify the caller's Supabase session, then verify they are an admin via
// the `is_admin` RPC (source of truth is the DB, never a client-supplied claim).

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://deno.land/x/supabase_js@2.45.1/mod.ts";
import { z } from "https://esm.sh/zod@3.23.8";

const ALLOWED_ORIGINS = new Set([
  "https://www.recruitlygroup.com",
  "https://app.recruitlygroup.com",
  "https://recruitlygroup.com",
  "http://localhost:5173",
  "http://localhost:8080",
]);

function buildCors(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : "https://www.recruitlygroup.com",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Frontmatter (kept in sync with src/lib/blog-frontmatter.ts)
// ─────────────────────────────────────────────────────────────────────────

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const BLOGS_DIR = "src/content/blogs";

interface BlogFrontmatter {
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  category: string | null;
  tags: string[];
  status: "draft" | "published";
  date: string | null;
}
type BlogPost = BlogFrontmatter & { body: string };

function stringifyScalar(value: string | null): string {
  if (value === null || value === undefined) return "null";
  const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
  return `"${escaped}"`;
}
function stringifyArray(values: string[]): string {
  if (!values || values.length === 0) return "[]";
  return `[${values.map((v) => stringifyScalar(v)).join(", ")}]`;
}
function stringifyFrontmatter(data: BlogFrontmatter, body: string): string {
  const lines = [
    "---",
    `title: ${stringifyScalar(data.title)}`,
    `slug: ${stringifyScalar(data.slug)}`,
    `excerpt: ${stringifyScalar(data.excerpt)}`,
    `cover_image_url: ${stringifyScalar(data.cover_image_url)}`,
    `category: ${stringifyScalar(data.category)}`,
    `tags: ${stringifyArray(data.tags)}`,
    `status: ${stringifyScalar(data.status)}`,
    `date: ${stringifyScalar(data.date)}`,
    "---",
    "",
  ];
  return lines.join("\n") + body.trim() + "\n";
}

function parseScalar(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed === "" || trimmed === "null" || trimmed === "~") return null;
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).replace(/\\"/g, '"').replace(/\\n/g, "\n");
  }
  return trimmed;
}
function parseArray(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return [];
  const inner = trimmed.slice(1, -1).trim();
  if (inner === "") return [];
  const parts: string[] = [];
  let current = "", inQuotes = false, quoteChar = "";
  for (const ch of inner) {
    if (inQuotes) {
      if (ch === quoteChar) inQuotes = false;
      else current += ch;
    } else if (ch === '"' || ch === "'") {
      inQuotes = true; quoteChar = ch;
    } else if (ch === ",") {
      parts.push(current.trim()); current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim() !== "") parts.push(current.trim());
  return parts.map((p) => p.trim()).filter(Boolean);
}
function parseFrontmatter(raw: string): { data: Partial<BlogFrontmatter>; body: string } {
  const normalized = raw.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---")) return { data: {}, body: normalized.trim() };
  const end = normalized.indexOf("\n---", 3);
  if (end === -1) return { data: {}, body: normalized.trim() };
  const block = normalized.slice(3, end).trim();
  const body = normalized.slice(end + 4).replace(/^\n+/, "");
  const data: Record<string, unknown> = {};
  for (const line of block.split("\n")) {
    const match = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/);
    if (!match) continue;
    const [, key, value] = match;
    data[key] = value.trim().startsWith("[") ? parseArray(value) : parseScalar(value);
  }
  return { data: data as Partial<BlogFrontmatter>, body };
}
function normalizePost(slug: string, raw: string): BlogPost {
  const { data, body } = parseFrontmatter(raw);
  return {
    title: typeof data.title === "string" && data.title ? data.title : slug,
    slug: typeof data.slug === "string" && data.slug ? data.slug : slug,
    excerpt: typeof data.excerpt === "string" ? data.excerpt : null,
    cover_image_url: typeof data.cover_image_url === "string" ? data.cover_image_url : null,
    category: typeof data.category === "string" ? data.category : null,
    tags: Array.isArray(data.tags) ? data.tags : [],
    status: data.status === "published" ? "published" : "draft",
    date: typeof data.date === "string" ? data.date : null,
    body,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// GitHub write layer (server only)
// ─────────────────────────────────────────────────────────────────────────

interface GhConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}

function sanitizeSegment(raw: string): string {
  return raw
    .replace(/^https?:\/\/[^/]+\//i, "")
    .replace(/^git@[^:]+:/i, "")
    .replace(/\.git$/i, "")
    .replace(/^\/+|\/+$/g, "");
}

function getGhConfig(): GhConfig {
  const token = Deno.env.get("GITHUB_TOKEN");
  let owner = Deno.env.get("GITHUB_OWNER") ?? "";
  let repo = Deno.env.get("GITHUB_REPO") ?? "";
  const branch = Deno.env.get("GITHUB_BRANCH") || "main";

  owner = sanitizeSegment(owner);
  repo = sanitizeSegment(repo);

  if (repo.includes("/")) {
    const segments = repo.split("/").filter(Boolean);
    if (segments.length >= 2) {
      owner = segments[segments.length - 2];
      repo = segments[segments.length - 1];
    }
  }

  if (!token || !owner || !repo) {
    throw new GhError("config", 500, "Missing GITHUB_TOKEN, GITHUB_OWNER, or GITHUB_REPO server secret.", null, { owner, repo, branch, dir: BLOGS_DIR });
  }

  return { token, owner, repo, branch };
}

class GhError extends Error {
  status: number;
  documentation_url: string | null;
  context: Record<string, unknown>;
  hint: string;
  constructor(operation: string, status: number, ghMessage: string, documentation_url: string | null, context: Record<string, unknown>) {
    const hint = {
      401: "GITHUB_TOKEN invalid/expired.",
      403: "PAT lacks 'Contents: Read and write' on this repo (or org approval missing).",
      404: "Check GITHUB_OWNER/GITHUB_REPO/GITHUB_BRANCH match the actual repo and the PAT can see it.",
      409: "Stale sha — reload the post and retry.",
      422: "Branch may not exist or path is invalid.",
    }[status] ?? "Unexpected GitHub API error.";
    super(`[github-blog] ${operation} failed (${status}): ${ghMessage}. Hint: ${hint}`);
    this.status = status;
    this.documentation_url = documentation_url;
    this.context = context;
    this.hint = hint;
  }
}

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
function base64ToUtf8(b64: string): string {
  const binary = atob(b64.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function ghRequest(cfg: GhConfig, operation: string, path: string, init?: RequestInit) {
  const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (res.status === 404) return { status: 404, json: null };

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    // no body
  }

  if (!res.ok) {
    console.error(`[github-blog] ${operation} error`, { status: res.status, json });
    throw new GhError(operation, res.status, json?.message ?? res.statusText, json?.documentation_url ?? null, {
      owner: cfg.owner, repo: cfg.repo, branch: cfg.branch, dir: BLOGS_DIR, path,
    });
  }

  return { status: res.status, json };
}

async function ghGetFile(cfg: GhConfig, slug: string): Promise<{ raw: string; sha: string } | null> {
  const { status, json } = await ghRequest(cfg, "ghGetFile", `${BLOGS_DIR}/${slug}.md?ref=${cfg.branch}`);
  if (status === 404 || !json) return null;
  return { raw: base64ToUtf8(json.content), sha: json.sha };
}

async function ghListFiles(cfg: GhConfig): Promise<{ slug: string; sha: string }[]> {
  const { status, json } = await ghRequest(cfg, "ghListFiles", `${BLOGS_DIR}?ref=${cfg.branch}`);
  if (status === 404 || !Array.isArray(json)) return [];
  return json
    .filter((f: any) => f.type === "file" && f.name.endsWith(".md"))
    .map((f: any) => ({ slug: f.name.replace(/\.md$/, ""), sha: f.sha }));
}

async function ghWriteFile(cfg: GhConfig, slug: string, content: string, sha: string | null, message: string) {
  await ghRequest(cfg, "ghWriteFile", `${BLOGS_DIR}/${slug}.md`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: utf8ToBase64(content),
      branch: cfg.branch,
      committer: { name: "Blog Admin", email: "blog-admin@recruitlygroup.com" },
      ...(sha ? { sha } : {}),
    }),
  });
}

async function ghDeleteFile(cfg: GhConfig, slug: string, sha: string, message: string) {
  await ghRequest(cfg, "ghDeleteFile", `${BLOGS_DIR}/${slug}.md`, {
    method: "DELETE",
    body: JSON.stringify({
      message,
      sha,
      branch: cfg.branch,
      committer: { name: "Blog Admin", email: "blog-admin@recruitlygroup.com" },
    }),
  });
}

// ─────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────

const PostInputSchema = z.object({
  originalSlug: z.string().nullable().optional(), // present + non-null when editing/renaming
  title: z.string().min(2).max(200),
  slug: z.string().regex(SLUG_REGEX, "Slug must be lowercase letters, numbers, and hyphens only"),
  excerpt: z.string().max(400).nullable(),
  cover_image_url: z.string().url().max(500).nullable(),
  category: z.string().max(80).nullable(),
  tags: z.array(z.string().max(40)).max(15),
  body: z.string().max(60000),
  status: z.enum(["draft", "published"]),
});

// ─────────────────────────────────────────────────────────────────────────
// Handler
// ─────────────────────────────────────────────────────────────────────────

serve(async (req) => {
  const cors = buildCors(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const jsonHeaders = { ...cors, "Content-Type": "application/json" };

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: jsonHeaders });
    }

    let body: { action: string; id?: string; input?: unknown };
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: jsonHeaders });
    }

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: jsonHeaders });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Never trust a client-supplied role. Re-check against the DB every request.
    const { data: isAdmin, error: adminCheckError } = await supabaseAdmin.rpc("is_admin", { _user_id: user.id });
    if (adminCheckError || !isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden - Admin access required" }), { status: 403, headers: jsonHeaders });
    }

    const cfg = getGhConfig();

    switch (body.action) {
      case "list": {
        const files = await ghListFiles(cfg);
        const posts = await Promise.all(
          files.map(async (f) => {
            const file = await ghGetFile(cfg, f.slug);
            if (!file) return null;
            const post = normalizePost(f.slug, file.raw);
            return { ...post, body: undefined, sha: file.sha }; // list view doesn't need full body
          })
        );
        return new Response(JSON.stringify({ posts: posts.filter(Boolean) }), { headers: jsonHeaders });
      }

      case "get": {
        const slug = String(body.id ?? "");
        if (!slug) return new Response(JSON.stringify({ error: "Missing id" }), { status: 400, headers: jsonHeaders });
        const file = await ghGetFile(cfg, slug);
        if (!file) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: jsonHeaders });
        const post = normalizePost(slug, file.raw);
        return new Response(JSON.stringify({ post: { ...post, sha: file.sha } }), { headers: jsonHeaders });
      }

      case "upsert": {
        const parsed = PostInputSchema.safeParse(body.input);
        if (!parsed.success) {
          return new Response(JSON.stringify({ error: "Validation failed", details: parsed.error.flatten() }), { status: 400, headers: jsonHeaders });
        }
        const input = parsed.data;
        const originalSlug = input.originalSlug || null;
        const isRename = !!originalSlug && originalSlug !== input.slug;

        // Preserve/compute `date`.
        const existing = originalSlug ? await ghGetFile(cfg, originalSlug) : null;
        const existingPost = existing ? normalizePost(originalSlug!, existing.raw) : null;

        let date: string | null;
        if (input.status === "draft") {
          date = null;
        } else if (existingPost?.status === "published" && existingPost.date) {
          date = existingPost.date; // preserve original publish date
        } else {
          date = new Date().toISOString(); // first time going live
        }

        const frontmatter: BlogFrontmatter = {
          title: input.title,
          slug: input.slug,
          excerpt: input.excerpt,
          cover_image_url: input.cover_image_url,
          category: input.category,
          tags: input.tags,
          status: input.status,
          date,
        };
        const raw = stringifyFrontmatter(frontmatter, input.body);

        // Check for slug collision when creating new or renaming into an existing slug.
        if (!existingPost || isRename) {
          const collision = await ghGetFile(cfg, input.slug);
          if (collision) {
            return new Response(JSON.stringify({ error: `A post with slug "${input.slug}" already exists.` }), { status: 409, headers: jsonHeaders });
          }
        }

        const shaForWrite = isRename ? null : existing?.sha ?? null;
        const verb = originalSlug ? "update" : "create";
        await ghWriteFile(cfg, input.slug, raw, shaForWrite, `chore(blog): ${verb} "${input.title}"`);

        if (isRename && originalSlug && existing) {
          await ghDeleteFile(cfg, originalSlug, existing.sha, `chore(blog): remove old slug after rename to "${input.slug}"`);
        }

        return new Response(JSON.stringify({ post: { ...frontmatter, body: input.body } }), { headers: jsonHeaders });
      }

      case "delete": {
        const slug = String(body.id ?? "");
        if (!slug) return new Response(JSON.stringify({ error: "Missing id" }), { status: 400, headers: jsonHeaders });
        const file = await ghGetFile(cfg, slug);
        if (!file) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: jsonHeaders });
        const post = normalizePost(slug, file.raw);
        await ghDeleteFile(cfg, slug, file.sha, `chore(blog): delete "${post.title}"`);
        return new Response(JSON.stringify({ ok: true }), { headers: jsonHeaders });
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action "${body.action}"` }), { status: 400, headers: jsonHeaders });
    }
  } catch (err) {
    console.error("[github-blog] handler error", err);
    if (err instanceof GhError) {
      return new Response(
        JSON.stringify({
          error: err.message,
          status: err.status,
          documentation_url: err.documentation_url,
          context: err.context,
          hint: err.hint,
        }),
        { status: err.status >= 400 && err.status < 600 ? err.status : 500, headers: jsonHeaders }
      );
    }
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), { status: 500, headers: jsonHeaders });
  }
});
