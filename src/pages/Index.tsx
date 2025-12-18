import SiteHeader from "@/components/SiteHeader";
import VideoHero from "@/components/VideoHero";
import ServicesSection from "@/components/ServicesSection";
import SiteFooter from "@/components/SiteFooter";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      {/* Sticky Navigation */}
      <SiteHeader />

      {/* Hero Section with Founder Video */}
      <VideoHero />

      {/* Services Grid */}
      <ServicesSection />

      {/* Footer with Trust Section */}
      <SiteFooter />
    </main>
  );
};

export default Index;
