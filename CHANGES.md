# Redesign changes — Adecco-inspired refresh

## Navigation (`src/config/nav.ts`, `SiteHeader.tsx`, `layout/MobileNav.tsx`, `layout/MegaMenuPanel.tsx`, `layout/HeaderSearch.tsx`)
- Header is now two tiers. Tier 1: audience switcher (Student / Manpower / Intern Recruitment). Tier 2: logo, audience menu, FAQ, Resources, Search, Contact button.
- Employer menu (Why Recruitly, How We Work, Solutions, Industries dropdowns) shows under Manpower Recruitment and on the homepage; every item/label matches the brief. Defined once in `MENUS`.
- Student and Intern views show their own short link bars (assumed — see below).
- Mobile drawer mirrors this (audience tabs, accordion, search, Contact).

## Homepage (`pages/Index.tsx`)
hero (full-width photo + overlay, existing hero text unchanged) → **Who we are** → **Roles we consistently fill** (carousel, each card links to `/roles/:slug`) → employer CTA → latest insights → **What our clients say** (video + quotes) → partner banner → **closing CTA** above the footer.
Removed: `VisaSuccessStories.tsx` and the 10 unused `visa-success-*.png` assets (~14 MB).

## New files
`BackgroundPhoto`, `WhoWeAre`, `ClientTestimonials`, `FinalCTA`, `pages/RolePage`, `pages/SectionHub`, `config/images.ts`, `data/roles.ts`, `data/clientTestimonials.ts`, `i18n/messages/home.ts` (EN + BG).

## New routes (`App.tsx`)
`/roles/:slug`, `/why-recruitly`, `/solutions`, `/industries`, `/resources`, plus placeholder pages `/employers/jobs-for-refugees`, `/employers/small-business-support`, `/employers/mvp`, `/career-center`. `/employers/industry-sectors` now redirects to `/industries`.

## Other
- `tailwind.config.ts` / `index.css`: new `ink` colour token.
- `JobBoard.tsx`: reads `?q=` so header search lands on filtered results.
- `SiteFooter.tsx`, header, drawer: logo import changed from `recruitly-logo.webp` to `recruitly-logo.png` (the `.webp` is not in the repo).
- Footer Industries/Solutions columns now follow the new menu.

## Needs your input before launch
1. **Photos** — none were added (no image access here). Drop 1920×1080 licensed files into `public/images/photos/` using the names in its README. Until then a navy gradient shows.
2. **Client quotes** — add real approved quotes to `src/data/clientTestimonials.ts`. The 3 sample quotes show in development only and are hidden in production builds. The video is the previous student testimonial; swap the YouTube id for a client video if you have one.
3. **Placeholder pages** — Jobs for Refugees, Small Business Support, MVP, Career Center, Onsite, Branches use the existing "Coming soon" page; write real content.
4. **Student/Intern menus and role-to-industry mapping** (`data/roles.ts`) are my assumptions; edit freely.
