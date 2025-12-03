import { motion } from "framer-motion";
import { CheckCircle2, FileCheck, Plane, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const JOURNEY_STEPS = [
  {
    number: 1,
    title: "HeraScore & Acceptance",
    description: "Get your AI-powered acceptance probability and matched universities",
    icon: CheckCircle2,
    status: "current",
  },
  {
    number: 2,
    title: "Global Document Verification",
    description: "Apostille & authentication for all your academic documents",
    icon: FileCheck,
    status: "upcoming",
    cta: {
      text: "Start Document Apostille Now",
      link: "/apostille-services",
      highlight: true,
    },
    badge: "Nepal Apostille Available",
  },
  {
    number: 3,
    title: "Visa Lodgement",
    description: "Expert guidance through visa application with 98% success rate",
    icon: Plane,
    status: "upcoming",
  },
];

const JourneyTimeline = () => {
  return (
    <section className="py-16 md:py-24 relative">
      <div className="max-w-5xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <Shield className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">End-to-End Support</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
            Your Seamless Journey After Acceptance 🛡️
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From assessment to visa approval, we handle every step so you can focus on your future
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-accent via-accent/50 to-muted hidden md:block" />

          <div className="space-y-8 md:space-y-0">
            {JOURNEY_STEPS.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className={`relative md:flex items-center ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Content Card */}
                <div className={`md:w-5/12 ${index % 2 === 0 ? "md:pr-12" : "md:pl-12"}`}>
                  <Card className={`glass border-border/50 hover:border-accent/30 transition-all duration-300 ${
                    step.cta?.highlight ? "border-accent/50 shadow-lg shadow-accent/10" : ""
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          step.status === "current" 
                            ? "bg-accent text-accent-foreground" 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          <step.icon className="w-6 h-6" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-accent">STEP {step.number}</span>
                            {step.badge && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent font-medium">
                                {step.badge}
                              </span>
                            )}
                          </div>
                          
                          <h3 className="text-lg font-bold text-foreground mb-2">
                            {step.title}
                          </h3>
                          
                          <p className="text-sm text-muted-foreground mb-4">
                            {step.description}
                          </p>

                          {step.cta && (
                            <Link to={step.cta.link}>
                              <Button 
                                variant={step.cta.highlight ? "default" : "outline"}
                                size="sm"
                                className="group"
                              >
                                {step.cta.text}
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Center Node */}
                <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-background border-4 border-accent items-center justify-center z-10">
                  <span className="text-lg font-black text-accent">{step.number}</span>
                </div>

                {/* Spacer for alternating layout */}
                <div className="hidden md:block md:w-5/12" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-muted-foreground mb-4">
            Need help with document verification for Nepal?
          </p>
          <Link to="/apostille-services">
            <Button variant="outline" size="lg" className="group">
              <FileCheck className="w-5 h-5 mr-2" />
              Direct to Nepal Apostille
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default JourneyTimeline;
