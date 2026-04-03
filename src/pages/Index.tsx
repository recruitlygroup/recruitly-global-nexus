import SmartIntentHero from "@/components/SmartIntentHero";
import LatestInsights from "@/components/blog/LatestInsights";
import VisaSuccessStories from "@/components/VisaSuccessStories";
import { useSEO } from "@/hooks/useSEO";

const Index = () => {
  useSEO({
    title: "Recruitly Group | Estonia's Premier Gateway for Education, Jobs & Travel",
    description: "Recruitly Group helps you study abroad, find jobs in Europe, get apostille services, and plan your travels. Trusted by thousands across Nepal, India & beyond.",
    keywords: "study abroad Estonia, manpower recruitment Europe, apostille services, educational consultancy Nepal, jobs in Poland Romania, travel consultancy",
    canonicalUrl: "https://www.recruitlygroup.com/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Recruitly Group",
      "url": "https://www.recruitlygroup.com",
      "description": "Estonia-based consultancy offering student placement, manpower recruitment, apostille services, and travel solutions.",
      "address": { "@type": "PostalAddress", "addressCountry": "EE" },
      "contactPoint": { "@type": "ContactPoint", "contactType": "customer service", "availableLanguage": ["English", "Nepali"] }
    },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Smart Intent Hero with AI Routing */}
      <SmartIntentHero />

      {/* Latest Blog Insights */}
      <LatestInsights />

      {/* Visa Success Stories */}
      <VisaSuccessStories />
    </div>
  );
};

export default Index;
