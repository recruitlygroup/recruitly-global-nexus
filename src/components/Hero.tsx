import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Building, Plane, FileText, MessageCircle, Search, Mic, Upload, Loader2 } from "lucide-react";
import { Input } from "./ui/input";
import BubbleMenu from "./BubbleMenu";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useIntentRouter } from "@/hooks/useIntentRouter";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useDebounce } from "@/hooks/useDebounce";

interface HeroProps {
  onExplore: () => void;
  onUserTypeSelect: (type: string) => void;
}

const SERVICES = [
  {
    id: "education",
    title: "Educational Consultancy",
    subtitle: "Study Abroad",
    icon: GraduationCap,
    color: "hsl(220 60% 55%)",
    description: "Expert guidance for your global education journey"
  },
  {
    id: "recruitment",
    title: "Manpower Recruitment",
    subtitle: "Find Your Career",
    icon: Building,
    color: "hsl(210 100% 50%)",
    description: "Connect with opportunities worldwide"
  },
  {
    id: "travel",
    title: "Tours & Travels",
    subtitle: "Explore the World",
    icon: Plane,
    color: "hsl(280 60% 55%)",
    description: "Curated experiences across the globe"
  },
  {
    id: "apostille",
    title: "Apostille Services",
    subtitle: "Document Legalization",
    icon: FileText,
    color: "hsl(340 80% 55%)",
    description: "Fast and reliable document authentication"
  }
];

const PLACEHOLDER_EXAMPLES = [
  "Start my application for a Master's in Germany...",
  "Find a recruiter for a software engineer role...",
  "Book a 7-day tour package to Japan...",
  "Get my documents apostilled for visa application..."
];

const Hero = ({ onExplore, onUserTypeSelect }: HeroProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestedService, setSuggestedService] = useState<typeof SERVICES[0] | null>(null);
  const [aiConfidence, setAiConfidence] = useState<number>(0);
  const [aiReasoning, setAiReasoning] = useState<string>("");
  
  const navigate = useNavigate();
  const { analyzeIntent, isLoading: isAnalyzing } = useIntentRouter();
  const { country } = useGeolocation();
  const debouncedQuery = useDebounce(searchQuery, 500);

  // Cycle through placeholder examples
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_EXAMPLES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // AI-powered intent analysis
  useEffect(() => {
    const analyzeQuery = async () => {
      if (debouncedQuery.length > 3) {
        const result = await analyzeIntent(debouncedQuery, { country });
        
        if (result && result.service) {
          const matched = SERVICES.find(s => s.id === result.service);
          setSuggestedService(matched || null);
          setShowSuggestion(!!matched);
          setAiConfidence(result.confidence);
          setAiReasoning(result.suggestedAction);
        } else {
          setShowSuggestion(false);
        }
      } else {
        setShowSuggestion(false);
      }
    };

    analyzeQuery();
  }, [debouncedQuery, analyzeIntent, country]);

  const handleServiceClick = (serviceId: string) => {
    switch (serviceId) {
      case "education":
        navigate("/educational-consultancy");
        break;
      case "recruitment":
        navigate("/manpower-recruitment");
        break;
      case "travel":
        navigate("/tours-and-travels");
        break;
      case "apostille":
        navigate("/apostille-services");
        break;
      default:
        onExplore();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative z-10">
      {/* Bubble Menu */}
      <BubbleMenu onUserTypeSelect={onUserTypeSelect} />
      
      {/* Main Hero Content */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-16 max-w-6xl w-full"
      >
        {/* Headline */}
        <motion.h1 
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-foreground tracking-tighter leading-none mb-8"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Your Global Journey
          <br />
          <span className="text-accent">Starts Here</span>
        </motion.h1>

        {/* Central Search Input */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="relative max-w-3xl mx-auto mb-16"
        >
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground z-10" />
            <Input
              type="text"
              placeholder={PLACEHOLDER_EXAMPLES[placeholderIndex]}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-16 pl-16 pr-32 text-lg glass rounded-2xl border-2 border-border/50 focus:border-accent transition-all duration-300 placeholder:text-muted-foreground/60"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-accent/20"
                aria-label="Voice input"
              >
                <Mic className="w-5 h-5 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-accent/20"
                aria-label="Upload file"
              >
                <Upload className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* AI-Powered Smart Suggestion Overlay */}
          <AnimatePresence>
            {(showSuggestion || isAnalyzing) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full mt-4 left-0 right-0 glass rounded-2xl p-6 border border-border/50 shadow-xl z-20"
              >
                {isAnalyzing ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-accent" />
                    <p className="text-sm text-muted-foreground">AI is analyzing your query...</p>
                  </div>
                ) : suggestedService && (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: suggestedService.color }}
                      >
                        <suggestedService.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm text-muted-foreground">AI Recommendation</p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent font-medium">
                            {Math.round(aiConfidence * 100)}% match
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-foreground">{suggestedService.title}</h3>
                      </div>
                      <Button
                        onClick={() => handleServiceClick(suggestedService.id)}
                        className="bg-accent hover:bg-accent/90 text-accent-foreground"
                      >
                        Go to {suggestedService.title.split(' ')[0]}
                      </Button>
                    </div>
                    {aiReasoning && (
                      <p className="text-xs text-muted-foreground border-t border-border/30 pt-3">
                        💡 {aiReasoning}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Service Cards Grid */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
        >
          {SERVICES.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => handleServiceClick(service.id)}
              className="group relative glass rounded-2xl p-8 cursor-pointer border border-border/50 hover:border-accent/50 transition-all duration-500 overflow-hidden"
            >
              {/* Animated background glow */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                style={{ backgroundColor: service.color }}
              />
              
              {/* Content */}
              <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: service.color }}
                >
                  <service.icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                </motion.div>
                
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1 tracking-tight">
                    {service.title}
                  </h3>
                  <p className="text-sm font-medium text-accent mb-2">
                    {service.subtitle}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                  
                  {/* Live Trust Metrics */}
                  <div className="mt-4 pt-3 border-t border-border/30">
                    <p className="text-[10px] font-semibold text-accent/80">
                      {service.id === "education" && "98.5% Visa Approval Rate"}
                      {service.id === "recruitment" && "1,200+ Placements This Quarter"}
                      {service.id === "travel" && "500+ Tours Completed"}
                      {service.id === "apostille" && "24-Hour Processing Available"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Hover overlay with personalized CTA */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/95 z-20 rounded-2xl">
                <div className="text-center px-6">
                  <p className="text-sm font-bold text-foreground mb-2">
                    {service.id === "education" && "Start Your Education Journey"}
                    {service.id === "recruitment" && "Find Your Dream Job"}
                    {service.id === "travel" && "Explore Top Destinations"}
                    {service.id === "apostille" && "Fast-Track Your Documents"}
                  </p>
                  <p className="text-xs text-muted-foreground">Click to learn more →</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* WhatsApp Chat Button */}
      <motion.a
        href="https://wa.me/1234567890"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 left-8 z-50 flex items-center gap-3 glass rounded-full px-6 py-4 shadow-2xl glow-hover group"
      >
        <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center group-hover:scale-110 transition-transform">
          <MessageCircle className="w-6 h-6 text-white fill-white" />
        </div>
        <span className="text-foreground font-medium tracking-wide">
          Chat with me
        </span>
      </motion.a>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="fixed bottom-8 right-8 text-right"
      >
        <p className="text-sm text-muted-foreground font-light tracking-wide">
          Registered in Estonia
        </p>
        <div className="flex gap-4 justify-end mt-2">
          <a
            href="#"
            className="text-muted-foreground hover:text-accent transition-colors"
          >
            LinkedIn
          </a>
          <a
            href="#"
            className="text-muted-foreground hover:text-accent transition-colors"
          >
            Instagram
          </a>
        </div>
      </motion.footer>
    </div>
  );
};

export default Hero;
