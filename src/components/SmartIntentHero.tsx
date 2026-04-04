import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Building2, Plane, FileText, Search, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";

const SERVICES = [
  { id: "education", title: "Study Abroad", subtitle: "University placement & visa guidance", icon: GraduationCap, color: "hsl(210 100% 50%)", path: "/educational-consultancy", keywords: /study|education|university|degree|masters|bachelor|abroad|scholarship|admission|ielts|student|college|course/ },
  { id: "recruitment", title: "Manpower Recruitment", subtitle: "Skilled workers for European employers", icon: Building2, color: "hsl(160 70% 42%)", path: "/manpower-recruitment", keywords: /hire|hiring|manpower|workers|staff|recruit|employees|workforce|factory|construction|electrician|labou?r/ },
  { id: "travel", title: "Travel & Ticketing", subtitle: "Flights, tours and travel packages", icon: Plane, color: "hsl(280 60% 55%)", path: "/tours-and-travels", keywords: /travel|tour|trip|vacation|holiday|flight|ticket|booking|visa|package/ },
  { id: "apostille", title: "Apostille & Docs", subtitle: "Document legalization in 24–72 hrs", icon: FileText, color: "hsl(340 75% 52%)", path: "/apostille-services", keywords: /apostille|document|legali[sz]|attestation|certificate|notary|embassy|authentication/ },
];

const PLACEHOLDERS = [
  "I want to study in Italy…",
  "Need 30 skilled workers for Poland…",
  "Apostille my degree certificate…",
  "Book flights to Dubai…",
  "Study Masters in Germany…",
];

const TRENDING = [
  { label: "Jobs in Romania", path: "/jobs" },
  { label: "Study in Estonia", path: "/educational-consultancy" },
  { label: "Apostille Docs", path: "/apostille-services" },
  { label: "Work Visa Help", path: "/manpower-recruitment" },
];

function matchService(query: string) {
  const q = query.toLowerCase();
  return SERVICES.find((s) => s.keywords.test(q)) ?? null;
}

const SmartIntentHero = () => {
  const [query, setQuery] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [matched, setMatched] = useState<(typeof SERVICES)[0] | null>(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 200);

  useEffect(() => {
    const id = setInterval(() => setPlaceholderIdx((p) => (p + 1) % PLACEHOLDERS.length), 3500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (debouncedQuery.length < 3) { setMatched(null); return; }
    setMatched(matchService(debouncedQuery));
  }, [debouncedQuery]);

  const handleGo = useCallback(() => {
    if (matched) navigate(matched.path);
  }, [matched, navigate]);

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-muted/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--accent)/0.08),transparent_60%)]" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-12 pb-16 text-center space-y-8">

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
        🇪🇪 Registered in Estonia · Serving globally
      </motion.p>

      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-foreground">
        One gateway.
        <br />
        <span className="bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
          Every journey.
        </span>
      </motion.h1>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
        Study abroad, hire talent, legalize documents, or plan travel — tell us what you need.
      </motion.p>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="max-w-xl mx-auto space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGo()}
            placeholder={PLACEHOLDERS[placeholderIdx]}
            aria-label="Describe what you need"
            className="h-14 sm:h-16 pl-12 pr-32 text-base rounded-2xl border-border/60 focus:border-accent/50 bg-background shadow-sm"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <AnimatePresence mode="wait">
              {matched && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                  <Button onClick={handleGo} size="sm" className="rounded-xl bg-accent hover:bg-accent/90 text-white gap-1.5 px-4">
                    {matched.title.split(" ")[0]} <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {matched && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 p-3 rounded-xl border border-accent/20 bg-accent/5">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: matched.color + "20", color: matched.color }}>
                <matched.icon className="w-5 h-5" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-semibold text-foreground">{matched.title}</p>
                <p className="text-xs text-muted-foreground">{matched.subtitle}</p>
              </div>
              <Button onClick={handleGo} size="sm" variant="ghost" className="text-accent hover:text-accent text-xs gap-1">
                Go <ArrowRight className="w-3 h-3" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
        className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
        <span className="font-medium">Popular:</span>
        {TRENDING.map((chip) => (
          <button key={chip.label} onClick={() => navigate(chip.path)}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted/60 hover:bg-accent/10 hover:text-accent border border-border/40 hover:border-accent/30 transition-all">
            {chip.label}
          </button>
        ))}
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto pt-4">
        {SERVICES.map((svc, i) => (
          <motion.button key={svc.id} onClick={() => navigate(svc.path)}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 + i * 0.07 }}
            whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }}
            aria-label={`Go to ${svc.title}`}
            className="group relative flex flex-col items-center text-center p-5 sm:p-6 rounded-2xl border border-border/50 bg-background hover:border-accent/30 hover:shadow-lg transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-colors"
              style={{ background: svc.color + "15", color: svc.color }}>
              <svc.icon className="w-5 h-5" />
            </div>
            <p className="relative text-sm font-semibold text-foreground">{svc.title}</p>
            <p className="relative text-[11px] text-muted-foreground mt-1 leading-snug">{svc.subtitle}</p>
          </motion.button>
        ))}
      </div>

      <motion.a href="https://wa.me/9779743208282" target="_blank" rel="noopener noreferrer"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors pt-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
        </span>
        Chat with us
      </motion.a>
      </div>
    </section>
  );
};

export default SmartIntentHero;
