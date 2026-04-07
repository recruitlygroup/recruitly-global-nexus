/**
 * src/components/SmartIntentHero.tsx  ← REPLACE existing file
 *
 * KEPT:   The AI intent router (Gemini 2.5 Flash via intent-router edge function)
 * ADDED:
 *   - Employer-urgency badge with shortage stat
 *   - Richer headline ("Fill Your EU Shortage…" / "One Gateway…" dual mode)
 *   - AI-powered response panel with action card instead of just a nav link
 *   - Employer-specific UI when B2B intent is detected (inline mini-form opener)
 *   - Loading shimmer on the search bar while AI processes
 *   - Updated trending chips include employer terms
 *   - Dual primary CTAs below headline for above-fold conversion
 */

import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Building2, Plane, FileText, Search,
  ArrowRight, Loader2, Sparkles, Briefcase, AlertTriangle
} from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import { useIntentRouter } from "@/hooks/useIntentRouter";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import EmployerHiringForm from "@/components/employer/EmployerHiringForm";

// ── Service config ────────────────────────────────────────────────────────────

const SERVICES = [
  {
    id: "education",
    title: "Study Abroad",
    subtitle: "University placement & visa guidance",
    icon: GraduationCap,
    color: "hsl(210 100% 50%)",
    path: "/educational-consultancy",
    aiService: "education",
  },
  {
    id: "recruitment",
    title: "Hire Talent",
    subtitle: "Pre-vetted workers for EU employers",
    icon: Building2,
    color: "hsl(160 70% 42%)",
    path: "/manpower-recruitment",
    aiService: "recruitment",
  },
  {
    id: "travel",
    title: "Travel & Ticketing",
    subtitle: "Flights, tours and travel packages",
    icon: Plane,
    color: "hsl(280 60% 55%)",
    path: "/tours-and-travels",
    aiService: "travel",
  },
  {
    id: "apostille",
    title: "Apostille & Docs",
    subtitle: "Document legalization in 24–72 hrs",
    icon: FileText,
    color: "hsl(340 75% 52%)",
    path: "/apostille-services",
    aiService: "apostille",
  },
];

// Rotating placeholders — mix B2B and B2C
const PLACEHOLDERS = [
  "Need 20 C/CE truck drivers for Germany by June…",
  "I want to study Masters in Italy…",
  "Caregiver recruitment for our Dutch care home…",
  "Apostille my degree certificate…",
  "Looking for factory workers in Romania…",
  "Book flights to Dubai…",
  "Welder staffing for Bulgaria project…",
];

const TRENDING = [
  { label: "Hire Drivers Germany 🇩🇪", path: "/manpower-recruitment" },
  { label: "Caregiver Sourcing", path: "/manpower-recruitment" },
  { label: "Study in Estonia", path: "/educational-consultancy" },
  { label: "Agency Partnership", path: "/for-employers#agency-partner" },
  { label: "Apostille Docs", path: "/apostille-services" },
];

// ── Component ─────────────────────────────────────────────────────────────────

const SmartIntentHero = () => {
  const [query, setQuery]               = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [aiResult, setAiResult]         = useState<{ service: string | null; suggestedAction: string; confidence: number } | null>(null);
  const [showEmployerForm, setShowEmployerForm] = useState(false);

  const navigate  = useNavigate();
  const debouncedQuery = useDebounce(query, 600); // slightly longer for AI call
  const { analyzeIntent, isLoading } = useIntentRouter();
  const inputRef  = useRef<HTMLInputElement>(null);

  // Rotate placeholders
  useEffect(() => {
    const id = setInterval(() => setPlaceholderIdx((p) => (p + 1) % PLACEHOLDERS.length), 3500);
    return () => clearInterval(id);
  }, []);

  // Call AI intent router on debounced query
  useEffect(() => {
    if (debouncedQuery.length < 4) { setAiResult(null); return; }
    analyzeIntent(debouncedQuery).then((result) => {
      if (result) setAiResult(result);
      else setAiResult(null);
    });
  }, [debouncedQuery, analyzeIntent]);

  // Map AI service string back to our SERVICES array
  const matchedService = aiResult?.service
    ? SERVICES.find((s) => s.aiService === aiResult.service) ?? null
    : null;

  const isEmployerIntent = aiResult?.service === "recruitment";

  const handleGo = useCallback(() => {
    if (!matchedService) return;
    if (isEmployerIntent) {
      // For B2B employer intent — open the hiring form directly
      setShowEmployerForm(true);
    } else {
      navigate(matchedService.path);
    }
  }, [matchedService, isEmployerIntent, navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleGo();
  };

  // Confidence indicator colour
  const confidenceColor =
    (aiResult?.confidence ?? 0) > 0.7
      ? "text-green-500"
      : (aiResult?.confidence ?? 0) > 0.4
      ? "text-yellow-500"
      : "text-muted-foreground";

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-muted/30">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--accent)/0.08),transparent_60%)]" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-12 pb-16 text-center space-y-8">

        {/* Urgency badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-semibold border border-orange-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
            </span>
            500,000+ EU driver vacancies · 2026 shortage crisis
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-foreground"
        >
          One gateway.
          <br />
          <span className="bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
            Every journey.
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          EU employers: fill driver & caregiver shortages with visa-ready Nepali talent in 4–6 weeks.
          Or tell us anything — our AI routes you instantly.
        </motion.p>

        {/* Dual CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button
            size="lg"
            className="h-12 px-7 text-base font-semibold bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20"
            onClick={() => setShowEmployerForm(true)}
          >
            <Briefcase className="w-4 h-4 mr-2" />
            Request Talent Pipeline
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 px-7 text-base border-accent/30 text-accent hover:bg-accent/5"
            onClick={() => navigate("/for-employers#agency-partner")}
          >
            Agency Partnership <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </motion.div>

        {/* ── AI Search Bar ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="max-w-xl mx-auto space-y-3"
        >
          {/* Label */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Or describe what you need — our AI will route you instantly</span>
          </div>

          {/* Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={PLACEHOLDERS[placeholderIdx]}
              aria-label="Describe what you need — AI will route you"
              className="h-14 sm:h-16 pl-12 pr-36 text-base rounded-2xl border-border/60 focus:border-accent/50 bg-background shadow-sm transition-shadow focus:shadow-accent/10 focus:shadow-lg"
            />

            {/* Right side: loading OR matched CTA */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <AnimatePresence mode="wait">
                {isLoading && query.length >= 4 && (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                      <span className="hidden sm:inline">AI routing…</span>
                    </div>
                  </motion.div>
                )}
                {!isLoading && matchedService && (
                  <motion.div key="matched" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}>
                    <Button
                      onClick={handleGo}
                      size="sm"
                      className="rounded-xl bg-accent hover:bg-accent/90 text-white gap-1.5 px-4"
                    >
                      {isEmployerIntent ? "Hire Now" : matchedService.title.split(" ")[0]}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* AI Result Card */}
          <AnimatePresence>
            {!isLoading && matchedService && aiResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className={`flex items-start gap-3 p-3 rounded-xl border bg-background ${isEmployerIntent ? "border-orange-400/30 bg-orange-50/50 dark:bg-orange-900/10" : "border-accent/20 bg-accent/5"}`}>
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: matchedService.color + "20", color: matchedService.color }}
                  >
                    <matchedService.icon className="w-5 h-5" />
                  </div>

                  {/* Text */}
                  <div className="text-left flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{matchedService.title}</p>
                      {aiResult.confidence > 0 && (
                        <span className={`text-[10px] font-medium ${confidenceColor}`}>
                          {Math.round(aiResult.confidence * 100)}% match
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{aiResult.suggestedAction}</p>
                    {isEmployerIntent && (
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 font-medium">
                        👷 Employer detected — we'll open a quick hiring form
                      </p>
                    )}
                  </div>

                  {/* CTA */}
                  <Button
                    onClick={handleGo}
                    size="sm"
                    variant="ghost"
                    className="text-accent hover:text-accent text-xs gap-1 flex-shrink-0"
                  >
                    {isEmployerIntent ? "Open Form" : "Go"} <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Trending chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground"
        >
          <span className="font-medium">Trending:</span>
          {TRENDING.map((chip) => (
            <button
              key={chip.label}
              onClick={() => navigate(chip.path)}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted/60 hover:bg-accent/10 hover:text-accent border border-border/40 hover:border-accent/30 transition-all"
            >
              {chip.label}
            </button>
          ))}
        </motion.div>

        {/* Service cards grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto pt-4">
          {SERVICES.map((svc, i) => (
            <motion.button
              key={svc.id}
              onClick={() => {
                if (svc.id === "recruitment") setShowEmployerForm(true);
                else navigate(svc.path);
              }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 + i * 0.07 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label={`Go to ${svc.title}`}
              className="group relative flex flex-col items-center text-center p-5 sm:p-6 rounded-2xl border border-border/50 bg-background hover:border-accent/30 hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div
                className="relative w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                style={{ background: svc.color + "15", color: svc.color }}
              >
                <svc.icon className="w-5 h-5" />
              </div>
              <p className="relative text-sm font-semibold text-foreground">{svc.title}</p>
              <p className="relative text-[11px] text-muted-foreground mt-1 leading-snug">{svc.subtitle}</p>
            </motion.button>
          ))}
        </div>

        {/* Registered + WhatsApp */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
        >
          <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
            🇪🇪 Registered in Estonia · Serving globally
          </span>
          <a
            href="https://wa.me/9779743208282"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            Chat with our EU hiring experts
          </a>
        </motion.div>
      </div>

      {/* Employer Hiring Form Dialog */}
      <Dialog open={showEmployerForm} onOpenChange={setShowEmployerForm}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Post a Hiring Requirement</DialogTitle>
            <DialogDescription>
              Pre-vetted Nepali candidates, visa-ready for EU deployment.
              We respond within <strong>24 hours</strong>.
            </DialogDescription>
          </DialogHeader>
          <EmployerHiringForm onSuccess={() => setTimeout(() => setShowEmployerForm(false), 3000)} />
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default SmartIntentHero;
