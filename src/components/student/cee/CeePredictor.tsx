// CEE Rank & Admission Predictor — lead gate → Nepal probability dashboard → India/abroad pivot → NPR 0 seat-booking CTA.
import { useMemo, useRef, useState } from "react";
import { ArrowRight, MessageCircle, Printer, ShieldCheck } from "lucide-react";
import { MBBS_QUOTAS } from "@/data/ceeCutoffs";
import {
  ASSUMPTIONS, predict, type Category, type Prediction, type Program, type Tier,
} from "@/lib/ceePredictor";
import { EMAIL_RE, NEPAL_MOBILE, submitCeeLead, whatsappUrl, type CeeLead } from "@/lib/ceeLead";

const PROGRAMS = ["MBBS", "BDS", "BSc Nursing", "All Programs"] as const;
const CATEGORIES: Category[] = ["Open", "Female", "Janajati", "Madhesi", "Dalit", "Tharu", "Muslim", "Backward Area", "Foreign"];
const BUDGETS = ["Scholarship Only", "Up to 45 Lakhs NPR", "45–60 Lakhs NPR", "Flexible / India & Abroad Options"] as const;

const field = "w-full h-11 rounded-md border border-border bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary";
const label = "block text-sm font-semibold text-primary mb-1";

const TIER_UI: Record<Tier, { dot: string; title: string; cls: string }> = {
  high: { dot: "🟢", title: "High Probability", cls: "bg-green-50 border-green-600 text-green-900" },
  borderline: { dot: "🟡", title: "Borderline / Mop-Up Round Chance", cls: "bg-amber-50 border-amber-600 text-amber-900" },
  low: { dot: "🔴", title: "Low Probability / Unlikely in Nepal", cls: "bg-red-50 border-red-600 text-red-900" },
};

const pctLabel = (p: number, t: Tier) => (p < 5 ? "<5% Unlikely" : `${p}% ${t === "high" ? "Likely" : t === "borderline" ? "Borderline" : "Unlikely"}`);

interface FormState {
  fullName: string; phone: string; email: string; rollNo: string; rank: string; score: string;
  program: (typeof PROGRAMS)[number]; category: Category; budget: (typeof BUDGETS)[number];
  district: string; guardianPhone: string;
}
const INITIAL: FormState = {
  fullName: "", phone: "", email: "", rollNo: "", rank: "", score: "", program: "MBBS", category: "Open",
  budget: "Flexible / India & Abroad Options", district: "", guardianPhone: "",
};

const CeePredictor = () => {
  const [f, setF] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [lead, setLead] = useState<CeeLead | null>(null);
  const [leadId, setLeadId] = useState<string>();
  const [pred, setPred] = useState<Prediction | null>(null);
  const [tab, setTab] = useState<"gov" | "private">("gov");
  const [pref, setPref] = useState("India");
  const [seatSent, setSeatSent] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((s) => ({ ...s, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (f.fullName.trim().length < 2) e.fullName = "Enter your full name.";
    if (!NEPAL_MOBILE.test(f.phone.trim())) e.phone = "Enter a 10-digit mobile number starting with 97 or 98.";
    if (!EMAIL_RE.test(f.email.trim())) e.email = "Enter a valid email address.";
    const rank = Number(f.rank), score = Number(f.score);
    if (!f.rank && !f.score) e.rank = "Enter your CEE rank or score (roll number alone can't be looked up).";
    if (f.rank && (!Number.isInteger(rank) || rank < 1 || rank > 20000)) e.rank = "Enter a valid rank (1–20,000).";
    if (f.score && (isNaN(score) || score < 0 || score > 200)) e.score = "Enter a valid score (0–200).";
    if (f.guardianPhone && !NEPAL_MOBILE.test(f.guardianPhone.trim())) e.guardianPhone = "Use a 10-digit number starting with 97 or 98.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const candidate = { rank: f.rank ? Number(f.rank) : undefined, score: f.score ? Number(f.score) : undefined };
    const p = predict(candidate, f.program, f.category, f.budget === "Scholarship Only");
    const l: CeeLead = {
      fullName: f.fullName.trim(), phone: f.phone.trim(), email: f.email.trim(), rollNo: f.rollNo.trim() || undefined,
      ...candidate, program: f.program, category: f.category, budget: f.budget,
      district: f.district.trim() || undefined, guardianPhone: f.guardianPhone.trim() || undefined, overallTier: p.overall,
    };
    try {
      setLeadId(await submitCeeLead(l));
    } catch {
      // Never block the student's report if lead storage hiccups; WhatsApp CTA remains a fallback.
    }
    setLead(l); setPred(p); setTab(f.budget === "Scholarship Only" || !p.mbbs ? "gov" : "gov");
    setSubmitting(false);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const showPivot = !!pred && (pred.overall !== "high" || f.budget !== "Scholarship Only");
  const waHref = lead ? whatsappUrl(lead, pref) : "#";

  const bookSeat = () => {
    if (!lead) return;
    setSeatSent(true);
    void submitCeeLead(lead, true, leadId).catch(() => undefined);
  };

  const err = (k: string) => (errors[k] ? <p role="alert" className="text-xs text-red-700 mt-1">{errors[k]}</p> : null);
  const tierUi = pred ? TIER_UI[pred.overall] : null;
  const quotaCount = useMemo(() => MBBS_QUOTAS.length, []);

  return (
    <section id="cee-predictor" aria-labelledby="cee-heading" className="bg-white border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div className="max-w-3xl mb-6 print:hidden">
          <p className="text-xs font-bold uppercase tracking-wider text-accent mb-2">Free tool · Takes 60 seconds</p>
          <h2 id="cee-heading" className="text-2xl md:text-4xl font-extrabold text-primary">CEE Rank &amp; Admission Predictor</h2>
          <p className="mt-2 text-slate-700">
            Enter your CEE rank to see your realistic chances in Nepal (MBBS, BDS, BSc Nursing) based on {quotaCount} scholarship quotas
            from MEC results for BS 2080–2082 — and your back-up options in India and abroad.
          </p>
        </div>

        <form onSubmit={onSubmit} noValidate className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 bg-background border border-border rounded-md p-4 md:p-6 print:hidden">
          <div>
            <label className={label} htmlFor="cee-name">Full name *</label>
            <input id="cee-name" className={field} value={f.fullName} onChange={(e) => set("fullName", e.target.value)} autoComplete="name" />
            {err("fullName")}
          </div>
          <div>
            <label className={label} htmlFor="cee-phone">Phone / WhatsApp *</label>
            <input id="cee-phone" className={field} inputMode="numeric" maxLength={10} placeholder="98XXXXXXXX" value={f.phone} onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))} autoComplete="tel" />
            {err("phone")}
          </div>
          <div>
            <label className={label} htmlFor="cee-email">Gmail / Email *</label>
            <input id="cee-email" type="email" className={field} value={f.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />
            {err("email")}
          </div>
          <div>
            <label className={label} htmlFor="cee-rank">CEE rank *</label>
            <input id="cee-rank" className={field} inputMode="numeric" placeholder="e.g. 1250" value={f.rank} onChange={(e) => set("rank", e.target.value.replace(/\D/g, ""))} />
            {err("rank")}
          </div>
          <div>
            <label className={label} htmlFor="cee-score">…or CEE score</label>
            <input id="cee-score" className={field} inputMode="decimal" placeholder="e.g. 104.25" value={f.score} onChange={(e) => set("score", e.target.value)} />
            {err("score")}
          </div>
          <div>
            <label className={label} htmlFor="cee-roll">Roll number (optional)</label>
            <input id="cee-roll" className={field} inputMode="numeric" value={f.rollNo} onChange={(e) => set("rollNo", e.target.value.replace(/\D/g, ""))} />
          </div>
          <div>
            <label className={label} htmlFor="cee-program">Preferred program *</label>
            <select id="cee-program" className={field} value={f.program} onChange={(e) => set("program", e.target.value as FormState["program"])}>
              {PROGRAMS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="cee-cat">Reservation / quota *</label>
            <select id="cee-cat" className={field} value={f.category} onChange={(e) => set("category", e.target.value as Category)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="cee-budget">Budget range *</label>
            <select id="cee-budget" className={field} value={f.budget} onChange={(e) => set("budget", e.target.value as FormState["budget"])}>
              {BUDGETS.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="cee-district">Home district / city (optional)</label>
            <input id="cee-district" className={field} placeholder="Kathmandu, Pokhara, Chitwan…" value={f.district} onChange={(e) => set("district", e.target.value)} />
          </div>
          <div className="md:col-span-1 lg:col-span-2">
            <label className={label} htmlFor="cee-guardian">Optional: Send fee structure directly to Parent/Guardian</label>
            <input id="cee-guardian" className={field} inputMode="numeric" maxLength={10} placeholder="Guardian WhatsApp 98XXXXXXXX" value={f.guardianPhone} onChange={(e) => set("guardianPhone", e.target.value.replace(/\D/g, ""))} />
            {err("guardianPhone")}
          </div>
          <div className="md:col-span-2 lg:col-span-3 flex flex-col sm:flex-row sm:items-center gap-3">
            <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 disabled:opacity-60 text-white font-bold px-6 py-3 rounded-md">
              {submitting ? "Calculating…" : "Show my admission chances"} <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
            <p className="text-xs text-slate-600 flex items-center gap-1"><ShieldCheck className="w-4 h-4" aria-hidden="true" /> Your details are used only to send your report and counselling. Free, no obligation.</p>
          </div>
        </form>

        {pred && lead && tierUi && (
          <div ref={resultRef} id="cee-report" className="mt-10 space-y-8 scroll-mt-24">
            <div className={`border-l-4 rounded-md p-5 ${tierUi.cls}`}>
              <p className="text-xs font-bold uppercase tracking-wider">Nepal admission status for {lead.fullName}</p>
              <p className="text-2xl font-extrabold mt-1">{tierUi.dot} {tierUi.title}</p>
              <p className="text-sm mt-1">
                Rank {lead.rank ?? "—"}{lead.score != null ? ` · Score ${lead.score}` : ""} · {lead.program} · {lead.category} quota
              </p>
            </div>

            {pred.mbbs && (
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3 print:hidden" role="tablist" aria-label="Seat type">
                  {(["gov", "private"] as const).map((t) => (
                    <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
                      className={`px-4 py-2 rounded-md text-sm font-bold border ${tab === t ? "bg-primary text-white border-primary" : "bg-white text-primary border-border"}`}>
                      {t === "gov" ? "Government (Scholarship)" : "Private (Paying)"}
                    </button>
                  ))}
                </div>

                <div className={tab === "gov" ? "" : "hidden print:block"}>
                  <h3 className="font-bold text-primary mb-2">MBBS — Government scholarship quotas (last admitted candidate)</h3>
                  <div className="overflow-x-auto border border-border rounded-md bg-white">
                    <table className="w-full text-sm min-w-[720px]">
                      <thead className="bg-muted text-left text-primary">
                        <tr>
                          <th className="p-3">Quota</th><th className="p-3">Seats (2082)</th>
                          <th className="p-3">Closing rank 2082 / 2081 / 2080</th><th className="p-3">Closing score 2082</th>
                          <th className="p-3">Your chance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pred.mbbs.scholarship.map((r) => (
                          <tr key={r.quota.id} className="border-t border-border">
                            <td className="p-3 font-semibold">{r.quota.name}</td>
                            <td className="p-3">{r.quota.seats2082}</td>
                            <td className="p-3">{r.quota.y2082[1].toLocaleString()} / {r.quota.y2081[1].toLocaleString()} / {r.quota.y2080[1].toLocaleString()}</td>
                            <td className="p-3">{r.quota.y2082[0]}</td>
                            <td className="p-3 font-bold">{TIER_UI[r.tier].dot} {pctLabel(r.probability, r.tier)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">Quota data is national (MEC merit lists). College-wise seat allocation and fees are not included in this tool; our counsellors will share them.</p>
                </div>

                <div className={tab === "private" ? "" : "hidden print:block print:mt-6"}>
                  <h3 className="font-bold text-primary mb-2">MBBS — Private / paying seats</h3>
                  <p className="text-sm text-slate-700">
                    {pred.mbbs.paying.qualified ? "You are within the MEC pass list" : "Your rank/score is below the MEC pass mark"} (pass mark {pred.mbbs.paying.passMark}; {pred.mbbs.paying.passed.toLocaleString()} passed for {pred.mbbs.paying.seats.toLocaleString()} total seats in 2082,
                    about {pred.mbbs.paying.paying?.toLocaleString()} non-scholarship seats).
                    Capacity-based estimate: <strong>{TIER_UI[pred.mbbs.paying.tier].dot} {pctLabel(pred.mbbs.paying.probability, pred.mbbs.paying.tier)}</strong>.
                    Fees vary by college — ask us for the current fee sheet.
                  </p>
                </div>
              </div>
            )}

            {pred.bds && (
              <div className="bg-white border border-border rounded-md p-5">
                <h3 className="font-bold text-primary mb-1">BDS — Paying / institutional seats</h3>
                <p className="text-sm text-slate-700">
                  2082 pass mark {pred.bds.paying.passMark}; {pred.bds.paying.passed.toLocaleString()} passed for {pred.bds.paying.seats} seats. You are {pred.bds.paying.qualified ? "on the pass list" : "below the pass mark"}.
                  Capacity-based estimate: <strong>{TIER_UI[pred.bds.paying.tier].dot} {pctLabel(pred.bds.paying.probability, pred.bds.paying.tier)}</strong>. Quota-wise BDS cutoffs are not in our dataset.
                </p>
              </div>
            )}

            {pred.nursing && (
              <div className="bg-white border border-border rounded-md p-5">
                <h3 className="font-bold text-primary mb-1">BSc Nursing / Midwifery</h3>
                <p className="text-sm text-slate-700">
                  {pred.nursing.qualified
                    ? <>Estimated rank position ≈ <strong>{pred.nursing.estRank?.toLocaleString()}</strong> of {`5,533`} qualified (MECEE-BL 2025 distribution){pred.nursing.percentile != null && <>, top {100 - pred.nursing.percentile}%</>}. Your seat depends on college-wise cutoffs, which we will confirm on your call.</>
                    : "Your score is below the 2025 qualifying cut-off (39.75), so a Nepal nursing seat is unlikely. India offers direct merit admission for BSc Nursing."}
                </p>
              </div>
            )}

            <details className="text-xs text-slate-600">
              <summary className="cursor-pointer font-semibold">How these numbers are calculated</summary>
              <ul className="list-disc pl-5 mt-2 space-y-1">{ASSUMPTIONS.map((a) => <li key={a}>{a}</li>)}</ul>
              <p className="mt-2">Indicative only. Actual results depend on the current year's merit list, MEC rules and seat allocation.</p>
            </details>

            {showPivot && (
              <div className="bg-primary text-white rounded-md p-6 print:border print:border-black print:bg-white print:text-black">
                <h3 className="text-xl md:text-2xl font-extrabold">Guaranteed Alternative Pathways: Study MBBS, BDS &amp; BSc Nursing in India &amp; Abroad</h3>
                <div className="grid md:grid-cols-2 gap-6 mt-4 text-sm leading-relaxed">
                  <div>
                    <h4 className="font-bold mb-1">Why India &amp; abroad through Recruitly Group?</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Admission in NMC / INC / MEC-recognised universities with transparent fee structures and no hidden donations.</li>
                      <li>MEC Eligibility Certificate guidance for Nepali aspirants.</li>
                      <li>NEET-UG qualification is required for MBBS/BDS in India; BSc Nursing and allied health are admitted on merit (no NEET).</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white/10 print:bg-transparent rounded-md p-3">
                      <p className="font-bold">🇮🇳 India (primary focus)</p>
                      <p>NMC/INC-approved private and deemed universities across Bangalore, Mangalore, Delhi NCR, Punjab and Kolkata.</p>
                    </div>
                    <div className="bg-white/10 print:bg-transparent rounded-md p-3">
                      <p className="font-bold">🌍 Other destinations</p>
                      <p>Bangladesh, China, the Philippines and European healthcare pathways, matched to your budget.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4 — NPR 0 seat booking */}
            <div id="seat-booking" className="rounded-md border-2 border-accent bg-amber-50 p-6 print:hidden">
              <h3 className="text-xl md:text-3xl font-extrabold text-primary">Don't Lose a Year—And Don't Pay NPR 5,000 Just to Book a Seat!</h3>
              <p className="mt-2 text-slate-800 max-w-3xl">
                Many consultancies charge NPR 5,000+ just to reserve a seat or process your file.
                <strong> Recruitly Group charges NPR 0</strong> — 100% free seat booking and end-to-end admission planning for India and international destinations.
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <select aria-label="Preferred destination" className={`${field} sm:w-56`} value={pref} onChange={(e) => setPref(e.target.value)}>
                  {["India", "Abroad (Bangladesh/China/Philippines/Europe)", "India & Abroad"].map((o) => <option key={o}>{o}</option>)}
                </select>
                <a href={waHref} target="_blank" rel="noopener noreferrer" onClick={bookSeat}
                  className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white font-bold px-6 py-3 rounded-md">
                  <MessageCircle className="w-4 h-4" aria-hidden="true" /> Book My Seat for NPR 0 (Free Counseling)
                </a>
                <button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 border-2 border-primary text-primary font-bold px-6 py-3 rounded-md hover:bg-primary hover:text-white transition-colors">
                  <Printer className="w-4 h-4" aria-hidden="true" /> Save / Print My CEE Report
                </button>
              </div>
              {seatSent && <p role="status" className="text-sm text-green-800 mt-3">Request noted — a counsellor will contact you on WhatsApp.</p>}
            </div>

            {/* Sticky mobile bar */}
            <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t-2 border-accent p-3 flex gap-2 print:hidden">
              <a href={waHref} target="_blank" rel="noopener noreferrer" onClick={bookSeat} className="flex-1 text-center bg-accent text-white font-bold py-3 rounded-md text-sm">Book Seat · NPR 0</a>
              <button type="button" onClick={() => window.print()} className="px-4 border-2 border-primary text-primary font-bold rounded-md text-sm" aria-label="Print report"><Printer className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CeePredictor;
