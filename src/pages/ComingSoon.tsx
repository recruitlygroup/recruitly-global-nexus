// Temporary page for sitemap routes that are built in later phases. Always noindex.
// Every route using this is replaced by its real page in Phase 3–5; nothing here is final copy.
import { Link, useLocation } from "react-router-dom";
import { Mail, MessageCircle, Search } from "lucide-react";
import PageHero from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import { useI18n } from "@/i18n/I18nProvider";
import { findNavLabelKey } from "@/config/nav";
import { SITE } from "@/config/site";

const humanize = (path: string) =>
  (path.split("/").filter(Boolean).pop() ?? "").replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());

const ComingSoon = () => {
  const { pathname } = useLocation();
  const { t } = useI18n();
  const key = findNavLabelKey(pathname);
  const title = key ? t(key) : humanize(pathname);

  useSEO({
    title: `${title} | ${SITE.name}`,
    description: t("soon.body"),
    canonicalUrl: `${SITE.url}${pathname}`,
    noIndex: true,
  });

  return (
    <>
      <PageHero eyebrow={t("soon.eyebrow")} title={title} subtitle={t("soon.body")} />
      <section className="section">
        <div className="page-container flex max-w-3xl flex-wrap gap-3">
          <Button asChild><Link to="/jobs"><Search aria-hidden />{t("nav.searchJobs")}</Link></Button>
          <Button asChild variant="secondary"><a href={`mailto:${SITE.email}`}><Mail aria-hidden />{t("soon.email")}</a></Button>
          <Button asChild variant="secondary"><a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden />{t("soon.whatsapp")}</a></Button>
          <Button asChild variant="tertiary"><Link to="/">{t("soon.home")}</Link></Button>
        </div>
      </section>
    </>
  );
};

export default ComingSoon;
