import { motion } from "framer-motion";
import {
  ArrowLeft,
  GraduationCap,
  Users,
  Briefcase,
  Palmtree,
  Calendar,
  HeartPulse,
  FileSearch,
  Route,
  Stamp,
  Plane,
  Shield,
  Eye,
  Clock,
  Globe,
  Phone,
  Mail,
  MessageCircle,
  User,
  Loader2,
  CheckCircle2,
  Building,
  BookOpen,
  FileText,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import odysseyHero from "@/assets/odyssey-hero.jpg";

// Purpose-based travel categories
const TRAVEL_PURPOSES = [
  {
    id: "study",
    title: "Study Travel",
    icon: GraduationCap,
    description:
      "Moving abroad for education requires visa compliance, accommodation planning, and arrival logistics. We handle the entire process so you can focus on your studies.",
  },
  {
    id: "family",
    title: "Family Visit",
    icon: Users,
    description:
      "Visiting family overseas involves sponsorship letters, documentation, and coordinated travel. We ensure your reunion happens without paperwork stress.",
  },
  {
    id: "business",
    title: "Business Travel",
    icon: Briefcase,
    description:
      "Corporate travel requires precision timing, visa arrangements, and reliable logistics. We manage every detail for seamless business trips.",
  },
  {
    id: "leisure",
    title: "Leisure Travel",
    icon: Palmtree,
    description:
      "Leisure trips should be about enjoyment, not logistics. We plan everything from flights to local arrangements so you can simply relax.",
  },
  {
    id: "events",
    title: "Events & Conferences",
    icon: Calendar,
    description:
      "Attending international events requires timely visa processing and accommodation near venues. We coordinate travel around your event schedule.",
  },
  {
    id: "medical",
    title: "Medical Travel",
    icon: HeartPulse,
    description:
      "Medical travel needs sensitive handling of appointments, visas, and accommodation near healthcare facilities. We provide compassionate, thorough support.",
  },
];

// The Odyssey Roadmap steps
const ROADMAP_STEPS = [
  {
    step: 1,
    title: "Understand Your Case",
    description: "Advisory & Document Review",
    details:
      "We begin with a thorough consultation to understand your travel purpose, timeline, and requirements. Our team reviews your documents and identifies any compliance needs.",
    icon: FileSearch,
  },
  {
    step: 2,
    title: "Design the Journey",
    description: "Structure, Compliance & Logistics",
    details:
      "We create a comprehensive travel plan covering visa strategy, flight options, accommodation, and ground support tailored to your specific needs.",
    icon: Route,
  },
  {
    step: 3,
    title: "Handle Approvals",
    description: "Embassy Coordination & Processing",
    details:
      "We manage all visa applications, embassy appointments, and documentation submissions. You receive updates at every stage of the process.",
    icon: Stamp,
  },
  {
    step: 4,
    title: "Travel & Support",
    description: "Departure Checklists & 24/7 Assistance",
    details:
      "Before departure, we provide complete checklists and briefings. During your journey, our team is available around the clock for any assistance needed.",
    icon: Plane,
  },
];

// Case studies
const CASE_STUDIES = [
  {
    title: "UK Student Journey",
    country: "United Kingdom",
    flag: "🇬🇧",
    services: [
      "Student Visa Processing",
      "University Liaison",
      "Accommodation Booking",
      "Airport Pickup",
      "Bank Account Setup",
    ],
    duration: "Managed over 6 weeks",
    outcome: "Student arrived and settled before term started",
  },
  {
    title: "UAE Family Visit",
    country: "United Arab Emirates",
    flag: "🇦🇪",
    services: [
      "Visit Visa Application",
      "Invitation Letter Guidance",
      "Flight Coordination",
      "Hotel Arrangement",
      "Airport Transfers",
    ],
    duration: "Managed over 3 weeks",
    outcome: "Family reunion during Eid celebrations",
  },
  {
    title: "Schengen Leisure",
    country: "Multiple EU Countries",
    flag: "🇪🇺",
    services: [
      "Schengen Visa Processing",
      "Multi-City Itinerary",
      "Hotel Bookings",
      "Travel Insurance",
      "Local Transport Planning",
    ],
    duration: "Managed over 4 weeks",
    outcome: "Seamless 14-day European tour",
  },
];

// Pricing tiers visualization
const PRICING_TIERS = [
  {
    name: "Service Fee",
    description: "Our professional fee for planning, coordination, and support throughout your journey.",
    color: "hsl(var(--accent))",
    examples: ["Consultation", "Planning", "Coordination", "Support"],
  },
  {
    name: "Direct Costs",
    description: "Third-party expenses paid directly to embassies, airlines, hotels, and other providers.",
    color: "hsl(var(--muted-foreground))",
    examples: ["Visa Fees", "Flight Tickets", "Accommodation", "Insurance"],
  },
  {
    name: "Ongoing Support",
    description: "Optional extended support packages for assistance during and after your journey.",
    color: "hsl(var(--primary))",
    examples: ["24/7 Helpline", "Emergency Support", "Local Assistance", "Follow-up"],
  },
];

// Ecosystem services
const ECOSYSTEM_SERVICES = [
  { name: "Odyssey", description: "Journey Management", icon: Globe, active: true },
  { name: "WiseAdmit", description: "Education Consultancy", icon: BookOpen, active: false },
  { name: "Recruitly", description: "Career Placement", icon: Building, active: false },
  { name: "VeriDocs", description: "Document Legalisation", icon: FileText, active: false },
];

const ToursAndTravels = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await supabase.functions.invoke("submit-consultation", {
        body: {
          serviceType: "travel",
          fullName: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
        },
      });

      if (response.error) {
        throw new Error("Failed to submit");
      }

      toast.success("Your inquiry has been submitted. A Travel Manager will contact you within 24 hours.");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch {
      toast.error("Failed to submit your inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToRoadmap = () => {
    document.getElementById("roadmap-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background odyssey-scope">
      {/* SECTION 1: HERO */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={odysseyHero}
            alt="Professional travel consultation"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Link to="/">
            <Button variant="ghost" className="mb-8 group text-foreground hover:bg-card/50">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-6">
              Travel Without Uncertainty.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Visas, documents, flights, stays, and on-ground support — managed by one responsible team.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={scrollToForm}
                className="text-base font-semibold h-12 px-8"
              >
                Plan My Journey
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={scrollToForm}
                className="text-base font-semibold h-12 px-8 border-2"
              >
                Talk to a Travel Manager
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: PURPOSE-BASED NAVIGATION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Are You Traveling?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Every journey has a purpose. Select yours, and we'll show you how Odyssey handles it.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TRAVEL_PURPOSES.map((purpose, index) => (
              <motion.div
                key={purpose.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-300 h-full ${
                    selectedPurpose === purpose.id
                      ? "ring-2 ring-accent shadow-lg"
                      : "hover:shadow-md hover:border-accent/50"
                  }`}
                  onClick={() => {
                    setSelectedPurpose(purpose.id);
                    scrollToRoadmap();
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <purpose.icon className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {purpose.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {purpose.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: THE ODYSSEY ROADMAP */}
      <section id="roadmap-section" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              The Odyssey Roadmap
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A clear, four-step process that takes you from inquiry to arrival with complete confidence.
            </p>
          </motion.div>

          {/* Desktop Horizontal Roadmap */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Connection Line */}
              <div className="absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-accent/20 via-accent to-accent/20" />

              <div className="grid grid-cols-4 gap-8">
                {ROADMAP_STEPS.map((step, index) => (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.15 }}
                    className="relative"
                  >
                    <div className="flex flex-col items-center text-center">
                      {/* Step Number Circle */}
                      <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-lg font-bold mb-4 relative z-10">
                        {step.step}
                      </div>

                      {/* Icon Box */}
                      <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center mb-4 shadow-sm">
                        <step.icon className="w-10 h-10 text-accent" />
                      </div>

                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {step.title}
                      </h3>
                      <p className="text-sm text-accent font-medium mb-3">
                        {step.description}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.details}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Vertical Roadmap */}
          <div className="lg:hidden space-y-6">
            {ROADMAP_STEPS.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex">
                      {/* Step indicator */}
                      <div className="w-16 bg-accent/10 flex flex-col items-center justify-center py-6">
                        <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-lg font-bold">
                          {step.step}
                        </div>
                        {index < ROADMAP_STEPS.length - 1 && (
                          <div className="w-0.5 h-8 bg-accent/30 mt-2" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-5">
                        <div className="flex items-center gap-3 mb-2">
                          <step.icon className="w-6 h-6 text-accent" />
                          <h3 className="text-lg font-semibold text-foreground">
                            {step.title}
                          </h3>
                        </div>
                        <p className="text-sm text-accent font-medium mb-2">
                          {step.description}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {step.details}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: CASE STUDIES */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Journeys We've Managed
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Real examples of complete journey management — from visa to arrival.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CASE_STUDIES.map((study, index) => (
              <motion.div
                key={study.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{study.flag}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {study.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{study.country}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {study.services.map((service) => (
                        <div key={service} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                          <span className="text-muted-foreground">{service}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-1">{study.duration}</p>
                      <p className="text-sm font-medium text-foreground">{study.outcome}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: TRANSPARENT PRICING PHILOSOPHY */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How Our Pricing Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Radical transparency. No hidden commissions. You see exactly what you're paying for.
            </p>
          </motion.div>

          {/* Pricing Breakdown Visual */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {/* Visual Bar */}
                <div className="flex h-4">
                  <div className="flex-1 bg-accent" />
                  <div className="flex-1 bg-muted-foreground/60" />
                  <div className="flex-1 bg-primary/80" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
                  {PRICING_TIERS.map((tier, index) => (
                    <div key={tier.name} className="p-6">
                      <div
                        className="w-3 h-3 rounded-full mb-3"
                        style={{ backgroundColor: tier.color }}
                      />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {tier.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {tier.description}
                      </p>
                      <div className="space-y-1">
                        {tier.examples.map((example) => (
                          <p key={example} className="text-xs text-muted-foreground">
                            • {example}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { icon: Shield, text: "No Hidden Fees" },
              { icon: Eye, text: "Full Transparency" },
              { icon: Clock, text: "Clear Timeline" },
              { icon: Globe, text: "All Inclusive Quote" },
            ].map((item, index) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center gap-2 justify-center text-sm text-muted-foreground"
              >
                <item.icon className="w-4 h-4 text-accent" />
                <span>{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: INTEGRATION & ECOSYSTEM */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              One Group. One Responsibility.
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Odyssey is part of the Recruitly Global ecosystem. Your journey connects seamlessly with our education, recruitment, and document services.
            </p>
          </motion.div>

          {/* Ecosystem Visualization */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {ECOSYSTEM_SERVICES.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card
                  className={`text-center ${
                    service.active ? "border-accent bg-accent/5" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <service.icon
                      className={`w-8 h-8 mx-auto mb-2 ${
                        service.active ? "text-accent" : "text-muted-foreground"
                      }`}
                    />
                    <h4
                      className={`font-semibold text-sm ${
                        service.active ? "text-accent" : "text-foreground"
                      }`}
                    >
                      {service.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">{service.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA & CONTACT FORM */}
      <section id="contact-section" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <p className="text-lg text-accent font-medium mb-2">
              Every journey is different.
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              We plan yours properly.
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Speak to a Travel Manager who will understand your specific requirements and create a tailored plan.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="name" className="text-foreground text-sm font-medium">
                        Full Name
                      </Label>
                      <div className="relative mt-1.5">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Your full name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-foreground text-sm font-medium">
                        Email Address
                      </Label>
                      <div className="relative mt-1.5">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-foreground text-sm font-medium">
                      Phone Number
                    </Label>
                    <div className="relative mt-1.5">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-foreground text-sm font-medium">
                      Tell us about your journey
                    </Label>
                    <div className="relative mt-1.5">
                      <MessageCircle className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Textarea
                        id="message"
                        placeholder="Where are you going? What's the purpose of your travel? Any specific requirements?"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="pl-10 min-h-[120px]"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full font-semibold h-12"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      "Speak to a Travel Manager"
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    We respond within 24 hours. No spam, no obligations.
                  </p>
                </form>

                {/* Contact Alternatives */}
                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Prefer to reach out directly?
                  </p>
                  <div className="flex flex-wrap justify-center gap-4 text-sm">
                    <a
                      href="tel:+1234567890"
                      className="flex items-center gap-2 text-foreground hover:text-accent transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      <span>+123 456 7890</span>
                    </a>
                    <a
                      href="mailto:travel@recruitlyglobal.com"
                      className="flex items-center gap-2 text-foreground hover:text-accent transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      <span>travel@recruitlyglobal.com</span>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Trust Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-8 text-center"
      >
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="w-4 h-4 text-accent" />
          <span>Part of Recruitly Global • Trusted Journey Management</span>
        </div>
      </motion.div>
    </div>
  );
};

export default ToursAndTravels;
