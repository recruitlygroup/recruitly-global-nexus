import SmartIntentHero from "@/components/SmartIntentHero";
import LatestInsights from "@/components/blog/LatestInsights";
import VisaSuccessStories from "@/components/VisaSuccessStories";
import MeetTheTeam from "@/components/MeetTheTeam";
import TrustAndCredibility from "@/components/TrustAndCredibility";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SmartIntentHero />
      <TrustAndCredibility />
      <VisaSuccessStories />
      <MeetTheTeam />
      <LatestInsights />
    </div>
  );
};

export default Index;
