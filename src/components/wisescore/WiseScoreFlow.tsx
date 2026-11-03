// The gamified questionnaire. Collects the same data as before + Destination Country,
// and captures phone + email as the LAST step, right before results are revealed.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2, Lock, Search, Sparkles, AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mascot, type MascotMood } from "./Mascot";
import { ProgressTrack } from "./ProgressTrack";
import {
  AGE_OPTIONS, DEGREE_OPTIONS, DESTINATIONS, DESTINATION_GROUPS, DIVISION_OPTIONS, EDUCATION_OPTIONS, ENGLISH_OPTIONS,
  GAP_OPTIONS, GRADING_OPTIONS, NATIONALITIES, PASSPORT_OPTIONS, PROGRAM_OPTIONS, STATUS_OPTIONS, STREAM_OPTIONS, flagUrl, type Opt,
} from "./options";
import { EMPTY_FORM, FALLBACK_DEMOGRAPHICS, computeScore, loadDemographics, pickDemographic, type Demographic, type FormState, type ScoreResult } from "./engine";

type StepType = "text" | "buttons" | "nationality" | "destination" | "lead";
interface Step { id: string; title: string; field: keyof FormState; type: StepType; options?: Opt[]; placeholder?: string; inputMode?: "decimal" }

const XP_PER_ANSWER = 10;
const MILESTONE_MSG: Record<number, string> = { 25: "Great start! 🔥", 50: "Halfway there! 🚀", 75: "Almost done! ⭐" };

// Plausible ranges so typos (e.g. GPA "35") don't silently wreck the score.
const RANGES: Record<string, [number, number]> = { gpa: [0, 4.5], percentage: [0, 100], cgpa: [0, 10], ielts: [0, 9], toefl: [0, 120], pte: [10, 90], duolingo: [10, 160] };
const inRange = (kind: string, v: string) => { const n = parseFloat(v); const r = RANGES[kind]; return !isNaN(n) && (!r || (n >= r[0] && n <= r[1])); };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const cleanPhone = (p: string) => p.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "").slice(0, 16);
const phoneOk = (p: string) => { const d = cleanPhone(p).replace(/\D/g, ""); return d.length >= 8 && d.length <= 15; };

const Flag = ({ iso }: { iso: string }) => {
  const [bad, setBad] = useState(false);
  return bad
    ? <span className="flex h-6 w-8 items-center justify-center rounded bg-primary/10 text-[10px] font-bold uppercase text-primary">{iso}</span>
    : <img src={flagUrl(iso)} alt="" loading="lazy" width={32} height={24} onError={() => setBad(true)} className="h-6 w-8 rounded-sm object-cover shadow-sm ring-1 ring-black/10" />;
};

const catSays = (id: string, f: FormState): { mood: MascotMood; text: string } => {
  const n = f.fullName.trim().split(" ")[0];
  const dest = DESTINATIONS.find((d) => d.value === f.destination)?.label;
  const map: Record<string, { mood: MascotMood; text: string }> = {
    name: { mood: "wave", text: "Hi! I'm Wise, your study-abroad guide. What should I call you?" },
    degree: { mood: "happy", text: `Nice to meet you${n ? `, ${n}` : ""}! What level of study are you aiming for?` },
    destination: { mood: "wow", text: "Where in the world do you want to study? I'll find your best-matching universities there!" },
    stream: { mood: "think", text: dest ? `${dest} — great choice! Now, which field excites you?` : "Pick your field of interest!" },
    program: { mood: "happy", text: "Narrowing it down — choose your program area." },
    nationality: { mood: "think", text: "Your nationality can affect visa rules and admission odds." },
    ageRange: { mood: "happy", text: "Age can matter for some scholarships." },
    highestEducation: { mood: "think", text: "What's the highest level you've completed so far?" },
    educationStatus: { mood: "happy", text: "Studying now or already graduated?" },
    educationGap: { mood: "happy", text: "Any gap in your studies? No worries either way!" },
    gradingScheme: { mood: "think", text: "Different countries grade differently — pick yours." },
    gradeValue: { mood: f.gradeValue === "distinction" ? "wow" : "happy", text: f.gradeValue === "distinction" ? "Distinction? Wow! Universities love that. 📈" : "Enter your academic score." },
    englishTest: { mood: "think", text: "English proficiency is crucial for admission and visas!" },
    englishScore: { mood: "happy", text: "Be accurate — this one counts a lot." },
    hasPassport: { mood: "happy", text: "A ready passport makes everything faster." },
    lead: { mood: "love", text: "Last step! Tell me where to send your matches and I'll reveal your Top 5." },
  };
  return map[id] ?? { mood: "happy", text: "Let's keep going!" };
};

interface Props { onComplete: (form: FormState, result: ScoreResult) => void; onCancel: () => void }

export const WiseScoreFlow = ({ onComplete, onCancel }: Props) => {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [stepIdx, setStepIdx] = useState(0);
  const [demographics, setDemographics] = useState<Demographic[]>(FALLBACK_DEMOGRAPHICS);
  const [natOpen, setNatOpen] = useState(false);
  const [destQuery, setDestQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [xp, setXp] = useState(0);
  const [burst, setBurst] = useState<string | null>(null);
  const reached = useRef<Set<number>>(new Set());
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => { let on = true; loadDemographics().then((d) => on && setDemographics(d)); return () => { on = false; }; }, []);

  const set = useCallback((k: keyof FormState, v: string) => setForm((p) => ({ ...p, [k]: v })), []);

  const steps = useMemo<Step[]>(() => {
    const s: Step[] = [
      { id: "name", title: "What's your name?", field: "fullName", type: "text", placeholder: "Your full name" },
      { id: "degree", title: "What degree are you pursuing?", field: "degree", type: "buttons", options: DEGREE_OPTIONS },
      { id: "destination", title: "Where do you want to study?", field: "destination", type: "destination" },
      { id: "stream", title: "What's your field of study?", field: "stream", type: "buttons", options: STREAM_OPTIONS },
    ];
    if (form.stream && PROGRAM_OPTIONS[form.stream]) s.push({ id: "program", title: "Select your program", field: "program", type: "buttons", options: PROGRAM_OPTIONS[form.stream] });
    s.push(
      { id: "nationality", title: "What's your nationality?", field: "nationality", type: "nationality" },
      { id: "ageRange", title: "Your age range?", field: "ageRange", type: "buttons", options: AGE_OPTIONS },
      { id: "highestEducation", title: "Highest education completed?", field: "highestEducation", type: "buttons", options: EDUCATION_OPTIONS },
      { id: "educationStatus", title: "What's your current status?", field: "educationStatus", type: "buttons", options: STATUS_OPTIONS },
      { id: "educationGap", title: "Any gap in your education?", field: "educationGap", type: "buttons", options: GAP_OPTIONS },
      { id: "gradingScheme", title: "Your grading system?", field: "gradingScheme", type: "buttons", options: GRADING_OPTIONS },
    );
    if (form.gradingScheme === "division") s.push({ id: "gradeValue", title: "Your academic division?", field: "gradeValue", type: "buttons", options: DIVISION_OPTIONS });
    else if (form.gradingScheme) s.push({ id: "gradeValue", title: "Enter your score", field: "gradeValue", type: "text", inputMode: "decimal",
      placeholder: form.gradingScheme === "gpa" ? "e.g. 3.5 (out of 4)" : form.gradingScheme === "percentage" ? "e.g. 75" : "e.g. 8.5 (out of 10)" });
    s.push({ id: "englishTest", title: "Have you taken an English test?", field: "englishTest", type: "buttons", options: ENGLISH_OPTIONS });
    if (form.englishTest && form.englishTest !== "moi") s.push({ id: "englishScore", title: `Your ${form.englishTest.toUpperCase()} score?`, field: "englishScore", type: "text", inputMode: "decimal",
      placeholder: form.englishTest === "ielts" ? "e.g. 7.0" : form.englishTest === "toefl" ? "e.g. 100" : form.englishTest === "pte" ? "e.g. 65" : "e.g. 120" });
    s.push(
      { id: "hasPassport", title: "Do you have a passport?", field: "hasPassport", type: "buttons", options: PASSPORT_OPTIONS },
      { id: "lead", title: "Where should we send your matches?", field: "email", type: "lead" },
    );
    return s;
  }, [form.stream, form.gradingScheme, form.englishTest]);

  const step = steps[Math.min(stepIdx, steps.length - 1)];
  const percent = Math.round((stepIdx / steps.length) * 100);
  const cat = catSays(step.id, form);

  // milestone celebration
  useEffect(() => {
    for (const m of [25, 50, 75]) {
      if (percent >= m && !reached.current.has(m)) {
        reached.current.add(m); setBurst(`${m}% — ${MILESTONE_MSG[m]}  +50 XP`); setXp((x) => x + 50);
        const t = setTimeout(() => setBurst(null), 2200); return () => clearTimeout(t);
      }
    }
  }, [percent]);

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const go = useCallback((delta: number) => { setStepIdx((i) => Math.max(0, Math.min(steps.length - 1, i + delta))); scrollTop(); }, [steps.length]);
  const answered = useRef<Set<string>>(new Set());
  const award = (id: string) => { if (!answered.current.has(id)) { answered.current.add(id); setXp((x) => x + XP_PER_ANSWER); } };

  const pick = (field: keyof FormState, v: string, id: string) => { set(field, v); award(id); setTimeout(() => go(1), 260); };

  // validation for the "Continue" button on text steps
  const textValid = (st: Step) => {
    const v = (form[st.field] as string).trim();
    if (!v) return false;
    if (st.id === "gradeValue") return inRange(form.gradingScheme, v);
    if (st.id === "englishScore") return inRange(form.englishTest, v);
    return true;
  };
  const textHint = (st: Step) => {
    const v = (form[st.field] as string).trim();
    if (!v) return "";
    if (st.id === "gradeValue" && !inRange(form.gradingScheme, v)) { const r = RANGES[form.gradingScheme]; return `Please enter a value between ${r[0]} and ${r[1]}.`; }
    if (st.id === "englishScore" && !inRange(form.englishTest, v)) { const r = RANGES[form.englishTest]; return `Please enter a value between ${r[0]} and ${r[1]}.`; }
    return "";
  };

  const demo = pickDemographic(demographics, form.nationality);
  const visaRiskWarn = step.id === "englishTest" && demo.no_english_penalty > 0;

  const submit = async () => {
    if (!EMAIL_RE.test(form.email.trim())) { toast({ title: "Please enter a valid email address", variant: "destructive" }); return; }
    if (!phoneOk(form.phone)) { toast({ title: "Please enter a valid phone number with country code", description: "Example: +977 98XXXXXXXX", variant: "destructive" }); return; }
    setSubmitting(true);
    const clean: FormState = { ...form, email: form.email.trim(), phone: cleanPhone(form.phone), fullName: form.fullName.trim() };
    const result = computeScore(clean, demo);
    try { localStorage.setItem("wiseScoreAnswers", JSON.stringify({ gradingScheme: clean.gradingScheme, gradeValue: clean.gradeValue, englishTest: clean.englishTest, englishScore: clean.englishScore })); } catch { /* storage unavailable */ }

    // Save the lead. A failure here must never block the student from seeing results.
    const lead = supabase.functions.invoke("submit-wisescore", { body: {
      fullName: clean.fullName, email: clean.email, phone: clean.phone, nationality: clean.nationality,
      currentEducation: clean.highestEducation, gradingScheme: clean.gradingScheme, academicGrade: clean.gradeValue,
      academicDivision: clean.gradingScheme === "division" ? clean.gradeValue : null,
      hasResearchPapers: false, hasStandardizedTests: false, testType: null, testScore: null,
      englishTest: clean.englishTest, englishScore: clean.englishScore, hasVisaRisk: result.hasVisaRisk,
      destinationCountry: clean.destination, preferredIntake: null, programLevel: clean.degree,
      wiseScore: result.score, scoreTier: result.tier, advice: result.advice,
      stream: clean.stream, program: clean.program, ageRange: clean.ageRange, educationStatus: clean.educationStatus,
      educationGap: clean.educationGap, hasPassport: clean.hasPassport,
    } });
    try { await Promise.race([lead, new Promise((r) => setTimeout(r, 4000))]); } catch (e) { console.warn("WiseScore lead save failed:", e); }
    setSubmitting(false);
    onComplete(clean, result);
  };

  const filteredDest = DESTINATIONS.filter((d) => d.label.toLowerCase().includes(destQuery.trim().toLowerCase()) || d.value.toLowerCase().includes(destQuery.trim().toLowerCase()));

  const optionBtn = (o: Opt, st: Step) => {
    const active = form[st.field] === o.value;
    return (
      <motion.button key={o.value} type="button" whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} onClick={() => pick(st.field, o.value, st.id)} aria-pressed={active}
        className={`group flex min-h-[64px] items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
          ${active ? "border-primary bg-primary/10 shadow-md shadow-primary/20" : "border-border bg-card hover:border-primary/50 hover:bg-primary/5"}`}>
        {o.emoji && <span className="text-2xl" aria-hidden>{o.emoji}</span>}
        <span className="flex-1 text-[15px] font-semibold leading-snug text-foreground">{o.label}</span>
        <span className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent group-hover:border-primary/50"}`}><Check className="h-3.5 w-3.5" /></span>
      </motion.button>
    );
  };

  const body = () => {
    switch (step.type) {
      case "text":
        return (
          <div className="mx-auto max-w-md space-y-3">
            <Input autoFocus inputMode={step.inputMode} placeholder={step.placeholder} value={form[step.field] as string} aria-label={step.title}
              onChange={(e) => set(step.field, e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && textValid(step)) { award(step.id); go(1); } }}
              className="h-14 rounded-2xl border-2 text-center text-lg font-semibold" />
            {textHint(step) && <p className="flex items-center justify-center gap-1.5 text-sm text-destructive"><AlertTriangle className="h-4 w-4" />{textHint(step)}</p>}
            <Button size="lg" className="h-12 w-full gap-2 text-base font-bold" disabled={!textValid(step)} onClick={() => { award(step.id); go(1); }}>Continue <ArrowRight className="h-4 w-4" /></Button>
          </div>
        );
      case "buttons":
        return <div className="grid gap-3 sm:grid-cols-2">{step.options!.map((o) => optionBtn(o, step))}</div>;
      case "nationality":
        return (
          <Popover open={natOpen} onOpenChange={setNatOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={natOpen} className="mx-auto flex h-14 w-full max-w-md justify-between rounded-2xl border-2 text-base">
                {form.nationality || "Search your nationality…"}<Search className="h-5 w-5 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="center">
              <Command>
                <CommandInput placeholder="Search nationality…" className="h-12" />
                <CommandList>
                  <CommandEmpty>No nationality found.</CommandEmpty>
                  <CommandGroup>
                    {NATIONALITIES.map((n) => (
                      <CommandItem key={n} value={n} className="h-11 text-base" onSelect={() => { set("nationality", n); award("nationality"); setNatOpen(false); setTimeout(() => go(1), 260); }}>
                        <Check className={`mr-2 h-4 w-4 ${form.nationality === n ? "opacity-100" : "opacity-0"}`} />{n}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        );
      case "destination":
        return (
          <div className="space-y-5">
            <div className="relative mx-auto max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input value={destQuery} onChange={(e) => setDestQuery(e.target.value)} placeholder="Search a country…" aria-label="Search destination country" className="h-12 rounded-2xl border-2 pl-11" />
            </div>
            {filteredDest.length === 0 && <p className="text-center text-sm text-muted-foreground">No country matches “{destQuery}”.</p>}
            {DESTINATION_GROUPS.map((g) => {
              const items = filteredDest.filter((d) => d.group === g.key);
              if (!items.length) return null;
              return (
                <div key={g.key}>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{g.label}</p>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {items.map((d) => {
                      const active = form.destination === d.value;
                      return (
                        <motion.button key={d.value} type="button" whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }} aria-pressed={active}
                          onClick={() => pick("destination", d.value, "destination")}
                          className={`flex min-h-[52px] items-center gap-2.5 rounded-xl border-2 px-3 py-2 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
                            ${active ? "border-primary bg-primary/10 shadow-md shadow-primary/20" : "border-border bg-card hover:border-primary/50"}`}>
                          <Flag iso={d.iso} /><span className="text-sm font-semibold leading-tight text-foreground">{d.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        );
      case "lead":
        return (
          <div className="mx-auto max-w-md space-y-4">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-center">
              <Sparkles className="mx-auto mb-1 h-6 w-6 text-accent" />
              <p className="text-sm text-foreground/80">Your Top 5 universities in <b>{DESTINATIONS.find((d) => d.value === form.destination)?.label ?? "your chosen country"}</b> are ready and waiting.</p>
            </div>
            <div>
              <label htmlFor="ws-phone" className="mb-1.5 block text-sm font-semibold text-foreground">Contact phone / WhatsApp *</label>
              <Input id="ws-phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="+977 98XXXXXXXX" value={form.phone} onChange={(e) => set("phone", e.target.value)} className="h-14 rounded-2xl border-2 text-lg" />
            </div>
            <div>
              <label htmlFor="ws-email" className="mb-1.5 block text-sm font-semibold text-foreground">Email address *</label>
              <Input id="ws-email" type="email" autoComplete="email" placeholder="you@email.com" value={form.email} onChange={(e) => set("email", e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") void submit(); }} className="h-14 rounded-2xl border-2 text-lg" />
            </div>
            <Button size="lg" onClick={submit} disabled={submitting || !form.email || !form.phone} className="h-14 w-full gap-2 text-lg font-bold shadow-lg shadow-primary/25">
              {submitting ? <><Loader2 className="h-5 w-5 animate-spin" /> Matching universities…</> : <><Lock className="h-5 w-5" /> Reveal my Top 5 <Sparkles className="h-5 w-5" /></>}
            </Button>
            <p className="flex items-start justify-center gap-1.5 text-center text-xs text-muted-foreground"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              We only use your details to share your results and help with your application. See our <a href="/privacy" className="underline">Privacy Policy</a>.</p>
          </div>
        );
    }
  };

  return (
    <div ref={topRef} className="mx-auto w-full max-w-3xl scroll-mt-24">
      <ProgressTrack percent={percent} step={stepIdx} total={steps.length} xp={xp} />

      <AnimatePresence>
        {burst && (
          <motion.div initial={{ opacity: 0, y: -10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} role="status"
            className="mx-auto mt-3 w-fit rounded-full bg-[hsl(var(--amber))] px-5 py-2 text-sm font-extrabold text-[hsl(var(--amber-foreground))] shadow-lg">🎉 {burst}</motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
        {/* mascot + speech bubble */}
        <div className="flex flex-col items-center gap-2 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent px-4 pt-5 sm:flex-row sm:items-end sm:gap-6 sm:px-8">
          <motion.div key={`cat-${step.id}`} initial={{ scale: 0.85, y: 12, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 160, damping: 14 }}
            className="w-44 shrink-0 sm:w-56 md:w-64">
            <Mascot mood={cat.mood} className="h-auto w-full drop-shadow-xl" />
          </motion.div>
          <motion.div key={`bubble-${step.id}`} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.12 }}
            className="relative mb-2 w-full rounded-2xl border-2 border-primary/20 bg-card p-4 text-[15px] font-medium text-foreground shadow-md sm:mb-10 sm:max-w-sm"
            aria-live="polite">
            <span className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l-2 border-t-2 border-primary/20 bg-card sm:-left-2 sm:top-1/2 sm:-translate-y-1/2 sm:translate-x-0 sm:-rotate-45" aria-hidden />
            {cat.text}
          </motion.div>
        </div>

        <div className="px-4 pb-6 pt-5 sm:px-8 sm:pb-8">
          <motion.h2 key={`t-${step.id}`} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} className="mb-5 text-center text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">{step.title}</motion.h2>

          {visaRiskWarn && (
            <div className="mx-auto mb-5 flex max-w-xl items-start gap-3 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
              <p className="text-sm text-foreground/80"><b className="text-orange-700 dark:text-orange-400">Heads up:</b> without an English test your visa application may face challenges.</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div key={step.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>{body()}</motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
            <Button variant="ghost" onClick={() => go(-1)} disabled={stepIdx === 0 || submitting} className="gap-2 text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Back</Button>
            <Button variant="ghost" size="sm" onClick={onCancel} disabled={submitting} className="text-muted-foreground hover:text-destructive">Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
