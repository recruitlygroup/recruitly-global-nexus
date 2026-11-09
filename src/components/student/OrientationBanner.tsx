// Weekly orientation notice + social links. Shown on every country hub.
import { CalendarCheck, Youtube, Instagram } from "lucide-react";
import { ORIENTATION_NOTICE, SOCIAL_LINKS } from "@/data/studyCountries";

// lucide-react has no TikTok glyph, so draw it inline.
const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M16.6 3c.3 2.3 1.7 3.9 4 4.1v3.1c-1.5.1-2.9-.4-4-1.1v6.2c0 3.2-2.4 5.7-5.6 5.7A5.6 5.6 0 0 1 5.4 15.4c0-3.4 2.9-6 6.3-5.5v3.2c-1.5-.5-3.1.5-3.1 2.2 0 1.3 1 2.3 2.3 2.3 1.4 0 2.4-1 2.4-2.5V3h3.3Z" />
  </svg>
);

const ICONS = { youtube: Youtube, instagram: Instagram, tiktok: TikTokIcon } as const;

const OrientationBanner = () => (
  <section aria-labelledby="orientation-heading" className="bg-white border border-border rounded-md p-6 md:p-8">
    <div className="grid md:grid-cols-2 gap-8 items-center">
      <div className="flex items-start gap-4">
        <span className="w-12 h-12 rounded-md bg-accent text-white flex items-center justify-center shrink-0">
          <CalendarCheck className="w-6 h-6" aria-hidden="true" />
        </span>
        <div>
          <h2 id="orientation-heading" className="text-xl md:text-2xl font-extrabold text-primary mb-2">Weekly orientation program</h2>
          <p className="text-slate-600 leading-relaxed">{ORIENTATION_NOTICE}</p>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-primary mb-3">Stay updated on our channels</p>
        <ul className="flex flex-wrap gap-3">
          {SOCIAL_LINKS.map((s) => {
            const Icon = ICONS[s.id];
            return (
              <li key={s.id}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-border rounded-md px-4 py-2.5 text-primary font-semibold hover:border-accent hover:text-accent transition-colors"
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  <span>{s.label}</span>
                  <span className="sr-only">{s.handle} (opens in a new tab)</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  </section>
);

export default OrientationBanner;
