// src/components/SiteFooter.tsx
// Dark mega-footer (#0F172A) mirroring the header hierarchy + registered address.
import { Link } from "react-router-dom";
import { Linkedin, Instagram, Mail, Phone, Youtube, MapPin, ExternalLink } from "lucide-react";
import recruitlyLogo from "@/assets/recruitly-logo.png";
import { useI18n } from "@/i18n/I18nProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { NAV_GROUPS, PILLARS, APOSTILLE_SEWA_URL } from "@/config/nav";

const SOCIALS = [
  { href: "https://linkedin.com/in/recruitly-group-1095b13a2", label: "LinkedIn",  icon: Linkedin },
  { href: "https://instagram.com/recruitlygroup",              label: "Instagram", icon: Instagram },
  { href: "https://www.youtube.com/@recruitlygroup",           label: "YouTube",   icon: Youtube },
];

const SiteFooter = () => {
  const { t } = useI18n();
  const linkCls = "text-sm text-slate-300 hover:text-white transition-colors";

  return (
    <footer className="bg-[#0F172A] text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-8">
        {/* Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-slate-700/50 rounded-md overflow-hidden mb-12">
          {PILLARS.map((p) => (
            <Link key={p.path} to={p.path} className="bg-[#0F172A] hover:bg-slate-800 transition-colors px-6 py-5 text-white font-extrabold text-sm flex items-center justify-between">
              {t(p.labelKey)}
              <span className="text-accent" aria-hidden>→</span>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-12 gap-8">
          <div className="col-span-2 md:col-span-4">
            <div className="flex items-center gap-2.5 mb-4">
              <img src={recruitlyLogo} alt="Recruitly Group" className="h-10 w-10 object-contain rounded bg-white p-1" />
              <span className="text-lg font-extrabold text-white">Recruitly Group</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">{t("footer.registered")}</p>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-accent" />{t("footer.address")}</li>
              <li><a href="mailto:info@recruitlygroup.com" className="flex items-center gap-2 hover:text-white"><Mail className="w-4 h-4 text-accent" />info@recruitlygroup.com</a></li>
              <li><a href="https://wa.me/9779743208282" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white"><Phone className="w-4 h-4 text-accent" />+977 974 320 8282</a></li>
            </ul>
            <div className="flex gap-2 mt-5">
              {SOCIALS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`Recruitly Group on ${s.label}`}
                   className="w-9 h-9 rounded bg-slate-800 hover:bg-accent hover:text-white flex items-center justify-center transition-colors">
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {NAV_GROUPS.map((g) => (
            <div key={g.labelKey} className="md:col-span-2">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-4">{t(g.labelKey)}</h4>
              <ul className="space-y-2.5">
                {g.links.map((l) => (
                  <li key={l.labelKey + l.path}>
                    {l.external ? (
                      <a href={l.path} target="_blank" rel="noopener noreferrer" className={linkCls}>{t(l.labelKey)}</a>
                    ) : (
                      <Link to={l.path} className={linkCls}>{t(l.labelKey)}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Apostille partner */}
        <div className="mt-10 rounded-md border border-slate-700 px-5 py-4 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p>
            {t("apostille.text")} <strong className="text-white">Apostille Sewa Nepal</strong>.
          </p>
          <a href={APOSTILLE_SEWA_URL} target="_blank" rel="noopener noreferrer"
             className="inline-flex items-center gap-1.5 text-white font-bold hover:text-accent whitespace-nowrap">
            {t("apostille.cta")} <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Recruitly Group. {t("footer.rights")}</p>
          <LanguageSwitcher dark />
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
