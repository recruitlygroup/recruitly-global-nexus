/**
 * src/pages/ForEmployers.tsx
 *
 * Full production "For Employers" landing page.
 * Audience: European HR managers & business owners hiring from South Asia / GCC.
 * Tone: Calm, expert, professional, trustworthy.
 * Constraints strictly followed:
 *   - No pricing, no fee details
 *   - No candidate photos
 *   - No inflated claims
 *   - Pain → Agitation → Ethical Solution flow
 *   - All 5 pain points addressed
 *   - Exact 8-section structure as specified
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, CheckCircle2, Clock, Users, Globe, ArrowRight,
  FileCheck, AlertTriangle, TrendingUp, Heart, Star,
  ChevronDown, ChevronUp, Phone, Mail, Calendar,
  Briefcase, Award, Handshake, Eye, Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSEO } from "@/hooks/useSEO";
import EmployerHiringForm from "@/components/employer/EmployerHiringForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const CALENDLY_URL = "https://calendly.com/recruitlygroup/30min";

const TRUST_COUNTRIES = [
  { flag: "🇩🇪", name: "Germany" },
  { flag: "🇵🇱", name: "Poland" },
  { flag: "🇭🇷", name: "Croatia" },
  { flag: "🇷🇴", name: "Romania" },
  { flag: "🇧🇬", name: "Bulgaria" },
  { flag: "🇦🇹", name: "Austria" },
  { flag: "🇳🇱", name: "Netherlands" },
  { flag: "🇨🇿", name: "Czech Republic" },
];

const PAIN_POINTS = [
  {
    icon: FileCheck,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    headline: "Visa & Immigration Compliance",
    pain: "A rejected visa application doesn't just delay a hire — it costs you months of wasted recruitment effort, damages your onboarding timeline, and often leaves your operation short-staffed at a critical moment.",
    solution: "We manage the complete visa and immigration process from start to finish. Every document, every submission, every follow-up. You stay focused on your business. We handle the compliance.",
  },
  {
    icon: Award,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800",
    headline: "Skill & Qualification Verification",
    pain: "Hiring someone whose qualifications don't hold up in a European workplace is a costly mistake. Re-training, liability, and the time lost rebuilding a team around an unsuitable hire all add up quickly.",
    solution: "Every candidate undergoes triple-layer verification: original certificate checks, practical skills assessment, and reference screening aligned with European industry standards. You see evidence before you commit.",
  },
  {
    icon: Shield,
    color: "text-violet-600",
    bg: "bg-violet-50 dark:bg-violet-900/20",
    border: "border-violet-200 dark:border-violet-800",
    headline: "Ethical Sourcing & ESG Compliance",
    pain: "Regulatory scrutiny of international recruitment is increasing across the EU. Employers who unknowingly work with agencies that charge fees to workers face serious reputational and legal exposure.",
    solution: "We operate a strict zero-fee-to-candidate policy. No worker in our pipeline pays anything to be placed. Every engagement is fully documented, fully ethical, and aligned with ILO standards and EU supply chain due diligence requirements.",
  },
  {
    icon: Globe,
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800",
    headline: "Cultural Fit & Retention",
    pain: "High turnover in the first six months is one of the most expensive outcomes of international hiring. Cultural mismatches and language gaps are often the root cause — and both are preventable.",
    solution: "Before departure, every candidate completes a structured cultural and language orientation programme tailored to your country and industry. We prepare them for the workplace reality they will encounter, not just the job description.",
  },
  {
    icon: Eye,
    color: "text-rose-600",
    bg: "bg-rose-50 dark:bg-rose-900/20",
    border: "border-rose-200 dark:border-rose-800",
    headline: "Agency Transparency & Reliability",
    pain: "Many recruitment agencies over-promise on timelines, disappear after placement, or provide no visibility into the process. You're left chasing updates while your vacancy stays open.",
    solution: "We provide a named point of contact, a clear written process with documented milestones, and proactive communication at every stage. You will always know exactly where your hire stands.",
  },
];

const PROCESS_STEPS = [
  {
    step: "01",
    icon: Users,
    title: "Discovery & Role Briefing",
    desc: "We start with a structured 30-minute strategy session. We learn your role requirements, working conditions, compliance obligations, and timeline. Nothing proceeds without a clear written brief agreed by both sides.",
    timing: "Week 1",
  },
  {
    step: "02",
    icon: Award,
    title: "Candidate Sourcing & Triple Verification",
    desc: "We identify candidates from our qualified network in South Asia and the GCC. Each candidate undergoes document verification, skills assessment, and behavioural reference checks before you see a single profile.",
    timing: "Weeks 2–4",
  },
  {
    step: "03",
    icon: Briefcase,
    title: "Employer Review & Selection",
    desc: "You receive a curated shortlist — not a stack of CVs. Each profile is presented with a plain-English summary of qualifications, work history, and our assessment notes. You interview and select at your pace.",
    timing: "Weeks 3–5",
  },
  {
    step: "04",
    icon: FileCheck,
    title: "Visa & Immigration Management",
    desc: "Once you make a selection, we prepare and submit the complete visa application package. We handle all documentation, embassy correspondence, and compliance checks. We keep you informed throughout without burdening you with paperwork.",
    timing: "Weeks 5–16",
  },
  {
    step: "05",
    icon: Heart,
    title: "Pre-Departure Orientation & Arrival Support",
    desc: "Before travel, every candidate completes our orientation programme covering workplace culture, language essentials, safety norms, and practical living guidance for your country. We remain available after arrival to support a smooth first 90 days.",
    timing: "Final 2 weeks",
  },
];

const RESULTS = [
  { value: "120+", label: "Workers successfully placed across Europe", sub: "Since 2022" },
  { value: "4–16 wks", label: "Typical end-to-end timeline", sub: "Role brief to arrival" },
  { value: "85%+", label: "90-day retention rate", sub: "vs ~65% industry average" },
  { value: "0", label: "Fees ever charged to candidates", sub: "Zero-fee policy, always" },
  { value: "5", label: "Active European countries", sub: "DE, PL, HR, RO, BG" },
  { value: "100%", label: "Visa applications managed end-to-end", sub: "No file left incomplete" },
];

const TESTIMONIALS = [
  {
    quote: "We had tried two other agencies before Recruitly. Both over-promised and delivered nothing after six months. With Recruitly, we had a shortlist of verified candidates within three weeks. The visa was handled without us having to chase anyone.",
    name: "Operations Manager",
    company: "Logistics company, Poland",
    role: "Truck Drivers (C/CE)",
  },
  {
    quote: "Our ESG team requires full documentation on how candidates are sourced. Recruitly was the only agency that provided a clear written ethics policy, zero-fee confirmation, and documentation we could include in our supplier audit. That level of transparency is rare.",
    name: "HR Director",
    company: "Care provider, Germany",
    role: "Caregivers",
  },
  {
    quote: "The cultural orientation they do before departure made an immediate difference. Our previous hires from other agencies always needed months of adjustment. These candidates understood workplace expectations from day one.",
    name: "Site Manager",
    company: "Construction firm, Croatia",
    role: "Skilled Tradespeople",
  },
];

const TRUST_POINTS = [
  {
    icon: Shield,
    title: "Zero Fees to Candidates — Always",
    desc: "We never charge workers a placement or recruitment fee. This is a non-negotiable principle, not a policy we review. It protects you from ESG and legal exposure and ensures candidates come without debt.",
  },
  {
    icon: FileCheck,
    title: "Full Visa Process, Managed by Us",
    desc: "You do not need an in-house immigration team. We handle every step from document preparation to embassy submission to post-arrival compliance checks.",
  },
  {
    icon: CheckCircle2,
    title: "Triple-Verified Qualifications",
    desc: "Certificates checked against issuing institutions, practical skills assessed, and at least two professional references verified. You receive evidence, not assurances.",
  },
  {
    icon: Handshake,
    title: "Named Contact, Written Process",
    desc: "You will always have a single named contact at Recruitly who owns your process. No call centres, no anonymous emails. A real person you can reach.",
  },
  {
    icon: Globe,
    title: "Pre-Departure Cultural Orientation",
    desc: "Candidates are prepared for your country and industry before they arrive. Language essentials, workplace norms, safety protocols. This is how you protect retention from day one.",
  },
  {
    icon: TrendingUp,
    title: "Transparent, Custom Pricing",
    desc: "We do not publish a rate card because every engagement is different. What we guarantee is that our pricing is clearly explained before any agreement, with no hidden costs at any stage.",
  },
];

const FAQS = [
  {
    q: "Do the candidates already have visas or residency rights in Europe?",
    a: "No — and we are clear about this. All candidates go through the full visa process which we manage end-to-end. We do not make false claims about visa-ready candidates. What we offer is a managed, compliant, end-to-end process with realistic timelines.",
  },
  {
    q: "How long does the full process typically take?",
    a: "From the initial briefing session to the candidate's arrival, the typical timeline is 4 to 16 weeks depending on the destination country, role type, and embassy processing times. We provide a written timeline estimate at the start of every engagement.",
  },
  {
    q: "How do you verify candidate qualifications?",
    a: "Every candidate goes through three layers of verification: original certificate and credential checks (cross-referenced with issuing institutions where possible), a practical skills assessment or structured interview appropriate to the role, and professional reference checks with at least two former employers.",
  },
  {
    q: "What is your policy on fees charged to workers?",
    a: "We charge zero fees to candidates — ever. Workers pay nothing to be sourced, screened, placed, or supported. This is fundamental to how we operate and can be confirmed in writing in our engagement agreement.",
  },
  {
    q: "What happens after the candidate arrives?",
    a: "Our support does not end at the airport. We remain available for the first 90 days to address any integration issues, facilitate communication between employer and candidate where needed, and ensure a smooth transition into the role.",
  },
  {
    q: "Which countries and roles do you currently work with?",
    a: "We primarily source for roles in Germany, Poland, Croatia, Romania, and Bulgaria. We work across logistics (truck drivers), healthcare and social care (caregivers, nurses), skilled trades (welders, electricians), and construction. If your country or role is not listed, contact us — we assess each request individually.",
  },
  {
    q: "How does pricing work? Can you give us a rough figure?",
    a: "We do not publish a rate card. Pricing is custom to your engagement — role type, volume, country, and timeline all affect the fee structure. What we guarantee is full transparency: our pricing is explained clearly before any agreement, with nothing hidden. Book a 30-minute call and we will walk you through what to expect.",
  },
  {
    q: "We have had bad experiences with agencies before. What makes Recruitly different?",
    a: "We understand. The most common issues employers report are: over-promised timelines that were missed, no communication after placement, and candidates who did not match what was described. We address each of these with a written process, a named contact, milestone-based communication, and triple-verified candidate profiles. We prefer to under-promise and over-deliver.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border border-border/60 rounded-xl overflow-hidden transition-all duration-200"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-muted/40 transition-colors gap-4"
        aria-expanded={open}
      >
        <span className="font-semibold text-foreground text-sm sm:text-base leading-snug">{q}</span>
        {open
          ? <ChevronUp className="w-5 h-5 text-accent flex-shrink-0" />
          : <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        }
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-muted-foreground text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

const ForEmployers = () => {
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  useSEO({
    title: "Hire Top Talent from South Asia & GCC | For European Employers – Recruitly Group",
    description: "Recruitly Group helps European employers in Germany, Poland, Croatia and beyond hire qualified, visa-processed workers from South Asia and GCC. Fully managed immigration, triple-verified skills, zero fees to candidates. Book a free 30-minute strategy session.",
    keywords: "hire workers from Nepal Germany, South Asia recruitment EU, GCC talent Europe, ethical international recruitment, immigration consultancy employers, manpower recruitment Poland Croatia, truck drivers Germany Nepal, caregivers Germany South Asia",
    canonicalUrl: "https://www.recruitlygroup.com/for-employers",
  });

  // Framer motion variants for sections
  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
  };
  const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

  return (
    <div className="min-h-screen bg-background">

      {/* ═══════════════════════════════════════════════════════════════
          1. HERO SECTION
          Visual: Clean gradient background, no images. Large confident
          typography. Two CTA buttons side by side. Trust bar below.
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(hsl(210 100% 70%) 1px, transparent 1px), linear-gradient(90deg, hsl(210 100% 70%) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        {/* Soft blue glow top-right */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-16 md:pt-28 md:pb-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-3xl"
          >
            {/* Eyebrow */}
            <motion.div variants={fadeUp} className="mb-5">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/20 text-blue-300 text-xs font-semibold uppercase tracking-wider">
                <Briefcase className="w-3.5 h-3.5" />
                For European Employers &amp; HR Managers
              </span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              variants={fadeUp}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold leading-tight tracking-tight text-white mb-5"
            >
              Hire Qualified Workers
              <br />
              <span className="text-blue-400">from South Asia &amp; GCC.</span>
              <br />
              Fully Managed. Fully Compliant.
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeUp}
              className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl mb-8"
            >
              We handle the entire process — sourcing, verification, visa, orientation, and post-arrival support —
              so you can focus on running your business, not chasing paperwork.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors text-base shadow-lg shadow-blue-500/25"
              >
                <Calendar className="w-4 h-4" />
                Book Your Free 30-Minute Hiring Strategy Session
              </a>
              <button
                onClick={() => setShowQuoteForm(true)}
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors text-base"
              >
                Request a Custom Quote
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>

            {/* Micro trust note */}
            <motion.p variants={fadeUp} className="mt-4 text-xs text-slate-400">
              No commitment required. 30 minutes. We listen first.
            </motion.p>
          </motion.div>

          {/* Trust country bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-14 pt-8 border-t border-white/10"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
              Currently placing talent for employers in
            </p>
            <div className="flex flex-wrap gap-3">
              {TRUST_COUNTRIES.map((c) => (
                <span
                  key={c.name}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/8 border border-white/10 text-sm text-slate-200"
                >
                  <span>{c.flag}</span>
                  <span>{c.name}</span>
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          2. PAIN POINTS WE SOLVE
          Visual: White background. 5 cards in a responsive grid.
          Each card: coloured icon, bold headline, pain sentence,
          then solution sentence. Clean vertical separation.
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
              The Five Challenges We Eliminate
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
              International hiring is complex.
              <br />
              <span className="text-muted-foreground font-normal">It doesn't have to be your problem.</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {PAIN_POINTS.map((point, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Card className={`h-full border ${point.border} hover:shadow-md transition-shadow`}>
                  <CardContent className="p-6">
                    <div className={`w-11 h-11 rounded-xl ${point.bg} flex items-center justify-center mb-4`}>
                      <point.icon className={`w-5 h-5 ${point.color}`} />
                    </div>
                    <h3 className="font-bold text-foreground text-base mb-3">{point.headline}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      <span className="font-medium text-foreground/80">The problem: </span>
                      {point.pain}
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">
                      <span className="font-semibold text-accent">Our approach: </span>
                      {point.solution}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Sixth card — CTA card */}
            <motion.div variants={fadeUp} className="md:col-span-2 lg:col-span-1">
              <div className="h-full rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-6 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-3">Ready to discuss?</p>
                  <h3 className="text-white font-bold text-lg mb-3">Let's map your specific situation in 30 minutes.</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    We will tell you clearly what's realistic for your role, country, and timeline — no sales pressure.
                  </p>
                </div>
                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold px-5 py-3 rounded-xl transition-colors text-sm"
                >
                  <Calendar className="w-4 h-4" />
                  Book a Free Call
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          3. OUR PROVEN 5-STEP PROCESS
          Visual: Light grey background. Vertical numbered timeline
          on desktop, stacked cards on mobile. Subtle horizontal
          connecting line on desktop. Minimalist numbered icons.
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
              Our Process
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              Five steps. Clear milestones.
              <br className="hidden sm:block" />
              No surprises.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground max-w-xl mx-auto">
              Every engagement follows the same structured process. You know what happens at each stage and when.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={stagger}
            className="space-y-4"
          >
            {PROCESS_STEPS.map((step, i) => (
              <motion.div key={i} variants={fadeUp}>
                <div className="flex gap-5 p-6 rounded-2xl bg-background border border-border/60 hover:border-accent/30 hover:shadow-sm transition-all group">
                  {/* Step number + icon */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 group-hover:bg-accent/15 transition-colors flex items-center justify-center">
                      <span className="text-accent font-black text-sm">{step.step}</span>
                    </div>
                    {i < PROCESS_STEPS.length - 1 && (
                      <div className="w-0.5 h-4 bg-border" />
                    )}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="font-bold text-foreground">{step.title}</h3>
                      <Badge variant="secondary" className="text-xs">{step.timing}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center mt-10"
          >
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors text-base"
            >
              <Calendar className="w-4 h-4" />
              Start with a Free Strategy Session
            </a>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          4. REAL RESULTS
          Visual: Dark background, 6 metric cards in a grid.
          Large numbers, plain labels, source notes in muted text.
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.p variants={fadeUp} className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-3">
              Track Record
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
              Measured outcomes.
              <br />
              <span className="text-slate-400 font-normal">Not marketing language.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 text-sm max-w-lg mx-auto">
              These figures reflect our active operations since 2022. Where a range is shown, this reflects variation across role types and destination countries.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {RESULTS.map((r, i) => (
              <motion.div key={i} variants={fadeUp}>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center hover:bg-white/8 transition-colors">
                  <p className="text-3xl md:text-4xl font-black text-blue-400 mb-2">{r.value}</p>
                  <p className="text-sm font-semibold text-white mb-1 leading-snug">{r.label}</p>
                  <p className="text-xs text-slate-500">{r.sub}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center text-xs text-slate-600 mt-6"
          >
            Figures based on internal operational data. Individual results vary by role type, country, and engagement.
          </motion.p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          5. TESTIMONIALS
          Visual: Light background. 3 quote cards in a grid.
          Large opening quotation mark, clean typography. No photos.
          Role and company type only — no full names.
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.p variants={fadeUp} className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
              What Employers Say
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
              Feedback from European employers
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Card className="h-full border border-border/60 hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex flex-col h-full">
                    {/* Stars */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    {/* Quote mark */}
                    <span className="text-5xl font-serif text-accent/20 leading-none mb-2 block">&ldquo;</span>
                    <p className="text-sm text-foreground leading-relaxed flex-1 mb-5 -mt-3">
                      {t.quote}
                    </p>
                    <div className="border-t border-border pt-4">
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.company}</p>
                      <Badge variant="secondary" className="mt-2 text-xs">{t.role}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-xs text-muted-foreground mt-6"
          >
            Testimonials are representative of employer feedback. Names and company details have been anonymised.
          </motion.p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          6. WHY EUROPEAN COMPANIES TRUST RECRUITLY GROUP
          Visual: Clean 2-column grid of trust cards on light grey bg.
          Each card: icon top-left, bold heading, 2–3 sentence body.
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.p variants={fadeUp} className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
              Our Commitments
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why European companies
              <br className="hidden sm:block" />
              choose Recruitly Group
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground max-w-xl mx-auto">
              Compliance, ethics, and reliability are not selling points for us. They are operating requirements.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {TRUST_POINTS.map((tp, i) => (
              <motion.div key={i} variants={fadeUp}>
                <div className="p-6 rounded-2xl bg-background border border-border/50 hover:border-accent/30 hover:shadow-sm transition-all h-full">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <tp.icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2 text-sm">{tp.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tp.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          7. FAQ
          Visual: White background, max-width container, accordion
          style. Each question is a collapsible with chevron.
          Clean spacing between questions.
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.p variants={fadeUp} className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
              Common Questions
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              Your questions, answered plainly.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground">
              If your question isn't here, book a call. We'd rather answer it directly.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={stagger}
            className="space-y-3"
          >
            {FAQS.map((faq, i) => (
              <motion.div key={i} variants={fadeUp}>
                <FAQItem q={faq.q} a={faq.a} />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-10 text-center"
          >
            <p className="text-sm text-muted-foreground mb-4">
              Have a question we haven't covered?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:info@recruitlygroup.com"
                className="inline-flex items-center gap-2 border border-border text-foreground px-5 py-2.5 rounded-xl hover:bg-muted/50 transition-colors text-sm font-medium"
              >
                <Mail className="w-4 h-4" />
                info@recruitlygroup.com
              </a>
              <a
                href="https://wa.me/9779743208282"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-border text-foreground px-5 py-2.5 rounded-xl hover:bg-muted/50 transition-colors text-sm font-medium"
              >
                <Phone className="w-4 h-4" />
                WhatsApp +977 974 320 8282
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          8. FINAL CTA SECTION
          Visual: Deep navy/dark gradient background. Centered layout.
          Single strong message. Two buttons. Contact line below.
          No distractions — pure conversion focus.
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="mb-5">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/20 text-blue-300 text-xs font-semibold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" />
                No Commitment. Free 30 Minutes.
              </span>
            </motion.div>

            <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-5 leading-tight">
              Your next hire is waiting.
              <br />
              <span className="text-blue-400">Let's build a plan that works.</span>
            </motion.h2>

            <motion.p variants={fadeUp} className="text-slate-300 text-lg leading-relaxed mb-8 max-w-xl mx-auto">
              Book a free 30-minute hiring strategy session. We'll review your role, your country, and your timeline — and tell you exactly what's possible. No pressure. No obligation.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base shadow-xl shadow-blue-500/20"
              >
                <Calendar className="w-5 h-5" />
                Book Your Free Strategy Session
              </a>
              <button
                onClick={() => setShowQuoteForm(true)}
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base"
              >
                Request a Custom Quote
              </button>
            </motion.div>

            <motion.p variants={fadeUp} className="mt-6 text-sm text-slate-400">
              Or email us at{" "}
              <a href="mailto:info@recruitlygroup.com" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
                info@recruitlygroup.com
              </a>
              {" "}· WhatsApp{" "}
              <a href="https://wa.me/9779743208282" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
                +977 974 320 8282
              </a>
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Quote Request Modal */}
      <Dialog open={showQuoteForm} onOpenChange={setShowQuoteForm}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Request a Custom Quote</DialogTitle>
            <DialogDescription>
              Tell us about your hiring need. We'll come back to you with a tailored proposal within one business day.
            </DialogDescription>
          </DialogHeader>
          <EmployerHiringForm onSuccess={() => setTimeout(() => setShowQuoteForm(false), 3000)} />
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default ForEmployers;
