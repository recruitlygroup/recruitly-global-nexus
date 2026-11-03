/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, Loader2, MessageCircle, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Mascot } from "./Mascot";
import { UniversityCard } from "./UniversityCard";
import { DESTINATIONS } from "./options";
import { whatsappLink } from "./config";
import { degreeLabel, fetchRecommendations, streamLabel, type FormState, type Recommendation, type ScoreResult } from "./engine";

const ring = (s: number) => (s >= 80 ? "#16a34a" : s >= 65 ? "#2563eb" : s >= 50 ? "#d97706" : "#dc2626");

interface Props { form: FormState; result: ScoreResult; onReset: () => void }

export const ResultsView = ({ form, result, onReset }: Props) => {
  const [recs, setRecs] = useState<Recommendation[] | null>(null);
  const [error, setError] = useState(false);
  const saved = useRef(false);
  const dest = DESTINATIONS.find((d) => d.value === form.destination);
  const destLabel = dest?.label ?? form.destination;
  const first = form.fullName.split(" ")[0];

  const load = () => { setError(false); setRecs(null); fetchRecommendations(form, result).then(setRecs).catch((e) => { console.error("WiseScore recommendations failed:", e); setError(true); }); };
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Logged-in students: keep saving to wisescore_results so the student dashboard keeps working (as before).
  useEffect(() => {
    if (!recs || saved.current) return;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        saved.current = true;
        localStorage.setItem("wiseScoreAnswers", JSON.stringify(form));
        await supabase.from("wisescore_results").insert({
          user_id: session.user.id, target_country: form.destination || null, study_level: form.degree || null, field: form.program || null,
          specific_program: form.program || null, nationality: form.nationality || null, age_range: form.ageRange || null,
          highest_education: form.highestEducation || null, current_status: form.educationStatus || null, education_gap: form.educationGap || null,
          grading_system: form.gradingScheme || null, academic_score: form.gradeValue ? parseFloat(form.gradeValue) || null : null,
          english_test: form.englishTest || null, english_score: form.englishScore ? parseFloat(form.englishScore) || null : null,
          has_passport: form.hasPassport === "yes", whatsapp: form.phone || null, email: form.email || null, wise_score: result.score,
          admission_score: null, visa_score: null, scholarship_score: null,
          rejection_risk: result.score >= 75 ? "Low" : result.score >= 50 ? "Medium" : "High",
          top_universities: recs.map((r) => r.name),
          action_items: [result.hasVisaRisk ? "Take IELTS/PTE English proficiency test" : null, result.score < 70 ? "Strengthen your academic profile" : null,
            form.hasPassport !== "yes" ? "Apply for passport immediately" : null, "Prepare a strong Statement of Purpose (SOP)", "Gather all academic transcripts and certificates"].filter(Boolean),
        } as any);
      } catch (e) { console.warn("WiseScore result save skipped:", e); }
    })();
  }, [recs, form, result]);

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* hero: cat + score */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(var(--ink))] via-[hsl(var(--primary-dark))] to-primary p-6 text-white shadow-xl sm:p-10">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="w-48 shrink-0 sm:w-60"><Mascot mood="love" className="h-auto w-full drop-shadow-2xl" /></div>
          <div className="text-center md:flex-1 md:text-left">
            <p className="text-sm font-bold uppercase tracking-widest text-[hsl(var(--amber))]">Level complete · 100%</p>
            <h2 className="mt-1 text-3xl font-extrabold text-white sm:text-4xl">Pawsome work, {first}! 🎉</h2>
            <p className="mt-2 max-w-xl text-white/85">{result.advice}</p>
            <div className="mt-3 inline-flex rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold">{result.tier}</div>
            <p className="mt-3 text-sm text-white/70">{degreeLabel(form)} · {streamLabel(form)} · {destLabel}</p>
          </div>
          <div className="relative h-40 w-40 shrink-0 sm:h-44 sm:w-44" role="img" aria-label={`WiseScore ${result.score} out of 100`}>
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="9" />
              <motion.circle cx="50" cy="50" r="44" fill="none" stroke={ring(result.score)} strokeWidth="9" strokeLinecap="round"
                initial={{ strokeDasharray: "0 277" }} animate={{ strokeDasharray: `${result.score * 2.77} 277` }} transition={{ duration: 1.4, delay: 0.3 }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-extrabold">{result.score}</span><span className="text-xs font-semibold text-white/70">WiseScore / 100</span>
            </div>
          </div>
        </div>
        {result.hasVisaRisk && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-orange-300/40 bg-orange-500/20 p-4 text-sm">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-300" /><p><b>Visa risk detected.</b> Without an English proficiency test your visa application may face significant challenges.</p>
          </div>
        )}
      </motion.div>

      {/* top 5 */}
      <section className="mt-10" aria-labelledby="top5-title">
        <h2 id="top5-title" className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">Your Top 5 universities in {destLabel}</h2>
        <p className="mt-1 text-sm text-muted-foreground">Acceptance chances are estimates based on your profile and our admissions data — not a guarantee of admission.</p>

        {recs === null && !error && <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Loading universities" /></div>}
        {error && (
          <div className="py-12 text-center"><p className="mb-3 text-foreground">We couldn't load your matches right now.</p><Button onClick={load}>Try again</Button></div>
        )}
        {recs && recs.length === 0 && (
          <div className="mt-6 rounded-3xl border border-dashed border-border p-10 text-center">
            <p className="text-lg font-bold text-foreground">We're still adding universities for {destLabel}.</p>
            <p className="mt-1 text-muted-foreground">Our counsellors can already shortlist options for you today.</p>
            <Button asChild className="mt-5 gap-2"><a href={whatsappLink(`Hi! I completed WiseScore (${result.score}/100) and want to study in ${destLabel}. Can you shortlist universities for me?`)} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" /> Talk to a counsellor</a></Button>
          </div>
        )}
        {recs && recs.length > 0 && (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recs.map((r, i) => <UniversityCard key={r.id} rec={r} rank={i + 1} form={form} result={result} />)}
          </div>
        )}
      </section>

      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button variant="outline" asChild className="gap-2"><Link to={`/universities`}>Browse all universities <ArrowRight className="h-4 w-4" /></Link></Button>
        <Button variant="ghost" onClick={onReset} className="gap-2 text-muted-foreground"><RotateCcw className="h-4 w-4" /> Take the assessment again</Button>
      </div>
    </div>
  );
};
