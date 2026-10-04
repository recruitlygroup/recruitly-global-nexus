// scripts/process-photos.mjs
// Turns any raw photos you downloaded into the exact files the site expects.
//
// 1. npm i -D sharp
// 2. Drop your downloads into /photos-raw and rename each to its slot name, e.g. nurses.jpg, drivers.png ...
// 3. npm run photos
//
// Output: public/images/photos/<slot>.jpg  (exact size, sRGB, progressive JPG, size-capped)
import sharp from "sharp";
import { readdirSync, mkdirSync, statSync } from "node:fs";
import { join, parse } from "node:path";

const SPECS = {
  "hero-team":    [1920, 1080, 400],
  "who-we-are":   [1200, 900, 250],
  "cta-banner":   [1920, 800, 300],
  "nurses":       [1600, 1200, 300],
  "drivers":      [1600, 1200, 300],
  "hospitality":  [1600, 1200, 300],
  "engineers":    [1600, 1200, 300],
  "artisans":     [1600, 1200, 300],
  "students":     [1600, 1200, 300],
  "interns":      [1600, 1200, 300],
  "testimonials": [1920, 1080, 400],
};
const IN = "photos-raw", OUT = "public/images/photos";
mkdirSync(OUT, { recursive: true });

const files = readdirSync(IN).filter((f) => /\.(jpe?g|png|webp|avif|tiff?)$/i.test(f));
const found = new Set();

for (const file of files) {
  const slot = parse(file).name.toLowerCase();
  const spec = SPECS[slot];
  if (!spec) { console.warn(`skip  ${file} (name must match a slot: ${Object.keys(SPECS).join(", ")})`); continue; }
  const [w, h, maxKB] = spec;
  const out = join(OUT, `${slot}.jpg`);
  let q = 82, size = Infinity;
  while (q >= 55) {
    await sharp(join(IN, file)).rotate()
      .resize(w, h, { fit: "cover", position: sharp.strategy.attention })
      .toColourspace("srgb").jpeg({ quality: q, mozjpeg: true, progressive: true }).toFile(out);
    size = statSync(out).size / 1024;
    if (size <= maxKB) break;
    q -= 5;
  }
  found.add(slot);
  console.log(`ok    ${slot}.jpg  ${w}x${h}  q${q}  ${Math.round(size)} KB`);
}
const missing = Object.keys(SPECS).filter((s) => !found.has(s) && s !== "testimonials");
if (missing.length) console.log(`\nstill missing: ${missing.join(", ")}`);
