// src/components/employer/HomepageHiringSection.tsx
// Premium UI upgrade: cleaner cards, better spacing, crisper typography

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Clock, Users, Shield, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import EmployerHiringForm from "./EmployerHiringForm";

const TRUST_ITEMS = [
  { icon: Clock,   value: "4–16 wks",  label: "End-to-end timeline" },
  { icon: Users,   value: "120+",       label: "Workers placed in EU" },
  { icon: Shield,  value: "Zero fees",  label: "Charged to candidates" },
  { icon: Award,   value: "85%+",       label: "90-day retention" },
];

const ROLES = [
  { emoji: "🚛", role: "C/CE Truck Drivers",     demand: "Germany · Bulgaria · Romania" },
  { emoji: "🏥", role: "Caregivers & Nurses",     demand: "Germany · Netherlands · Austria" },
  { emoji: "⚡", role: "Welders & Electricians",  demand: "Poland · Romania · Croatia" },
  { emoji: "🏗️", role: "Construction Workers",    demand: "EU-wide" },
];

const fade = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

export default function HomepageHiringSection() {
  const navigate = useNavigate();

  return (
    <section id="hire-talent" className="bg-white border-t border-border py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* ── Header ─────────────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fade}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold uppercase tracking-wide mb-4">
            🇪🇺 For European Employers & Agencies
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Hire Qualified Workers
            <span className="text-accent"> from South Asia & GCC</span>
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Full visa process managed end-to-end. Triple-verified skills.
            Zero fees charged to candidates. Pre-departure cultural orientation included.
          </p>
        </motion.div>

        {/* ── Trust strip ────────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={fade}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12"
        >
          {TRUST_ITEMS.map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center p-4 rounded-xl border border-border bg-background hover:border-accent/40 transition-colors"
            >
              <item.icon className="w-5 h-5 text-accent mb-2" />
              <span className="text-xl font-bold text-foreground">{item.value}</span>
              <span className="text-xs text-muted-foreground mt-0.5">{item.label}</span>
            </div>
          ))}
        </motion.div>

        {/* ── Two-column layout ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12 items-start">

          {/* Form card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={fade}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="rounded-2xl border border-border bg-white shadow-sm p-6 md:p-8">
              <h3 className="text-xl font-bold text-foreground mb-1">
                Post Your Hiring Requirement
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                We respond within 24 hours with a tailored candidate pipeline.
              </p>
              <EmployerHiringForm />
            </div>
          </motion.div>

          {/* Right: roles + process + agency */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={fade}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-5"
          >
            {/* Roles */}
            <div>
              <h3 className="text-base font-semibold text-foreground mb-3">Roles We Consistently Fill</h3>
              <div className="space-y-2">
                {ROLES.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-background hover:border-accent/30 hover:bg-blue-50/30 transition-colors"
                  >
                    <span className="text-xl leading-none">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">{item.role}</p>
                      <p className="text-xs text-muted-foreground">{item.demand}</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* How it works */}
            <div className="rounded-xl border border-border bg-muted/30 p-5">
              <h4 className="font-semibold text-foreground mb-4 text-sm">How It Works</h4>
              <ol className="space-y-3">
                {[
                  "Submit your requirement above",
                  "Receive pre-screened profiles within 48 hrs",
                  "We manage all visa & documentation",
                  "Workers arrive prepared and ready to start",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Agency CTA */}
            <div className="rounded-xl border border-dashed border-accent/30 bg-blue-50/40 p-5 text-center">
              <p className="text-sm font-semibold text-foreground mb-1">Recruitment agency?</p>
              <p className="text-xs text-muted-foreground mb-3">
                White-label our pipeline. Deliver volume without building your own Asia sourcing desk.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="text-accent border-accent/30 hover:bg-accent hover:text-white transition-colors"
                onClick={() => navigate("/for-employers#agency-partner")}
              >
                Agency Partnership <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
