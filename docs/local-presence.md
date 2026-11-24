# Local presence: Google Business Profile + WhatsApp Channel

## Name / Address / Phone (NAP) must match everywhere
Google compares your Business Profile with your website, directories and social pages. Mismatches lower local ranking.
**Open question (needs the owner's answer):** the site currently shows *Samakhusi, Kathmandu (near CitySquare, above Prime Bank)*
and *+977 974 320 8282*; the owner gave *Baneshwor* and *+977 982 999 7364*, Mon-Fri 9-5. Decide which is the public
student-counselling office (or whether there are two), then update: Google Business Profile, `src/config/site.ts`,
the Organization/LocalBusiness JSON-LD in `index.html`, the Contact page, the footer, Facebook/LinkedIn and any directory listing.

## Google Business Profile checklist (owner does this at business.google.com)
- Status shows **Verified** (not "Verification required"). Unverified profiles do not rank.
- Business name = legal/trading name only (no keywords added). Category: *Educational consultant* (primary) + *Study abroad consultant*.
- Address pin exactly on the Baneshwor office; opening hours Mon-Fri 9:00-17:00; phone; website `https://www.recruitlygroup.com`.
- Website link: use `https://www.recruitlygroup.com/cee/result-2083` as the Appointment/Products link and add `?utm_source=google&utm_medium=gbp` in the Website field.
- Services: MBBS/BDS/BSc Nursing counselling (Nepal and India), seat booking NPR 0, WiseScore, German pathway counselling.
- Photos (office, team, signage), logo, cover; a weekly *Update* post (CEE news with link).
- Reviews: ask real students/parents; never pay for or script them. Reply to every review.
- Q&A: pre-seed the questions parents ask (fees, "do you charge for seat booking", documents).

## WhatsApp
- **Use a Channel, not a group, for public updates.** In a group every member sees every member's phone number.
  Channel link format: `https://whatsapp.com/channel/<id>` (WhatsApp → Updates → + → New channel).
- Set `VITE_WHATSAPP_CHANNEL_URL` in the deploy environment. The button appears on `/cee/*`, `/ne/cee/*` and the predictor results; it hides itself if the value is not a Channel link.
- WhatsApp Business app on the counselling number: greeting, away message, quick replies, labels (New, Contacted, Parent, Hot).
- Message only people who agreed to hear from you.
