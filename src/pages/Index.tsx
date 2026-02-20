import SmartIntentHero from "@/components/SmartIntentHero";
import LatestInsights from "@/components/blog/LatestInsights";
import VisaSuccessStories from "@/components/VisaSuccessStories";

const Index = () => {
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
