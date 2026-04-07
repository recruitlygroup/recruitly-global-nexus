/**
 * src/components/SmartIntentHero.tsx
 *
 * HIGH-IMPACT CHANGES vs previous version:
 * ─────────────────────────────────────────
 * 1. STORY-FIRST headline — leads with problem narrative, not service list
 * 2. TRUST BADGE ROW — glassmorphism pill badges (social proof above fold)
 * 3. WISESCORE CTA — "Check My Eligibility" placed between headline and search
 * 4. CALENDLY FLOATING BADGE — `window.Calendly.initBadgeWidget` on mount
 * 5. BACKGROUND MESH — subtle Navy-to-midnight gradient with noise texture
 * 6. EMPLOYER & CANDIDATE toggle — single above-fold intent switch
 *
 * LIGHTHOUSE NOTES:
 * - Calendly script loaded async after LCP to not block first paint
 * - Background uses CSS `will-change: transform` only on animated blobs
 * - Font: Syne (display) + DM Sans (body) — loaded in index.html head
 */

import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Building2, Plane, FileText, Search,
  ArrowRight, Loader2, Sparkles, Briefcase, Zap, CalendarDays,
  CheckCircle2, Users, Globe2,
} from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import { useIntentRouter } from "@/hooks/useIntentRouter";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import EmployerHiringForm from "@/components/employer/EmployerHiringForm";

// ── Design tokens ─────────────────────────────────────────────────────────────
const GOLD  = "#C9A84C";
const NAVY  = "#1A2744";

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
    color: GOLD,
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

// ── Rotating placeholders ─────────────────────────────────────────────────────
const PLACEHOLDERS = [
  "Need 20 C/CE truck drivers for Germany by June…",
  "I want to study Masters in Italy…",
  "Caregiver recruitment for our Dutch care home…",
  "Apostille my degree certificate…",
  "Looking for factory workers in Romania…",
  "Welder staffing for Bulgaria project…",
];

const TRENDING = [
  { label: "Hire Drivers Germany 🇩🇪", path: "/manpower-recruitment" },
  { label: "Caregiver Sourcing",        path: "/manpower-recruitment"  },
  { label: "Study in Estonia",          path: "/educational-consultancy" },
  { label: "Agency Partnership",        path: "/for-employers#agency-partner" },
  { label: "Apostille Docs",            path: "/apostille-services"    },
];

// ── Trust badges (social proof — above fold) ─────────────────────────────────
const TRUST_BADGES = [
  { icon: CheckCircle2, label: "Zero fees for workers",    color: "#22c55e" },
  { icon: Users,        label: "153 roles filled in 2025", color: GOLD      },
  { icon: Globe2,       label: "6 EU countries served",    color: "#60a5fa" },
];

// ── Calendly config — REPLACE with your event link ───────────────────────────
const CALENDLY_URL = "https://calendly.com/recruitlygroup/eu-employer-consultation";

// ── Component ─────────────────────────────────────────────────────────────────
const SmartIntentHero = () => {
  const [query,           setQuery]           = useState("");
  const [placeholderIdx,  setPlaceholderIdx]  = useState(0);
  const [aiResult,        setAiResult]        = useState<{
    service: string | null;
    suggestedAction: string;
    confidence: number;
  } | null>(null);
  const [showEmployerForm, setShowEmployerForm] = useState(false);
  const [intentMode,      setIntentMode]      = useState<"employer" | "candidate">("employer");
  const [calendlyReady,   setCalendlyReady]   = useState(false);

  const navigate       = useNavigate();
  const debouncedQuery = useDebounce(query, 600);
  const { analyzeIntent, isLoading } = useIntentRouter();
  const inputRef       = useRef<HTMLInputElement>(null);

  // ── Rotate placeholders ──────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(
      () => setPlaceholderIdx((p) => (p + 1) % PLACEHOLDERS.length),
      3500,
    );
    return () => clearInterval(id);
  }, []);

  // ── AI intent router ─────────────────────────────────────────────────────
  useEffect(() => {
    if (debouncedQuery.length < 4) { setAiResult(null); return; }
    analyzeIntent(debouncedQuery).then((result) => {
      setAiResult(result ?? null);
    });
  }, [debouncedQuery, analyzeIntent]);

  // ── Load Calendly badge widget AFTER LCP (defer) ─────────────────────────
  useEffect(() => {
    const loadCalendly = () => {
      // Inject Calendly CSS
      if (!document.querySelector("#calendly-css")) {
        const link  = document.createElement("link");
        link.id     = "calendly-css";
        link.rel    = "stylesheet";
        link.href   = "https://assets.calendly.com/assets/external/widget.css";
        document.head.appendChild(link);
      }
      // Inject Calendly JS
      if (!document.querySelector("#calendly-js")) {
        const script   = document.createElement("script");
        script.id      = "calendly-js";
        script.src     = "https://assets.calendly.com/assets/external/widget.js";
        script.async   = true;
        script.onload  = () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const w = window as any;
          if (w.Calendly?.initBadgeWidget) {
            w.Calendly.initBadgeWidget({
              url:             CALENDLY_URL,
              text:            "📅 Book Free Consultation",
              color:           NAVY,
              textColor:       GOLD,
              branding:        false,
            });
            setCalendlyReady(true);
          }
        };
        document.body.appendChild(script);
      }
    };

    // Defer until after first paint (idle or 3s)
    if ("requestIdleCallback" in window) {
      requestIdleCallback(loadCalendly, { timeout: 3000 });
    } else {
      setTimeout(loadCalendly, 3000);
    }
  }, []);

  const matchedService   = aiResult?.service
    ? SERVICES.find((s) => s.aiService === aiResult.service) ?? null
    : null;
  const isEmployerIntent = aiResult?.service === "recruitment";

  const handleGo = useCallback(() => {
    if (!matchedService) return;
    if (isEmployerIntent) setShowEmployerForm(true);
    else navigate(matchedService.path);
  }, [matchedService, isEmployerIntent, navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleGo();
  };

  const confidenceColor =
    (aiResult?.confidence ?? 0) > 0.7
      ? "text-green-400"
      : (aiResult?.confidence ?? 0) > 0.4
      ? "text-yellow-400"
      : "text-white/40";

  return (
    <section
      className="relative min-h-[92vh] flex items-center justify-center overflow-hidden"
      style={{
        background: `linear-gradient(160deg, ${NAVY} 0%, #0f1a35 50%, #0a1228 100%)`,
      }}
    >
      {/* ── Background mesh blobs ──────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        {/* Gold glow top-right */}
        <div
          className="absolute -top-32 right-0 w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{ background: `radial-gradient(circle, ${GOLD}, transparent 70%)` }}
        />
        {/* Blue glow bottom-left */}
        <div
          className="absolute bottom-0 -left-32 w-[500px] h-[500px] rounded-full opacity-[0.08]"
          style={{ background: "radial-gradient(circle, #3b82f6, transparent 70%)" }}
        />
        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: "256px",
          }}
        />
        {/* Subtle horizontal rule */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px opacity-20"
          style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-16 pb-20 text-center space-y-8">

        {/* ── Intent Mode Toggle ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center"
        >
          <div
            className="inline-flex items-center rounded-full p-1 gap-1"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <button
              onClick={() => setIntentMode("employer")}
              className="px-5 py-2 rounded-full text-xs font-bold transition-all duration-200"
              style={
                intentMode === "employer"
                  ? { background: GOLD, color: NAVY }
                  : { color: "rgba(255,255,255,0.5)" }
              }
            >
              🏢 I'm an EU Employer
            </button>
            <button
              onClick={() => setIntentMode("candidate")}
              className="px-5 py-2 rounded-full text-xs font-bold transition-all duration-200"
              style={
                intentMode === "candidate"
                  ? { background: GOLD, color: NAVY }
                  : { color: "rgba(255,255,255,0.5)" }
              }
            >
              🎓 I'm a Candidate
            </button>
          </div>
        </motion.div>

        {/* ── Story-First Headline ────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {intentMode === "employer" ? (
            <motion.div
              key="employer-headline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.1, duration: 0.35 }}
              className="space-y-4"
            >
              {/* Urgency badge */}
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border"
                style={{
                  background: "rgba(239,68,68,0.12)",
                  borderColor: "rgba(239,68,68,0.3)",
                  color: "#fca5a5",
                }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                500,000+ EU driver vacancies · 2026 shortage crisis
              </span>

              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-white"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Your EU fleet is waiting.<br />
                <span style={{ color: GOLD }}>Nepal has the drivers.</span>
              </h1>
              <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Recruitly Group is an Estonia-registered ethical sourcing partner — delivering
                visa-ready C/CE drivers, caregivers and skilled trades from Nepal in{" "}
                <strong className="text-white/80">4–6 weeks</strong>. No worker fees. Full
                EU compliance.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="candidate-headline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.1, duration: 0.35 }}
              className="space-y-4"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border"
                style={{
                  background: "rgba(201,168,76,0.12)",
                  borderColor: "rgba(201,168,76,0.3)",
                  color: GOLD,
                }}
              >
                <Sparkles className="w-3 h-3" />
                Zero placement fees · 153 workers placed in 2025
              </span>

              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-white"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                One gateway.<br />
                <span style={{ color: GOLD }}>Every journey.</span>
              </h1>
              <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Study in Europe, find an EU job, or get your documents apostilled — all from
                a single, trusted consultancy registered in Estonia.{" "}
                <strong className="text-white/80">We never charge workers.</strong>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Trust Badge Row ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {TRUST_BADGES.map((badge) => (
            <div
              key={badge.label}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
                color: "rgba(255,255,255,0.85)",
              }}
            >
              <badge.icon className="w-3.5 h-3.5" style={{ color: badge.color }} />
              {badge.label}
            </div>
          ))}
        </motion.div>

        {/* ── Primary CTAs ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          {intentMode === "employer" ? (
            <>
              <Button
                size="lg"
                onClick={() => setShowEmployerForm(true)}
                className="h-12 px-7 text-base font-bold border-0 rounded-xl shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${GOLD}, #e8c86a)`,
                  color: NAVY,
                  boxShadow: `0 8px 24px ${GOLD}44`,
                }}
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Request Talent Pipeline
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/for-employers#agency-partner")}
                className="h-12 px-7 text-base font-semibold rounded-xl border-white/20 text-white/80 hover:bg-white/8 bg-transparent"
              >
                Agency Partnership <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </>
          ) : (
            <>
              {/* ── WiseScore CTA — PRIMARY PLACEMENT ───────────── */}
              <Button
                size="lg"
                onClick={() => navigate("/wisescore")}
                className="h-12 px-7 text-base font-bold border-0 rounded-xl shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${GOLD}, #e8c86a)`,
                  color: NAVY,
                  boxShadow: `0 8px 24px ${GOLD}44`,
                }}
              >
                <Zap className="w-4 h-4 mr-2" />
                Check My Eligibility — WiseScore™
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/jobs")}
                className="h-12 px-7 text-base font-semibold rounded-xl border-white/20 text-white/80 hover:bg-white/8 bg-transparent"
              >
                Browse EU Jobs <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </>
          )}
        </motion.div>

        {/* ── AI Search Bar ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.52 }}
          className="max-w-xl mx-auto space-y-3"
        >
          <div className="flex items-center justify-center gap-1.5 text-xs text-white/40">
            <Sparkles className="w-3.5 h-3.5" style={{ color: GOLD }} />
            <span>Or describe what you need — our AI routes you instantly</span>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 pointer-events-none" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={PLACEHOLDERS[placeholderIdx]}
              aria-label="Describe what you need — AI will route you"
              className="h-14 sm:h-16 pl-12 pr-36 text-base rounded-2xl text-white placeholder:text-white/30 focus:ring-1"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.15)",
                backdropFilter: "blur(12px)",
                // @ts-expect-error CSS custom property
                "--tw-ring-color": GOLD,
              }}
            />

            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <AnimatePresence mode="wait">
                {isLoading && query.length >= 4 && (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="flex items-center gap-1.5 text-xs text-white/40 px-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: GOLD }} />
                      <span className="hidden sm:inline">AI routing…</span>
                    </div>
                  </motion.div>
                )}
                {!isLoading && matchedService && (
                  <motion.div
                    key="matched"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                  >
                    <Button
                      onClick={handleGo}
                      size="sm"
                      className="rounded-xl font-bold gap-1.5 px-4 border-0"
                      style={{ background: GOLD, color: NAVY }}
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
                <div
                  className="flex items-start gap-3 p-3 rounded-xl"
                  style={{
                    background: isEmployerIntent
                      ? "rgba(239,68,68,0.12)"
                      : "rgba(201,168,76,0.1)",
                    border: isEmployerIntent
                      ? "1px solid rgba(239,68,68,0.2)"
                      : `1px solid ${GOLD}33`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: matchedService.color + "25", color: matchedService.color }}
                  >
                    <matchedService.icon className="w-5 h-5" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white">{matchedService.title}</p>
                      {aiResult.confidence > 0 && (
                        <span className={`text-[10px] font-medium ${confidenceColor}`}>
                          {Math.round(aiResult.confidence * 100)}% match
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/50 mt-0.5 truncate">{aiResult.suggestedAction}</p>
                  </div>
                  <Button
                    onClick={handleGo}
                    size="sm"
                    variant="ghost"
                    className="text-xs gap-1 flex-shrink-0 text-white/60 hover:text-white"
                  >
                    {isEmployerIntent ? "Open Form" : "Go"}{" "}
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Trending chips ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-2 text-xs text-white/40"
        >
          <span className="font-medium">Trending:</span>
          {TRENDING.map((chip) => (
            <button
              key={chip.label}
              onClick={() => navigate(chip.path)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:text-white"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.55)",
              }}
            >
              {chip.label}
            </button>
          ))}
        </motion.div>

        {/* ── Service cards grid ──────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto pt-2">
          {SERVICES.map((svc, i) => (
            <motion.button
              key={svc.id}
              onClick={() => {
                if (svc.id === "recruitment") setShowEmployerForm(true);
                else navigate(svc.path);
              }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.06 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label={`Go to ${svc.title}`}
              className="group relative flex flex-col items-center text-center p-5 sm:p-6 rounded-2xl transition-all duration-300 overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `radial-gradient(circle at center, ${svc.color}12, transparent 70%)` }}
              />
              <div
                className="relative w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                style={{ background: svc.color + "20", color: svc.color }}
              >
                <svc.icon className="w-5 h-5" />
              </div>
              <p className="relative text-sm font-semibold text-white">{svc.title}</p>
              <p className="relative text-[11px] text-white/45 mt-1 leading-snug">{svc.subtitle}</p>
            </motion.button>
          ))}
        </div>

        {/* ── Registered + WhatsApp ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-white/30">
            🇪🇪 Registered in Estonia · Serving globally
          </span>
          <a
            href="https://wa.me/9779743208282"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            Chat with our EU hiring experts
          </a>
        </motion.div>
      </div>

      {/* ── Employer Hiring Form Dialog ─────────────────────────────── */}
      <Dialog open={showEmployerForm} onOpenChange={setShowEmployerForm}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Post a Hiring Requirement
            </DialogTitle>
            <DialogDescription>
              Pre-vetted Nepali candidates, visa-ready for EU deployment.
              We respond within <strong>24 hours</strong>.
            </DialogDescription>
          </DialogHeader>
          <EmployerHiringForm
            onSuccess={() => setTimeout(() => setShowEmployerForm(false), 3000)}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default SmartIntentHero;
