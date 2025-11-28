import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Users, FileCheck, Plane, Play } from "lucide-react";
import DivisionCard from "./DivisionCard";
import wiseadmitImg from "@/assets/wiseadmit.png";
import recruitlyImg from "@/assets/recruitly.png";
import veridocsImg from "@/assets/veridocs.png";
import odysseyImg from "@/assets/odyssey.png";

interface NexusProps {
  onDivisionClick: (division: string) => void;
}

const Nexus = ({ onDivisionClick }: NexusProps) => {
  const divisions = [
    {
      id: "wiseadmit",
      title: "WiseAdmit",
      subtitle: "Student Consultancy",
      description: "Your pathway to global education excellence",
      headline: "Secure Your Future, Study Abroad",
      icon: GraduationCap,
      image: wiseadmitImg,
    },
    {
      id: "recruitly",
      title: "Recruitly",
      subtitle: "Find a Job",
      description: "Connect with opportunities that match your skills",
      headline: "Access International Job Opportunities",
      icon: Users,
      image: recruitlyImg,
    },
    {
      id: "veridocs",
      title: "VeriDocs",
      subtitle: "Legal & Apostille",
      description: "Professional document authentication and legal services",
      headline: "Expedite Your Legal Document Process",
      icon: FileCheck,
      image: veridocsImg,
    },
    {
      id: "odyssey",
      title: "Odyssey",
      subtitle: "Tours & Travels",
      description: "Curated travel experiences for unforgettable journeys",
      headline: "Plan Your Next Global Adventure",
      icon: Plane,
      image: odysseyImg,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-8 pt-10 min-h-screen w-full max-w-7xl mx-auto"
    >
      {/* Video Promo Block */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full glass rounded-3xl p-6 md:p-8 mb-12 shadow-2xl"
      >
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          {/* Text Content */}
          <div className="text-left w-full md:w-1/2">
            <h2 className="text-base font-medium text-muted-foreground mb-2">
              Message from the Founder
            </h2>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-snug mb-4">
              We are <span className="text-accent">Recruitly Global</span>, your unified gateway to the world.
            </p>
            <p className="text-muted-foreground/80 text-sm md:text-base">
              For over a decade, we've helped connect talent, certify futures, and guide adventures from our hub in Estonia.
            </p>
          </div>

          {/* Video Thumbnail */}
          <div className="relative w-full md:w-96 h-48 md:h-64 rounded-2xl overflow-hidden shadow-xl group cursor-pointer">
            <a 
              href="https://www.youtube.com"
              target="_blank" 
              rel="noopener noreferrer" 
              className="block w-full h-full"
            >
              <img
                src="https://placehold.co/600x400/1e293b/a5b4fc?text=FOUNDER+MESSAGE"
                alt="Founder of Recruitly Global"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              
              <motion.div
                initial={{ scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="absolute inset-0 flex items-center justify-center bg-background/30 transition-all duration-300 group-hover:bg-background/10"
              >
                <Play className="w-12 h-12 md:w-16 md:h-16 text-destructive fill-destructive opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
              </motion.div>
            </a>
          </div>
        </div>
      </motion.div>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-foreground to-accent tracking-tighter leading-none mb-4">
          Recruitly Global
        </h1>
        <p className="text-lg sm:text-xl font-light text-muted-foreground">
          Choose your path below
        </p>
      </div>

      {/* Division Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        <AnimatePresence>
          {divisions.map((division, index) => (
            <DivisionCard
              key={division.id}
              {...division}
              onClick={() => onDivisionClick(division.id)}
              index={index}
            />
          ))}
        </AnimatePresence>
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
