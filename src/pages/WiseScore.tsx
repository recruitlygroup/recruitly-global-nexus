// /wisescore — dedicated, mobile-first, gamified WiseScore experience (intro → questionnaire → Top-5 results).
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Clock, GraduationCap, Globe2, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import { Mascot } from "@/components/wisescore/Mascot";
import { WiseScoreFlow } from "@/components/wisescore/WiseScoreFlow";
import { ResultsView } from "@/components/wisescore/ResultsView";
import type { FormState, ScoreResult } from "@/components/wisescore/engine";

type Stage = "intro" | "flow" | "results";

const WiseScore = () => {
  useSEO({
    title: "WiseScore – Free Study Abroad Admission Chance Calculator | Recruitly Group",
    description: "Find out your admission chances in 2 minutes. Pick your destination, answer a few questions and get your Top 5 matching universities with acceptance chances.",
    keywords: "WiseScore, study abroad, admission chance, university recommendation, Schengen, USA, Australia, India",
    canonicalUrl: "https://www.recruitlygroup.com/wisescore",
  });

  const [stage, setStage] = useState<Stage>("intro");
  const [data, setData] = useState<{ form: FormState; result: ScoreResult } | null>(null);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [stage]);

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-24 top-64 h-72 w-72 rounded-full bg-[hsl(var(--amber))]/15 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-4 pb-32 pt-8 sm:py-12 lg:pb-12">
        <AnimatePresence mode="wait">
          {stage === "intro" && (
            <motion.section key="intro" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              className="grid items-center gap-8 md:grid-cols-2">
              <div className="text-center md:text-left">
                <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent"><Sparkles className="h-4 w-4" /> Free · 2 minutes · No signup</span>
                <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  Do you actually qualify to <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">study abroad?</span>
                </h1>
                <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground md:mx-0">
                  Meet Wise, our study-abroad cat. Answer a few quick questions, earn XP along the way and unlock your <b>Top 5 universities</b> in the country you choose — with your acceptance chance for each.
                </p>
                <Button size="lg" onClick={() => setStage("flow")} className="group mt-8 h-14 gap-2 px-10 text-lg font-bold shadow-xl shadow-primary/25">
                  Start my WiseScore <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <ul className="mt-8 grid gap-3 text-sm text-foreground/80 sm:grid-cols-3 md:max-w-xl">
                  <li className="flex items-center justify-center gap-2 md:justify-start"><Globe2 className="h-5 w-5 text-primary" /> 40+ destinations</li>
                  <li className="flex items-center justify-center gap-2 md:justify-start"><GraduationCap className="h-5 w-5 text-primary" /> Top 5 matches</li>
                  <li className="flex items-center justify-center gap-2 md:justify-start"><ShieldCheck className="h-5 w-5 text-primary" /> Expert counsellors</li>
                </ul>
              </div>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", delay: 0.1 }} className="relative mx-auto w-full max-w-sm md:max-w-md">
                <div className="absolute inset-6 rounded-full bg-gradient-to-br from-primary/20 to-[hsl(var(--amber))]/30 blur-2xl" aria-hidden />
                <Mascot mood="wave" className="relative h-auto w-full drop-shadow-2xl" />
                <div className="absolute -top-2 right-2 flex items-center gap-1.5 rounded-2xl rounded-bl-sm border-2 border-primary/20 bg-card px-4 py-2 text-sm font-bold text-foreground shadow-lg sm:right-6">Hi! I'm Wise 👋</div>
                <div className="absolute bottom-6 left-0 flex items-center gap-1.5 rounded-full bg-[hsl(var(--ink))] px-3 py-1.5 text-xs font-bold text-white shadow-lg"><Clock className="h-3.5 w-3.5 text-[hsl(var(--amber))]" /> ~2 min</div>
              </motion.div>
            </motion.section>
          )}

          {stage === "flow" && (
            <motion.div key="flow" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <WiseScoreFlow onCancel={() => setStage("intro")} onComplete={(form, result) => { setData({ form, result }); setStage("results"); }} />
            </motion.div>
          )}

          {stage === "results" && data && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ResultsView form={data.form} result={data.result} onReset={() => { setData(null); setStage("intro"); }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WiseScore;
