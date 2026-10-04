# Recruitly Group — Design System (Phase 1)

## Colour tokens (HSL channels in `src/index.css`, mapped in `tailwind.config.ts`)
| Token | Hex | Use |
|---|---|---|
| `primary` | #1D4ED8 | Buttons, links, eyebrows |
| `primary-dark` | −20% lightness | Hover, dark hero bands |
| `amber` | #F59E0B | Bright accent: fills / text on dark or photo backgrounds. Use `text-amber-foreground` (dark) on top. |
| `accent` | #B45309 | Amber "ink": AA-safe as text on white and as a fill under white text. Legacy `text-accent` / `bg-accent` keep working. |
| `foreground` | #0F172A | Body text |
| `muted-foreground` | #64748B | Secondary text |
| `background` | #F8FAFC | Page surface |

Radius 12px (`rounded-lg`). Soft card shadow + hover lift via `.card-lift`.

## Type — Inter 400/500/600/700/800 (fallback Helvetica Neue, Arial)
- H1 36→56px / 800, H2 28→36px / 700, H3 20→24px / 700 (fluid `clamp`, set globally)
- Body 16px / 400 / 1.6 · `.lead` 18px
- `.eyebrow` — 12px / 600 / uppercase / 0.12em tracking (`.eyebrow-on-dark` for dark bands)

## Buttons (`<Button variant=…>`)
- `default` — primary, solid blue
- `secondary` — outline (brand blue)
- `tertiary` — text + animated arrow
- `amber` — CTA on photos / dark bands
- `outline` — neutral, kept for admin dashboards

## Layout helpers
`.page-container`, `.section`, `.section-sm`, `.card-lift`

## Rules going forward
- Sentence-case headings, one H1 per page.
- New code uses tokens, never raw hex (the admin dashboards still use `#0a192f` / `#fbbf24`; they are out of scope).
- Every new string goes in BOTH `en` and `bg` in `src/i18n/translations.ts`.
