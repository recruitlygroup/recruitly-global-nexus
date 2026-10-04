// src/config/images.ts — every photo used on the redesigned pages, in one place.
//
// Files live in /public/images/photos (served from /images/photos). Use 1920×1080 (16:9) JPG/WebP,
// ≤ 400 KB for full-bleed backgrounds, sRGB. See public/images/photos/README.md for the shot list.
// A missing file never breaks the layout: <BackgroundPhoto/> falls back to a brand gradient, and the
// dark overlay keeps the text legible either way.
const base = "/images/photos";

export const PHOTOS = {
  hero:        `${base}/hero-team.jpg`,        // full-width hero: global workforce & staffing (1920×1080)
  whoWeAre:    `${base}/who-we-are.jpg`,       // recruiters meeting candidates / employers (1200×900)
  ctaBanner:   `${base}/cta-banner.jpg`,       // closing CTA: handshake / team on site (1920×800)
  testimonial: `${base}/testimonials.jpg`,     // optional backdrop for the client-story block (1920×1080)
  nurses:      `${base}/nurses.jpg`,
  drivers:     `${base}/drivers.jpg`,
  hospitality: `${base}/hospitality.jpg`,
  engineers:   `${base}/engineers.jpg`,
  artisans:    `${base}/artisans.jpg`,
} as const;
