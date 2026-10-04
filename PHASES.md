# Build phases

| Phase | Scope | Status |
|---|---|---|
| 1 | Design system (Inter, tokens, buttons) + Estonia removal | ✅ done |
| 2 | Layout: scam banner, header + mega-menu, mobile drawer, language switcher, footer, cookie consent, mobile sticky CTA, route skeleton | ✅ done |
| 3 | Homepage (10 sections) | next |
| 4 | Job board + job detail + Supabase tables/RLS | |
| 5 | Programmatic landing templates (sector / city / sector×city / type / industry) + remaining content pages | |
| 6 | SEO + pre-render (vite-react-ssg), sitemap split, hreflang, JSON-LD | |
| 7 | GitHub Pages deploy (base, CNAME, workflow, 404 fallback) | |

## Phase 2 notes
- Routes marked `<ComingSoon />` in `src/App.tsx` are placeholders (noindex) replaced in phases 3–5.
- Legal pages (/terms, /privacy, /cookies, /candidate-privacy, /equal-opportunity) need real text reviewed by your lawyer.
- Old URLs redirect to the new sitemap URLs (see "Old URLs" block in App.tsx).
- New strings live in `src/i18n/messages/*.ts` (one file per phase, EN + BG together).
- `index.html` now sets Google Consent Mode defaults to "denied" before GTM; the cookie banner grants analytics only on "Accept all".
