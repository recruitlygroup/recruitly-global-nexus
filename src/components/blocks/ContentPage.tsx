// Renders a PageSpec in a fixed, Adecco-style order: hero → proof → explanation → visual process → conversion.
import { useLocation } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import { SITE } from "@/config/site";
import EmployerDashboardCTA from "@/components/EmployerDashboardCTA";
import { ApplyOptions, Checklists, Comparison, CtaBar, Faqs, FeatureGrid, FlowChart, Hero, Intro, Notice, Partners, Related, Section, StatBand, Timeline } from "./index";
import { useMemo } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { translateDeep } from "@/i18n/translateDeep";
import { PAGE_BG } from "@/i18n/pageStrings.bg";
import { DEFAULT_CLOSING } from "./defaults";
import type { PageSpec } from "./spec";

const ContentPage = ({ spec: source, noIndex = false }: { spec: PageSpec; noIndex?: boolean }) => {
  const { pathname } = useLocation();
  const { lang } = useI18n();
  const spec = useMemo(() => { const full = { ...source, closing: source.closing ?? DEFAULT_CLOSING }; return lang === "bg" ? translateDeep(full, PAGE_BG) : full; }, [source, lang]);
  useSEO({ title: spec.seo.title, description: spec.seo.description, canonicalUrl: `${SITE.url}${pathname}`, noIndex });
  return (
    <div className="bg-background">
      <Hero hero={spec.hero} />
      {spec.notice && <Notice {...spec.notice} />}
      {spec.stats && <StatBand items={spec.stats} />}
      {spec.intro && <Intro intro={spec.intro} />}
      {spec.features && <FeatureGrid f={spec.features} />}
      {spec.flow && <FlowChart f={spec.flow} />}
      {spec.partners && <Partners p={spec.partners} />}
      {spec.timeline && <Timeline t={spec.timeline} />}
      {spec.checklists && <Checklists c={spec.checklists} />}
      {spec.comparison && <Comparison c={spec.comparison} />}
      {spec.apply && <ApplyOptions />}
      {spec.employerCta && <Section><EmployerDashboardCTA /></Section>}
      {spec.faqs && <Faqs f={spec.faqs} />}
      {spec.related && <Related r={spec.related} />}
      <CtaBar {...spec.closing!} />
    </div>
  );
};
export default ContentPage;
