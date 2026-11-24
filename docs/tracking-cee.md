# CEE predictor: conversion tracking (GTM)

The site already loads Google Tag Manager (`GTM-MW5QW8XS`) with Google Consent Mode, so these events only
become GA4 / Google Ads hits for visitors who accepted cookies. No personal data is ever sent.

## Events pushed to `dataLayer`

| Event | When | Parameters |
|---|---|---|
| `cee_lookup` | Student gets a result | `program`, `lookup_by` (roll/rank/score), `qualified`, `nepal_tier` |
| `generate_lead` | Lead saved (also on successful retry) | `market`=`nepal_cee`, `program`, `nepal_tier`, `budget`, `category` |
| `cee_seat_booking_click` | Clicked "Book My Seat for NPR 0" (WhatsApp) | `destination`, `program`, `nepal_tier`, `preference` |
| `cee_print_report` | Clicked Save / Print | `program` |
| `cee_lead_save_failed` | Lead could not be saved | `program` (watch this: it means lost leads) |

`generate_lead` is the same event name the Australia form already uses, distinguished by `market`.

## One-time setup in GTM (about 15 minutes)

1. **Variables** (Data Layer Variable): `program`, `nepal_tier`, `budget`, `market`, `lookup_by`.
2. **Triggers** (Custom Event): one each for `cee_lookup`, `generate_lead`, `cee_seat_booking_click`, `cee_print_report`.
3. **GA4 Event tags** using your GA4 configuration tag: event name = the dataLayer event, with the variables above as parameters.
4. In GA4: **Admin → Events → mark `generate_lead` and `cee_seat_booking_click` as key events** (conversions).
5. **Google Ads** (when running ads): import those key events as conversions, or add Conversion tags on the same triggers.
   Use `cee_seat_booking_click` as the primary conversion and `generate_lead` as secondary.
6. **Meta Pixel** (when running Facebook/Instagram ads): add the Pixel base tag in GTM and fire `Lead` on `generate_lead`.
7. Test with GTM **Preview** mode: submit a test lead and confirm each event fires.

## What to look at weekly
- Leads per source/medium (GA4 → Reports → Acquisition) for `generate_lead`.
- `cee_lookup` → `generate_lead` ratio (should be close to 1 because the form is the gate).
- `generate_lead` → `cee_seat_booking_click` ratio: how many leads are warm.
- Any `cee_lead_save_failed` events.
