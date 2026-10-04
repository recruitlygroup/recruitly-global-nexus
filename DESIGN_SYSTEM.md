# Recruitly Group — Design System (Phase 1 + Adecco-inspired refresh)

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

## Adecco-inspired refresh (header, homepage)
- **Crisp, corporate**: sharp `rounded-sm` corners on new marketing components, hairline dividers instead of boxed cards,
  bold sans headlines (Inter 700–800), generous whitespace, sentence-case body copy.
- **`ink` token** (`--ink`, `text-ink` / `bg-ink`): deep navy-black for the audience bar, headings on white and every photo overlay.
- **Photo rule**: any text on a photo goes through `<BackgroundPhoto overlay="left|bottom|flat" />` (semi-transparent ink
  gradient). Never place text directly on an un-overlaid image. Photos are 1920×1080; slots are listed in
  `src/config/images.ts` and `public/images/photos/README.md`.
- **Header**: tier 1 = audience switcher (Student / Manpower / Intern, active tab is white and joins tier 2);
  tier 2 = logo, audience navigation, FAQ, Resources, Search, Contact. Menus live in `src/config/nav.ts` (`MENUS`).
  The employer dropdowns show under Manpower Recruitment and on the homepage.
- **CTA colours on photos**: `amber` fill with dark text (primary), white outline (secondary).
