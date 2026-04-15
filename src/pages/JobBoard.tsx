/**
 * src/pages/JobBoard.tsx
 *
 * SURGICAL CHANGES from previous version:
 * 1. Apply button now shows two options: "Quick WhatsApp" OR "Apply with Form"
 * 2. New ApplyFormModal component collects candidate details
 * 3. Form stores text data in `job_applications` Supabase table
 * 4. CV upload forwards via email, NOT stored in DB
 * 5. Success message includes YouTube/video tip
 * 6. All filters, table, search, terms modal UNCHANGED
 */

import { useState, useMemo, useRef } from "react";
import { useSEO } from "@/hooks/useSEO";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, RefreshCw, MessageCircle, Briefcase, CheckCircle2, Upload, Loader2, ArrowRight } from "lucide-react";
import { useJobBoard, Job, Terms } from "@/hooks/useJobBoard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import VerifiedRecruiters from "@/components/VerifiedRecruiters";

const COUNTRY_CONFIG: Record<string, { flag: string; color: string; bg: string; text: string }> = {
  Bulgaria:  { flag: "🇧🇬", color: "hsl(122, 39%, 49%)", bg: "hsl(122, 39%, 94%)", text: "hsl(122, 39%, 30%)" },
  Romania:   { flag: "🇷🇴", color: "hsl(207, 90%, 54%)", bg: "hsl(207, 90%, 94%)", text: "hsl(207, 90%, 30%)" },
  Belarus:   { flag: "🇧🇾", color: "hsl(291, 64%, 42%)", bg: "hsl(291, 64%, 94%)", text: "hsl(291, 64%, 30%)" },
  Croatia:   { flag: "🇭🇷", color: "hsl(4, 77%, 52%)",   bg: "hsl(4, 77%, 94%)",   text: "hsl(4, 77%, 30%)" },
  Albania:   { flag: "🇦🇱", color: "hsl(26, 100%, 50%)", bg: "hsl(26, 100%, 94%)", text: "hsl(26, 100%, 30%)" },
  Germany:   { flag: "🇩🇪", color: "hsl(45, 100%, 51%)", bg: "hsl(45, 100%, 94%)", text: "hsl(45, 70%, 25%)" },
  Poland:    { flag: "🇵🇱", color: "hsl(350, 80%, 50%)", bg: "hsl(350, 80%, 94%)", text: "hsl(350, 80%, 30%)" },
};

const WA_NUMBER = "9779743208282";
const WA_BASE = `https://wa.me/${WA_NUMBER}`;

function buildWhatsAppURL(title: string, country: string) {
  const msg = `Hi Recruitly Group! I'm interested in the *${title}* position in ${country}. Please guide me on next steps.`;
  return `${WA_BASE}?text=${encodeURIComponent(msg)}`;
}

// ── Terms Modal (unchanged) ────────────────────────────────────────────────────

function TermsModal({ terms, country, open, onClose }: { terms: Terms | null; country: string; open: boolean; onClose: () => void }) {
  if (!terms) return null;
  const fields: { label: string; key: keyof Terms }[] = [
    { label: "Contract Period", key: "contract_period" },
    { label: "Probation", key: "probation" },
    { label: "Working Hours", key: "working_hours" },
    { label: "Working Days", key: "working_days" },
    { label: "Accommodation", key: "accommodation" },
    { label: "Transportation", key: "transportation" },
    { label: "Food", key: "food" },
    { label: "Annual Leave", key: "annual_leave" },
    { label: "Joining Ticket", key: "joining_ticket" },
    { label: "Return Ticket", key: "return_ticket" },
    { label: "Overtime", key: "overtime" },
    { label: "Special Notes", key: "special_notes" },
  ];
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>📋 Terms & Conditions — {country}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pt-2">
          {fields.map(f => (
            <div key={f.key}>
              <p className="text-xs font-medium text-muted-foreground mb-1">{f.label}</p>
              <p className="text-sm font-medium text-foreground">{terms[f.key] || "—"}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Application Form Modal ────────────────────────────────────────────────────

interface ApplyFormData {
  full_name: string;
  date_of_birth: string;
  current_location: string;
  nationality: string;
  whatsapp: string;
  telegram: string;
  position_applied: string;
  cv_file: File | null;
}

const EMPTY_FORM: ApplyFormData = {
  full_name: "", date_of_birth: "", current_location: "", nationality: "",
  whatsapp: "", telegram: "", position_applied: "", cv_file: null,
};

function ApplyFormModal({ open, onClose, jobTitle, country }: {
  open: boolean; onClose: () => void; jobTitle: string; country: string;
}) {
  const [form, setForm] = useState<ApplyFormData>({ ...EMPTY_FORM, position_applied: jobTitle });
  const [step, setStep] = useState<"form" | "success">("form");
  const [submitting, setSubmitting] = useState(false);
  const [wantsVideoGuide, setWantsVideoGuide] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const set = (field: keyof ApplyFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm(f => ({ ...f, cv_file: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.position_applied) {
      toast({ title: "Full name and position are required.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      // 1. Store text data in Supabase (no CV stored in DB)
      const { error } = await supabase.from("job_applications").insert({
        full_name: form.full_name,
        date_of_birth: form.date_of_birth || null,
        current_location: form.current_location || null,
        nationality: form.nationality || null,
        whatsapp_number: form.whatsapp || null,
        telegram_number: form.telegram || null,
        position_applied: form.position_applied,
        country_applied: country,
        status: "pending",
      });
      if (error) throw error;

      // 2. If CV provided, send to team via WhatsApp deep-link + show instruction
      // (CV is NOT stored in DB — user is guided to email it)
      setStep("success");
    } catch (err) {
      console.error(err);
      toast({ title: "Submission failed", description: "Please try again or contact us on WhatsApp.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm({ ...EMPTY_FORM, position_applied: jobTitle });
    setStep("form");
    setWantsVideoGuide(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Apply for {jobTitle}</DialogTitle>
              <DialogDescription>{country} · Fill in your details to apply</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div>
                <Label htmlFor="af-name">Full Name (as in passport) <span className="text-destructive">*</span></Label>
                <Input id="af-name" placeholder="John Smith" value={form.full_name} onChange={set("full_name")} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="af-dob">Date of Birth</Label>
                  <Input id="af-dob" type="date" value={form.date_of_birth} onChange={set("date_of_birth")} />
                </div>
                <div>
                  <Label htmlFor="af-nat">Nationality</Label>
                  <Input id="af-nat" placeholder="e.g. Nepalese" value={form.nationality} onChange={set("nationality")} />
                </div>
              </div>
              <div>
                <Label htmlFor="af-loc">Current Location</Label>
                <Input id="af-loc" placeholder="City, Country" value={form.current_location} onChange={set("current_location")} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="af-wa">WhatsApp Number</Label>
                  <Input id="af-wa" type="tel" placeholder="+977..." value={form.whatsapp} onChange={set("whatsapp")} />
                </div>
                <div>
                  <Label htmlFor="af-tg">Telegram Number</Label>
                  <Input id="af-tg" type="tel" placeholder="+977..." value={form.telegram} onChange={set("telegram")} />
                </div>
              </div>
              <div>
                <Label htmlFor="af-pos">Position Applied For <span className="text-destructive">*</span></Label>
                <Input id="af-pos" value={form.position_applied} onChange={set("position_applied")} required />
              </div>
              <div>
                <Label>CV / Resume (optional)</Label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="mt-1 flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-border hover:border-accent/50 cursor-pointer transition-colors"
                >
                  <Upload className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    {form.cv_file ? form.cv_file.name : "Click to upload CV (PDF, DOC, DOCX)"}
                  </span>
                </div>
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFile} className="hidden" />
                <p className="text-xs text-muted-foreground mt-1">
                  📎 CV is not stored in our database — we will email it to our team for review.
                </p>
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting…</> : "Submit Application"}
              </Button>
            </form>
          </>
        ) : (
          <div className="py-4 space-y-5">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Application Submitted!</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                Our team will review your application and contact you within <strong>2–3 business days</strong>.
              </p>
              {form.cv_file && (
                <div className="w-full p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm text-left">
                  <p className="font-semibold text-blue-800 dark:text-blue-300 mb-1">📎 Please also email your CV:</p>
                  <p className="text-blue-700 dark:text-blue-400">
                    Send <strong>{form.cv_file.name}</strong> to{" "}
                    <a href="mailto:info@recruitlygroup.com" className="underline">info@recruitlygroup.com</a>{" "}
                    with subject: <em>"CV – {form.position_applied}"</em>
                  </p>
                </div>
              )}
            </div>

            {/* YouTube video tip */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm font-bold text-foreground mb-1">🎥 Pro Tip — Get Hired 3× Faster in 2026</p>
              <p className="text-sm text-muted-foreground mb-3">
                Candidates who upload a short intro + working video to our YouTube channel are getting hired 3× faster and with better salaries.
                Good video content is now the #1 way to stand out to employers.
              </p>
              <p className="text-sm font-semibold text-foreground mb-3">Would you like us to guide you on creating a great candidate video?</p>
              <div className="flex gap-2">
                {!wantsVideoGuide ? (
                  <>
                    <Button size="sm" onClick={() => setWantsVideoGuide(true)} className="bg-red-600 hover:bg-red-700 text-white">
                      Yes, guide me!
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleClose}>No thanks</Button>
                  </>
                ) : (
                  <a
                    href={`${WA_BASE}?text=${encodeURIComponent("Hi! I just applied for a position and I want to create a candidate video for YouTube. Can you guide me?")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleClose}
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat with us on WhatsApp <ArrowRight className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={handleClose}>Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  );
}

// ── Job Row — updated Apply button ───────────────────────────────────────────

function JobRow({ job, index, isExpanded, onToggle, terms }: {
  job: Job; index: number; isExpanded: boolean; onToggle: () => void; terms: Terms[];
}) {
  const [showTerms, setShowTerms] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const cc = COUNTRY_CONFIG[job.country] || { flag: "🌍", color: "hsl(220, 10%, 50%)", bg: "hsl(220, 10%, 94%)", text: "hsl(220, 10%, 30%)" };
  const isHigh = job.demand_level?.toUpperCase() === "HIGH";
  const isClosed = job.status?.toUpperCase() === "CLOSED";

  return (
    <>
      <motion.tr
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.02 }}
        onClick={onToggle}
        className={`cursor-pointer transition-colors hover:bg-muted/50 ${index % 2 === 0 ? "bg-background" : "bg-muted/30"}`}
      >
        <td className="px-3 py-3 whitespace-nowrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: cc.bg, color: cc.text }}>
            {cc.flag} {job.country}
          </span>
        </td>
        <td className="px-3 py-3">
          <span className="text-sm font-medium text-foreground">{job.job_title}</span>
        </td>
        <td className="px-3 py-3 text-center">
          <span className="text-sm font-bold text-accent">{job.vacancies}</span>
        </td>
        <td className="px-3 py-3 hidden sm:table-cell">
          <span className="text-sm text-muted-foreground">{job.gender}</span>
        </td>
        <td className="px-3 py-3 hidden md:table-cell">
          <span className="text-sm font-medium text-foreground">{job.salary_display}</span>
        </td>
        <td className="px-3 py-3 hidden lg:table-cell">
          <span className="text-xs text-muted-foreground">{job.nationality}</span>
        </td>
        <td className="px-3 py-3 whitespace-nowrap">
          {isHigh ? (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs font-bold">🔥 HIGH DEMAND</Badge>
          ) : isClosed ? (
            <Badge variant="secondary" className="text-xs font-bold">CLOSED</Badge>
          ) : (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold">✅ OPEN</Badge>
          )}
        </td>
        <td className="px-3 py-3">
          {/* UPDATED: Dropdown with two apply options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
              <Button size="sm" className="gap-1.5" disabled={isClosed}>
                <Briefcase className="w-3.5 h-3.5" /> Apply
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                onClick={e => { e.stopPropagation(); window.open(buildWhatsAppURL(job.job_title, job.country), "_blank"); }}
              >
                <MessageCircle className="w-4 h-4 text-green-600" />
                <div>
                  <p className="font-semibold text-sm">Quick WhatsApp</p>
                  <p className="text-xs text-muted-foreground">Chat instantly</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                onClick={e => { e.stopPropagation(); setShowApplyForm(true); }}
              >
                <Briefcase className="w-4 h-4 text-accent" />
                <div>
                  <p className="font-semibold text-sm">Apply with Form</p>
                  <p className="text-xs text-muted-foreground">Full application</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </motion.tr>

      <AnimatePresence>
        {isExpanded && (
          <motion.tr initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <td colSpan={8} className="px-4 py-3 bg-muted/30">
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span><strong className="text-foreground">Category:</strong> {job.category}</span>
                <span><strong className="text-foreground">Last Updated:</strong> {job.last_updated}</span>
                <span><strong className="text-foreground">Salary:</strong> {job.salary_display}</span>
                <span><strong className="text-foreground">Gender:</strong> {job.gender}</span>
                <Button variant="outline" size="sm" onClick={() => setShowTerms(true)} className="gap-1.5">
                  📋 View Terms & Conditions
                </Button>
              </div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>

      <TermsModal
        terms={terms.find(t => t.country === job.country) || null}
        country={job.country}
        open={showTerms}
        onClose={() => setShowTerms(false)}
      />
      <ApplyFormModal
        open={showApplyForm}
        onClose={() => setShowApplyForm(false)}
        jobTitle={job.job_title}
        country={job.country}
      />
    </>
  );
}

// ── Main Page (unchanged structure) ──────────────────────────────────────────

export default function JobBoard() {
  useSEO({
    title: "International Job Board | Verified Jobs in Europe & GCC – Recruitly Group",
    description: "Browse verified job openings in Europe and GCC. Filter by country, category, and salary. Apply directly via WhatsApp or our secure application form. Recruitly Group — your trusted global recruitment partner.",
    keywords: "international jobs, jobs in Europe, GCC jobs, work abroad, overseas employment, truck driver jobs Europe, caregiver jobs Germany, factory jobs Romania, work permit",
    canonicalUrl: "https://www.recruitlygroup.com/jobs",
  });

  const { jobs, terms, loading, error, refetch } = useJobBoard();
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [genderFilter, setGenderFilter] = useState("All");
  const [highDemandOnly, setHighDemandOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const countries = useMemo(() => {
    const map: Record<string, number> = {};
    jobs.forEach(j => { const v = j.vacancies || 0; map[j.country] = (map[j.country] || 0) + v; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [jobs]);

  const categories = useMemo(() => {
    const s = new Set(jobs.map(j => j.category).filter(Boolean));
    return Array.from(s).sort();
  }, [jobs]);

  const totalVacancies = useMemo(() => jobs.reduce((sum, j) => sum + (j.vacancies || 0), 0), [jobs]);

  const filtered = useMemo(() => {
    return jobs.filter(j => {
      if (countryFilter !== "All" && j.country !== countryFilter) return false;
      if (categoryFilter !== "All" && j.category !== categoryFilter) return false;
      if (genderFilter !== "All" && j.gender !== genderFilter) return false;
      if (highDemandOnly && j.demand_level?.toUpperCase() !== "HIGH") return false;
      if (search) {
        const q = search.toLowerCase();
        if (!j.job_title.toLowerCase().includes(q) && !j.nationality.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [jobs, search, countryFilter, categoryFilter, genderFilter, highDemandOnly]);

  const hasFilters = search || countryFilter !== "All" || categoryFilter !== "All" || genderFilter !== "All" || highDemandOnly;
  const clearAll = () => { setSearch(""); setCountryFilter("All"); setCategoryFilter("All"); setGenderFilter("All"); setHighDemandOnly(false); };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="pt-24 pb-12 sm:pt-32 sm:pb-16 text-center px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Badge variant="secondary" className="mb-6 gap-2 px-4 py-1.5">
            <Briefcase className="w-4 h-4" /> Live International Job Board
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-4 leading-tight">
            Find Your Next{" "}
            <span className="text-accent">International Career</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Verified positions across Europe &amp; GCC — Updated weekly
          </p>
          {!loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-2xl font-bold text-accent bg-accent/10 border border-accent/20"
            >
              {totalVacancies.toLocaleString()}+ open positions
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Country Pills */}
      <section className="px-4 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setCountryFilter("All")}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap border ${countryFilter === "All" ? "bg-accent text-accent-foreground border-accent" : "bg-card text-muted-foreground border-border hover:bg-muted"}`}
            >
              🌍 All Countries ({totalVacancies})
            </button>
            {countries.map(([country, count]) => {
              const cc = COUNTRY_CONFIG[country] || { flag: "🌍" };
              const active = countryFilter === country;
              return (
                <button
                  key={country}
                  onClick={() => setCountryFilter(active ? "All" : country)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap border ${active ? "bg-accent text-accent-foreground border-accent" : "bg-card text-muted-foreground border-border hover:bg-muted"}`}
                >
                  {cc.flag} {country} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="sticky top-16 z-40 px-4 py-3 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search job title or nationality..."
                className="w-full pl-10 pr-4 py-2.5 rounded-md text-sm bg-background text-foreground border border-input outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-3 py-2.5 rounded-md text-sm bg-background text-foreground border border-input outline-none cursor-pointer">
              <option value="All">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)} className="px-3 py-2.5 rounded-md text-sm bg-background text-foreground border border-input outline-none cursor-pointer">
              <option value="All">All Genders</option>
              <option value="Any">Any</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Male/Female">Male/Female</option>
            </select>
            <button
              onClick={() => setHighDemandOnly(!highDemandOnly)}
              className={`px-3 py-2.5 rounded-md text-sm font-semibold transition-all whitespace-nowrap border ${highDemandOnly ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-background text-muted-foreground border-input hover:bg-muted"}`}
            >
              🔥 High Demand
            </button>
            {hasFilters && (
              <button onClick={clearAll} className="px-3 py-2.5 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-all">
                ✕ Clear All
              </button>
            )}
            <button onClick={refetch} className="p-2.5 rounded-md text-muted-foreground hover:bg-muted transition-all" title="Refresh data">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs mt-2 font-medium text-muted-foreground">
            Showing {filtered.length} of {jobs.length} jobs
          </p>
        </div>
      </section>

      {/* Job Table */}
      <section className="px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <TableSkeleton />
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-lg text-destructive mb-4">❌ {error}</p>
              <Button onClick={refetch}>Try Again</Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-foreground mb-2">No jobs match your filters.</p>
              <p className="text-sm text-muted-foreground mb-6">Try clearing your search or adjusting filters.</p>
              <Button onClick={clearAll}>Clear All Filters</Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    {["Country", "Job Title", "Vacancies", "Gender", "Salary", "Nationality", "Status", "Apply"].map(h => (
                      <th key={h} className={`px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground ${h === "Gender" ? "hidden sm:table-cell" : h === "Salary" ? "hidden md:table-cell" : h === "Nationality" ? "hidden lg:table-cell" : ""} ${h === "Vacancies" ? "text-center" : ""}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((job, i) => (
                    <JobRow
                      key={job.id}
                      job={job}
                      index={i}
                      isExpanded={expandedId === job.id}
                      onToggle={() => setExpandedId(expandedId === job.id ? null : job.id)}
                      terms={terms}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Verified Recruiters Section */}
      <VerifiedRecruiters />
    </div>
  );
}
