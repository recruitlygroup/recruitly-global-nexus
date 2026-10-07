// src/pages/ManpowerRecruitment.tsx — "Hire Top Talent" (pillar 2)
// Inline forms removed: employers and agencies are routed to dashboard.recruitlygroup.com.
import { Link } from "react-router-dom";
import { Shield, Users, Globe, Clock, Star, BadgeCheck, ArrowRight } from "lucide-react";
import PageHero from "@/components/PageHero";
import RolesGrid from "@/components/RolesGrid";
import EmployerDashboardCTA from "@/components/EmployerDashboardCTA";
import ExternalPartnerBanner from "@/components/ExternalPartnerBanner";
import { useSEO } from "@/hooks/useSEO";
import { NICHE_PAGES } from "./niche/nicheData";

// NOTE: figures below (4–6 weeks, 85% retention) were already published on the previous site — please re-verify before launch.
const WHY_EU = [
  { icon: Clock,      metric: "4–6 weeks", title: "Fast delivery",       body: "Average pipeline from brief to arrival." },
  { icon: Star,       metric: "85%+",      title: "90-day retention",    body: "Replacement offered within the placement warranty period." },
  { icon: BadgeCheck, metric: "€0",        title: "Placement fee for workers", body: "Candidates are never charged to be placed." },
  { icon: Shield,     metric: "Legal",     title: "Compliant sourcing",  body: "Bulgarian-registered agency supplying talent under applicable rules." },
  { icon: Users,      metric: "Vetted",    title: "Pre-screened talent", body: "Interviewed and document-verified before you see a profile." },
  { icon: Globe,      metric: "4 regions", title: "Bulgaria, Nepal, South Asia, EU", body: "Skilled talent from multiple source markets." },
];

const ManpowerRecruitment = () => {
  useSEO({
    title: "Hire Top Talent from Bulgaria, Nepal, South Asia & the EU | Recruitly Group",
    description:
      "Recruitly Group is a Bulgarian-registered recruitment agency legally supplying skilled drivers, nurses, hospitality staff, engineers and artisans from Bulgaria, Nepal, South Asia and EU countries.",
    canonicalUrl: "https://www.recruitlygroup.com/manpower-recruitment",
  });

  return (
    <div className="bg-background">
      <PageHero
        eyebrow="Manpower Recruitment"
        title="Hire top talent, supplied legally and fast"
        subtitle="Recruitly is a Bulgarian-registered recruitment agency capable of legally supplying skilled talent from Bulgaria, Nepal, South Asia and EU countries."
        photo="hero-team.jpg" photoAlt="Skilled workers placed by Recruitly"
      >
        <Link to="/schedule-a-call" className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-bold px-6 py-3 rounded-md">
          Book a hiring consultation <ArrowRight className="w-4 h-4" />
        </Link>
      </PageHero>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 space-y-16">
        <RolesGrid />

        <section>
          <h2 className="text-2xl md:text-3xl font-extrabold text-primary mb-8">Why EU employers choose Recruitly</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_EU.map((w) => (
              <div key={w.title} className="bg-white border border-border rounded-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <w.icon className="w-6 h-6 text-primary" />
                  <span className="bg-accent text-white text-xs font-bold px-2.5 py-1 rounded-sm">{w.metric}</span>
                </div>
                <h3 className="font-bold text-primary mb-1">{w.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{w.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl md:text-3xl font-extrabold text-primary mb-8">Specialised programmes</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {NICHE_PAGES.map((n) => (
              <Link key={n.slug} to={`/specializations/${n.slug}`} className="bg-white border border-border rounded-md p-6 hover:border-accent transition-colors group">
                <p className="text-xs font-bold text-accent uppercase tracking-wider mb-1">{n.eyebrow}</p>
                <h3 className="text-lg font-extrabold text-primary mb-2 group-hover:text-accent">{n.title}</h3>
                <p className="text-sm text-slate-600">{n.subtitle}</p>
              </Link>
            ))}
          </div>
        </section>

        <EmployerDashboardCTA />
        <ExternalPartnerBanner />
      </div>
    </div>
  );
};
export default ManpowerRecruitment;
