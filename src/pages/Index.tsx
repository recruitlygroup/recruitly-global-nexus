import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Gateway from "@/components/Gateway";
import Hero from "@/components/Hero";
import Nexus from "@/components/Nexus";
import DivisionModal from "@/components/DivisionModal";
import wiseadmitImg from "@/assets/wiseadmit.png";
import recruitlyImg from "@/assets/recruitly.png";
import veridocsImg from "@/assets/veridocs.png";
import odysseyImg from "@/assets/odyssey.png";

type UserType = "b2b" | "individual" | null;

const Index = () => {
  const [userType, setUserType] = useState<UserType>(null);
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);
  const [showGateway, setShowGateway] = useState(false);

  // Show Gateway modal after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (userType === null) {
        setShowGateway(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [userType]);

  const handleUserTypeSelect = (type: "b2b" | "individual") => {
    setUserType(type);
    setShowGateway(false);
  };

  const divisionDetails = {
    wiseadmit: {
      id: "wiseadmit",
      title: "WiseAdmit",
      subtitle:
        userType === "b2b" ? "Corporate Training" : "Student Consultancy",
      description:
        userType === "b2b"
          ? "Comprehensive training programs for your workforce"
          : "Your pathway to global education excellence",
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
      subtitle: userType === "b2b" ? "Find Talent" : "Find a Job",
      description:
        userType === "b2b"
          ? "Access skilled professionals for your business needs"
          : "Connect with opportunities that match your skills",
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
      subtitle: userType === "b2b" ? "Corporate Travel" : "Tours & Travels",
      description:
        userType === "b2b"
          ? "Seamless business travel and event management"
          : "Curated travel experiences for unforgettable journeys",
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
      {/* Gateway Modal - pops up after delay */}
      <Gateway 
        onSelect={handleUserTypeSelect}
        isOpen={showGateway}
        onClose={() => setShowGateway(false)}
      />

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {userType === null ? (
          <Hero key="hero" />
        ) : (
          <Nexus
            key="nexus"
            userType={userType}
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
