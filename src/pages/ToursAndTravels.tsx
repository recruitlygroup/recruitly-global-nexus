import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Users, MapPin, Star, Phone, Mail, User, MessageSquare } from "lucide-react";
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
  { number: 2, label: "Plan" },
  { number: 3, label: "Travel" }
];

const STATISTICS = [
  { value: "4.9/5", label: "Average Customer Rating", icon: Star },
  { value: "2000+", label: "Travelers Last Year", icon: Users },
  { value: "50+", label: "Global Destinations", icon: MapPin }
];

const TESTIMONIALS = [
  {
    name: "David Chen",
    destination: "Japan",
    text: "The cherry blossom tour was perfectly organized. Every detail was taken care of, allowing us to fully enjoy the experience.",
    trip: "14-Day Cultural Tour"
  },
  {
    name: "Lisa Anderson",
    destination: "Switzerland",
    text: "Our family alpine adventure exceeded all expectations. Professional guides and breathtaking views!",
    trip: "Swiss Alps Package"
  },
  {
    name: "Michael Brown",
    destination: "Thailand",
    text: "Amazing beach resort package with great activities. Odyssey made our honeymoon unforgettable.",
    trip: "Tropical Paradise"
  }
];

const FAQ_ITEMS = [
  {
    question: "What's included in your tour packages?",
    answer: "Our packages typically include round-trip flights, accommodation, daily breakfast, guided tours, entrance fees to attractions, and airport transfers. Specific inclusions vary by package and are clearly detailed in each itinerary."
  },
  {
    question: "Can I customize my travel package?",
    answer: "Absolutely! We offer both pre-designed packages and fully customizable itineraries. During your consultation, we'll work with you to create a trip that matches your interests, budget, and schedule."
  },
  {
    question: "What happens if I need to cancel my trip?",
    answer: "We offer flexible cancellation policies depending on the package and timing. Travel insurance is always recommended and available through our partners. Specific terms are provided during booking."
  },
  {
    question: "Do you handle visa applications?",
    answer: "Yes! We provide comprehensive visa assistance including document preparation, application submission, and tracking. Our team is experienced with visa requirements for all our destination countries."
  },
  {
    question: "Are group tours or private tours available?",
    answer: "We offer both! Group tours are great for solo travelers or those seeking social experiences, while private tours provide personalized attention and flexible itineraries for families or couples."
  }
];

const ToursAndTravels = () => {
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
            Tours & Travels
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto">
            Discover the world with expertly curated travel experiences
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
            Traveler Stories
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
                      <p className="text-sm text-muted-foreground">{testimonial.trip}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-1 text-xs text-accent">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Traveled to {testimonial.destination}</span>
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
                  Ready to Explore the World?
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
                    Tell us about your dream vacation
                  </Label>
                  <div className="relative mt-2">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Textarea
                      id="message"
                      placeholder="Where would you like to go? Any specific interests or requirements?"
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
            <span>Trusted by 2000+ happy travelers worldwide</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ToursAndTravels;
