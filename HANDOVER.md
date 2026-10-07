# Handover: meeting-first hiring, Cal.com scheduler, Bulgarian translation

## What changed in this round
- **Master Vendor Program (`/employers/mvp`)** rebuilt (own wording): flow, comparison table, "when to choose" checklist, rollout steps. Nav label now "Master Vendor Program".
- **Meeting-first routing**: every employer, intern, manpower and student-partner CTA now goes to `/schedule-a-call`
  (home hero, final CTA, role pages, niche programmes, manpower and intern pages, employer CTA block, all employer specs).
  Existing partners still see a small "Open the dashboard" link.
- **`/schedule-a-call`**: employer context (value proposition, 3 highlights, "what happens on the call"), topic chips
  (manpower / interns / student partnership / MVP, sent to Cal.com as notes), scheduler, FAQ.
  - `ScheduleCall mode="embed"` (default): live Cal.com iframe `https://cal.com/recruitly-group/hire-talent-consultation`.
  - `?mode=preview` (or `mode="preview"`): interactive preview (dark calendar panel, light slot panel, 15m/30m/1h,
    auto-detected timezone). Its "Confirm" opens the real Cal.com page with date/duration prefilled, so fake slots are never booked.
  - To use `@calcom/embed-react` instead, see the comment at the top of `src/components/schedule/ScheduleCall.tsx`.
  - Host name/role props: `hostName`, `hostRole` (currently "Recruitly Talent Partnerships").
- **Nepal office** added: Samakhusi, Kathmandu, near CitySquare, above Prime Bank Limited (offices, contact, scam page).
- **Placeholder stats** (`PLACEHOLDER_STATS` in `src/data/pages/company.ts`, used on About and Advantage). REPLACE with real numbers.
- **Bulgarian + English** for all pages:
  - Page copy: English lives in `src/data/pages/*.ts`; Bulgarian in `src/i18n/pageStrings.bg.ts` (English string -> Bulgarian).
  - Component text uses `useTr()` (`tr("English", "Български")`).
  - After editing any English copy run `npx tsx scripts/extract-strings.mts`, then add the new strings to `pageStrings.bg.ts`.
    A string without a Bulgarian entry simply shows in English.
  - Checked: 41 pages in EN and BG, no overflow, console errors, or untranslated lines.

## Still to do on your side
1. Legal pages: see the list sent in chat (company details needed). Remove the draft badge via `SHOW_DRAFT_BADGE` in `data/pages/legal.ts`.
2. Replace placeholder stats; add real case studies.
3. Bulgarian text was written by me. Have a native speaker read it, especially legal and recruitment terms.
4. Confirm Cal.com event settings (durations, Google Meet / Teams, availability) match the preview (15m / 30m / 1h).
