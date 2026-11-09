// src/pages/EducationalConsultancy.tsx — "Study abroad" (pillar 1, /student-recruitment)
// Same structure as ManpowerRecruitment / InternRecruitment: PageHero + bordered sections inside
// a max-w-7xl container. Country hubs are data-driven from src/data/studyCountries.ts.
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Users, Globe, Award, Info, ClipboardCheck, GraduationCap, FileStack, Plane } from "lucide-react";
import PageHero from "@/components/PageHero";
import RecruitlyAIChatWidget from "@/components/RecruitlyAIChatWidget";
import { useSEO } from "@/hooks/useSEO";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useHashnodeBlog } from "@/hooks/useHashnodeBlog";
import { STUDY_COUNTRIES, filterPostsByCountry } from "@/data/studyCountries";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STATISTICS = [
  { value: "98%", label: "Visa Success Rate", icon: Award, key: "success" },
  { value: "100+", label: "Students Placed Last Month", icon: Users, key: "students" },
  { value: "50+", label: "Partner Universities", icon: Globe, key: "universities" }
];

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    country: "UK",
    text: "Recruitly Group made my dream of studying in the UK a reality. The WiseScore gave me confidence in my application.",
    university: "University of Oxford"
  },
  {
    name: "Rajesh Kumar",
    country: "Canada",
    text: "Professional guidance from WiseScore assessment to visa approval. I got accepted to my top choice!",
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
    question: "What is WiseScore and how does it work?",
    answer: "WiseScore is our AI-powered assessment tool that analyzes your academic profile, test scores, and preferences to calculate your estimated acceptance probability at top universities worldwide. It takes just 2 minutes to complete."
  },
  {
    question: "How long does the entire application process take?",
    answer: "The typical timeline is 3-6 months from WiseScore assessment to visa approval, depending on the country and university. We'll provide you with a detailed timeline during your consultation."
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
    question: "Is the WiseScore assessment free?",
    answer: "Yes! The initial WiseScore assessment is completely free. You'll get your acceptance probability and university tier match instantly. Log in to unlock specific university recommendations and your personalized Letter of Intent."
  }
];

const STEPS = [
  { icon: ClipboardCheck, title: "Assessment", body: "Take the free WiseScore to see your admission chances and get an AI university shortlist." },
  { icon: GraduationCap,  title: "Matching",   body: "Pick one realistic university and program that fits your profile and budget." },
  { icon: FileStack,      title: "Documents",  body: "Prepare, legalize and apostille your documents with step-by-step guidance." },
  { icon: Plane,          title: "Visa",       body: "Follow your country\u2019s visa checklist and apply to the right embassy or visa centre." },
];

const EducationalConsultancy = () => {
  useSEO({
    title: "Student Recruitment | Study in Europe & India – Recruitly Group",
    description: "Get expert guidance to study in Italy, Austria, Lithuania, Slovakia, Slovenia and India. WiseScore assessment, step-by-step country roadmaps, legalization and visa support.",
    keywords: "study in Europe, student recruitment Nepal, university admission Europe, student visa guidance, WiseScore, study in Italy, study in Austria",
    canonicalUrl: "https://www.recruitlygroup.com/student-recruitment",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": "Recruitly Group – Student Recruitment",
      "url": "https://www.recruitlygroup.com/student-recruitment",
    },
  });

  const { country, countryCode } = useGeolocation();
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const { posts } = useHashnodeBlog(Infinity);

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
        ? `We successfully placed over 100 students from ${country} in top universities last month. Our WiseScore system ensures each student finds the perfect match.`
        : "We successfully placed over 100 students in top universities worldwide last month, with personalized WiseScore assessments for each.",
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
    <div className="bg-background">
      <PageHero
        eyebrow="Student Recruitment"
        title="Do you actually qualify to study abroad?"
        subtitle="Find out in 2 minutes. Our AI analyzes your profile and tells you exactly where you stand, then guides you country by country."
        photo="students.jpg" photoAlt="Students preparing to study abroad"
      >
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link to="/wisescore" className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-bold px-6 py-3 rounded-md">
            Check my WiseScore <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <p className="text-sm text-white/80">Free · No signup required · Results in 2 minutes</p>
        </div>
      </PageHero>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 space-y-16">
        {/* Country hubs — generated from STUDY_COUNTRIES */}
        <section aria-labelledby="destinations-heading">
          <h2 id="destinations-heading" className="text-2xl md:text-3xl font-extrabold text-primary mb-2">Choose your study destination</h2>
          <p className="text-slate-600 mb-8 max-w-2xl">Each country guide has a step-by-step roadmap, a free support community and the latest articles.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {STUDY_COUNTRIES.map((c) => {
              const count = filterPostsByCountry(posts, c).length;
              return (
                <Link key={c.slug} to={`/student-recruitment/${c.slug}`} className="bg-white border border-border rounded-md p-6 hover:border-accent transition-colors group flex flex-col">
                  <span className="text-3xl mb-3" aria-hidden="true">{c.flag}</span>
                  <h3 className="text-lg font-extrabold text-primary mb-2 group-hover:text-accent">Study in {c.name}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">{c.tagline}</p>
                  <span className="mt-auto flex items-center justify-between text-sm font-semibold text-primary group-hover:text-accent">
                    <span>{count > 0 ? `${count} ${count === 1 ? "article" : "articles"}` : "Open the guide"}</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="how-heading">
          <h2 id="how-heading" className="text-2xl md:text-3xl font-extrabold text-primary mb-8">How it works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.title} className="bg-white border border-border rounded-md p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">{i + 1}</span>
                  <s.icon className="w-5 h-5 text-accent" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-primary mb-1">{s.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Statistics */}
        <section aria-label="Key figures">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STATISTICS.map((stat) => (
              <button
                key={stat.key}
                type="button"
                onClick={() => setSelectedMetric(stat.key)}
                className="bg-white border border-border rounded-md p-6 text-center hover:border-accent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <stat.icon className="w-7 h-7 text-accent mx-auto mb-3" aria-hidden="true" />
                <div className="text-4xl font-extrabold text-primary mb-1">
                  {stat.value}
                  {stat.key === "students" && country && country !== "Global" && (
                    <span className="ml-2 text-2xl" aria-hidden="true">{getCountryFlag(countryCode)}</span>
                  )}
                </div>
                <div className="text-sm text-slate-600 font-medium">
                  {stat.key === "students" && country && country !== "Global" ? `Students from ${country}` : stat.label}
                </div>
                <span className="mt-2 inline-flex items-center gap-1 text-xs text-accent"><Info className="w-3.5 h-3.5" aria-hidden="true" /> Details</span>
              </button>
            ))}
          </div>
        </section>

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
            <div className="mt-4 p-4 bg-accent/10 rounded-md border border-accent/20">
              <p className="text-xs text-muted-foreground italic">
                {selectedMetric && metricDetails[selectedMetric as keyof typeof metricDetails].source}
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Testimonials */}
        <section aria-labelledby="stories-heading">
          <h2 id="stories-heading" className="text-2xl md:text-3xl font-extrabold text-primary mb-8">Success stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="bg-white border border-border rounded-md p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary" aria-hidden="true">
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <figcaption>
                    <p className="font-bold text-primary">{t.name}</p>
                    <p className="text-sm text-slate-600">{t.university}</p>
                  </figcaption>
                </div>
                <blockquote className="text-sm text-slate-600 mb-3 italic">“{t.text}”</blockquote>
                <p className="flex items-center gap-1 text-xs text-accent"><CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Now studying in {t.country}</p>
              </figure>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-heading" className="max-w-3xl">
          <h2 id="faq-heading" className="text-2xl md:text-3xl font-extrabold text-primary mb-8">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem key={item.question} value={`item-${index}`} className="bg-white border border-border rounded-md px-6">
                <AccordionTrigger className="text-left text-primary font-semibold hover:text-accent hover:no-underline">{item.question}</AccordionTrigger>
                <AccordionContent className="text-slate-600">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>

      <RecruitlyAIChatWidget />
    </div>
  );
};

export default EducationalConsultancy;
