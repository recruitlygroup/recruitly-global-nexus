// src/lib/blog-frontmatter.ts
//
// Tiny, dependency-free YAML-frontmatter parser/stringifier for blog posts.
// Only supports the small subset of YAML we actually need: strings, null,
// and single-line string arrays (["a", "b"]). That's all blog frontmatter
// ever contains, so we don't need to pull in a full YAML parser.

export interface BlogFrontmatter {
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  category: string | null;
  tags: string[];
  status: "draft" | "published";
  date: string | null; // ISO string, null for drafts
}

export interface BlogPost extends BlogFrontmatter {
  body: string;
}

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const FRONTMATTER_DELIM = "---";

function parseScalar(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed === "" || trimmed === "null" || trimmed === "~") return null;
  // Strip a single layer of matching quotes.
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed
      .slice(1, -1)
      .replace(/\\"/g, '"')
      .replace(/\\n/g, "\n");
  }
  return trimmed;
}

function parseArray(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return [];
  const inner = trimmed.slice(1, -1).trim();
  if (inner === "") return [];
  // Split on commas that are not inside quotes.
  const parts: string[] = [];
  let current = "";
  let inQuotes = false;
  let quoteChar = "";
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (inQuotes) {
      if (ch === quoteChar) {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else if (ch === '"' || ch === "'") {
      inQuotes = true;
      quoteChar = ch;
    } else if (ch === ",") {
      parts.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim() !== "") parts.push(current.trim());
  return parts.map((p) => p.trim()).filter(Boolean);
}

/**
 * Parses a raw markdown file (with leading YAML frontmatter block) into
 * a frontmatter object and the remaining body markdown.
 */
export function parseFrontmatter(raw: string): {
  data: Partial<BlogFrontmatter>;
  body: string;
} {
  const normalized = raw.replace(/\r\n/g, "\n");
  if (!normalized.startsWith(FRONTMATTER_DELIM)) {
    return { data: {}, body: normalized.trim() };
  }

  const end = normalized.indexOf(`\n${FRONTMATTER_DELIM}`, FRONTMATTER_DELIM.length);
  if (end === -1) {
    return { data: {}, body: normalized.trim() };
  }

  const frontmatterBlock = normalized.slice(FRONTMATTER_DELIM.length, end).trim();
  const body = normalized.slice(end + `\n${FRONTMATTER_DELIM}`.length).replace(/^\n+/, "");

  const data: Record<string, unknown> = {};
  const lines = frontmatterBlock.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/);
    if (!match) continue;
    const key = match[1];
    const value = match[2];

    if (value.trim().startsWith("[")) {
      data[key] = parseArray(value);
    } else {
      data[key] = parseScalar(value);
    }
  }

  return { data: data as Partial<BlogFrontmatter>, body };
}

function stringifyScalar(value: string | null): string {
  if (value === null || value === undefined) return "null";
  const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
  return `"${escaped}"`;
}

function stringifyArray(values: string[]): string {
  if (!values || values.length === 0) return "[]";
  return `[${values.map((v) => stringifyScalar(v)).join(", ")}]`;
}

/**
 * Serializes frontmatter data + body markdown back into a raw markdown
 * file with a YAML frontmatter block.
 */
export function stringifyFrontmatter(data: BlogFrontmatter, body: string): string {
  const lines = [
    FRONTMATTER_DELIM,
    `title: ${stringifyScalar(data.title)}`,
    `slug: ${stringifyScalar(data.slug)}`,
    `excerpt: ${stringifyScalar(data.excerpt)}`,
    `cover_image_url: ${stringifyScalar(data.cover_image_url)}`,
    `category: ${stringifyScalar(data.category)}`,
    `tags: ${stringifyArray(data.tags)}`,
    `status: ${stringifyScalar(data.status)}`,
    `date: ${stringifyScalar(data.date)}`,
    FRONTMATTER_DELIM,
    "",
  ];
  return lines.join("\n") + body.trim() + "\n";
}

/**
 * Normalizes a raw frontmatter parse result into a fully-typed BlogPost,
 * falling back to sane defaults for any missing/invalid fields.
 */
export function normalizePost(slug: string, raw: string): BlogPost {
  const { data, body } = parseFrontmatter(raw);

  const status: "draft" | "published" = data.status === "published" ? "published" : "draft";

  return {
    title: typeof data.title === "string" && data.title ? data.title : slug,
    slug: typeof data.slug === "string" && data.slug ? data.slug : slug,
    excerpt: typeof data.excerpt === "string" ? data.excerpt : null,
    cover_image_url: typeof data.cover_image_url === "string" ? data.cover_image_url : null,
    category: typeof data.category === "string" ? data.category : null,
    tags: Array.isArray(data.tags) ? data.tags : [],
    status,
    date: typeof data.date === "string" ? data.date : null,
    body,
  };
}
