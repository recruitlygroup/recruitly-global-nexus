import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Users, Globe, Award, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import HeraScoreSection from "@/components/education/HeraScoreSection";
import JourneyTimeline from "@/components/education/JourneyTimeline";
import LoginModal from "@/components/education/LoginModal";
import DynamicHeadline from "@/components/education/DynamicHeadline";
import TrustBadge from "@/components/TrustBadge";
import RecruitlyAIChatWidget from "@/components/RecruitlyAIChatWidget";

const STATISTICS = [
  { value: "98%", label: "Visa Success Rate", icon: Award, key: "success" },
  { value: "100+", label: "Students Placed Last Month", icon: Users, key: "students" },
  { value: "50+", label: "Partner Universities", icon: Globe, key: "universities" }
];

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    country: "UK",
    text: "Recruitly Global made my dream of studying in the UK a reality. The HeraScore gave me confidence in my application.",
    university: "University of Oxford"
  },
  {
    name: "Rajesh Kumar",
    country: "Canada",
    text: "Professional guidance from HeraScore assessment to visa approval. I got accepted to my top choice!",
    university: "University of Toronto"
  },
  {
    name: "Maria Santos",
    country: "Australia",
    text: "The document apostille process was seamless. Their team handled everything perfectly.",
    university: "University of Melbourne"
  }
];

const FAQ_ITEMS = [
  {
    question: "What is HeraScore and how does it work?",
    answer: "HeraScore is our AI-powered assessment tool that analyzes your academic profile, test scores, and preferences to calculate your estimated acceptance probability at top universities worldwide. It takes just 2 minutes to complete."
  },
  {
    question: "How long does the entire application process take?",
    answer: "The typical timeline is 3-6 months from HeraScore assessment to visa approval, depending on the country and university. We'll provide you with a detailed timeline during your consultation."
  },
  {
    question: "Do you help with document apostille for Nepal?",
    answer: "Yes! We specialize in document apostille services for Nepal and other countries. Our Global Document Verification service ensures your academic documents are properly authenticated for international use."
  },
  {
    question: "What is your visa success rate?",
    answer: "We maintain a 98% visa success rate across all destinations. Our experienced team ensures all documentation is thorough and accurate to minimize rejection risks."
  },
  {
    question: "Is the HeraScore assessment free?",
    answer: "Yes! The initial HeraScore assessment is completely free. You'll get your acceptance probability and university tier match instantly. Log in to unlock specific university recommendations and your personalized Letter of Intent."
  }
];

const EducationalConsultancy = () => {
  const { country, countryCode } = useGeolocation();
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [destinationCountry] = useState<string | undefined>();

  const getCountryFlag = (code: string) => {
    if (!code) return "🌍";
    return String.fromCodePoint(...[...code.toUpperCase()].map(c => c.charCodeAt(0) + 127397));
  };

  const metricDetails = {
    success: {
      title: "98% Visa Success Rate",
      description: "Our visa success rate is calculated based on all student visa applications processed in the last 12 months. This exceptional rate is achieved through thorough documentation and expert guidance.",
      source: "Data validated by Recruitly's Compliance AI on November 2025"
    },
    students: {
      title: `100+ Students Placed${country && country !== 'Global' ? ` from ${country}` : ''} Last Month`,
      description: country && country !== 'Global' 
        ? `We successfully placed over 100 students from ${country} in top universities last month. Our HeraScore system ensures each student finds the perfect match.`
        : "We successfully placed over 100 students in top universities worldwide last month, with personalized HeraScore assessments for each.",
      source: "Data validated by Recruitly's Compliance AI on November 2025"
    },
    universities: {
      title: "50+ Partner Universities",
      description: country && country !== 'Global'
        ? `We have partnerships with 50+ universities globally, including institutions that actively recruit students from ${country}.`
        : "Our network spans 50+ universities across multiple countries, providing diverse opportunities for every student.",
      source: "Data validated by Recruitly's Compliance AI on November 2025"
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-16">
        <div className="flex items-center justify-between mb-8">
          <Link to="/">
            <Button variant="ghost" className="group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Button>
          </Link>
          <TrustBadge />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <DynamicHeadline 
            userCountry={country} 
            destinationCountry={destinationCountry} 
          />
        </motion.div>

        <HeraScoreSection 
          onLoginRequired={() => setShowLoginModal(true)}
          userCountry={country}
        />

        <JourneyTimeline />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {STATISTICS.map((stat, index) => (
            <Card 
              key={index} 
              className="border-accent/20 cursor-pointer hover:border-accent/50 transition-all duration-300 hover:scale-105 group"
              onClick={() => setSelectedMetric(stat.key)}
            >
              <CardContent className="p-6 text-center relative">
                <stat.icon className="w-8 h-8 text-accent mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-4xl font-black text-foreground mb-2">
                  {stat.value}
                  {stat.key === "students" && country && country !== 'Global' && (
                    <span className="ml-2 text-2xl">{getCountryFlag(countryCode)}</span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground font-medium mb-2">
                  {stat.key === "students" && country && country !== 'Global' 
                    ? `Students from ${country}` 
                    : stat.label}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Info className="w-4 h-4 text-accent mx-auto" />
                  <p className="text-xs text-accent mt-1">Click for details</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
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
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 font-bold text-accent">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
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

      <LoginModal 
        open={showLoginModal} 
        onOpenChange={setShowLoginModal}
      />

      <RecruitlyAIChatWidget />
    </div>
  );
};

export default EducationalConsultancy;
