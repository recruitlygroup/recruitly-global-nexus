import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Hero from "@/components/Hero";
import Nexus from "@/components/Nexus";
import DivisionModal from "@/components/DivisionModal";
import wiseadmitImg from "@/assets/wiseadmit.png";
import recruitlyImg from "@/assets/recruitly.png";
import veridocsImg from "@/assets/veridocs.png";
import odysseyImg from "@/assets/odyssey.png";

const Index = () => {
  const [showNexus, setShowNexus] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);

  const divisionDetails = {
    wiseadmit: {
      id: "wiseadmit",
      title: "WiseAdmit",
      subtitle: "Student Consultancy",
      description: "Your pathway to global education excellence",
      fullDescription:
        "WiseAdmit provides comprehensive consultancy services for students seeking international education opportunities. Our expert team guides you through every step of the admission process, ensuring you make informed decisions about your academic future.",
      features: [
        "University selection and application assistance",
        "Visa guidance and documentation support",
        "Career counseling and pathway planning",
        "Scholarship and financial aid consultation",
        "Pre-departure orientation and support",
      ],
      image: wiseadmitImg,
    },
    recruitly: {
      id: "recruitly",
      title: "Recruitly",
      subtitle: "Find a Job",
      description: "Connect with opportunities that match your skills and career goals",
      fullDescription:
        "Recruitly bridges the gap between talented professionals and growing organizations. Whether you're seeking opportunities or building your team, we provide personalized recruitment solutions backed by industry expertise.",
      features: [
        "Executive search and placement services",
        "Technical and specialized recruitment",
        "Contract and permanent staffing solutions",
        "Talent pool management and screening",
        "Onboarding support and integration",
      ],
      image: recruitlyImg,
    },
    veridocs: {
      id: "veridocs",
      title: "VeriDocs",
      subtitle: "Legal & Apostille",
      description:
        "Professional document authentication and legal services across borders",
      fullDescription:
        "VeriDocs specializes in apostille services and document legalization, ensuring your important documents are recognized internationally. Our expert team handles the complex processes of authentication and translation with precision.",
      features: [
        "Apostille and document legalization",
        "Certified translation services",
        "Notarization and attestation",
        "Embassy and consular services",
        "Document verification and authentication",
      ],
      image: veridocsImg,
    },
    odyssey: {
      id: "odyssey",
      title: "Odyssey",
      subtitle: "Tours & Travels",
      description: "Curated travel experiences for unforgettable journeys",
      fullDescription:
        "Odyssey crafts exceptional travel experiences tailored to your preferences. From business trips to leisure getaways, we handle every detail to ensure smooth and memorable journeys across the globe.",
      features: [
        "Custom itinerary planning and booking",
        "Corporate event management",
        "Visa assistance and travel documentation",
        "24/7 travel support and concierge",
        "Group tours and special packages",
      ],
      image: odysseyImg,
    },
  };

  const handleDivisionClick = (divisionId: string) => {
    setSelectedDivision(divisionId);
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900" />
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {!showNexus ? (
          <Hero key="hero" onExplore={() => setShowNexus(true)} />
        ) : (
          <Nexus
            key="nexus"
            onDivisionClick={handleDivisionClick}
          />
        )}
      </AnimatePresence>

      <DivisionModal
        isOpen={selectedDivision !== null}
        onClose={() => setSelectedDivision(null)}
        division={
          selectedDivision
            ? divisionDetails[selectedDivision as keyof typeof divisionDetails]
            : null
        }
      />
    </main>
  );
};

export default Index;
