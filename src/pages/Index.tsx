/**
 * src/pages/Index.tsx  ← REPLACE existing file
 */
import SmartIntentHero from "@/components/SmartIntentHero";
import ShortageStatsBar from "@/components/employer/ShortageStatsBar";
import HomepageHiringSection from "@/components/employer/HomepageHiringSection";
import LatestInsights from "@/components/blog/LatestInsights";
import VisaSuccessStories from "@/components/VisaSuccessStories";
import { useSEO } from "@/hooks/useSEO";

const Index = () => {
  useSEO({
    title: "Nepal Talent Sourcing for EU Employers | Truck Drivers, Caregivers & Trades – Recruitly Group",
    description:
      "Recruitly Group supplies pre-vetted Nepali workers to European employers and agencies. Truck drivers, caregivers, welders delivered visa-ready in 4–6 weeks. Germany, Bulgaria, Romania specialist.",
    keywords:
      "Nepal talent sourcing Germany, truck driver recruitment EU Nepal, caregiver sourcing Europe, manpower agency Nepal EU, Bulgaria driver shortage Nepal, Romania logistics recruitment, visa-ready workers Europe, Nepali workers Germany, blue-collar sourcing EU",
    canonicalUrl: "https://www.recruitlygroup.com/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Recruitly Group",
      url: "https://www.recruitlygroup.com",
      description: "Estonia-registered sourcing partner supplying pre-vetted Nepali talent to European employers — truck drivers, caregivers, skilled trades.",
      address: { "@type": "PostalAddress", addressCountry: "EE" },
      contactPoint: { "@type": "ContactPoint", contactType: "customer service", availableLanguage: ["English", "Nepali"] },
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <SmartIntentHero />
      <ShortageStatsBar />
      <HomepageHiringSection />
      <LatestInsights />
      <VisaSuccessStories />
    </div>
  );
};

export default Index;
