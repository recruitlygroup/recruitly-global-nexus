// src/pages/Index.tsx — corporate homepage
import { Link } from "react-router-dom";
import { GraduationCap, Users, Briefcase } from "lucide-react";
import CorporateHero from "@/components/CorporateHero";
import RolesGrid from "@/components/RolesGrid";
import EmployerDashboardCTA from "@/components/EmployerDashboardCTA";
import ExternalPartnerBanner from "@/components/ExternalPartnerBanner";
import LatestInsights from "@/components/blog/LatestInsights";
import VisaSuccessStories from "@/components/VisaSuccessStories";
import { useSEO } from "@/hooks/useSEO";
import { useI18n } from "@/i18n/I18nProvider";

const PILLAR_CARDS = [
  { key: "pillar.student",  path: "/student-recruitment",  icon: GraduationCap, body: "Admission guidance and eligibility scoring powered by WiseScore AI." },
  { key: "pillar.manpower", path: "/manpower-recruitment", icon: Users,         body: "Skilled workers for EU employers, routed through the Employer Dashboard." },
  { key: "pillar.intern",   path: "/intern-recruitment",   icon: Briefcase,     body: "Trained hospitality and engineering interns for EU and global employers." },
];

const Index = () => {
  const { t } = useI18n();
  useSEO({
    title: "Recruitly Group | Registered Recruitment Agency in Sofia, Bulgaria",
    description:
      "Recruitly Group is an officially registered recruitment agency in Sofia, Bulgaria — student, manpower and intern recruitment for EU and global employers.",
    canonicalUrl: "https://www.recruitlygroup.com/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "EmploymentAgency",
      name: "Recruitly Group",
      url: "https://www.recruitlygroup.com",
      address: { "@type": "PostalAddress", streetAddress: "Strandscha St 44", postalCode: "1303", addressLocality: "Sofia", addressCountry: "BG" },
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <CorporateHero />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 space-y-16">
        <section className="grid md:grid-cols-3 gap-6">
          {PILLAR_CARDS.map((p) => (
            <Link key={p.path} to={p.path} className="bg-white border border-border border-t-4 border-t-accent rounded-md p-6 hover:shadow-lg transition-shadow">
              <p.icon className="w-7 h-7 text-primary mb-4" />
              <h2 className="text-xl font-extrabold text-primary mb-2">{t(p.key)}</h2>
              <p className="text-slate-600 text-sm leading-relaxed">{p.body}</p>
            </Link>
          ))}
        </section>

        <RolesGrid />
        <EmployerDashboardCTA />
      </div>

      <LatestInsights />
      <VisaSuccessStories />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14"><ExternalPartnerBanner /></div>
    </div>
  );
};

export default Index;
