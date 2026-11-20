// scripts/check-au-todos.mjs — lists every unresolved [TODO: …] in the Australia content/config.
// Run before launch:  npm run check:au   (exits 1 if any remain, so it can gate CI).
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FILES = ["src/data/pages/australia.ts", "src/config/markets.ts", "supabase/functions/submit-b2b-lead/index.ts"];
let n = 0;
for (const f of FILES) readFileSync(join(ROOT, f), "utf8").split("\n").forEach((line, i) => {
  const m = line.match(/\[TODO:[^\]]*\]?/); if (m) { n++; console.log(`${f}:${i + 1}  ${m[0].slice(0, 110)}`); }
});
console.log(n ? `\n${n} unresolved TODO(s). Resolve or remove before launch.` : "No unresolved Australia TODOs.");
process.exit(n ? 1 : 0);
