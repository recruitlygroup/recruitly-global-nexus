// scripts/generate-sitemap.mjs
//
// Regenerates public/sitemap.xml before every build ("prebuild" in package.json).
//
//  - Static public pages, niche/role pages and blog posts are derived here from
//    the same sources the app uses (published .md posts + staticBlogPosts.ts).
//  - /universities/* and /study-abroad* entries come from the database/Excel
//    import and cannot be rebuilt offline, so they are carried over unchanged
//    from the existing public/sitemap.xml.
//  - Redirecting, "coming soon" (noindex), auth-gated and external URLs are
//    deliberately NOT listed.
//
// Run manually:  node scripts/generate-sitemap.mjs

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://www.recruitlygroup.com"; // must match the live canonical host exactly
const OUT = join(ROOT, "public", "sitemap.xml");
const TODAY = new Date().toISOString().slice(0, 10);

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

const entries = new Map(); // path -> { lastmod?, changefreq?, priority }
const add = (path, priority, changefreq, lastmod) => {
  if (!entries.has(path)) entries.set(path, { priority, changefreq, lastmod });
};

// 1) Real, indexable static pages (see src/App.tsx). Order = priority order.
const PAGES = [
  ["/", "1.0", "weekly"],
  ["/student-recruitment", "0.9", "monthly"],
  ["/manpower-recruitment", "0.9", "monthly"],
  ["/intern-recruitment", "0.8", "monthly"],
  ["/jobs", "0.9", "daily"],
  ["/universities", "0.8", "monthly"],
  ["/programs", "0.7", "weekly"],
  ["/blog", "0.7", "weekly"],
  ["/why-recruitly", "0.7", "monthly"],
  ["/solutions", "0.7", "monthly"],
  ["/industries", "0.6", "monthly"],
  ["/resources", "0.6", "monthly"],
  ["/solutions/temporary-staffing", "0.7", "monthly"],
  ["/solutions/permanent-recruitment", "0.7", "monthly"],
  ["/solutions/outsourcing", "0.7", "monthly"],
  ["/solutions/training", "0.6", "monthly"],
  ["/solutions/diversity-inclusion", "0.5", "monthly"],
  ["/job-seekers/working-with-us", "0.7", "monthly"],
  ["/job-seekers/faq", "0.6", "monthly"],
  ["/employers/why-us", "0.7", "monthly"],
  ["/employers/how-we-work", "0.7", "monthly"],
  ["/employers/faq", "0.6", "monthly"],
  ["/about", "0.6", "monthly"],
  ["/contact", "0.6", "monthly"],
  ["/careers", "0.4", "monthly"],
  ["/investors", "0.3", "yearly"],
];
for (const [p, pr, cf] of PAGES) add(p, pr, cf);

// 2) Specialisation (niche) + role pages
const niche = readFileSync(join(ROOT, "src/pages/niche/nicheData.ts"), "utf8");
for (const m of niche.matchAll(/^\s*slug:\s*"([a-z0-9-]+)"/gm)) add(`/specializations/${m[1]}`, "0.8", "monthly");
const roles = readFileSync(join(ROOT, "src/data/roles.ts"), "utf8");
for (const m of roles.matchAll(/\{\s*slug:\s*"([a-z0-9-]+)"\s*,\s*photo:/g)) add(`/roles/${m[1]}`, "0.7", "monthly");

// 3) Blog posts: published markdown posts (drafts excluded, same rule as the app)…
const blogDir = join(ROOT, "src/content/blogs");
for (const f of readdirSync(blogDir).filter((f) => f.endsWith(".md"))) {
  const raw = readFileSync(join(blogDir, f), "utf8");
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
  if (!/^status:\s*["']?published["']?\s*$/m.test(fm)) continue;
  const d = fm.match(/^date:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1];
  add(`/blog/${f.replace(/\.md$/, "")}`, "0.6", "monthly", d);
}
// …plus the hand-written posts in staticBlogPosts.ts
const stat = readFileSync(join(ROOT, "src/data/staticBlogPosts.ts"), "utf8");
for (const m of stat.matchAll(/^\s*slug:\s*"([a-z0-9-]+)"/gm)) add(`/blog/${m[1]}`, "0.6", "monthly");

// 4) Carry over DB-driven entries (/universities/*, /study-abroad*) from the current file.
let carried = [];
if (existsSync(OUT)) {
  const prev = readFileSync(OUT, "utf8");
  carried = [...prev.matchAll(/<url>[\s\S]*?<\/url>/g)]
    .map((m) => m[0])
    .filter((u) => /<loc>[^<]*\/(universities\/|study-abroad)/.test(u));
}
if (carried.length === 0) {
  console.error("generate-sitemap: no /universities/ or /study-abroad entries found in the existing public/sitemap.xml.");
  console.error("Refusing to overwrite it (would drop ~1,850 URLs). Restore the file from git and re-run.");
  process.exit(1);
}

// 5) Write
const own = [...entries].map(([p, e]) => {
  const loc = esc(SITE + (p === "/" ? "/" : p));
  return `  <url><loc>${loc}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ""}<changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`;
});
const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  own.join("\n") + "\n" +
  carried.map((u) => "  " + u.trim()).join("\n") + "\n" +
  `</urlset>\n`;

writeFileSync(OUT, xml, "utf8");
console.log(`generate-sitemap: wrote ${own.length + carried.length} URLs (${own.length} generated, ${carried.length} carried over) -> public/sitemap.xml  [${TODAY}]`);
