// src/components/TopBanner.tsx
// FIX: Removed `z-50` from the motion.div — the parent fixed container
// in Layout.tsx now handles stacking. Banner is in normal document flow
// within that container, so z-index on this element was redundant and
// could cause conflicts.
// UPGRADE: Slightly tighter padding, cleaner dismiss button.

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "recruitly_banner_dismissed";

const TopBanner = () => {
  const [visible, setVisible]     = useState(false);
  const [activeTab, setActiveTab] = useState<"seeker" | "employer">("seeker");
  const navigate = useNavigate();

  useEffect(() => {
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          // NO z-50 here — parent Layout div handles z-index
          className="bg-accent text-white overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">

            {/* Tab switcher */}
            <div className="flex items-center gap-1 bg-white/15 rounded-full p-0.5 flex-shrink-0">
              <button
                onClick={() => setActiveTab("seeker")}
                className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
                  activeTab === "seeker" ? "bg-white text-accent" : "text-white/80 hover:text-white"
                }`}
              >
                For You
              </button>
              <button
                onClick={() => setActiveTab("employer")}
                className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
                  activeTab === "employer" ? "bg-white text-accent" : "text-white/80 hover:text-white"
                }`}
              >
                Employers
              </button>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              {activeTab === "seeker" ? (
                <motion.div
                  key="seeker"
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-2 flex-1 min-w-0"
                >
                  <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm truncate">
                    Want to study or work abroad?{" "}
                    <span className="font-semibold hidden sm:inline">Find out in 2 minutes with AI WiseScore →</span>
                  </span>
                  <button
                    onClick={() => { navigate("/educational-consultancy"); dismiss(); }}
                    className="flex-shrink-0 text-xs font-bold bg-white text-accent px-3 py-1 rounded-full hover:bg-white/90 transition-colors whitespace-nowrap"
                  >
                    Check WiseScore
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="employer"
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-2 flex-1 min-w-0"
                >
                  <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm truncate">
                    Hiring from GCC & South Asia?{" "}
                    <span className="font-semibold hidden sm:inline">Post requirements and get matched fast →</span>
                  </span>
                  <button
                    onClick={() => { navigate("/for-employers"); dismiss(); }}
                    className="flex-shrink-0 text-xs font-bold bg-white text-accent px-3 py-1 rounded-full hover:bg-white/90 transition-colors whitespace-nowrap"
                  >
                    Post Requirements
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dismiss */}
            <button
              onClick={dismiss}
              aria-label="Dismiss banner"
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TopBanner;
