// src/components/employer/HomepageHiringSection.tsx
// Replaces the minimal stub with the full B2B form + trust section

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Clock, Users, Shield, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import EmployerHiringForm from "./EmployerHiringForm";

const TRUST_ITEMS = [
  { icon: Clock,   value: "4–6 Weeks",  label: "Average time-to-placement" },
  { icon: Users,   value: "120+",        label: "Workers placed in EU" },
  { icon: Shield,  value: "0 Fees",      label: "Charged to candidates" },
  { icon: Star,    value: "85%+",        label: "90-day retention rate" },
];

const ROLES = [
  { emoji: "🚛", role: "C/CE Truck Drivers",      demand: "Germany · Bulgaria · Romania" },
  { emoji: "🏥", role: "Caregivers & Nurses",      demand: "Germany · Netherlands · Austria" },
  { emoji: "⚡", role: "Welders & Electricians",   demand: "Poland · Romania · Croatia" },
  { emoji: "🏗️", role: "Construction Workers",     demand: "EU-wide" },
];

const HomepageHiringSection = () => {
  const navigate = useNavigate();

  return (
    <section id="hire-talent" className="py-16 md:py-24 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-4">
            🇪🇺 For EU Agencies & Employers
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight mb-4">
            Hire Qualified Workers
            <br />
            <span className="text-accent">from South Asia & GCC</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Full visa process managed end-to-end. Triple-verified skills. Zero fees charged to candidates.
            Pre-departure cultural orientation included.
          </p>
        </motion.div>

        {/* Trust strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14"
        >
          {TRUST_ITEMS.map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center p-4 rounded-xl border border-border/50 bg-background"
            >
              <item.icon className="w-6 h-6 text-accent mb-2" />
              <span className="text-2xl font-black text-foreground">{item.value}</span>
              <span className="text-xs text-muted-foreground mt-1">{item.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Two columns: Form + Roles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-accent/30 shadow-lg">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-xl font-bold text-foreground mb-1">
                  Post Your Hiring Requirement
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Tell us what you need — we respond within 24 hours with a candidate pipeline proposal.
                </p>
                <EmployerHiringForm />
              </CardContent>
            </Card>
          </motion.div>

          {/* Roles + process */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">Roles We Consistently Fill</h3>
              <div className="space-y-3">
                {ROLES.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border/50 hover:border-accent/30 transition-colors"
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{item.role}</p>
                      <p className="text-xs text-muted-foreground">{item.demand}</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Process */}
            <Card className="border-border/50 bg-muted/30">
              <CardContent className="p-5 space-y-3">
                <h4 className="font-bold text-foreground">How It Works</h4>
                {[
                  "Submit your hiring requirement above",
                  "Receive pre-screened candidate profiles within 48 hrs",
                  "We handle all visa & documentation",
                  "Workers arrive prepared and ready to start",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <span className="text-muted-foreground">{step}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Agency CTA */}
            <div className="p-5 rounded-xl border border-dashed border-accent/40 bg-accent/5 text-center">
              <p className="text-sm font-semibold text-foreground mb-2">Are you a recruitment agency?</p>
              <p className="text-xs text-muted-foreground mb-3">
                White-label our pipeline. Deliver volume to your EU clients without building your own Asia sourcing desk.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="border-accent/40 text-accent hover:bg-accent hover:text-white"
                onClick={() => navigate("/for-employers#agency-partner")}
              >
                Agency Partnership Info <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HomepageHiringSection;
