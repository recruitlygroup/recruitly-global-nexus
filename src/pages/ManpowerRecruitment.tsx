/**
 * src/pages/ManpowerRecruitment.tsx  ← REPLACE the existing file with this
 *
 * Full B2B rewrite:
 * - Employer-first headline + USP messaging
 * - Roles we fill (drivers, care, trades)
 * - Compliance / visa support section
 * - EmployerHiringForm embedded
 * - Agency white-label pitch section
 * - Process timeline
 * - Kept download form for candidates (secondary)
 */

import { useState } from "react";
import { useSEO } from "@/hooks/useSEO";
import { motion } from "framer-motion";
import {
  ArrowLeft, CheckCircle2, Download, Briefcase, MapPin, Clock,
  Shield, Building2, Users, Globe, ChevronRight, Star, Handshake,
  Truck, Heart, Wrench, HardHat, ArrowRight, FileText
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EmployerHiringForm from "@/components/employer/EmployerHiringForm";

// ── Data ──────────────────────────────────────────────────────────────────────

const ROLES_WE_FILL = [
  {
    icon: Truck,
    emoji: "🚛",
    title: "Truck Drivers (C / C+E / CE)",
    demand: "Germany · Bulgaria · Romania · Poland",
    highlights: [
      "CPC / Code 95 training support",
      "Licence verification & translation",
      "ADR variants available",
      "Avg. 20–40 placements / month",
    ],
  },
  {
    icon: Heart,
    emoji: "🏥",
    title: "Caregivers & Nurses",
    demand: "Germany · Netherlands · Austria · Switzerland",
    highlights: [
      "Care certificate holders",
      "German A2/B1 language support",
      "24/7 and residential care",
      "RN, LPN, care assistant levels",
    ],
  },
  {
    icon: Wrench,
    emoji: "⚡",
    title: "Welders & Electricians",
    demand: "Poland · Romania · Croatia · Bulgaria",
    highlights: [
      "MIG/TIG/arc certified welders",
      "Industrial electricians",
      "EU-recognised cert pathways",
      "Factory & infrastructure projects",
    ],
  },
  {
    icon: HardHat,
    emoji: "🏗️",
    title: "Construction & Skilled Trades",
    demand: "EU-wide",
    highlights: [
      "Concrete, steel, civil works",
      "Plumbers, pipefitters",
      "Scaffolders, crane operators",
      "Multi-country deployments",
    ],
  },
];

const TRUST_POINTS = [
  {
    icon: Shield,
    title: "EU-Compliant Visa Coordination",
    description:
      "Full support: job-seeker visas, single permit applications, document legalisation & translation. We know Estonia, Germany, Romanian, Bulgarian requirements inside-out.",
  },
  {
    icon: Building2,
    title: "Estonia-Registered EU Entity",
    description:
      "Recruitly Group OÜ is a fully registered EU company. You work with a transparent, legally accountable partner — not a grey-market middleman.",
  },
  {
    icon: Users,
    title: "Pre-Screened Talent Pool",
    description:
      "Every candidate is interviewed, document-verified, and licence-checked before you see their profile. No CV spam — curated shortlists only.",
  },
  {
    icon: Globe,
    title: "Cultural Onboarding Included",
    description:
      "Workers receive pre-departure briefings on EU workplace culture, safety norms, and basic language essentials — reducing drop-off and complaints.",
  },
  {
    icon: Clock,
    title: "4–6 Week Delivery",
    description:
      "From your brief to boots-on-ground, our average pipeline is 4–6 weeks. Urgent? We maintain a ready-to-deploy bench of pre-cleared candidates.",
  },
  {
    icon: Star,
    title: "Retention Guarantee",
    description:
      "We offer replacement within the placement warranty period. Our 90-day retention rate is consistently above 85%.",
  },
];

const AGENCY_BENEFITS = [
  "White-label Nepal pipeline — sell to your EU clients under your brand",
  "Volume pricing available (10+ placements/month)",
  "Dedicated account manager + candidate tracking dashboard",
  "Co-branded marketing materials on request",
  "Revenue-share referral model for sub-agents",
  "Preferential turnaround for agency-priority roles",
];

const COMPLIANCE_STEPS = [
  {
    step: 1,
    title: "Skills Verification",
    desc: "Licence checks, certificate translation, experience audit",
    duration: "Days 1–3",
  },
  {
    step: 2,
    title: "Employer Shortlisting",
    desc: "Profiles sent to you for review and interview scheduling",
    duration: "Days 4–7",
  },
  {
    step: 3,
    title: "Contract & Offer Letters",
    desc: "Employment contract preparation, salary alignment",
    duration: "Week 2",
  },
  {
    step: 4,
    title: "Visa Application",
    desc: "Document pack, embassy submission, tracking",
    duration: "Weeks 2–5",
  },
  {
    step: 5,
    title: "Pre-Departure",
    desc: "Cultural onboarding, travel booking, medical checks",
    duration: "Week 5–6",
  },
  {
    step: 6,
    title: "Arrival & Handover",
    desc: "Airport reception, first-week check-in, 30-day follow-up",
    duration: "Week 6+",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

const ManpowerRecruitment = () => {
  const navigate = useNavigate();

  useSEO({
    title:
      "White-Label Candidate Sourcing for European Employers & Agencies | Recruitly Group",
    description:
      "Recruitly Group is Nepal's specialist manpower partner for European recruitment agencies and employers. Pre-vetted truck drivers, caregivers, welders & construction workers delivered visa-ready in 4–6 weeks. Germany, Bulgaria, Romania.",
    keywords:
      "white-label Nepal recruitment, truck driver sourcing EU, caregiver recruitment Nepal, manpower agency Nepal Europe, driver shortage Germany Nepal, Bulgaria logistics recruitment Nepal, Romania manpower partner",
    canonicalUrl: "https://www.recruitlygroup.com/manpower-recruitment",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "EmploymentAgency",
      name: "Recruitly Group – EU Manpower Sourcing",
      url: "https://www.recruitlygroup.com/manpower-recruitment",
      description:
        "Nepal-based sourcing partner for European employers and recruitment agencies — truck drivers, caregivers, skilled trades delivered visa-ready.",
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-16">

        {/* Back */}
        <Link to="/">
          <Button variant="ghost" className="mb-8 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Button>
        </Link>

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 md:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-6">
            <Briefcase className="w-4 h-4" />
            For EU Employers &amp; Recruitment Agencies
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight mb-6 leading-tight">
            Your Nepal-Based
            <br />
            <span className="text-accent">Candidate Sourcing Partner</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground font-light max-w-3xl mx-auto mb-4">
            We deliver pre-vetted, visa-ready talent from Nepal to European employers and
            agencies — cutting your time-to-hire by <strong className="text-foreground">50%</strong>.
            Truck drivers, caregivers, welders, construction workers.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-10 text-sm">
            {["🇩🇪 Germany", "🇧🇬 Bulgaria", "🇷🇴 Romania", "🇵🇱 Poland", "🇳🇱 Netherlands"].map((c) => (
              <Badge key={c} variant="secondary" className="text-sm px-3 py-1">
                {c}
              </Badge>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="text-lg h-14 px-8 font-semibold bg-accent hover:bg-accent/90 text-white"
              onClick={() => {
                document.getElementById("employer-form")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Request Talent Pipeline
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg h-14 px-8"
              onClick={() => {
                document.getElementById("agency-partner")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Handshake className="w-5 h-5 mr-2" />
              Agency Partnership
            </Button>
          </div>
        </motion.section>

        {/* ── Roles We Fill ─────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 md:mb-24"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Roles We Consistently Fill
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our talent pipeline is tuned for Europe's highest-demand shortage occupations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ROLES_WE_FILL.map((role, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07 }}
              >
                <Card className="h-full hover:border-accent/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{role.emoji}</span>
                      <div>
                        <h3 className="font-bold text-foreground text-lg">{role.title}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {role.demand}
                        </p>
                      </div>
                    </div>
                    <ul className="space-y-1.5">
                      {role.highlights.map((h, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Trust / Why Us ────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 md:mb-24"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Why EU Employers Choose Recruitly
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TRUST_POINTS.map((point, index) => (
              <Card key={index} className="border-border/50">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <point.icon className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{point.title}</h3>
                    <p className="text-sm text-muted-foreground">{point.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* ── Compliance Process ────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 md:mb-24"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Our Compliance &amp; Placement Process
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              End-to-end managed so your HR team doesn't have to chase paperwork.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {COMPLIANCE_STEPS.map((step, index) => (
              <div
                key={index}
                className="relative p-5 rounded-xl border border-border/50 bg-background hover:border-accent/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {step.step}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{step.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{step.desc}</p>
                    <span className="inline-flex items-center gap-1 text-xs text-accent mt-2">
                      <Clock className="w-3 h-3" />
                      {step.duration}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Employer Hiring Form ──────────────────────────────────────────── */}
        <motion.section
          id="employer-form"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 md:mb-24 scroll-mt-24"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Submit Your Hiring Requirement
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We respond within 24 hours with a tailored candidate pipeline proposal.
            </p>
          </div>

          <Card className="max-w-3xl mx-auto border-accent/30 shadow-lg">
            <CardContent className="p-6 md:p-10">
              <EmployerHiringForm />
            </CardContent>
          </Card>
        </motion.section>

        {/* ── Agency Partner Section ────────────────────────────────────────── */}
        <motion.section
          id="agency-partner"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 md:mb-24 scroll-mt-24"
        >
          <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-background overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/15 text-accent text-sm font-semibold mb-4">
                    <Handshake className="w-4 h-4" />
                    Agency White-Label Programme
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-foreground mb-4">
                    Sell Nepal Talent Under Your Brand
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    European recruitment agencies: outsource your entire Asia candidate
                    sourcing to Recruitly. We operate invisibly behind your brand while
                    you keep the client relationship and margin.
                  </p>
                  <Button
                    size="lg"
                    className="bg-accent hover:bg-accent/90 text-white"
                    onClick={() => {
                      document.getElementById("employer-form")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Apply for Partnership <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {AGENCY_BENEFITS.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* ── Candidate section (secondary) ─────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <Card className="border-dashed border-border/60 bg-muted/20">
            <CardContent className="p-6 md:p-8 text-center">
              <p className="text-muted-foreground text-sm mb-2">
                Are you a job-seeker looking for work in Europe?
              </p>
              <p className="font-semibold text-foreground mb-4">
                Download our application form and email it to us.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button variant="outline" asChild>
                  <a href="/documents/Recruitly_Application_Form.docx" download>
                    <Download className="w-4 h-4 mr-2" />
                    Download Application Form
                  </a>
                </Button>
                <Button variant="ghost" onClick={() => navigate("/jobs")}>
                  <FileText className="w-4 h-4 mr-2" />
                  Browse Job Listings
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Trust footer */}
        <div className="text-center pb-8">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-accent" />
            <span>Recruitly Group OÜ · Registered in Estonia 🇪🇪 · EU-compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManpowerRecruitment;
