import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  Shield, 
  Phone, 
  Mail, 
  User, 
  MessageSquare, 
  Loader2,
  Globe,
  FileText,
  Building2,
  GraduationCap,
  Briefcase,
  Zap,
  ArrowRight,
  MapPin,
  MessageCircle,
  Package,
  Send,
  BadgeCheck,
  Scale,
  Lock,
  Users,
  Stamp
} from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Import images
import heroImage from "@/assets/veridocs-hero.jpg";
import step1Image from "@/assets/veridocs-step1-order.jpg";
import step2Image from "@/assets/veridocs-step2-send.jpg";
import step3Image from "@/assets/veridocs-step3-process.jpg";
import step4Image from "@/assets/veridocs-step4-delivery.jpg";

const TRUST_SIGNALS = [
  { icon: BadgeCheck, text: "Registered & compliant service" },
  { icon: Globe, text: "Serving multiple countries" },
  { icon: Lock, text: "Secure document handling" }
];

const SERVICES = [
  {
    icon: Stamp,
    title: "Apostille Services",
    description: "UK & international apostille certification with government-compliant handling for Hague Convention countries.",
    features: ["UK apostille", "International coverage", "Government compliance"]
  },
  {
    icon: Building2,
    title: "Embassy Attestation",
    description: "Full end-to-end attestation services for UAE, Qatar, Egypt, and other destination countries.",
    features: ["UAE attestation", "Qatar legalisation", "Egypt & others"]
  },
  {
    icon: FileText,
    title: "Certified Translations",
    description: "Multi-language translation services with legal and corporate acceptance worldwide.",
    features: ["50+ languages", "Certified translators", "Legal acceptance"]
  },
  {
    icon: GraduationCap,
    title: "Personal & Academic Documents",
    description: "Birth certificates, marriage documents, educational records, and immigration paperwork.",
    features: ["Birth & marriage", "Degrees & transcripts", "Immigration docs"]
  },
  {
    icon: Briefcase,
    title: "Business & Corporate Documents",
    description: "Commercial documents, contracts, company records, and trade documentation.",
    features: ["Contracts", "Company records", "Trade documents"]
  },
  {
    icon: Zap,
    title: "E-Apostille / E-Legalisation",
    description: "Digital delivery options with faster turnaround for time-sensitive requirements.",
    features: ["Email delivery", "Faster processing", "Digital copies"]
  }
];

const PROCESS_STEPS = [
  {
    number: 1,
    title: "Place an Order",
    description: "Submit your requirements online. Tell us which documents need legalisation and for which country.",
    image: step1Image
  },
  {
    number: 2,
    title: "Send Documents",
    description: "Securely send your original documents to us via courier. We provide full tracking and insurance.",
    image: step2Image
  },
  {
    number: 3,
    title: "We Process & Legalise",
    description: "Our expert team handles all verification, apostille, and attestation requirements on your behalf.",
    image: step3Image
  },
  {
    number: 4,
    title: "Secure Return / Digital Delivery",
    description: "Receive your legalised documents via secure courier or digital delivery as per your preference.",
    image: step4Image
  }
];

const WHY_CHOOSE_US = [
  { icon: Scale, title: "Compliance-Focused", description: "All processes follow strict legal and regulatory requirements" },
  { icon: FileCheck, title: "Transparent Pricing", description: "Clear pricing with no hidden fees or surprise charges" },
  { icon: Lock, title: "Secure Storage", description: "Your documents are handled with utmost confidentiality" },
  { icon: Users, title: "Experienced Team", description: "Professional legalisation specialists with years of expertise" },
  { icon: Globe, title: "International Acceptance", description: "Documents accepted by authorities worldwide" }
];

const PRICING_PLANS = [
  {
    name: "Standard Apostille",
    price: "From £65",
    turnaround: "7-10 business days",
    features: ["UK apostille certification", "Document verification", "Secure handling", "Standard delivery"],
    popular: false
  },
  {
    name: "Express Apostille",
    price: "From £120",
    turnaround: "3-5 business days",
    features: ["Priority processing", "UK apostille certification", "Document verification", "Express delivery included"],
    popular: true
  },
  {
    name: "E-Apostille",
    price: "From £85",
    turnaround: "5-7 business days",
    features: ["Digital apostille copy", "Email delivery", "Physical copy optional", "Perfect for urgent needs"],
    popular: false
  }
];

const ADDITIONAL_SERVICES = [
  { title: "Solicitor Certification", description: "Professional certification by qualified solicitors" },
  { title: "International Delivery", description: "Worldwide tracked delivery to any destination" },
  { title: "Scan Service", description: "High-quality scans of legalised documents" },
  { title: "Embassy Attestation Add-on", description: "Additional attestation for non-Hague countries" }
];

const FAQ_ITEMS = [
  {
    question: "What is an apostille?",
    answer: "An apostille is an international certification that authenticates the origin of public documents. It's a standardized form of authentication issued for documents used in countries that participate in the Hague Convention of 1961. The apostille certifies the authenticity of the signature, the capacity in which the person signing the document acted, and the identity of any seal or stamp on the document."
  },
  {
    question: "Do I need to send original documents?",
    answer: "In most cases, yes. Original documents or certified copies from the issuing authority are required for apostille. We handle your documents with the utmost care, providing full tracking, insurance, and secure storage throughout the process. For certain documents, notarized copies may be acceptable - please contact us to confirm your specific requirements."
  },
  {
    question: "How long does the process take?",
    answer: "Standard apostille processing takes 7-10 business days from when we receive your documents. Express service is available for 3-5 business days, and urgent cases can sometimes be accommodated within 24-48 hours at additional cost. Embassy attestation may take longer depending on the specific embassy requirements."
  },
  {
    question: "Can you apostille business documents?",
    answer: "Yes, we handle a wide range of business and corporate documents including company registration certificates, articles of association, board resolutions, powers of attorney, commercial invoices, and contracts. All business documents must be signed by an authorized signatory and may require notarization before apostille."
  },
  {
    question: "Do you provide translation services?",
    answer: "Yes, we offer certified translation services in over 50 languages. Our translations are completed by qualified translators and are accepted by government authorities, educational institutions, and legal bodies worldwide. Translation can be combined with apostille services for a complete legalisation package."
  },
  {
    question: "Which countries accept apostille?",
    answer: "Apostilles are accepted by all countries that are members of the Hague Convention (currently over 120 countries). For countries that are not members of the Convention, documents require embassy attestation or legalisation through the relevant embassy or consulate. We can advise on the correct process for your destination country."
  }
];

const ApostilleServices = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  
  const contactRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await supabase.functions.invoke('submit-consultation', {
        body: {
          serviceType: 'apostille',
          fullName: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message
        }
      });

      if (response.error) {
        const errorMessage = response.error.message || 'An unexpected error occurred';
        
        if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
          toast.error('Too many requests. Please wait a moment and try again.');
        } else if (errorMessage.includes('email') || errorMessage.includes('invalid')) {
          toast.error('Please check your email address and try again.');
        } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
          toast.error('Connection error. Please check your internet and try again.');
        } else {
          toast.error(`Submission failed: ${errorMessage}`);
        }
        return;
      }

      toast.success('Your inquiry has been submitted! We will contact you within 24 hours.');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to submit: ${message}. Please try again or contact us via WhatsApp.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToContact = () => {
    contactRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleImageError = (key: string) => {
    setImageErrors(prev => ({ ...prev, [key]: true }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          {!imageErrors['hero'] ? (
            <img 
              src={heroImage} 
              alt="Document legalisation services"
              className="w-full h-full object-cover"
              onError={() => handleImageError('hero')}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/10" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/70" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
          <Link to="/">
            <Button variant="ghost" className="mb-8 group text-foreground hover:text-primary">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">VeriDocs by Recruitly Group</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Get Your Documents Legalised{" "}
              <span className="text-primary">Without the Stress</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Fast, secure, and internationally accepted apostille and legalisation services for individuals and businesses.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button size="lg" className="text-lg h-14 px-8" onClick={scrollToContact}>
                Place an Order
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg h-14 px-8" onClick={scrollToContact}>
                <Phone className="w-5 h-5 mr-2" />
                Contact Our Team
              </Button>
            </div>

            {/* Trust Signals */}
            <div className="flex flex-wrap gap-6">
              {TRUST_SIGNALS.map((signal, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <signal.icon className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">{signal.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Who We Are
            </h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              VeriDocs is the legalisation and apostille arm of Recruitly Group. We specialize in handling personal, academic, and corporate documents for international use.
            </p>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Our focus is on compliance, speed, and security. We understand that your documents are important, and we treat every submission with the professionalism and care it deserves.
            </p>
            <Button variant="outline" size="lg" onClick={scrollToServices}>
              Learn More About Our Process
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Services Overview */}
      <section ref={servicesRef} className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Legalisation & Certification Services
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive document authentication services for personal, academic, and business needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-border/50">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <service.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="w-full" onClick={scrollToContact}>
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Visual Roadmap */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How VeriDocs Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A simple 4-step process to get your documents legalised
            </p>
          </motion.div>

          <div className="space-y-12 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PROCESS_STEPS.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                {/* Connection Line - Desktop */}
                {index < PROCESS_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-24 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-primary/20 z-0" />
                )}

                <Card className="relative z-10 h-full border-border/50 overflow-hidden">
                  {/* Step Image */}
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    {!imageErrors[`step${step.number}`] ? (
                      <img 
                        src={step.image} 
                        alt={step.title}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(`step${step.number}`)}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        {step.number === 1 && <Send className="w-12 h-12 text-primary/50" />}
                        {step.number === 2 && <Package className="w-12 h-12 text-primary/50" />}
                        {step.number === 3 && <FileCheck className="w-12 h-12 text-primary/50" />}
                        {step.number === 4 && <CheckCircle2 className="w-12 h-12 text-primary/50" />}
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg">
                        {step.number}
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Clients Choose VeriDocs
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Trusted by individuals and businesses for professional document legalisation
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {WHY_CHOOSE_US.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Transparent Pricing, No Hidden Fees
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Clear pricing for our most popular services. Custom quotes available for complex requirements.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PRICING_PLANS.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`h-full relative ${plan.popular ? 'border-primary shadow-lg' : 'border-border/50'}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold text-foreground">{plan.price}</div>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-2">
                      <Clock className="w-4 h-4" />
                      {plan.turnaround}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? "default" : "outline"}
                      onClick={scrollToContact}
                    >
                      Select
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            * Prices are indicative and may vary based on document type and destination country. 
            Contact us for a precise quote.
          </p>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Additional Services
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {ADDITIONAL_SERVICES.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-border/50 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-2">{service.title}</h3>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <Accordion type="single" collapsible className="space-y-4">
            {FAQ_ITEMS.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <AccordionItem 
                  value={`item-${index}`} 
                  className="bg-background border border-border/50 rounded-xl px-6"
                >
                  <AccordionTrigger className="text-left text-foreground font-semibold hover:text-primary">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Contact Section */}
      <section ref={contactRef} className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Need Help with a Specific Case?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our team is ready to assist you with your document legalisation needs. 
                Get in touch and we'll provide personalized guidance.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                    <p className="text-muted-foreground">+372 5555 1234</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Email</h3>
                    <p className="text-muted-foreground">info@recruitlygroup.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">WhatsApp</h3>
                    <a href="https://wa.me/9779743208282" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-accent">+977 974 320 8282</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Office Hours</h3>
                    <p className="text-muted-foreground">Monday - Friday: 9:00 AM - 6:00 PM (EET)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Location</h3>
                    <p className="text-muted-foreground">Kathmandu, Nepal</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Send Us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you within 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                          maxLength={100}
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
                          maxLength={255}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-foreground">
                        Phone Number
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
                          maxLength={20}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-foreground">
                        Your Message *
                      </Label>
                      <div className="relative mt-2">
                        <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Textarea
                          id="message"
                          placeholder="Which documents do you need apostilled? For which country? Any specific deadlines?"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="pl-10 min-h-32"
                          required
                          maxLength={2000}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full text-lg h-14 font-semibold"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      By submitting this form, you agree to our terms of service and privacy policy.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Badge Footer */}
      <section className="py-12 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Estonia Registered Company</span>
            </div>
            <div className="hidden md:block w-1 h-1 rounded-full bg-muted-foreground" />
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>Secure Document Handling</span>
            </div>
            <div className="hidden md:block w-1 h-1 rounded-full bg-muted-foreground" />
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              <span>International Acceptance</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ApostilleServices;