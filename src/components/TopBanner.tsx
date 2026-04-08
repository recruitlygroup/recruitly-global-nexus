/**
 * src/components/TopBanner.tsx  ← NEW FILE
 *
 * Dismissible banner above the navbar with two audience CTAs:
 *   - Job seekers → WiseScore
 *   - Employers   → Post requirements
 * Stores dismissed state in sessionStorage (reappears on new tab/session).
 * Add <TopBanner /> ABOVE <SiteHeader /> in Layout.tsx.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "recruitly_banner_dismissed";

const TopBanner = () => {
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"seeker" | "employer">("seeker");
  const navigate = useNavigate();

  useEffect(() => {
    // Show banner unless dismissed this session
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
          transition={{ duration: 0.25 }}
          className="bg-gradient-to-r from-accent/90 via-accent to-accent/80 text-white overflow-hidden relative z-50"
        >
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">

            {/* Tab switcher */}
            <div className="flex items-center gap-1 bg-white/15 rounded-full p-0.5 flex-shrink-0">
              <button
                onClick={() => setActiveTab("seeker")}
                className={`text-xs font-semibold px-3 py-1 rounded-full transition-all ${activeTab === "seeker" ? "bg-white text-accent" : "text-white/80 hover:text-white"}`}
              >
                For You
              </button>
              <button
                onClick={() => setActiveTab("employer")}
                className={`text-xs font-semibold px-3 py-1 rounded-full transition-all ${activeTab === "employer" ? "bg-white text-accent" : "text-white/80 hover:text-white"}`}
              >
                Employers
              </button>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              {activeTab === "seeker" ? (
                <motion.div
                  key="seeker"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-2 flex-1 min-w-0"
                >
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-white/95 truncate">
                    Want to study or work abroad?{" "}
                    <span className="font-semibold">Find out where you stand in 2 minutes with our AI WiseScore →</span>
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
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-2 flex-1 min-w-0"
                >
                  <Briefcase className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-white/95 truncate">
                    Hiring talent from GCC &amp; South Asia?{" "}
                    <span className="font-semibold">Post your requirements and get matched fast →</span>
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
              className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TopBanner;
