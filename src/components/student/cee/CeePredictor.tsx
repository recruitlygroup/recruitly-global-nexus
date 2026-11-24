// CEE Rank & Admission Predictor — lead gate → verified standing (real MEC 2027 lists) → named Nepal colleges
// (scholarship + paying) → named India colleges / Recruitly pathways → NPR 0 seat-booking CTA.
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle, Printer, ShieldCheck } from "lucide-react";
import { INDIA_COLLEGES, totalFee, type IndiaCollege } from "@/data/indiaColleges";
import { ASSUMPTIONS, predict, type Category, type CollegeResult, type Prediction, type Program, type Tier } from "@/lib/ceePredictor";
import { lookupByRank, lookupByRoll, lookupByScore, programStats, type Standing } from "@/lib/ceeResults";
import { track } from "@/lib/track";
import { NE_PREDICTOR } from "@/data/ceeCopyNe";
import { EMAIL_RE, NEPAL_MOBILE, submitCeeLead, whatsappUrl, type CeeLead } from "@/lib/ceeLead";

const PROGRAMS: Program[] = ["MBBS", "BDS", "BSc Nursing"];
const CATEGORIES: Category[] = ["Open", "Female", "Janajati", "Madhesi", "Dalit", "Tharu", "Muslim", "Backward Area", "Foreign"];
const BUDGETS = ["Scholarship Only", "Up to 45 Lakhs NPR", "45–60 Lakhs NPR", "Flexible / India & Abroad Options"] as const;

const field = "w-full h-11 rounded-md border border-border bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary";
const label = "block text-sm font-semibold text-primary mb-1";

const TIER_UI: Record<Tier, { dot: string; title: string; cls: string; word: string }> = {
  high: { dot: "🟢", title: "High Probability", cls: "bg-green-50 border-green-600 text-green-900", word: "High chance" },
  borderline: { dot: "🟡", title: "Borderline / Mop-Up Round Chance", cls: "bg-amber-50 border-amber-600 text-amber-900", word: "Borderline" },
  low: { dot: "🔴", title: "Low Probability / Unlikely in Nepal", cls: "bg-red-50 border-red-600 text-red-900", word: "Unlikely" },
};
type Tr = (s: string) => string;
const pctLabel = (r: CollegeResult, T: Tr) => `${TIER_UI[r.tier].dot} ${r.probability < 5 ? "<5%" : `${r.probability}%`} · ${T(TIER_UI[r.tier].word)}`;
const inr = (n: number) => `₹${(n / 100000).toFixed(2).replace(/\.?0+$/, "")} lakh`;

interface FormState { consent: boolean; website: string; fullName: string; phone: string; email: string; rollNo: string; rank: string; score: string; program: Program; category: Category; budget: (typeof BUDGETS)[number]; district: string; guardianPhone: string }
const INITIAL: FormState = { consent: false, website: "", fullName: "", phone: "", email: "", rollNo: "", rank: "", score: "", program: "MBBS", category: "Open", budget: "Flexible / India & Abroad Options", district: "", guardianPhone: "" };

type PoolTab = "scholarship" | "paying";
const VISIBLE = 12;

const CollegeTable = ({ rows, pool, showAll, T }: { rows: CollegeResult[]; pool: PoolTab; showAll: boolean; T: Tr }) => {
  const sorted = [...rows].sort((a, b) => b.probability - a.probability || b.seats - a.seats);
  const shown = showAll ? sorted : sorted.slice(0, VISIBLE);
  return (
    <div className="overflow-x-auto border border-border rounded-md bg-white">
      <table className="w-full text-sm min-w-[640px]">
        <thead className="bg-muted text-left text-primary">
          <tr>
            <th className="p-3">{T("College")}</th><th className="p-3">{T("Seats")}</th><th className="p-3">{T("Est. closing rank")}</th>
            {pool === "paying" && <th className="p-3">{T("Tuition (MEC ceiling)")}</th>}
            <th className="p-3">{T("Admission likelihood")}</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((r) => (
            <tr key={r.college.id} className="border-t border-border align-top">
              <td className="p-3"><span className="font-semibold">{r.college.name}</span>
                <span className="block text-xs text-slate-600">{[r.college.city, r.college.affiliation && `${r.college.affiliation} affiliation`].filter(Boolean).join(" · ")}</span></td>
              <td className="p-3">{r.seats}</td>
              <td className="p-3">≈ {r.estClosingRank.toLocaleString()}</td>
              {pool === "paying" && <td className="p-3">{r.feeText}{r.withinBudget === false && <span className="block text-xs text-red-700">{T("Above your budget")}</span>}</td>}
              <td className="p-3 font-bold whitespace-nowrap">{pctLabel(r, T)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const IndiaCard = ({ c, gender }: { c: IndiaCollege; gender?: "f" | "m" }) => {
  const y = c.fee?.yearly;
  const plan = y && (y.all ?? (gender === "m" ? y.m : y.f) ?? y.f);
  return (
    <div className="bg-white/10 print:bg-transparent rounded-md p-3 text-sm">
      <p className="font-bold">{c.name}</p>
      <p className="opacity-90">{c.city}{c.note ? ` · ${c.note}` : ""}</p>
      {c.fee && plan ? (
        <p className="mt-1">
          Fees: Year 1 {inr(plan[0])}, then {inr(plan[1])}/yr · 4-year total ≈ <strong>{inr(totalFee(plan))}</strong> incl. {c.fee.includes.toLowerCase()}. Extra: {c.fee.extras.join(", ")}.
        </p>
      ) : <p className="mt-1 opacity-90">Fee sheet on request — current seat availability for Nepali nationals confirmed by our counsellor.</p>}
    </div>
  );
};

const CeePredictor = ({ lang = "en" }: { lang?: "en" | "ne" }) => {
  const T: Tr = (s) => (lang === "ne" ? NE_PREDICTOR[s] ?? s : s);
  const [f, setF] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [lead, setLead] = useState<CeeLead | null>(null);
  const [leadId, setLeadId] = useState<string>();
  const [saveState, setSaveState] = useState<"saved" | "failed" | "retrying">("saved");
  const [standing, setStanding] = useState<Standing | null>(null);
  const [notQualified, setNotQualified] = useState<{ program: Program; cutoff: number } | null>(null);
  const [pred, setPred] = useState<Prediction | null>(null);
  const [tab, setTab] = useState<PoolTab>("scholarship");
  const [showAll, setShowAll] = useState(false);
  const [pref, setPref] = useState("India");
  const [seatSent, setSeatSent] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((s) => ({ ...s, [k]: v }));

  const basicErrors = () => {
    const e: Record<string, string> = {};
    if (f.fullName.trim().length < 2) e.fullName = T("Enter your full name.");
    if (!NEPAL_MOBILE.test(f.phone.trim())) e.phone = T("Enter a 10-digit mobile number starting with 97 or 98.");
    if (!EMAIL_RE.test(f.email.trim())) e.email = T("Enter a valid email address.");
    if (!f.rollNo && !f.rank && !f.score) e.rollNo = T("Enter your CEE roll number, rank or score.");
    if (f.guardianPhone && !NEPAL_MOBILE.test(f.guardianPhone.trim())) e.guardianPhone = "Use a 10-digit number starting with 97 or 98.";
    if (!f.consent) e.consent = T("Please tick the box so we may contact you about your report.");
    return e;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = basicErrors();
    setErrors(e);
    if (Object.keys(e).length) return;
    setSubmitting(true);
    let found: Standing | null = null;
    let program = f.program;
    try {
      if (f.rollNo) {
        found = await lookupByRoll(Number(f.rollNo));
        if (!found) e.rollNo = "Roll number not found in the MECEE-BL 2027 MBBS, BDS or BSc Nursing result lists. Check it, or enter your rank/score instead.";
        else program = found.program;
      } else if (f.rank) {
        found = await lookupByRank(program, Number(f.rank));
        if (!found) e.rank = `Rank not found on the ${program} list. Check the program selected.`;
      } else {
        const score = Number(f.score);
        if (isNaN(score) || score < 0 || score > 200) e.score = "Enter a valid score (0–200).";
        else {
          found = await lookupByScore(program, score);
          if (!found) { setNotQualified({ program, cutoff: (await programStats(program)).cutoff }); }
        }
      }
    } catch {
      e.rollNo = "Couldn't load the result database. Please check your connection and try again.";
    }
    setErrors(e);
    if (Object.keys(e).length) { setSubmitting(false); return; }

    const qualified = !!found;
    if (found) setNotQualified(null);
    const rank = found?.rank ?? 1e9;
    const p = predict(program, rank, qualified, f.category, f.budget);
    const l: CeeLead = {
      fullName: f.fullName.trim(), phone: f.phone.trim(), email: f.email.trim(), rollNo: f.rollNo || undefined,
      rank: found?.rank, score: found?.score ?? (f.score ? Number(f.score) : undefined),
      program, category: f.category, budget: f.budget, district: f.district.trim() || undefined,
      guardianPhone: f.guardianPhone.trim() || undefined, overallTier: p.overall, consent: f.consent,
    };
    track("cee_lookup", { program, lookup_by: f.rollNo ? "roll" : f.rank ? "rank" : "score", qualified, nepal_tier: p.overall });
    if (f.website) { setSaveState("saved"); } // honeypot filled by bots: show nothing special, store nothing
    else {
      try {
        setLeadId(await submitCeeLead(l)); setSaveState("saved");
        track("generate_lead", { market: "nepal_cee", program, nepal_tier: p.overall, budget: f.budget, category: f.category });
      } catch { setSaveState("failed"); track("cee_lead_save_failed", { program }); } // never block the report itself
    }
    setStanding(found); setLead(l); setPred(p); setTab("scholarship"); setShowAll(false); setSubmitting(false);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const showPivot = !!pred && (pred.overall !== "high" || f.budget !== "Scholarship Only");
  const waHref = lead ? whatsappUrl(lead, pref) : "#";
  const bookSeat = () => { if (!lead) return; track("cee_seat_booking_click", { destination: "whatsapp", program: lead.program, nepal_tier: lead.overallTier, preference: pref }); setSeatSent(true); void submitCeeLead(lead, true, leadId).catch(() => undefined); };
  const retrySave = async () => {
    if (!lead) return;
    setSaveState("retrying");
    try {
      setLeadId(await submitCeeLead(lead, false, leadId)); setSaveState("saved");
      track("generate_lead", { market: "nepal_cee", program: lead.program, nepal_tier: lead.overallTier, budget: lead.budget, category: lead.category, retry: true });
    } catch { setSaveState("failed"); }
  };
  const doPrint = () => { track("cee_print_report", { program: lead?.program }); setShowAll(true); setTimeout(() => window.print(), 100); };
  const err = (k: string) => (errors[k] ? <p role="alert" className="text-xs text-red-700 mt-1">{errors[k]}</p> : null);
  const tierUi = pred ? TIER_UI[pred.overall] : null;
  const indiaFiltered = pred ? INDIA_COLLEGES.filter((c) => c.programs.includes(pred.program)) : [];

  return (
    <section id="cee-predictor" aria-labelledby="cee-heading" className="bg-white border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div className="max-w-3xl mb-6 print:hidden">
          <p className="text-xs font-bold uppercase tracking-wider text-accent mb-2">{T("Free tool · Takes 60 seconds")}</p>
          <h2 id="cee-heading" className="text-2xl md:text-4xl font-extrabold text-primary">{T("CEE Rank & Admission Predictor")}</h2>
          <p className="mt-2 text-slate-700">
            {T("Enter your roll number, rank or score. We match it against the complete MEC MECEE-BL 2027 result lists (MBBS, BDS and BSc Nursing), then name the Nepal scholarship and paying colleges you can realistically target — plus back-up options in India and abroad.")}
          </p>
        </div>

        <form onSubmit={onSubmit} noValidate className="relative grid md:grid-cols-2 lg:grid-cols-3 gap-4 bg-background border border-border rounded-md p-4 md:p-6 print:hidden">
          <div><label className={label} htmlFor="cee-name">{T("Full name *")}</label>
            <input id="cee-name" className={field} value={f.fullName} onChange={(e) => set("fullName", e.target.value)} autoComplete="name" />{err("fullName")}</div>
          <div><label className={label} htmlFor="cee-phone">{T("Phone / WhatsApp *")}</label>
            <input id="cee-phone" className={field} inputMode="numeric" maxLength={10} placeholder="98XXXXXXXX" value={f.phone} onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))} autoComplete="tel" />{err("phone")}</div>
          <div><label className={label} htmlFor="cee-email">{T("Gmail / Email *")}</label>
            <input id="cee-email" type="email" className={field} value={f.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />{err("email")}</div>
          <div><label className={label} htmlFor="cee-roll">{T("CEE roll number *")}</label>
            <input id="cee-roll" className={field} inputMode="numeric" placeholder="e.g. 28387 (finds your exact rank)" value={f.rollNo} onChange={(e) => set("rollNo", e.target.value.replace(/\D/g, ""))} />{err("rollNo")}</div>
          <div><label className={label} htmlFor="cee-rank">{T("…or CEE rank")}</label>
            <input id="cee-rank" className={field} inputMode="numeric" placeholder="e.g. 1250" value={f.rank} onChange={(e) => set("rank", e.target.value.replace(/\D/g, ""))} />{err("rank")}</div>
          <div><label className={label} htmlFor="cee-score">{T("…or CEE score")}</label>
            <input id="cee-score" className={field} inputMode="decimal" placeholder="e.g. 104.25" value={f.score} onChange={(e) => set("score", e.target.value)} />{err("score")}</div>
          <div><label className={label} htmlFor="cee-program">{T("Result list / program *")}</label>
            <select id="cee-program" className={field} value={f.program} onChange={(e) => set("program", e.target.value as Program)}>{PROGRAMS.map((p) => <option key={p}>{p}</option>)}</select>
            <p className="text-xs text-slate-600 mt-1">{T("Roll number auto-detects this. Needed only for rank/score.")}</p></div>
          <div><label className={label} htmlFor="cee-cat">{T("Reservation / quota *")}</label>
            <select id="cee-cat" className={field} value={f.category} onChange={(e) => set("category", e.target.value as Category)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div><label className={label} htmlFor="cee-budget">{T("Budget range *")}</label>
            <select id="cee-budget" className={field} value={f.budget} onChange={(e) => set("budget", e.target.value as FormState["budget"])}>{BUDGETS.map((b) => <option key={b}>{b}</option>)}</select></div>
          <div><label className={label} htmlFor="cee-district">{T("Home district / city (optional)")}</label>
            <input id="cee-district" className={field} placeholder="Kathmandu, Pokhara, Chitwan…" value={f.district} onChange={(e) => set("district", e.target.value)} /></div>
          <div className="lg:col-span-2"><label className={label} htmlFor="cee-guardian">{T("Optional: Send fee structure directly to Parent/Guardian")}</label>
            <input id="cee-guardian" className={field} inputMode="numeric" maxLength={10} placeholder="Guardian WhatsApp 98XXXXXXXX" value={f.guardianPhone} onChange={(e) => set("guardianPhone", e.target.value.replace(/\D/g, ""))} />{err("guardianPhone")}</div>
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label htmlFor="cee-website">Leave this field empty</label>
            <input id="cee-website" tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => set("website", e.target.value)} />
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <label className="flex items-start gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" className="mt-1 h-4 w-4" checked={f.consent} onChange={(e) => set("consent", e.target.checked)} aria-describedby="cee-consent-err" />
              <span>{T("I agree that Recruitly Group may contact me by phone, WhatsApp and email about my CEE report and study options. If I add a parent/guardian number, I confirm they agree to be contacted. See our ")}<Link to="/privacy" className="underline text-primary">{T("Privacy Policy")}</Link>.</span>
            </label>
            <div id="cee-consent-err">{err("consent")}</div>
          </div>
          <div className="md:col-span-2 lg:col-span-3 flex flex-col sm:flex-row sm:items-center gap-3">
            <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 disabled:opacity-60 text-white font-bold px-6 py-3 rounded-md">
              {submitting ? T("Checking MEC results…") : T("Show my admission chances")} <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
            <p className="text-xs text-slate-600 flex items-center gap-1"><ShieldCheck className="w-4 h-4" aria-hidden="true" /> {T("Your details are used only to send your report and counselling. Free, no obligation.")}</p>
          </div>
        </form>

        {pred && lead && tierUi && (
          <div ref={resultRef} id="cee-report" className="mt-10 space-y-8 scroll-mt-24">
            {saveState !== "saved" && (
              <div role="alert" className="border-l-4 border-amber-600 bg-amber-50 text-amber-900 rounded-md p-4 print:hidden">
                <p className="font-semibold">{T("We couldn't save your details to our team.")}</p>
                <p className="text-sm mt-1">Your report below is unaffected. Please try again, or message us on WhatsApp so a counsellor can follow up.</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <button type="button" onClick={retrySave} disabled={saveState === "retrying"} className="bg-primary text-white font-bold px-4 py-2 rounded-md text-sm disabled:opacity-60">{saveState === "retrying" ? "…" : T("Try again")}</button>
                  <a href={waHref} target="_blank" rel="noopener noreferrer" className="border-2 border-primary text-primary font-bold px-4 py-2 rounded-md text-sm">{T("Message us on WhatsApp")}</a>
                </div>
              </div>
            )}
            <div className="bg-white border border-border rounded-md p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-accent">{T("Your MECEE-BL 2027 result")} · {lead.program}</p>
              {standing ? (
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div><p className="text-xs text-slate-600">{T("Rank")}</p><p className="text-2xl font-extrabold text-primary">{standing.rank.toLocaleString()}</p></div>
                  <div><p className="text-xs text-slate-600">{T("Score")}</p><p className="text-2xl font-extrabold text-primary">{standing.score}</p></div>
                  <div><p className="text-xs text-slate-600">{T("Percentile")}</p><p className="text-2xl font-extrabold text-primary">{standing.aheadOfPercent}%</p><p className="text-xs text-slate-600">{T("ahead of qualified candidates")}</p></div>
                  <div><p className="text-xs text-slate-600">{T("Qualified candidates")}</p><p className="text-2xl font-extrabold text-primary">{standing.qualified.toLocaleString()}</p><p className="text-xs text-slate-600">{T("cut-off score")} {standing.cutoff}</p></div>
                </div>
              ) : (
                <p className="mt-2 text-slate-800">Your score is below the {lead.program} qualifying cut-off{notQualified ? ` (${notQualified.cutoff})` : ""}, so a Nepal seat through MECEE-BL is not possible this cycle. See your India and abroad options below.</p>
              )}
              {standing && !standing.exact && <p className="text-xs text-slate-600 mt-2">No candidate has exactly this {f.rank ? "rank" : "score"}; the nearest listed record is shown.</p>}
            </div>

            <div className={`border-l-4 rounded-md p-5 ${tierUi.cls}`}>
              <p className="text-xs font-bold uppercase tracking-wider">{T("Nepal admission status for")} {lead.fullName}</p>
              <p className="text-2xl font-extrabold mt-1">{tierUi.dot} {T(tierUi.title)}</p>
              <p className="text-sm mt-1">{lead.program} · {lead.category} quota · Budget: {lead.budget}</p>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3 print:hidden" role="tablist" aria-label="Nepal colleges">
                {([["scholarship", T("🎓 Eligible Scholarship Colleges in Nepal")], ["paying", T("🏥 Eligible Paying Colleges in Nepal")]] as const).map(([t, text]) => (
                  <button key={t} role="tab" aria-selected={tab === t} onClick={() => { setTab(t); setShowAll(false); }}
                    className={`px-4 py-2 rounded-md text-sm font-bold border ${tab === t ? "bg-primary text-white border-primary" : "bg-white text-primary border-border"}`}>{text}</button>
                ))}
              </div>
              {(["scholarship", "paying"] as const).map((pool) => (
                <div key={pool} className={tab === pool ? "" : "hidden print:block print:mt-6"}>
                  <h3 className="font-bold text-primary mb-1">{pool === "scholarship" ? `🎓 ${lead.program} — Government / scholarship colleges` : `🏥 ${lead.program} — Private / paying colleges`}</h3>
                  <p className="text-xs text-slate-600 mb-2">
                    {pool === "scholarship"
                      ? "Government colleges give about 75% of seats as scholarships. Private colleges also hold roughly 10% scholarship seats, allotted by quota merit at counselling."
                      : "Tuition shown is the MEC ceiling for Nepali paying seats."}
                  </p>
                  <CollegeTable rows={pool === "scholarship" ? pred.scholarship : pred.paying} pool={pool} showAll={showAll} T={T} />
                  {!showAll && (pool === "scholarship" ? pred.scholarship : pred.paying).length > VISIBLE && (
                    <button type="button" onClick={() => setShowAll(true)} className="mt-2 text-sm font-bold text-primary underline print:hidden">Show all {(pool === "scholarship" ? pred.scholarship : pred.paying).length} colleges</button>
                  )}
                </div>
              ))}
            </div>

            <details className="text-xs text-slate-600">
              <summary className="cursor-pointer font-semibold">{T("How these numbers are calculated")}</summary>
              <ul className="list-disc pl-5 mt-2 space-y-1">{ASSUMPTIONS.map((a) => <li key={a}>{a}</li>)}</ul>
              <p className="mt-2">Indicative only. Actual results depend on MEC's counselling rounds, your college priority list and seat allocation.</p>
            </details>

            {showPivot && (
              <div className="bg-primary text-white rounded-md p-6 space-y-6 print:border print:border-black print:bg-white print:text-black">
                <h3 className="text-xl md:text-2xl font-extrabold">Guaranteed Alternative Pathways: Study {lead.program} in India &amp; Abroad</h3>

                <div>
                  <h4 className="font-bold mb-2">🇮🇳 Named {lead.program} colleges in India</h4>
                  <div className="grid md:grid-cols-2 gap-3">{indiaFiltered.map((c) => <IndiaCard key={c.name} c={c} />)}</div>
                  <ul className="list-disc pl-5 mt-3 text-sm space-y-1">
                    <li><strong>MEC Eligibility Certificate:</strong> Nepali students must obtain it from the Medical Education Commission before enrolling abroad; we guide the full process.</li>
                    <li><strong>NEET-UG:</strong> required for MBBS and BDS admission in India. BSc Nursing is admitted on merit — no NEET.</li>
                    <li>Seats for Nepali nationals and fees change every year; our counsellor confirms current availability before you pay anything.</li>
                  </ul>
                </div>

                <div className="border-t border-white/30 pt-5">
                  <h4 className="text-lg font-extrabold mb-3">Why We Are Different From Every Other Consultancy in Nepal</h4>
                  <ul className="grid md:grid-cols-2 gap-3 text-sm">
                    <li className="bg-white/10 print:bg-transparent rounded-md p-3">🇪🇺 <strong>Bulgaria-Licensed European Company.</strong> Unlike local middlemen, Recruitly Group is an officially registered and licensed European recruitment organisation in Bulgaria.</li>
                    <li className="bg-white/10 print:bg-transparent rounded-md p-3">🏥 <strong>100% Guaranteed Placement in German Hospitals — For Free.</strong> Especially for BSc Nursing graduates and healthcare students: a guaranteed career pathway into German hospitals at zero recruitment cost.*</li>
                    <li className="bg-white/10 print:bg-transparent rounded-md p-3">🤝 <strong>Ethical, Zero-Fee Recruitment Model.</strong> We do not charge students exploitative agency or placement fees. We operate on an Employer-Pays / Zero-Fee model — NPR 0 seat booking instead of the NPR 5,000+ others charge.</li>
                    <li className="bg-white/10 print:bg-transparent rounded-md p-3">🇩🇪 <strong>Free German Language Classes From Day 1.</strong> Join free German classes alongside your degree so you graduate ready for direct hospital placement in Germany.</li>
                  </ul>
                  <p className="text-xs opacity-80 mt-2">*Eligibility and programme terms apply; ask your counsellor for the written terms.</p>
                </div>

                <div className="bg-white text-primary rounded-md p-4 print:hidden">
                  <p className="font-semibold">Planning to study in the <strong>US, Australia, New Zealand, or other European countries</strong> instead? Check your instant university admission &amp; scholarship eligibility on <strong>WiseScore</strong>.</p>
                  <Link to="/wisescore" className="inline-flex items-center gap-2 mt-3 bg-accent hover:bg-accent/90 text-white font-bold px-5 py-3 rounded-md">Explore US, Australia, NZ &amp; Europe on WiseScore →</Link>
                </div>
              </div>
            )}

            <div id="seat-booking" className="rounded-md border-2 border-accent bg-amber-50 p-6 print:hidden">
              <h3 className="text-xl md:text-3xl font-extrabold text-primary">{T("Don't Lose a Year—And Don't Pay NPR 5,000 Just to Book a Seat!")}</h3>
              <p className="mt-2 text-slate-800 max-w-3xl">
                {T("Many consultancies charge NPR 5,000+ just to reserve a seat or process your file.")}
                <strong> {T("Recruitly Group charges NPR 0")}</strong> {T("— 100% free seat booking and end-to-end admission planning for India and international destinations.")}
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <select aria-label="Preferred destination" className={`${field} sm:w-56`} value={pref} onChange={(e) => setPref(e.target.value)}>
                  {["India", "Abroad (Bangladesh/China/Philippines/Europe)", "India & Abroad"].map((o) => <option key={o}>{o}</option>)}
                </select>
                <a href={waHref} target="_blank" rel="noopener noreferrer" onClick={bookSeat} className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white font-bold px-6 py-3 rounded-md">
                  <MessageCircle className="w-4 h-4" aria-hidden="true" /> {T("Book My Seat for NPR 0 (Free Counseling)")}</a>
                <button type="button" onClick={doPrint} className="inline-flex items-center justify-center gap-2 border-2 border-primary text-primary font-bold px-6 py-3 rounded-md hover:bg-primary hover:text-white transition-colors">
                  <Printer className="w-4 h-4" aria-hidden="true" /> {T("Save / Print My CEE Report")}</button>
              </div>
              {seatSent && <p role="status" className="text-sm text-green-800 mt-3">{T("Request noted — a counsellor will contact you on WhatsApp.")}</p>}
            </div>

            <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t-2 border-accent p-3 flex gap-2 print:hidden">
              <a href={waHref} target="_blank" rel="noopener noreferrer" onClick={bookSeat} className="flex-1 text-center bg-accent text-white font-bold py-3 rounded-md text-sm">{T("Book Seat · NPR 0")}</a>
              <button type="button" onClick={doPrint} className="px-4 border-2 border-primary text-primary font-bold rounded-md text-sm" aria-label="Print report"><Printer className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CeePredictor;
