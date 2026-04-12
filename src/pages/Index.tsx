// src/pages/Index.tsx
// ─────────────────────────────────────────────────────────────
// THE FIX: SocialProofWall was imported but never rendered.
// The <SocialProofWall /> tag was missing from the JSX return.
// Now added between HomepageHiringSection and LatestInsights.
// ─────────────────────────────────────────────────────────────

import SmartIntentHero from "@/components/SmartIntentHero";
import ShortageStatsBar from "@/components/employer/ShortageStatsBar";
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
      "immigration consultants GCC, hire talent South Asia, study abroad visa, work visa GCC, apostille services, global recruitment, talent acquisition South Asia, visa consultancy, manpower recruitment, overseas education consultancy",
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
      {/* 1. AI intent hero with smart routing */}
      <SmartIntentHero />

      {/* 2. EU shortage stats strip */}
      <ShortageStatsBar />

      {/* 3. B2B employer section */}
      <HomepageHiringSection />

      {/* 4. Social proof wall — Instagram-style curated posts
              This was the missing piece: imported but not rendered */}
      <SocialProofWall />

      {/* 5. Latest blog insights */}
      <LatestInsights />

      {/* 6. Visa success stories */}
      <VisaSuccessStories />
    </div>
  );
};

export default Index;
