import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Users, Globe, Briefcase, Phone, Mail, User, MessageSquare } from "lucide-react";
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
import { useState } from "react";

const PROGRESS_STEPS = [
  { number: 1, label: "Consult" },
  { number: 2, label: "Apply" },
  { number: 3, label: "Job Placement" }
];

const STATISTICS = [
  { value: "95%", label: "Placement Success Rate", icon: Briefcase },
  { value: "500+", label: "Jobs Filled Last Quarter", icon: Users },
  { value: "30+", label: "Partner Countries", icon: Globe }
];

const TESTIMONIALS = [
  {
    name: "Ahmed Hassan",
    country: "UAE",
    text: "Found my dream construction job in Dubai within 2 weeks. The entire process was professional and transparent.",
    position: "Site Engineer"
  },
  {
    name: "Elena Popov",
    country: "Germany",
    text: "Recruitly Global helped me secure a nursing position with excellent benefits. Highly recommended!",
    position: "Registered Nurse"
  },
  {
    name: "John Martinez",
    country: "Canada",
    text: "From application to work permit, everything was handled smoothly. Now working in my field of expertise.",
    position: "IT Specialist"
  }
];

const FAQ_ITEMS = [
  {
    question: "What types of jobs do you recruit for?",
    answer: "We specialize in healthcare, construction, IT, hospitality, and skilled trades across multiple countries including UAE, Canada, Germany, UK, and Australia. We work with both entry-level and senior positions."
  },
  {
    question: "How long does it take to get placed?",
    answer: "The timeline varies by industry and location, but typically ranges from 2-8 weeks from initial consultation to job offer. Work permit processing adds an additional 4-12 weeks depending on the destination country."
  },
  {
    question: "Do I need to pay any fees upfront?",
    answer: "We offer a transparent fee structure. Initial consultation is free. Placement fees are discussed upfront and vary based on the position and destination country. Many positions have employer-paid recruitment fees."
  },
  {
    question: "What support do you provide after placement?",
    answer: "We provide comprehensive post-placement support including visa processing assistance, travel arrangements, initial accommodation guidance, and ongoing support during your first 3 months abroad."
  },
  {
    question: "What if I don't have international work experience?",
    answer: "Not a problem! We work with candidates at all experience levels. We'll assess your skills and match you with appropriate opportunities. Many of our partner employers specifically seek fresh talent to train."
  }
];

const ManpowerRecruitment = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
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
            Manpower Recruitment
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto">
            Connect with global career opportunities and trusted employers worldwide
          </p>
        </motion.div>

        {/* Trust Building - Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {STATISTICS.map((stat, index) => (
            <Card key={index} className="border-accent/20">
              <CardContent className="p-6 text-center">
                <stat.icon className="w-8 h-8 text-accent mx-auto mb-3" />
                <div className="text-4xl font-black text-foreground mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

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
                      <p className="text-sm text-muted-foreground">{testimonial.position}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-1 text-xs text-accent">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Now working in {testimonial.country}</span>
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
                  Ready to Launch Your Career?
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
                    Tell us about your career goals
                  </Label>
                  <div className="relative mt-2">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Textarea
                      id="message"
                      placeholder="Which industry and country are you interested in?"
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
                >
                  Start My Free 15-Min Consultation
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
            <span>Trusted by 5000+ professionals worldwide</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ManpowerRecruitment;
