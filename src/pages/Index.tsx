import SmartIntentHero from "@/components/SmartIntentHero";
import LatestInsights from "@/components/blog/LatestInsights";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Smart Intent Hero with AI Routing */}
      <SmartIntentHero />

      {/* Latest Blog Insights */}
      <LatestInsights />
    </div>
  );
};

export default Index;
