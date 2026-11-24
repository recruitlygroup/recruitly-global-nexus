// Minimal GTM dataLayer helper. GTM + Google Consent Mode already run site-wide (index.html / CookieConsent), so events pushed
// here only become GA4/Ads hits when the visitor has consented. NEVER put personal data (name, phone, email) in params.
declare global { interface Window { dataLayer?: unknown[] } }

export function track(event: string, params: Record<string, string | number | boolean | undefined> = {}) {
  try {
    (window.dataLayer = window.dataLayer || []).push({ event, ...params });
  } catch { /* analytics must never break the page */ }
}
