import SmartIntentHero from "@/components/SmartIntentHero";
import LatestInsights from "@/components/blog/LatestInsights";
import MeetTheTeam from "@/components/MeetTheTeam";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Smart Intent Hero with AI Routing */}
      <SmartIntentHero />

      {/* Latest Blog Insights */}
      <LatestInsights />

      {/* Team Section */}
      <MeetTheTeam />
    </div>
  );
};

export default Index;
