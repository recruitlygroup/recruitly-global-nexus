// Overview page behind a header dropdown ("Why Recruitly", "Our Solutions", "Our Industries", "Resources").
// Renders every sub-page of that menu as a link, straight from config/nav.ts — add a nav item and it appears here.
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PageHero from "@/components/PageHero";
import { HUB_SECTIONS } from "@/config/nav";
import { SITE } from "@/config/site";
import { useSEO } from "@/hooks/useSEO";
import { useI18n } from "@/i18n/I18nProvider";

const SectionHub = ({ id }: { id: keyof typeof HUB_SECTIONS }) => {
  const section = HUB_SECTIONS[id];
  const { t } = useI18n();
  const [overview, ...items] = section.items;
  const title = t(section.labelKey);
  useSEO({ title: `${title} | ${SITE.name}`, description: t(`hub.${id}.sub`), canonicalUrl: `${SITE.url}${overview.path}` });

  return (
    <div className="bg-background">
      <PageHero title={title} subtitle={t(`hub.${id}.sub`)} />
      <section className="page-container py-14 md:py-20" aria-label={title}>
        <ul className="grid gap-x-12 md:grid-cols-2">
          {items.map((item) => (
            <li key={item.path + item.labelKey} className="border-b border-border">
              <Link to={item.path} className="group flex items-start justify-between gap-6 py-6">
                <span>
                  <span className="block text-xl font-bold text-ink group-hover:text-primary">{t(item.labelKey)}</span>
                  {item.descKey && <span className="mt-1 block text-[15px] text-muted-foreground">{t(item.descKey)}</span>}
                </span>
                <ArrowRight className="mt-1 h-5 w-5 flex-shrink-0 text-primary transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-label={t("hub.explore")} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
export default SectionHub;
