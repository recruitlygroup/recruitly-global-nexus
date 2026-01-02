import SiteHeader from "@/components/SiteHeader";
import SmartIntentHero from "@/components/SmartIntentHero";
import SiteFooter from "@/components/SiteFooter";
import LatestInsights from "@/components/blog/LatestInsights";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      {/* Sticky Navigation */}
      <SiteHeader />

      {/* Smart Intent Hero with AI Routing */}
      <SmartIntentHero />

      {/* Latest Blog Insights */}
      <LatestInsights />

      {/* Footer with Trust Section */}
      <SiteFooter />
    </main>
  );
};

export default Index;
