import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const FloatingEmployerCTA = () => {
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 2 }}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-30 hidden md:block"
    >
      <div className="relative">
        <button
          onClick={() => setDismissed(true)}
          className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
        >
          <X className="w-3 h-3" />
        </button>
        <Button
          onClick={() => navigate("/for-employers")}
          className="rounded-l-xl rounded-r-none px-3 py-6 bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg flex flex-col items-center gap-1"
        >
          <Briefcase className="w-4 h-4" />
          <span className="text-xs font-semibold writing-mode-vertical" style={{ writingMode: "vertical-rl" }}>
            Hire Talent
          </span>
        </Button>
      </div>
    </motion.div>
  );
};

export default FloatingEmployerCTA;
