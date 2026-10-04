// src/pages/Index.tsx — corporate homepage
// Order: hero → who we are → roles carousel → employer dashboard CTA → latest insights →
//        client testimonials → partner banner → closing CTA (directly above the footer).
import CorporateHero from "@/components/CorporateHero";
import WhoWeAre from "@/components/WhoWeAre";
import RolesGrid from "@/components/RolesGrid";
import EmployerDashboardCTA from "@/components/EmployerDashboardCTA";
import ExternalPartnerBanner from "@/components/ExternalPartnerBanner";
import LatestInsights from "@/components/blog/LatestInsights";
import ClientTestimonials from "@/components/ClientTestimonials";
import FinalCTA from "@/components/FinalCTA";
import { useSEO } from "@/hooks/useSEO";

const Index = () => {
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
    <div className="bg-background">
      <CorporateHero />
      <WhoWeAre />

      <div className="page-container space-y-16 py-16 md:py-24">
        <RolesGrid />
        <EmployerDashboardCTA />
      </div>

      <LatestInsights />
      <ClientTestimonials />

      <div className="page-container py-14"><ExternalPartnerBanner /></div>
      <FinalCTA />
    </div>
  );
};

export default Index;
