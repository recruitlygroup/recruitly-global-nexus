// scripts/prerender-content.mjs — runs after prerender-routes.mjs ("postbuild").
//
// Writes dist/blog/<slug>/index.html for every published blog post and dist/cee/<slug>/index.html for the CEE landing pages,
// each with the correct <title>, description, canonical, Open Graph tags, JSON-LD AND the real article/page body inside #root.
// Crawlers that do not execute JavaScript (WhatsApp, Facebook, Bing, LLM crawlers) therefore see the full content.
// The React app still boots and replaces #root, so users get the normal interactive page. The static body mirrors the
// content the React page renders (same markdown, same data files) — it must never differ materially from it.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { marked } from "marked";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const SITE = "https://www.recruitlygroup.com";
const shellPath = join(DIST, "index.html");
if (!existsSync(shellPath)) { console.error("prerender-content: dist/index.html missing — run `vite build` first."); process.exit(1); }
const shell = readFileSync(shellPath, "utf8");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const setMeta = (html, attr, key, value) => {
  const re = new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`);
  return re.test(html) ? html.replace(re, `$1${esc(value)}$2`) : html;
};

function page({ title, description, url, ogType = "website", body, jsonLd = [] }) {
  let h = shell.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  h = setMeta(h, "name", "description", description);
  h = setMeta(h, "property", "og:title", title);
  h = setMeta(h, "property", "og:description", description);
  h = setMeta(h, "property", "og:url", url);
  h = setMeta(h, "property", "og:type", ogType);
  h = setMeta(h, "name", "twitter:title", title);
  h = setMeta(h, "name", "twitter:description", description);
  h = h.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);
  const ld = jsonLd.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`).join("");
  h = h.replace("</head>", `${ld}</head>`);
  return h.replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}
const write = (path, html) => { const dir = join(DIST, path); mkdirSync(dir, { recursive: true }); writeFileSync(join(dir, "index.html"), html); };
// Same safety rule as the runtime sanitiser: no scripts/styles/images in the static body.
const clean = (html) => html.replace(/<(script|style)[\s\S]*?<\/\1>/gi, "").replace(/<img[^>]*>/gi, "");
const nav = `<nav><a href="/">Home</a> · <a href="/blog">Blog</a> · <a href="/student-recruitment">Student recruitment</a> · <a href="/student-recruitment/india">Study in India</a> · <a href="/cee/result-2083">CEE result 2083</a></nav>`;

const vite = await createServer({ root: ROOT, server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
try {
  // ---- Blog posts ----
  const { normalizePost } = await vite.ssrLoadModule("/src/lib/blog-frontmatter.ts");
  const dir = join(ROOT, "src/content/blogs");
  let blogs = 0;
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".md"))) {
    const slug = f.replace(/\.md$/, "");
    const p = normalizePost(slug, readFileSync(join(dir, f), "utf8"));
    if (p.status !== "published") continue;
    const url = `${SITE}/blog/${slug}`;
    const description = (p.excerpt || p.title).slice(0, 160);
    const bodyHtml = clean(marked.parse(p.body, { async: false }));
    write(`blog/${slug}`, page({
      title: `${p.title} | Recruitly Group`, description, url, ogType: "article",
      body: `<main><article><h1>${esc(p.title)}</h1>${p.date ? `<p><time datetime="${esc(p.date)}">${esc(p.date.slice(0, 10))}</time></p>` : ""}${bodyHtml}</article>${nav}</main>`,
      jsonLd: [{ "@context": "https://schema.org", "@type": "BlogPosting", headline: p.title, description, datePublished: p.date || undefined, mainEntityOfPage: url,
        author: { "@type": "Organization", name: "Recruitly Group" }, publisher: { "@type": "Organization", name: "Recruitly Group", url: SITE } }],
    }));
    blogs++;
  }

  // ---- CEE landing pages (content from the same data files the React page uses) ----
  const { CEE_PAGES, CEE_FACTS } = await vite.ssrLoadModule("/src/data/ceePages.ts");
  const { NEPAL_COLLEGES } = await vite.ssrLoadModule("/src/data/nepalColleges.ts");
  const { MBBS_QUOTAS } = await vite.ssrLoadModule("/src/data/ceeCutoffs.ts");
  const { feeFor } = await vite.ssrLoadModule("/src/lib/ceePredictor.ts");
  const table = (head, rows) => `<table><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  for (const pg of CEE_PAGES) {
    const url = `${SITE}/cee/${pg.slug}`;
    const progs = pg.program ? [pg.program] : Object.keys(CEE_FACTS);
    let body = `<h1>${esc(pg.h1)}</h1><p>${esc(pg.subtitle)}</p>`;
    for (const p of progs) { const f = CEE_FACTS[p]; body += `<h2>${esc(p)}</h2><ul><li>Qualifying cut-off: ${f.cutoff}</li><li>Qualified candidates: ${f.qualified}</li><li>Top score: ${f.top}</li><li>MEC seats 2083/84: ${f.seats} in ${f.colleges} colleges</li><li>Result published: ${esc(f.published)}</li></ul>`; }
    if (pg.program) {
      const rows = NEPAL_COLLEGES.filter((c) => c.seats[pg.program] > 0).sort((a, b) => b.seats[pg.program] - a.seats[pg.program] || a.name.localeCompare(b.name));
      body += `<h2>All ${esc(pg.program)} colleges in Nepal (MEC 2083/84)</h2>` + table(["College", "Type", "Location", `${pg.program} seats`, "Tuition (MEC ceiling)"],
        rows.map((c) => [c.name, c.type === "public" ? "Government" : "Private", c.city ?? "", c.seats[pg.program], c.type === "public" ? "Scholarship seats free; paying seats per MEC" : feeFor(pg.program, c).text]));
      if (pg.program === "MBBS") body += `<h2>MBBS scholarship closing ranks by quota</h2>` + table(["Quota", "Seats 2082", "Closing rank 2082", "2081", "2080", "Closing score 2082"],
        MBBS_QUOTAS.map((q) => [q.name, q.seats2082, q.y2082[1], q.y2081[1], q.y2080[1], q.y2082[0]]));
    }
    body += `<h2>Frequently asked questions</h2>` + pg.faqs.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join("");
    write(`cee/${pg.slug}`, page({
      title: pg.title, description: pg.description, url, body: `<main>${body}${nav}</main>`,
      jsonLd: [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: pg.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }],
    }));
  }
  console.log(`prerender-content: wrote ${blogs} blog posts + ${CEE_PAGES.length} CEE pages with full static bodies`);
} finally {
  await vite.close();
}
