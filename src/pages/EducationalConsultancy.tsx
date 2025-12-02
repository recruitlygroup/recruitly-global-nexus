import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Users, Globe, Award, Phone, Mail, User, MessageSquare, Info, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useSubmitConsultation } from "@/hooks/useSubmitConsultation";

const PROGRESS_STEPS = [
  { number: 1, label: "Consult" },
  { number: 2, label: "Apply" },
  { number: 3, label: "Visa Success" }
];

const STATISTICS = [
  { value: "98%", label: "Visa Success Rate", icon: Award },
  { value: "100+", label: "Students Placed Last Month", icon: Users },
  { value: "50+", label: "Partner Universities", icon: Globe }
];

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    country: "UK",
    text: "Recruitly Global made my dream of studying in the UK a reality. The process was smooth and stress-free.",
    university: "University of Oxford"
  },
  {
    name: "Rajesh Kumar",
    country: "Canada",
    text: "Professional guidance from start to finish. I got accepted to my top choice university!",
    university: "University of Toronto"
  },
  {
    name: "Maria Santos",
    country: "Australia",
    text: "The visa process seemed daunting, but their team handled everything perfectly.",
    university: "University of Melbourne"
  }
];

const FAQ_ITEMS = [
  {
    question: "How long does the entire application process take?",
    answer: "The typical timeline is 3-6 months from initial consultation to visa approval, depending on the country and university. We'll provide you with a detailed timeline during your free consultation."
  },
  {
    question: "What documents do I need to prepare?",
    answer: "Common documents include academic transcripts, passport, language proficiency tests (IELTS/TOEFL), statement of purpose, and letters of recommendation. We'll provide a complete checklist specific to your target universities."
  },
  {
    question: "Do you help with scholarship applications?",
    answer: "Yes! We actively identify scholarship opportunities and guide you through the application process to maximize your chances of financial aid."
  },
  {
    question: "What is your visa success rate?",
    answer: "We maintain a 98% visa success rate across all destinations. Our experienced team ensures all documentation is thorough and accurate to minimize rejection risks."
  },
  {
    question: "Is the initial consultation really free?",
    answer: "Absolutely! Your first 15-minute consultation is completely free with no obligations. We'll assess your profile and provide initial guidance on the best study destinations for you."
  }
];

const EducationalConsultancy = () => {
  const { country, countryCode, loading: geoLoading } = useGeolocation();
  const { submitConsultation, isSubmitting } = useSubmitConsultation();
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const getCountryFlag = (code: string) => {
    if (!code) return "🌍";
    return String.fromCodePoint(...[...code.toUpperCase()].map(c => c.charCodeAt(0) + 127397));
  };

  const metricDetails = {
    success: {
      title: "98% Visa Success Rate",
      description: "Our visa success rate is calculated based on all student visa applications processed in the last 12 months. This data is validated by our internal compliance system and cross-referenced with embassy feedback.",
      source: "Data validated by Recruitly's Compliance AI on November 2025"
    },
    students: {
      title: `100+ Students Placed${country && country !== 'Global' ? ` from ${country}` : ''} Last Month`,
      description: country && country !== 'Global' 
        ? `We successfully placed over 100 students from ${country} in top universities last month. Our personalized approach ensures each student finds the right program.`
        : "We successfully placed over 100 students in top universities worldwide last month, with personalized support throughout their journey.",
      source: "Data validated by Recruitly's Compliance AI on November 2025"
    },
    universities: {
      title: "50+ Partner Universities",
      description: country && country !== 'Global'
        ? `We have partnerships with 50+ universities globally, including institutions that actively recruit students from ${country}. These partnerships give our students priority consideration.`
        : "Our network spans 50+ universities across multiple countries, providing diverse opportunities for every student's unique goals.",
      source: "Data validated by Recruitly's Compliance AI on November 2025"
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await submitConsultation({
      serviceType: "education",
      fullName: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      message: formData.message || undefined,
      countryOfInterest: country || undefined
    });

    if (result?.success) {
      setFormSubmitted(true);
      setFormData({ name: "", email: "", phone: "", message: "" });
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Sticky Progress Bar - Mobile Only */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-40 glass border-b border-border md:hidden"
      >
        <div className="px-4 py-3">
          <p className="text-xs font-medium text-muted-foreground mb-2 text-center">
            Your 3-Step Plan
          </p>
          <div className="flex justify-between items-center gap-2">
            {PROGRESS_STEPS.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center w-full">
                  <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold mb-1">
                    {step.number}
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    {step.label}
                  </span>
                </div>
                {index < PROGRESS_STEPS.length - 1 && (
                  <div className="h-0.5 bg-accent/30 flex-1 mx-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-16 mt-20 md:mt-0">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" className="mb-8 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Button>
        </Link>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground tracking-tighter mb-4">
            Educational Consultancy
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto">
            Transform your academic aspirations into reality with expert guidance
          </p>
        </motion.div>

        {/* Trust Building - Statistics (Geo-Targeted & Interactive) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {[
            { 
              icon: Award, 
              value: "98%", 
              label: "Visa Success Rate",
              key: "success"
            },
            { 
              icon: Users, 
              value: geoLoading ? "..." : "100+", 
              label: country && country !== 'Global' ? `Students from ${country}` : "Students Placed Last Month",
              key: "students",
              flag: country && country !== 'Global' ? getCountryFlag(countryCode) : null
            },
            { 
              icon: Globe, 
              value: "50+", 
              label: "Partner Universities",
              key: "universities"
            }
          ].map((stat, index) => (
            <Card 
              key={index} 
              className="border-accent/20 cursor-pointer hover:border-accent/50 transition-all duration-300 hover:scale-105 group"
              onClick={() => setSelectedMetric(stat.key)}
            >
              <CardContent className="p-6 text-center relative">
                <stat.icon className="w-8 h-8 text-accent mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-4xl font-black text-foreground mb-2">
                  {stat.value}
                  {stat.flag && <span className="ml-2 text-2xl">{stat.flag}</span>}
                </div>
                <div className="text-sm text-muted-foreground font-medium mb-2">
                  {stat.label}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Info className="w-4 h-4 text-accent mx-auto" />
                  <p className="text-xs text-accent mt-1">Click for details</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Metric Details Dialog */}
        <Dialog open={!!selectedMetric} onOpenChange={() => setSelectedMetric(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {selectedMetric && metricDetails[selectedMetric as keyof typeof metricDetails].title}
              </DialogTitle>
              <DialogDescription className="text-base pt-4">
                {selectedMetric && metricDetails[selectedMetric as keyof typeof metricDetails].description}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
              <p className="text-xs text-muted-foreground italic">
                {selectedMetric && metricDetails[selectedMetric as keyof typeof metricDetails].source}
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Testimonials Module */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-8">
            Success Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, index) => (
              <Card key={index} className="glass">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.university}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-1 text-xs text-accent">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Now studying in {testimonial.country}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Main Application Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <Card className="glass border-accent/30 max-w-3xl mx-auto">
            <CardContent className="p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                  Ready to Start Your Journey?
                </h2>
                <p className="text-muted-foreground">
                  Fill out the form below and we'll contact you within 24 hours
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-foreground">
                    Full Name *
                  </Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-foreground">
                    Email Address *
                  </Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-foreground">
                    Phone Number *
                  </Label>
                  <div className="relative mt-2">
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
                  <Label htmlFor="message" className="text-foreground">
                    Tell us about your academic goals
                  </Label>
                  <div className="relative mt-2">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Textarea
                      id="message"
                      placeholder="Which country and course are you interested in?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="pl-10 min-h-32"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-lg h-14 font-bold tracking-wide"
                  disabled={isSubmitting || formSubmitted}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : formSubmitted ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Request Submitted!
                    </>
                  ) : (
                    "Start My Free 15-Min Consultation"
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By submitting this form, you agree to our terms and privacy policy. No spam, we promise!
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <Accordion type="single" collapsible className="space-y-4">
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="glass border border-border/50 rounded-xl px-6">
                <AccordionTrigger className="text-left text-foreground font-semibold hover:text-accent">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Trust Badge Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-accent" />
            <span>Trusted by 1000+ students worldwide</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EducationalConsultancy;
