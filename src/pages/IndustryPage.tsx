// /industries/:industry — built from data/pages/industries.ts and rendered with the shared blocks.
import { Navigate, useParams } from "react-router-dom";
import ContentPage from "@/components/blocks/ContentPage";
import type { PageSpec } from "@/components/blocks/spec";
import { EMPLOYER_DASHBOARD_URL } from "@/config/nav";
import { findIndustry, type Industry } from "@/data/pages/industries";

const toSpec = (i: Industry): PageSpec => ({
  seo: { title: `${i.title} Recruitment | Recruitly Group`, description: i.lead },
  hero: { eyebrow: "Industries", title: `${i.title} recruitment`, lead: i.lead, primary: { label: "Open Employer Dashboard", href: EMPLOYER_DASHBOARD_URL }, secondary: { label: "Request talent", to: "/employers/request-talent" }, journey: { title: `Hiring in ${i.title.toLowerCase()}`, steps: i.journey } },
  notice: i.note ? { tone: "info", title: "Sourced to order", body: i.note } : undefined,
  features: { title: `Roles we recruit for in ${i.title.toLowerCase()}`, cols: 3, items: i.roles.map((r) => ({ icon: r.icon, title: r.title, body: r.body })) },
  flow: { title: "How a hire works", nodes: [
    { title: i.journey[0], icon: "clipboard", body: "You share the role, numbers and dates." },
    { title: "Sourcing and screening", icon: "search", body: "Bulgaria, Nepal, South Asia and the EU." },
    { title: "Candidate files and video demos", icon: "video", body: "See qualifications and skills first." },
    { title: "Documents attested", icon: "stamp", kind: "partner", tag: "Apostille Sewa", body: "Ward, MOFA and embassy steps." },
    { title: "Arrival and onboarding", icon: "plane", kind: "end", body: "Travel and first-weeks support." },
  ] },
  related: { title: "Related", items: [...i.roleLinks, { label: "All industries", to: "/industries" }] },
  employerCta: true,
});

const IndustryPage = () => {
  const { industry } = useParams();
  const found = findIndustry(industry);
  if (!found) return <Navigate to="/industries" replace />;
  return <ContentPage spec={toSpec(found)} />;
};
export default IndustryPage;
