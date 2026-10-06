// Renders a PageSpec in a fixed, Adecco-style order: hero → proof → explanation → visual process → conversion.
import { useLocation } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import { SITE } from "@/config/site";
import EmployerDashboardCTA from "@/components/EmployerDashboardCTA";
import { ApplyOptions, Checklists, Comparison, CtaBar, Faqs, FeatureGrid, FlowChart, Hero, Intro, Notice, Partners, Related, Section, StatBand, Timeline } from "./index";
import type { PageSpec } from "./spec";

const ContentPage = ({ spec, noIndex = false }: { spec: PageSpec; noIndex?: boolean }) => {
  const { pathname } = useLocation();
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
      <CtaBar {...(spec.closing ?? { title: "Talk to the Recruitly team", body: "Tell us what you need and we will reply with a clear plan and next steps.", primary: { label: "Contact us", to: "/contact" } })} />
    </div>
  );
};
export default ContentPage;
