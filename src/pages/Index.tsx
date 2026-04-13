// src/pages/Index.tsx
// ─────────────────────────────────────────────────────────────
// REMOVED: ShortageStatsBar (400K+ EU Driver Vacancies section)
// as requested. Component import also removed.
// ─────────────────────────────────────────────────────────────

import SmartIntentHero from "@/components/SmartIntentHero";
import HomepageHiringSection from "@/components/employer/HomepageHiringSection";
import SocialProofWall from "@/components/SocialProofWall";
import LatestInsights from "@/components/blog/LatestInsights";
import VisaSuccessStories from "@/components/VisaSuccessStories";
import { useSEO } from "@/hooks/useSEO";

const Index = () => {
  useSEO({
    title: "Recruitly Group | Immigration & Global Talent Acquisition | GCC & South Asia",
    description:
      "Global immigration consultancy & talent acquisition partner — Study Abroad, Work Visas, Hire Top Talent from South Asia & GCC, Apostille Services. Trusted by employers and students worldwide.",
    keywords:
      "immigration consultants GCC, hire talent South Asia, study abroad visa, work visa GCC, apostille services, global recruitment, talent acquisition South Asia, visa consultancy, manpower recruitment",
    canonicalUrl: "https://www.recruitlygroup.com/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Recruitly Group",
      url: "https://www.recruitlygroup.com",
      description:
        "Global immigration consultancy and talent acquisition partner specialising in Study Abroad, Work Visas, Talent Sourcing from South Asia & GCC, and Apostille Services.",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        availableLanguage: ["English", "Nepali", "Hindi", "Arabic"],
      },
    },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* AI-powered intent hero */}
      <SmartIntentHero />

      {/* B2B employer hiring form — renders immediately below hero */}
      <HomepageHiringSection />

      {/* Social proof wall — Instagram-style curated posts */}
      <SocialProofWall />

      {/* Latest blog insights */}
      <LatestInsights />

      {/* Visa success stories */}
      <VisaSuccessStories />
    </div>
  );
};

export default Index;
