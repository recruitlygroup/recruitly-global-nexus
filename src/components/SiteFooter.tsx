// Site footer: brand + contact, 4 link columns (Candidates / Employers / Industries / Company),
// solutions row, programmes row, office directory, socials, legal strip, cookie settings.
import { Link } from "react-router-dom";
import { Linkedin, Instagram, Youtube, Mail, Phone, MapPin, ExternalLink, ShieldAlert, ArrowRight, type LucideIcon } from "lucide-react";
import logo from "@/assets/recruitly-logo.webp";
import { useI18n } from "@/i18n/I18nProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { openCookieSettings } from "@/components/layout/CookieConsent";
import { FOOTER_COLUMNS, FOOTER_SOLUTIONS, LEGAL_LINKS, PILLARS, APOSTILLE_SEWA_URL, type NavItem } from "@/config/nav";
import { SITE } from "@/config/site";

const SOCIAL_ICONS: Record<string, LucideIcon> = { LinkedIn: Linkedin, Instagram, YouTube: Youtube };

const SiteFooter = () => {
  const { t } = useI18n();
  const linkCls = "text-sm text-slate-300 transition-colors hover:text-white focus-visible:text-white";

  const renderLink = (l: NavItem) =>
    l.external ? (
      <a href={l.path} target="_blank" rel="noopener noreferrer" className={`${linkCls} inline-flex items-center gap-1`}>
        {t(l.labelKey)} <ExternalLink className="h-3 w-3 opacity-60" aria-hidden />
      </a>
    ) : (
      <Link to={l.path} className={linkCls}>{t(l.labelKey)}</Link>
    );

  return (
    <footer className="mt-auto bg-slate-900 text-slate-300">
      <div className="page-container pb-8 pt-14">
        {/* Brand + link columns */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-12">
          <div className="col-span-2 md:col-span-4">
            <Link to="/" className="mb-4 inline-flex items-center gap-3" aria-label={t("header.home")}>
              <img src={logo} alt="" width={44} height={44} loading="lazy" className="h-11 w-11 rounded-full bg-white" />
              <span className="text-lg font-extrabold text-white">{SITE.name}</span>
            </Link>
            <p className="mb-2 text-sm font-semibold text-white">{t("footer.tagline")}</p>
            <p className="mb-5 text-sm leading-relaxed">{t("footer.registered")}</p>
            <address className="not-italic">
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-start gap-2.5"><MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber" aria-hidden />{t("footer.address")}</li>
                <li><a href={`mailto:${SITE.email}`} className="flex items-center gap-2.5 hover:text-white"><Mail className="h-4 w-4 text-amber" aria-hidden />{SITE.email}</a></li>
                <li><a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 hover:text-white"><Phone className="h-4 w-4 text-amber" aria-hidden />{SITE.phoneDisplay}</a></li>
              </ul>
            </address>
            <Link to="/offices" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-amber hover:text-white">
              {t("footer.offices")} <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <ul className="mt-5 flex gap-2">
              {SITE.socials.map((s) => {
                const Icon = SOCIAL_ICONS[s.label];
                return (
                  <li key={s.label}>
                    <a
                      href={s.href} target="_blank" rel="noopener noreferrer"
                      aria-label={`${t("footer.social")} ${s.label}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 transition-colors hover:bg-primary hover:text-white"
                    >
                      {Icon && <Icon className="h-4 w-4" aria-hidden />}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <nav key={col.headingKey} aria-labelledby={`f-${col.headingKey}`} className={col.twoCol ? "col-span-2 md:col-span-3" : "md:col-span-2"}>
              <h2 id={`f-${col.headingKey}`} className="eyebrow mb-4 text-white">{t(col.headingKey)}</h2>
              <ul className={col.twoCol ? "grid grid-cols-2 gap-x-4 gap-y-2.5 md:grid-cols-1" : "space-y-2.5"}>
                {col.items.map((l) => <li key={l.path + l.labelKey}>{renderLink(l)}</li>)}
              </ul>
            </nav>
          ))}
        </div>

        {/* Solutions + programmes */}
        <div className="mt-12 grid gap-8 border-t border-slate-700/70 pt-8 md:grid-cols-2">
          <nav aria-labelledby="f-solutions">
            <h2 id="f-solutions" className="eyebrow mb-3 text-white">{t("footer.solutions")}</h2>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {FOOTER_SOLUTIONS.map((l) => <li key={l.path}>{renderLink(l)}</li>)}
            </ul>
          </nav>
          <nav aria-labelledby="f-pillars">
            <h2 id="f-pillars" className="eyebrow mb-3 text-white">{t("footer.pillars")}</h2>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {PILLARS.map((l) => <li key={l.path}>{renderLink(l)}</li>)}
            </ul>
          </nav>
        </div>

        {/* Scam notice + Apostille partner */}
        <div className="mt-8 flex flex-col gap-4 rounded-xl border border-slate-700 px-5 py-4 text-sm md:flex-row md:items-center md:justify-between">
          <p className="flex items-start gap-2.5">
            <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber" aria-hidden />
            <span>{t("banner.body")} <strong className="text-white">@{SITE.domain}</strong>.{" "}
              <Link to="/security-and-scams" className="font-semibold text-amber hover:text-white">{t("banner.link")}</Link></span>
          </p>
          <a href={APOSTILLE_SEWA_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 whitespace-nowrap font-semibold text-white hover:text-amber">
            {t("apostille.cta")} <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>

        {/* Legal strip */}
        <div className="mt-8 flex flex-col gap-4 border-t border-slate-700/70 pt-6 pb-20 text-xs text-slate-400 lg:flex-row lg:items-center lg:justify-between lg:pb-0">
          <p>© {new Date().getFullYear()} {SITE.name}. {t("footer.rights")}</p>
          <nav aria-label={t("footer.legalNav")}>
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {LEGAL_LINKS.map((l) => (
                <li key={l.path}><Link to={l.path} className="hover:text-white">{t(l.labelKey)}</Link></li>
              ))}
              <li>
                <button type="button" onClick={openCookieSettings} className="hover:text-white underline-offset-2 hover:underline">
                  {t("footer.cookieSettings")}
                </button>
              </li>
            </ul>
          </nav>
          <LanguageSwitcher dark className="self-start lg:self-auto" />
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
