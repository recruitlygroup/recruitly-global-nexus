import SiteHeader from "@/components/SiteHeader";
import SmartIntentHero from "@/components/SmartIntentHero";
import SiteFooter from "@/components/SiteFooter";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      {/* Sticky Navigation */}
      <SiteHeader />

      {/* Smart Intent Hero with AI Routing */}
      <SmartIntentHero />

      {/* Footer with Trust Section */}
      <SiteFooter />
    </main>
  );
};

export default Index;
