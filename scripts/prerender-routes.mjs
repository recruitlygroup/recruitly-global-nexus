// scripts/prerender-routes.mjs — runs after `vite build` ("postbuild").
//
// The app is a client-side SPA, so every URL initially serves the homepage's <head>. Social scrapers
// (LinkedIn, WhatsApp, Facebook, Slack) and non-rendering crawlers never run JavaScript and would show the
// homepage card for every page. This script writes dist/<route>/index.html for each market route with the
// correct title, description, canonical, Open Graph and Twitter tags, plus a <noscript> summary with links.
// The React app still boots and takes over; hosts that serve /<route>/index.html get correct heads for free.
//
// Source of truth: src/config/market-routes.json (shared with the pages and the sitemap).
// NOTE: this fixes the <head> only. Full HTML body prerendering would need vite-react-ssg (PHASES.md, phase 6).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const SITE = "https://www.recruitlygroup.com";
const routes = JSON.parse(readFileSync(join(ROOT, "src/config/market-routes.json"), "utf8"));

const shellPath = join(DIST, "index.html");
if (!existsSync(shellPath)) { console.error("prerender: dist/index.html not found — run `vite build` first."); process.exit(1); }
const shell = readFileSync(shellPath, "utf8");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const setMeta = (html, attr, key, value) => {
  const re = new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`);
  if (!re.test(html)) { console.warn(`prerender: <meta ${attr}="${key}"> not found in shell`); return html; }
  return html.replace(re, `$1${esc(value)}$2`);
};

let count = 0;
for (const [path, m] of Object.entries(routes)) {
  const url = `${SITE}${path}`;
  let html = shell;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(m.title)}</title>`);
  html = setMeta(html, "name", "description", m.description);
  html = setMeta(html, "property", "og:title", m.title);
  html = setMeta(html, "property", "og:description", m.description);
  html = setMeta(html, "property", "og:url", url);
  html = setMeta(html, "name", "twitter:title", m.title);
  html = setMeta(html, "name", "twitter:description", m.description);
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);
  const siblings = Object.entries(routes).filter(([p]) => p !== path).map(([p, r]) => `<li><a href="${p}">${esc(r.title)}</a></li>`).join("");
  html = html.replace('<div id="root"></div>', `<div id="root"></div><noscript><h1>${esc(m.title)}</h1><p>${esc(m.description)}</p><ul>${siblings}</ul></noscript>`);
  const dir = join(DIST, path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html);
  count++;
}
console.log(`prerender: wrote ${count} route heads`);
