// Collects every translatable English string used by page-content specs -> scripts/strings.en.json
import { writeFileSync } from "node:fs";
import { SEEKER_PAGES } from "../src/data/pages/seekers";
import { EMPLOYER_PAGES } from "../src/data/pages/employers";
import { COMPANY_PAGES } from "../src/data/pages/company";
import { LEGAL } from "../src/data/pages/legal";
import { INDUSTRIES } from "../src/data/pages/industries";
import { ROWS, REGIONS } from "../src/pages/MarketReport";
import { toSpec } from "../src/pages/IndustryPage";
import { DEFAULT_CLOSING } from "../src/components/blocks/defaults";
import { SKIP_KEYS, isTranslatable } from "../src/i18n/translateDeep";

const out = new Set<string>();
const walk = (v: unknown, key?: string) => {
  if (typeof v === "string") { if (!(key && SKIP_KEYS.has(key)) && isTranslatable(v)) out.add(v); return; }
  if (Array.isArray(v)) return v.forEach((x) => walk(x, key));
  if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, k);
};
[SEEKER_PAGES, EMPLOYER_PAGES, COMPANY_PAGES, LEGAL, INDUSTRIES, ROWS, REGIONS, DEFAULT_CLOSING].forEach((x) => walk(x));
INDUSTRIES.forEach((i) => walk(toSpec(i)));
writeFileSync("scripts/strings.en.json", JSON.stringify([...out], null, 1));
console.log("unique strings:", out.size);
