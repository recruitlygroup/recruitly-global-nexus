import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { COUNTRY_STORE } from "@/data/countryStore";

export interface VisaFormData {
  targetCountry: string;
  sponsorType: string;
  sponsorProfession: string;
  incomeSource: string;
  monthlyIncome: string;
  taxDocuments: string;
  totalFunds: string;
  fundsHistory: string;
  suddenDeposit: string;
  accommodation: string;
  visaRefusals: string;
  refusalCountry: string;
  reappliedSuccessfully: string;
  validVisas: string[];
  studiedAbroad: string;
  studiedAbroadCountry: string;
  familyInDestination: string;
  programAvailableHome: string;
  careerPlan: string;
  offerLetter: string;
  sopStatus: string;
  propertyOwnership: string;
  employment: string;
  familyHome: string[];
  financialLiabilities: string;
  passportStatus: string;
  policeClearance: string;
  medicalTest: string;
  transcripts: string;
  whatsapp: string;
  email: string;
}

export interface VisaPredictionResult {
  visaScore: number;
  riskFlags: string[];
  travelBoost: number;
  actionItems: string[];
}

interface VisaPredictorFormProps {
  onComplete: (result: VisaPredictionResult, formData: VisaFormData) => void;
  onCancel: () => void;
  prefillCountry?: string;
  prefillWhatsapp?: string;
  prefillEmail?: string;
}

const COUNTRY_NAMES = Object.keys(COUNTRY_STORE);

const SPONSOR_OPTIONS = [
  { value: "parents", label: "Parents", emoji: "👨‍👩‍👦" },
  { value: "relatives", label: "Relatives", emoji: "👨‍💼" },
  { value: "self", label: "Self-Funded", emoji: "💼" },
  { value: "employer", label: "Employer Sponsor", emoji: "🏢" },
  { value: "scholarship", label: "Scholarship", emoji: "🎓" },
];

const INCOME_OPTIONS = [
  { value: "under-500", label: "Under $500" },
  { value: "500-1000", label: "$500–$1,000" },
  { value: "1000-2500", label: "$1,000–$2,500" },
  { value: "2500-5000", label: "$2,500–$5,000" },
  { value: "above-5000", label: "Above $5,000" },
];

const TAX_OPTIONS = [
  { value: "yes-docs", label: "Yes, with tax documents", emoji: "✅" },
  { value: "yes-no-docs", label: "Yes, but no documents", emoji: "⚠️" },
  { value: "no", label: "No", emoji: "❌" },
];

const FUNDS_OPTIONS = [
  { value: "under-5000", label: "Under $5,000" },
  { value: "5000-10000", label: "$5,000–$10,000" },
  { value: "10000-20000", label: "$10,000–$20,000" },
  { value: "20000-40000", label: "$20,000–$40,000" },
  { value: "above-40000", label: "Above $40,000" },
];

const FUNDS_HISTORY_OPTIONS = [
  { value: "less-1m", label: "Less than 1 month" },
  { value: "1-3m", label: "1–3 months" },
  { value: "3-6m", label: "3–6 months" },
  { value: "over-6m", label: "Over 6 months" },
];

const DEPOSIT_OPTIONS = [
  { value: "consistent", label: "No, consistent history", emoji: "✅" },
  { value: "large-recent", label: "Yes, large recent deposit", emoji: "⚠️" },
  { value: "cash", label: "Mostly cash transactions", emoji: "❌" },
];

const ACCOMMODATION_OPTIONS = [
  { value: "uni-housing", label: "Confirmed university housing", emoji: "✅" },
  { value: "signed-lease", label: "Signed lease/rental", emoji: "✅" },
  { value: "hotel", label: "Hotel booking only", emoji: "🏨" },
  { value: "none", label: "None yet", emoji: "❌" },
];

const REFUSAL_OPTIONS = [
  { value: "never", label: "Never refused", emoji: "❌" },
  { value: "once", label: "Once", emoji: "⚠️" },
  { value: "twice-plus", label: "Twice or more", emoji: "🔴" },
];

const VISA_TYPES = [
  { value: "UAE", label: "🇦🇪 UAE Residence/Visit Visa" },
  { value: "USA", label: "🇺🇸 USA B1/B2 or Student Visa" },
  { value: "UK", label: "🇬🇧 UK Visa" },
  { value: "Canada", label: "🇨🇦 Canada Visa" },
  { value: "Singapore", label: "🇸🇬 Singapore Visa" },
  { value: "Japan", label: "🇯🇵 Japan Visa" },
  { value: "Schengen", label: "Schengen Visa (any)" },
  { value: "None", label: "✅ None currently" },
];

const PROGRAM_HOME_OPTIONS = [
  { value: "not-available", label: "Not available", emoji: "❌" },
  { value: "lower-quality", label: "Available but lower quality", emoji: "⚠️" },
  { value: "available", label: "Available (explain why abroad)", emoji: "✅" },
];

const CAREER_OPTIONS = [
  { value: "clear", label: "Clear plan (return + job/business)", emoji: "✅" },
  { value: "general", label: "General plan", emoji: "🤔" },
  { value: "not-sure", label: "Not sure yet", emoji: "❌" },
];

const OFFER_OPTIONS = [
  { value: "unconditional", label: "Unconditional offer", emoji: "✅" },
  { value: "conditional", label: "Conditional offer", emoji: "⚠️" },
  { value: "not-applied", label: "Not yet applied", emoji: "❌" },
  { value: "in-progress", label: "Application in progress", emoji: "⏳" },
];

const SOP_OPTIONS = [
  { value: "country-specific", label: "Country-specific, detailed SOP ready", emoji: "✅" },
  { value: "generic", label: "Generic SOP", emoji: "⚠️" },
  { value: "none", label: "Not written yet", emoji: "❌" },
];

const PROPERTY_OPTIONS = [
  { value: "own-name", label: "Yes, in my name", emoji: "✅" },
  { value: "family", label: "Family property", emoji: "✅" },
  { value: "none", label: "No", emoji: "❌" },
];

const EMPLOYMENT_OPTIONS = [
  { value: "full-time", label: "Employed full-time", emoji: "✅" },
  { value: "own-business", label: "Own business", emoji: "✅" },
  { value: "part-time", label: "Part-time / freelance", emoji: "⚠️" },
  { value: "unemployed", label: "Currently unemployed/student", emoji: "❌" },
];

const FAMILY_HOME_OPTIONS = [
  { value: "parents", label: "👨‍👩‍👦 Parents" },
  { value: "spouse", label: "👫 Spouse/Partner" },
  { value: "children", label: "👶 Children" },
  { value: "siblings", label: "👨‍👩‍👧‍👦 Siblings" },
  { value: "none", label: "❌ None / all abroad" },
];

const PASSPORT_OPTIONS = [
  { value: "valid-2yr", label: "Yes, valid 2+ years", emoji: "✅" },
  { value: "expires-1yr", label: "Yes, expires within 1 year", emoji: "⚠️" },
  { value: "no", label: "No passport yet", emoji: "❌" },
];

const POLICE_OPTIONS = [
  { value: "obtained-apostilled", label: "Obtained & apostilled", emoji: "✅" },
  { value: "obtained-not-apostilled", label: "Obtained, not apostilled", emoji: "⚠️" },
  { value: "not-obtained", label: "Not obtained yet", emoji: "❌" },
];

const MEDICAL_OPTIONS = [
  { value: "completed", label: "Completed (panel doctor)", emoji: "✅" },
  { value: "scheduled", label: "Scheduled", emoji: "⚠️" },
  { value: "not-done", label: "Not done yet", emoji: "❌" },
  { value: "not-required", label: "Not required for my destination", emoji: "➖" },
];

const TRANSCRIPT_OPTIONS = [
  { value: "apostilled", label: "Apostilled & translated", emoji: "✅" },
  { value: "obtained-not-apostilled", label: "Obtained, not apostilled", emoji: "⚠️" },
  { value: "missing", label: "Missing some documents", emoji: "❌" },
];

const STEP_META: { emoji: string; bubble: string; title: string }[] = [
  { emoji: "🌍", bubble: "Which country are you planning to apply to?", title: "Select your destination" },
  { emoji: "💰", bubble: "Visa officers assess your financial stability carefully.", title: "Financial Sponsorship" },
  { emoji: "🏦", bubble: "Bank statements are scrutinized for consistency.", title: "Your proof of funds" },
  { emoji: "✈️", bubble: "Travel history tells visa officers a lot about you.", title: "Your travel history" },
  { emoji: "🎓", bubble: "Why THIS country, THIS program, and what is your plan after?", title: "Your study purpose" },
  { emoji: "🏡", bubble: "Strong ties to your home country reduce refusal risk.", title: "Your ties to your home country" },
  { emoji: "📋", bubble: "Document readiness significantly impacts processing time.", title: "Your document readiness" },
  { emoji: "🎉", bubble: "Almost there! Get your visa prediction instantly.", title: "Get Your Visa Prediction" },
];

export function calculateVisaScore(answers: VisaFormData): VisaPredictionResult {
  let score = 100;
  const flags: string[] = [];

  // FINANCIAL
  if (answers.monthlyIncome === "under-500") { score -= 25; flags.push("⚠️ Sponsor income very low for destination country requirements"); }
  else if (answers.monthlyIncome === "500-1000") { score -= 10; }
  else if (answers.monthlyIncome === "2500-5000" || answers.monthlyIncome === "above-5000") { score += 5; }

  if (answers.taxDocuments === "no") { score -= 20; flags.push("🔴 No tax documents — major red flag for financial sponsor verification"); }
  else if (answers.taxDocuments === "yes-no-docs") { score -= 10; flags.push("⚠️ Tax records exist but undocumented — obtain copies immediately"); }

  if (answers.fundsHistory === "less-1m") { score -= 20; flags.push("🔴 Funds too recent — need 3–6 month consistent bank history"); }
  else if (answers.fundsHistory === "1-3m") { score -= 10; flags.push("⚠️ Short funds history — build to 6 months for best results"); }

  if (answers.suddenDeposit === "large-recent") { score -= 15; flags.push("🔴 Sudden large deposit detected — officers will question origin of funds"); }
  else if (answers.suddenDeposit === "cash") { score -= 20; flags.push("🔴 Cash-based finances are very hard to verify for visa purposes"); }

  if (answers.totalFunds === "under-5000") { score -= 25; flags.push("🔴 Insufficient funds — below minimum for almost all destinations"); }
  else if (answers.totalFunds === "5000-10000") { score -= 10; }
  else if (answers.totalFunds === "20000-40000" || answers.totalFunds === "above-40000") { score += 10; }

  if (answers.accommodation === "none") { score -= 15; flags.push("⚠️ No accommodation proof — hotel or lease required before visa"); }
  else if (answers.accommodation === "hotel") { score -= 5; }
  else { score += 5; }

  // TRAVEL HISTORY
  if (answers.visaRefusals === "twice-plus") { score -= 30; flags.push("🔴 Multiple visa refusals — each refusal must be fully explained with supporting docs"); }
  else if (answers.visaRefusals === "once") { score -= 15; flags.push("⚠️ Prior visa refusal — prepare detailed explanation and strong supporting evidence"); }

  let travelBoost = 0;
  if (answers.validVisas?.includes("USA")) travelBoost += 12;
  if (answers.validVisas?.includes("UK")) travelBoost += 12;
  if (answers.validVisas?.includes("Canada")) travelBoost += 12;
  if (answers.validVisas?.includes("Schengen")) travelBoost += 10;
  if (answers.validVisas?.includes("UAE")) travelBoost += 8;
  if (answers.validVisas?.includes("Singapore") || answers.validVisas?.includes("Japan")) travelBoost += 6;
  if (answers.studiedAbroad === "yes") travelBoost += 5;
  score += Math.min(travelBoost, 20);

  if (answers.familyInDestination === "yes") { score -= 5; flags.push("⚠️ Family in destination country — officer may question immigration intent"); }

  // PURPOSE & INTENT
  if (answers.sopStatus === "none") { score -= 20; flags.push("🔴 No SOP written — this is required and critical for all destinations"); }
  else if (answers.sopStatus === "generic") { score -= 10; flags.push("⚠️ Generic SOP will not pass — must be country/program specific"); }
  else { score += 5; }

  if (answers.careerPlan === "not-sure") { score -= 10; flags.push("⚠️ No clear career plan — visa officers assess post-study return intent"); }
  else if (answers.careerPlan === "clear") { score += 5; }

  if (answers.offerLetter === "not-applied") { score -= 15; flags.push("🔴 No offer letter — apply to universities first before visa"); }
  else if (answers.offerLetter === "conditional") { score -= 5; }
  else if (answers.offerLetter === "unconditional") { score += 10; }

  // HOME TIES
  if (answers.propertyOwnership === "none") { score -= 5; }
  else { score += 5; }

  if (answers.employment === "unemployed") { score -= 10; flags.push("⚠️ No active employment in home country — weakens return intent case"); }
  else if (answers.employment === "full-time" || answers.employment === "own-business") { score += 8; }

  if (answers.familyHome?.includes("none")) { score -= 10; flags.push("⚠️ No immediate family in home country — major return-intent concern"); }
  else if (answers.familyHome && answers.familyHome.length >= 2) { score += 5; }

  // DOCUMENTS
  if (answers.passportStatus === "no") { score -= 20; flags.push("🔴 No passport — apply immediately, this is the first requirement"); }
  else if (answers.passportStatus === "expires-1yr") { score -= 5; flags.push("⚠️ Passport expires soon — renew before applying for visa"); }

  if (answers.policeClearance === "not-obtained") { score -= 10; flags.push("⚠️ Police clearance pending — takes 2–4 weeks, start now"); }
  if (answers.medicalTest === "not-done") { score -= 5; flags.push("⚠️ Medical/TB test required for your destination — book panel doctor appointment"); }
  if (answers.transcripts === "missing") { score -= 10; flags.push("🔴 Incomplete academic documents — all transcripts must be apostilled"); }
  else if (answers.transcripts === "apostilled") { score += 5; }

  const visaScore = Math.min(100, Math.max(0, Math.round(score)));

  // Generate top 3 action items from the biggest penalties
  const actionItems = flags.filter(f => f.startsWith("🔴")).slice(0, 3);
  if (actionItems.length < 3) {
    actionItems.push(...flags.filter(f => f.startsWith("⚠️")).slice(0, 3 - actionItems.length));
  }

  return { visaScore, riskFlags: flags, travelBoost, actionItems };
}

const VisaPredictorForm = ({ onComplete, onCancel, prefillCountry, prefillWhatsapp, prefillEmail }: VisaPredictorFormProps) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<VisaFormData>({
    targetCountry: prefillCountry || "",
    sponsorType: "", sponsorProfession: "", incomeSource: "", monthlyIncome: "", taxDocuments: "",
    totalFunds: "", fundsHistory: "", suddenDeposit: "", accommodation: "",
    visaRefusals: "", refusalCountry: "", reappliedSuccessfully: "",
    validVisas: [], studiedAbroad: "", studiedAbroadCountry: "", familyInDestination: "",
    programAvailableHome: "", careerPlan: "", offerLetter: "", sopStatus: "",
    propertyOwnership: "", employment: "", familyHome: [], financialLiabilities: "",
    passportStatus: "", policeClearance: "", medicalTest: "", transcripts: "",
    whatsapp: prefillWhatsapp || "", email: prefillEmail || "",
  });

  const totalSteps = 8;
  const progress = ((step + 1) / totalSteps) * 100;
  const meta = STEP_META[step];

  const set = useCallback((field: keyof VisaFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const toggleMulti = useCallback((field: "validVisas" | "familyHome", value: string) => {
    setFormData(prev => {
      const arr = prev[field] as string[];
      if (value === "None" || value === "none") return { ...prev, [field]: [value] };
      const filtered = arr.filter(v => v !== "None" && v !== "none");
      return { ...prev, [field]: filtered.includes(value) ? filtered.filter(v => v !== value) : [...filtered, value] };
    });
  }, []);

  const canNext = useMemo(() => {
    switch (step) {
      case 0: return !!formData.targetCountry;
      case 1: return !!formData.sponsorType && !!formData.monthlyIncome && !!formData.taxDocuments;
      case 2: return !!formData.totalFunds && !!formData.fundsHistory && !!formData.suddenDeposit && !!formData.accommodation;
      case 3: return !!formData.visaRefusals && formData.validVisas.length > 0 && !!formData.studiedAbroad && !!formData.familyInDestination;
      case 4: return !!formData.programAvailableHome && !!formData.careerPlan && !!formData.offerLetter && !!formData.sopStatus;
      case 5: return !!formData.propertyOwnership && !!formData.employment && formData.familyHome.length > 0 && !!formData.financialLiabilities;
      case 6: return !!formData.passportStatus && !!formData.policeClearance && !!formData.medicalTest && !!formData.transcripts;
      case 7: return true;
      default: return false;
    }
  }, [step, formData]);

  const handleSubmit = () => {
    const result = calculateVisaScore(formData);
    onComplete(result, formData);
  };

  const OptionButton = ({ value, label, emoji, selected, onClick }: { value: string; label: string; emoji?: string; selected: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl border-2 transition-all text-sm font-medium ${
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-card hover:border-primary/40 text-foreground"
      }`}
    >
      {emoji && <span className="mr-2">{emoji}</span>}{label}
    </button>
  );

  const MultiCheckOption = ({ value, label, checked, onToggle }: { value: string; label: string; checked: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`w-full text-left p-3 rounded-xl border-2 transition-all text-sm font-medium flex items-center gap-3 ${
        checked
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-card hover:border-primary/40 text-foreground"
      }`}
    >
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${checked ? "bg-primary border-primary" : "border-muted-foreground"}`}>
        {checked && <Check className="w-3 h-3 text-primary-foreground" />}
      </div>
      {label}
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Step {step + 1} of {totalSteps}</span>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">Cancel</button>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Speech Bubble */}
      <div className="flex items-start gap-3 mb-6">
        <div className="text-3xl">{meta.emoji}</div>
        <div className="bg-muted/50 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-foreground">
          {meta.bubble}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-border/50 shadow-lg">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-foreground">{meta.title}</h2>

              {/* STEP 0: Destination Country */}
              {step === 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-1">
                  {COUNTRY_NAMES.map(c => {
                    const info = COUNTRY_STORE[c as keyof typeof COUNTRY_STORE];
                    return (
                      <OptionButton
                        key={c}
                        value={c}
                        label={c}
                        emoji={info.flag}
                        selected={formData.targetCountry === c}
                        onClick={() => set("targetCountry", c)}
                      />
                    );
                  })}
                </div>
              )}

              {/* STEP 1: Financial Sponsorship */}
              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground font-medium">Who will sponsor your education?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {SPONSOR_OPTIONS.map(o => (
                      <OptionButton key={o.value} {...o} selected={formData.sponsorType === o.value} onClick={() => set("sponsorType", o.value)} />
                    ))}
                  </div>
                  {formData.sponsorType && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Sponsor's profession or business?</label>
                        <Input value={formData.sponsorProfession} onChange={e => set("sponsorProfession", e.target.value)} placeholder="e.g. Government employee, Business owner..." />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Main source of income?</label>
                        <Input value={formData.incomeSource} onChange={e => set("incomeSource", e.target.value)} placeholder="e.g. Salary, Business revenue..." />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Approximate monthly income?</label>
                        <div className="grid grid-cols-1 gap-2">
                          {INCOME_OPTIONS.map(o => (
                            <OptionButton key={o.value} {...o} selected={formData.monthlyIncome === o.value} onClick={() => set("monthlyIncome", o.value)} />
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Paying taxes for the past 3 years?</label>
                        <div className="grid grid-cols-1 gap-2">
                          {TAX_OPTIONS.map(o => (
                            <OptionButton key={o.value} {...o} selected={formData.taxDocuments === o.value} onClick={() => set("taxDocuments", o.value)} />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* STEP 2: Proof of Funds */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Total available funds (USD equivalent)?</label>
                    <div className="grid grid-cols-1 gap-2">
                      {FUNDS_OPTIONS.map(o => (
                        <OptionButton key={o.value} {...o} selected={formData.totalFunds === o.value} onClick={() => set("totalFunds", o.value)} />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">How long have funds been in the account?</label>
                    <div className="grid grid-cols-1 gap-2">
                      {FUNDS_HISTORY_OPTIONS.map(o => (
                        <OptionButton key={o.value} {...o} selected={formData.fundsHistory === o.value} onClick={() => set("fundsHistory", o.value)} />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Any large sudden deposits in the last 60 days?</label>
                    <div className="grid grid-cols-1 gap-2">
                      {DEPOSIT_OPTIONS.map(o => (
                        <OptionButton key={o.value} {...o} selected={formData.suddenDeposit === o.value} onClick={() => set("suddenDeposit", o.value)} />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Accommodation proof for first 30 days?</label>
                    <div className="grid grid-cols-1 gap-2">
                      {ACCOMMODATION_OPTIONS.map(o => (
                        <OptionButton key={o.value} {...o} selected={formData.accommodation === o.value} onClick={() => set("accommodation", o.value)} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Travel History */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Have you ever been refused a visa?</label>
                    <div className="grid grid-cols-1 gap-2">
                      {REFUSAL_OPTIONS.map(o => (
                        <OptionButton key={o.value} {...o} selected={formData.visaRefusals === o.value} onClick={() => set("visaRefusals", o.value)} />
                      ))}
                    </div>
                  </div>
                  {(formData.visaRefusals === "once" || formData.visaRefusals === "twice-plus") && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Which country refused you?</label>
                      <Input value={formData.refusalCountry} onChange={e => set("refusalCountry", e.target.value)} placeholder="Country name" />
                      <label className="text-sm font-medium text-foreground">Did you reapply successfully?</label>
                      <div className="flex gap-2">
                        <OptionButton value="yes" label="Yes" selected={formData.reappliedSuccessfully === "yes"} onClick={() => set("reappliedSuccessfully", "yes")} />
                        <OptionButton value="no" label="No" selected={formData.reappliedSuccessfully === "no"} onClick={() => set("reappliedSuccessfully", "no")} />
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Do you currently hold any valid visas?</label>
                    <div className="grid grid-cols-1 gap-2">
                      {VISA_TYPES.map(o => (
                        <MultiCheckOption key={o.value} value={o.value} label={o.label} checked={formData.validVisas.includes(o.value)} onToggle={() => toggleMulti("validVisas", o.value)} />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Previously studied/lived abroad for 6+ months?</label>
                    <div className="flex gap-2">
                      <OptionButton value="yes" label="✅ Yes" selected={formData.studiedAbroad === "yes"} onClick={() => set("studiedAbroad", "yes")} />
                      <OptionButton value="no" label="❌ No" selected={formData.studiedAbroad === "no"} onClick={() => set("studiedAbroad", "no")} />
                    </div>
                  </div>
                  {formData.studiedAbroad === "yes" && (
                    <Input value={formData.studiedAbroadCountry} onChange={e => set("studiedAbroadCountry", e.target.value)} placeholder="Which country?" />
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Family members who are citizens/PR of destination?</label>
                    <div className="flex gap-2">
                      <OptionButton value="yes" label="✅ Yes" selected={formData.familyInDestination === "yes"} onClick={() => set("familyInDestination", "yes")} />
                      <OptionButton value="no" label="❌ No" selected={formData.familyInDestination === "no"} onClick={() => set("familyInDestination", "no")} />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Academic & Purpose Intent */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Is this program available in your home country?</label>
                    <div className="grid grid-cols-1 gap-2">
                      {PROGRAM_HOME_OPTIONS.map(o => (
                        <OptionButton key={o.value} {...o} selected={formData.programAvailableHome === o.value} onClick={() => set("programAvailableHome", o.value)} />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Do you have a specific career plan after graduation?</label>
                    <div className="grid grid-cols-1 gap-2">
                      {CAREER_OPTIONS.map(o => (
                        <OptionButton key={o.value} {...o} selected={formData.careerPlan === o.value} onClick={() => set("careerPlan", o.value)} />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Offer letter / admission confirmation?</label>
                    <div className="grid grid-cols-1 gap-2">
                      {OFFER_OPTIONS.map(o => (
                        <OptionButton key={o.value} {...o} selected={formData.offerLetter === o.value} onClick={() => set("offerLetter", o.value)} />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">SOP / Personal Statement status?</label>
                    <div className="grid grid-cols-1 gap-2">
                      {SOP_OPTIONS.map(o => (
                        <OptionButton key={o.value} {...o} selected={formData.sopStatus === o.value} onClick={() => set("sopStatus", o.value)} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Home Country Ties */}
              {step === 5 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Do you own property in your home country?</label>
                    <div className="grid grid-cols-1 gap-2">
                      {PROPERTY_OPTIONS.map(o => (
                        <OptionButton key={o.value} {...o} selected={formData.propertyOwnership === o.value} onClick={() => set("propertyOwnership", o.value)} />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Active employment or business?</label>
                    <div className="grid grid-cols-1 gap-2">
                      {EMPLOYMENT_OPTIONS.map(o => (
                        <OptionButton key={o.value} {...o} selected={formData.employment === o.value} onClick={() => set("employment", o.value)} />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Immediate family members in your home country?</label>
                    <div className="grid grid-cols-1 gap-2">
                      {FAMILY_HOME_OPTIONS.map(o => (
                        <MultiCheckOption key={o.value} value={o.value} label={o.label} checked={formData.familyHome.includes(o.value)} onToggle={() => toggleMulti("familyHome", o.value)} />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Financial liabilities in home country (loan, mortgage, business)?</label>
                    <div className="flex gap-2">
                      <OptionButton value="yes" label="✅ Yes (shows commitment)" selected={formData.financialLiabilities === "yes"} onClick={() => set("financialLiabilities", "yes")} />
                      <OptionButton value="no" label="❌ No" selected={formData.financialLiabilities === "no"} onClick={() => set("financialLiabilities", "no")} />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: Documents */}
              {step === 6 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Do you have a valid passport?</label>
                    <div className="grid grid-cols-1 gap-2">
                      {PASSPORT_OPTIONS.map(o => (
                        <OptionButton key={o.value} {...o} selected={formData.passportStatus === o.value} onClick={() => set("passportStatus", o.value)} />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Police clearance certificate status?</label>
                    <div className="grid grid-cols-1 gap-2">
                      {POLICE_OPTIONS.map(o => (
                        <OptionButton key={o.value} {...o} selected={formData.policeClearance === o.value} onClick={() => set("policeClearance", o.value)} />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Medical/TB test status?</label>
                    <div className="grid grid-cols-1 gap-2">
                      {MEDICAL_OPTIONS.map(o => (
                        <OptionButton key={o.value} {...o} selected={formData.medicalTest === o.value} onClick={() => set("medicalTest", o.value)} />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Academic transcripts & certificates?</label>
                    <div className="grid grid-cols-1 gap-2">
                      {TRANSCRIPT_OPTIONS.map(o => (
                        <OptionButton key={o.value} {...o} selected={formData.transcripts === o.value} onClick={() => set("transcripts", o.value)} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 7: Contact + Submit */}
              {step === 7 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">WhatsApp Number</label>
                    <Input value={formData.whatsapp} onChange={e => set("whatsapp", e.target.value)} placeholder="+977 98XXXXXXXX" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <Input value={formData.email} disabled className="bg-muted" />
                  </div>
                  <p className="text-xs text-muted-foreground">Your prediction will be calculated based on our demographic model used by real visa officers.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => step > 0 ? setStep(step - 1) : onCancel()} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        {step < totalSteps - 1 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canNext} className="gap-2">
            Continue <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} className="gap-2">
            Calculate My Visa Chances <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default VisaPredictorForm;
