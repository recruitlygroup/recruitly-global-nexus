// scripts/prerender-content.mjs — runs after prerender-routes.mjs ("postbuild").
//
// Writes dist/blog/<slug>/index.html for every published blog post (markdown + hand-written), dist/cee/<slug>/index.html for the CEE
// landing pages and dist/student-recruitment/<country>/index.html for the study-destination hubs,
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

function page({ title, description, url, ogType = "website", body, jsonLd = [], alternates = [], htmlLang = "en", ogImage = null, ogImageAlt = "" }) {
  let h = shell.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  h = setMeta(h, "name", "description", description);
  h = setMeta(h, "property", "og:title", title);
  h = setMeta(h, "property", "og:description", description);
  h = setMeta(h, "property", "og:url", url);
  h = setMeta(h, "property", "og:type", ogType);
  if (ogImage) {
    h = setMeta(h, "property", "og:image", ogImage);
    h = setMeta(h, "property", "og:image:alt", ogImageAlt);
    h = setMeta(h, "name", "twitter:image", ogImage);
  }
  h = setMeta(h, "name", "twitter:title", title);
  h = setMeta(h, "name", "twitter:description", description);
  h = h.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);
  h = h.replace(/<meta\s+name="keywords"[^>]*>\s*/i, ""); // the shell carries homepage (employer/GCC) keywords; drop them from content pages
  const alt = alternates.map(([l, href]) => `<link rel="alternate" hreflang="${l}" href="${href}">`).join("");
  if (htmlLang !== "en") h = h.replace(/<html lang="en"/, `<html lang="${htmlLang}"`);
  const ld = jsonLd.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`).join("");
  h = h.replace("</head>", `${alt}${ld}</head>`);
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
    const p = normalizePost(f.replace(/\.md$/, ""), readFileSync(join(dir, f), "utf8"));
    if (p.status !== "published") continue;
    const slug = p.slug; // the app routes by frontmatter slug, which can differ from the filename
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


  // ---- Hand-written posts (src/data/staticBlogPosts.ts: raw HTML bodies) ----
  const { staticBlogPosts } = await vite.ssrLoadModule("/src/data/staticBlogPosts.ts");
  let statics = 0;
  for (const p of staticBlogPosts) {
    if (existsSync(join(DIST, "blog", p.slug, "index.html"))) continue; // markdown post of the same slug wins (same as the app's merge order)
    const url = `${SITE}/blog/${p.slug}`;
    const description = (p.brief || p.title).slice(0, 160);
    const published = p.publishedAt ? new Date(p.publishedAt).toISOString() : undefined;
    write(`blog/${p.slug}`, page({
      title: `${p.title} | Recruitly Group`, description, url, ogType: "article",
      body: `<main><article><h1>${esc(p.title)}</h1>${published ? `<p><time datetime="${published}">${published.slice(0, 10)}</time></p>` : ""}${clean(p.content?.html ?? "")}</article>${nav}</main>`,
      jsonLd: [{ "@context": "https://schema.org", "@type": "BlogPosting", headline: p.title, description, datePublished: published, mainEntityOfPage: url,
        author: { "@type": "Organization", name: "Recruitly Group" }, publisher: { "@type": "Organization", name: "Recruitly Group", url: SITE } }],
    }));
    statics++;
  }

  // ---- Study-destination hubs (src/data/studyCountries.ts — same data StudentCountryHub renders) ----
  const { STUDY_COUNTRIES } = await vite.ssrLoadModule("/src/data/studyCountries.ts");
  const href = (u) => (/^https?:/.test(u) ? u : u.startsWith("/") ? u : `/${u}`);
  for (const c of STUDY_COUNTRIES) {
    const url = `${SITE}/student-recruitment/${c.slug}`;
    const title = `Study in ${c.name}: Step-by-Step Guide for Students | Recruitly Group`;
    const description = `${c.tagline} Follow our step-by-step roadmap for ${c.name}: WiseScore, documents, legalization and visa.`;
    let body = `<main><nav aria-label="Breadcrumb"><a href="/student-recruitment">Student recruitment</a> / ${esc(c.name)}</nav><h1>Study in ${esc(c.name)}</h1><p>${esc(c.tagline)}</p>`;
    if (c.slug === "india") body += `<section><h2>CEE Rank &amp; Admission Predictor</h2><p>Enter your CEE roll number, rank or score to see your exact standing in the MECEE-BL 2027 result lists and the named Nepal scholarship and paying colleges you can target, plus India and abroad alternatives. Recruitly Group charges NPR 0 for seat booking.</p><ul><li><a href="/cee/result-2083">CEE Result 2083</a></li><li><a href="/cee/mbbs-colleges-nepal">MBBS colleges in Nepal</a></li><li><a href="/cee/bds-colleges-nepal">BDS colleges in Nepal</a></li><li><a href="/cee/bsc-nursing-colleges-nepal">BSc Nursing colleges in Nepal</a></li></ul></section>`;
    if (c.slug === "slovakia") body += `<section><h2>Slovakia guides for Nepali students</h2><ul><li><a href="/cee/study-medicine-in-slovakia">Study medicine in Slovakia: fees, exam and visa</a></li><li><a href="/blog/slovak-student-visa-from-nepal-step-by-step">Slovak student visa from Nepal</a></li><li><a href="/blog/study-medicine-in-slovakia-from-nepal-is-it-worth-it">Is medicine in Slovakia worth it?</a></li><li><a href="/blog/study-in-slovakia-comenius-university">Comenius University guide</a></li><li><a href="/blog/study-in-slovakia-stu-bratislava">STU Bratislava guide</a></li></ul></section>`;
    body += `<section><h2>Why Study in ${esc(c.name)}</h2><p>${esc(c.overview.intro)}</p>${c.overview.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}${c.overview.highlights.map((h) => `<h3>${esc(h.title)}</h3><p>${esc(h.body)}</p>`).join("")}</section>`;
    body += `<section><h2>Your step-by-step application roadmap</h2><p>Follow these ${c.steps.length} steps in order. This roadmap is specific to ${esc(c.name)}.</p><ol>${c.steps.map((st) => `<li><h3>${esc(st.title)}</h3><p>${esc(st.summary)}</p><ul>${st.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>${st.links.map((l) => `<p><a href="${esc(href(l.url))}">${esc(l.label)}</a></p>`).join("")}</li>`).join("")}</ol></section>`;
    body += `<section><h2>Compare other destinations</h2><ul>${STUDY_COUNTRIES.filter((o) => o.slug !== c.slug).map((o) => `<li><a href="/student-recruitment/${o.slug}">Study in ${esc(o.name)}</a></li>`).join("")}</ul></section>${nav}</main>`;
    write(`student-recruitment/${c.slug}`, page({
      title, description, url, body,
      jsonLd: [{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Student recruitment", item: `${SITE}/student-recruitment` },
        { "@type": "ListItem", position: 2, name: `Study in ${c.name}`, item: url } ] }],
    }));
  }

  // ---- CEE landing pages (content from the same data files the React page uses) ----
  const { CEE_PAGES, CEE_FACTS } = await vite.ssrLoadModule("/src/data/ceePages.ts");
  const { NEPAL_COLLEGES } = await vite.ssrLoadModule("/src/data/nepalColleges.ts");
  const { MBBS_QUOTAS } = await vite.ssrLoadModule("/src/data/ceeCutoffs.ts");
  const { feeFor } = await vite.ssrLoadModule("/src/lib/ceePredictor.ts");
  const { NE_PAGES, NE_UI } = await vite.ssrLoadModule("/src/data/ceeCopyNe.ts");
  const { collegeContent, collegeSlug } = await vite.ssrLoadModule("/src/lib/collegeContent.ts");
  const table = (head, rows) => `<table><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c && typeof c === "object" ? `<a href="${esc(c.href)}">${esc(c.text)}</a>` : esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  const quotaRows = MBBS_QUOTAS.map((q) => [q.name, q.seats2082, q.y2082[1], q.y2081[1], q.y2080[1], q.y2082[0]]);
  let ceeCount = 0;
  for (const base of CEE_PAGES) {
    for (const lang of ["en", "ne"]) {
      const ne = lang === "ne";
      if (ne && !NE_PAGES[base.slug]) continue;
      const pg = ne ? { ...base, ...NE_PAGES[base.slug] } : base;
      const prefix = ne ? "/ne" : "";
      const url = `${SITE}${prefix}/cee/${pg.slug}`;
      const progs = pg.factsFor ?? (pg.program ? [pg.program] : Object.keys(CEE_FACTS));
      let body = `<h1>${esc(pg.h1)}</h1><p>${esc(pg.subtitle)}</p>`;
      for (const p of progs) {
        const f = CEE_FACTS[p];
        body += ne
          ? `<h2>${esc(p)}</h2><ul><li>${NE_UI.cutoff}: ${f.cutoff}</li><li>${NE_UI.qualified}: ${f.qualified}</li><li>${NE_UI.top}: ${f.top}</li><li>${esc(NE_UI.seats(String(f.seats), f.colleges))}</li><li>${NE_UI.published}: ${esc(f.published)}</li></ul>`
          : `<h2>${esc(p)}</h2><ul><li>Qualifying cut-off: ${f.cutoff}</li><li>Qualified candidates: ${f.qualified}</li><li>Top score: ${f.top}</li><li>MEC seats 2083/84: ${f.seats} in ${f.colleges} colleges</li><li>Result published: ${esc(f.published)}</li></ul>`;
      }
      if (pg.program) {
        const rows = NEPAL_COLLEGES.filter((c) => c.seats[pg.program] > 0).sort((a, b) => b.seats[pg.program] - a.seats[pg.program] || a.name.localeCompare(b.name));
        const typeLabel = (c) => (c.operator === "army" ? (ne ? "सेना-सञ्चालित" : "Army-run") : c.type === "public" ? (ne ? "सरकारी" : "Government") : (ne ? "निजी" : "Private"));
        body += `<h2>${esc(ne ? NE_UI.allColleges(pg.program) : `All ${pg.program} colleges in Nepal (MEC 2083/84)`)}</h2>` + table(
          ne ? [NE_UI.college, "प्रकार", NE_UI.location, NE_UI.seatsCol(pg.program), NE_UI.tuition] : ["College", "Type", "Location", `${pg.program} seats`, "Tuition (MEC ceiling)"],
          rows.map((c) => [{ href: `/cee/colleges/${collegeSlug(c)}`, text: c.name }, typeLabel(c), c.city ?? "", c.seats[pg.program], c.type === "public" ? (ne ? NE_UI.govFee : "Scholarship seats: subsidised fee, confirm with the college; paying seats per MEC") : feeFor(pg.program, c).text]));
        if (pg.program === "MBBS") body += `<h2>${esc(ne ? NE_UI.quotaTitle : "MBBS scholarship closing ranks by quota")}</h2>` + table(ne ? ["कोटा", "सिट २०८२", "अन्तिम र‍्याङ्क २०८२", "२०८१", "२०८०", "अन्तिम अंक २०८२"] : ["Quota", "Seats 2082", "Closing rank 2082", "2081", "2080", "Closing score 2082"], quotaRows);
      }
      if (pg.quotaTable) body += `<h2>MBBS scholarship closing ranks by quota</h2>` + table(["Quota", "Seats 2082", "Closing rank 2082", "2081", "2080", "Closing score 2082"], quotaRows);
      for (const sec of pg.sections ?? []) {
        body += `<h2>${esc(sec.h2)}</h2>` + (sec.paragraphs ?? []).map((p) => `<p>${esc(p)}</p>`).join("") + (sec.table ? table(sec.table.head, sec.table.rows) : "")
          + (sec.bullets ? `<ul>${sec.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : "")
          + (sec.links ? `<ul>${sec.links.map((l) => `<li><a href="${esc(l.to)}">${esc(l.label)}</a></li>`).join("")}</ul>` : "");
      }
      body += `<h2>${ne ? NE_UI.faq : "Frequently asked questions"}</h2>` + pg.faqs.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join("");
      const hasNe = !!NE_PAGES[base.slug];
      write(`${prefix.slice(1)}${ne ? "/" : ""}cee/${pg.slug}`.replace(/^\//, ""), page({
        title: pg.title, description: pg.description, url, body: `<main>${body}${nav}</main>`, htmlLang: ne ? "ne" : "en",
        ogImage: `${SITE}/og-cee.png`, ogImageAlt: "CEE Result 2083: check your rank, score and college chances free with Recruitly Group",
        alternates: hasNe ? [["en", `${SITE}/cee/${pg.slug}`], ["ne", `${SITE}/ne/cee/${pg.slug}`], ["x-default", `${SITE}/cee/${pg.slug}`]] : [],
        jsonLd: [{ "@context": "https://schema.org", "@type": "FAQPage", inLanguage: ne ? "ne" : "en", mainEntity: pg.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }],
      }));
      ceeCount++;
    }
  }

  // ---- One page per college (src/lib/collegeContent.ts: same generator the React page uses) ----
  let collegePages = 0;
  for (const college of NEPAL_COLLEGES) {
    const c = collegeContent(college);
    const url = `${SITE}/cee/colleges/${c.slug}`;
    let body = `<h1>${esc(c.h1)}</h1><p>${esc(c.intro)}</p><h2>${esc(college.name)} at a glance</h2>` + table(["Detail", "Information"], c.facts);
    body += `<h2>How it compares</h2><ul>${c.comparison.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
    body += `<h2>What rank do you need?</h2><ul>${c.rankNote.map((t) => `<li>${esc(t)}</li>`).join("")}</ul><p><a href="/cee/result-2083">Check my rank &amp; college chances</a></p>`;
    for (const sim of c.similar) body += `<h2>Similar ${esc(sim.program)} colleges</h2><ul>${sim.colleges.map((x) => `<li><a href="/cee/colleges/${collegeSlug(x)}">${esc(x.name)}</a> (${x.seats[sim.program]} seats)</li>`).join("")}</ul>`;
    body += `<h2>Frequently asked questions</h2>` + c.faqs.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join("");
    write(`cee/colleges/${c.slug}`, page({
      title: c.title, description: c.description, url, body: `<main>${body}${nav}</main>`,
      ogImage: `${SITE}/og-cee.png`, ogImageAlt: "CEE Result 2083: check your rank, score and college chances free with Recruitly Group",
      jsonLd: [
        { "@context": "https://schema.org", "@type": "CollegeOrUniversity", name: college.name, url, address: { "@type": "PostalAddress", ...(college.city ? { addressLocality: college.city } : {}), addressCountry: "NP" } },
        { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: c.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      ],
    }));
    collegePages++;
  }
  console.log(`prerender-content: wrote ${blogs} markdown posts + ${statics} hand-written posts + ${STUDY_COUNTRIES.length} study hubs + ${ceeCount} CEE pages (en + ne) + ${collegePages} college pages with full static bodies`);
} finally {
  await vite.close();
}
