import { motion } from "framer-motion";
import { GraduationCap, Users, FileCheck, Plane } from "lucide-react";
import DivisionCard from "./DivisionCard";
import wiseadmitImg from "@/assets/wiseadmit.png";
import recruitlyImg from "@/assets/recruitly.png";
import veridocsImg from "@/assets/veridocs.png";
import odysseyImg from "@/assets/odyssey.png";

interface NexusProps {
  userType: "b2b" | "individual";
  onDivisionClick: (division: string) => void;
}

const Nexus = ({ userType, onDivisionClick }: NexusProps) => {
  const divisions = [
    {
      id: "wiseadmit",
      title: "WiseAdmit",
      subtitle: userType === "b2b" ? "Corporate Training" : "Student Consultancy",
      description:
        userType === "b2b"
          ? "Comprehensive training programs for your workforce"
          : "Your pathway to global education excellence",
      icon: GraduationCap,
      image: wiseadmitImg,
    },
    {
      id: "recruitly",
      title: "Recruitly",
      subtitle: userType === "b2b" ? "Find Talent" : "Find a Job",
      description:
        userType === "b2b"
          ? "Access skilled professionals for your business needs"
          : "Connect with opportunities that match your skills",
      icon: Users,
      image: recruitlyImg,
    },
    {
      id: "veridocs",
      title: "VeriDocs",
      subtitle: "Legal & Apostille",
      description:
        "Professional document authentication and legal services across borders",
      icon: FileCheck,
      image: veridocsImg,
    },
    {
      id: "odyssey",
      title: "Odyssey",
      subtitle: userType === "b2b" ? "Corporate Travel" : "Tours & Travels",
      description:
        userType === "b2b"
          ? "Seamless business travel and event management"
          : "Curated travel experiences for unforgettable journeys",
      icon: Plane,
      image: odysseyImg,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative z-10"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl md:text-7xl font-light tracking-widest mb-4 text-foreground">
          RECRUITLY GLOBAL
        </h1>
        <p className="text-xl md:text-2xl text-accent font-light tracking-wider">
          Estonia's Premier Gateway
        </p>
      </motion.div>

      <div className="max-w-7xl w-full grid md:grid-cols-2 gap-6 md:gap-8 mb-12">
        {divisions.map((division, index) => (
          <DivisionCard
            key={division.id}
            {...division}
            onClick={() => onDivisionClick(division.id)}
            index={index}
          />
        ))}
      </div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-8 right-8 text-right"
      >
        <p className="text-sm text-muted-foreground font-light tracking-wide">
          Registered in Estonia
        </p>
        <div className="flex gap-4 justify-end mt-2">
          <a
            href="#"
            className="text-muted-foreground hover:text-accent transition-colors"
          >
            LinkedIn
          </a>
          <a
            href="#"
            className="text-muted-foreground hover:text-accent transition-colors"
          >
            Instagram
          </a>
        </div>
      </motion.footer>
    </motion.div>
  );
};

export default Nexus;
