# Australia B2B expansion — change log

Apply by copying these files over the repo (paths preserved), then:
1. `npm install` (no new dependencies) and `npm run build` (runs sitemap → build → prerender).
2. Apply the migration: `supabase db push` (creates `b2b_leads`), then deploy the function:
   `supabase functions deploy submit-b2b-lead`.
3. Add `.env` to git ignore (done in `.gitignore`); if `.env` was ever committed, run `git rm --cached .env`.
4. Run `npm run check:au` — lists every `[TODO: …]` that must be resolved before launch.

## New
- `src/config/markets.ts`, `src/config/market-routes.json` — market registry + per-route SEO meta (single source for pages, sitemap, prerender)
- `src/data/pages/australia.ts` — specs: hub, employers, agencies, sourcing overview, Nepal, Bulgaria, EU, visa hub, skilled trades
- `src/components/australia/AuAudienceForm.tsx`, `AustraliaHomeBand.tsx`
- `src/pages/australia/AustraliaPage.tsx`, `AustraliaGetStarted.tsx`
- `src/i18n/messages/australia.ts`
- `supabase/migrations/20261120000001_b2b_leads.sql`, `supabase/functions/submit-b2b-lead/index.ts`
- `scripts/prerender-routes.mjs`, `scripts/check-au-todos.mjs`, `.env.example`

## Modified
- `src/App.tsx` — 10 routes (see below); `/specializations/skilled-trades-australia` now uses the new page
- `src/hooks/useSEO.ts` — JSON-LD removed when a page has none, accepts arrays (@graph), canonical defaults to current path
- `src/components/blocks/ContentPage.tsx`, `spec.ts` — BreadcrumbList + optional extra schema per page
- `src/config/nav.ts`, `src/i18n/translations.ts` — "Australia" dropdown in the employer menu; 3 footer links
- `src/pages/Index.tsx`, `src/components/CorporateHero.tsx` — Australia band under the hero + hero link (option A)
- `scripts/generate-sitemap.mjs`, `package.json` (`postbuild`, `check:au`), `supabase/config.toml`, `.gitignore`

## Routes
/australia · /australia/for-employers · /australia/for-recruitment-agencies · /australia/sourcing ·
/australia/sourcing/{nepal,bulgaria,eu} · /australia/visa-pathways-overview · /australia/get-started ·
/specializations/skilled-trades-australia (upgraded in place) · /australia/skilled-trades → redirects to it
