import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Building, Plane, FileText, MessageCircle, Search, Mic, Paperclip, Loader2, ArrowRight, Upload, X, CheckCircle2 } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import { supabase } from "@/integrations/supabase/client";

// Service definitions
const SERVICES = [
  {
    id: "education",
    route: "B2C_Student",
    title: "Student Recruitment",
    subtitle: "Study Abroad",
    icon: GraduationCap,
    color: "210 100% 50%",
    description: "Expert guidance for your global education journey",
    metric: "98.5% Visa Approval Rate"
  },
  {
    id: "recruitment",
    route: "B2B_Employer",
    title: "Manpower Supply",
    subtitle: "Hire Talent",
    icon: Building,
    color: "160 80% 45%",
    description: "Connect with skilled workforce worldwide",
    metric: "1,200+ Placements This Quarter"
  },
  {
    id: "travel",
    route: "Travel",
    title: "Visa & Travel",
    subtitle: "Explore the World",
    icon: Plane,
    color: "280 60% 55%",
    description: "Curated experiences across the globe",
    metric: "500+ Tours Completed"
  },
  {
    id: "apostille",
    route: "Apostille",
    title: "Document Services",
    subtitle: "Legalization",
    icon: FileText,
    color: "340 80% 55%",
    description: "Fast and reliable document authentication",
    metric: "24-Hour Processing Available"
  }
];

// Cycling placeholder examples
const PLACEHOLDER_EXAMPLES = [
  "I want to study in Europe...",
  "I need 20 construction workers...",
  "Upload resume for job matching...",
  "Get my documents apostilled for visa..."
];

interface IntentResult {
  route: string;
  confidence: number;
  keywords: string[];
  suggestedAction: string;
  serviceId: string;
}

type SuccessState = 'none' | 'student' | 'employer';

// Mock job data for student success state
const MOCK_JOBS = [
  { title: "Software Engineer", company: "TechCorp Germany", location: "Berlin", match: 95 },
  { title: "Data Analyst", company: "DataHub UK", location: "London", match: 88 },
  { title: "Marketing Associate", company: "Global Media", location: "Dubai", match: 82 }
];

const SmartIntentHero = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [intentResult, setIntentResult] = useState<IntentResult | null>(null);
  const [highlightedService, setHighlightedService] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [successState, setSuccessState] = useState<SuccessState>('none');
  const [isListening, setIsListening] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(searchQuery, 200); // Fast 200ms debounce

  // Cycle through placeholder examples
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_EXAMPLES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Real-time intent analysis with fast keyword matching
  useEffect(() => {
    const analyzeIntent = async () => {
      if (debouncedQuery.length < 3) {
        setIntentResult(null);
        setHighlightedService(null);
        return;
      }

      setIsAnalyzing(true);
      
      try {
        const { data, error } = await supabase.functions.invoke('smart-intent', {
          body: { query: debouncedQuery }
        });

        if (error) throw error;

        if (data && data.route !== 'Unknown') {
          setIntentResult(data);
          setHighlightedService(data.serviceId);
        } else {
          setIntentResult(null);
          setHighlightedService(null);
        }
      } catch (err) {
        console.error('Intent analysis error:', err);
        // Fallback to local keyword matching for speed
        const localResult = localKeywordMatch(debouncedQuery);
        if (localResult) {
          setIntentResult(localResult);
          setHighlightedService(localResult.serviceId);
        }
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeIntent();
  }, [debouncedQuery]);

  // Local keyword matching fallback for ultra-fast response
  const localKeywordMatch = (query: string): IntentResult | null => {
    const lowerQuery = query.toLowerCase();
    
    if (/study|education|university|degree|masters|abroad|europe|usa|uk|canada/.test(lowerQuery)) {
      return { route: 'B2C_Student', confidence: 0.8, keywords: [], suggestedAction: 'Find matching programs', serviceId: 'education' };
    }
    if (/hire|manpower|workers|staff|recruit|employees|construction/.test(lowerQuery)) {
      return { route: 'B2B_Employer', confidence: 0.8, keywords: [], suggestedAction: 'Get a quote', serviceId: 'recruitment' };
    }
    if (/travel|tour|visa|trip|vacation|flight/.test(lowerQuery)) {
      return { route: 'Travel', confidence: 0.8, keywords: [], suggestedAction: 'Explore packages', serviceId: 'travel' };
    }
    if (/apostille|document|legalization|certificate/.test(lowerQuery)) {
      return { route: 'Apostille', confidence: 0.8, keywords: [], suggestedAction: 'Start your request', serviceId: 'apostille' };
    }
    
    return null;
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadedFile(file);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);

      if (error) throw error;

      // Update search query to indicate file upload
      setSearchQuery("Analyzing your resume for job matching...");
      setHighlightedService('recruitment');
      
      // Simulate analysis delay
      setTimeout(() => {
        setIntentResult({
          route: 'B2C_Student',
          confidence: 0.95,
          keywords: ['resume', 'job matching'],
          suggestedAction: 'View matching opportunities',
          serviceId: 'recruitment'
        });
        setIsUploading(false);
      }, 2000);
      
    } catch (err) {
      console.error('Upload error:', err);
      setIsUploading(false);
    }
  };

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.type.includes('document'))) {
      handleFileUpload(file);
    }
  }, []);

  // Handle voice input (basic implementation)
  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
      };
      
      recognition.start();
    }
  };

  // Handle submit action
  const handleSubmit = async () => {
    if (!intentResult) return;
    
    if (intentResult.route === 'B2B_Employer') {
      setSuccessState('employer');
    } else if (intentResult.route === 'B2C_Student') {
      setSuccessState('student');
    } else {
      // Navigate to appropriate page
      const service = SERVICES.find(s => s.id === intentResult.serviceId);
      if (service) {
        handleServiceClick(service.id);
      }
    }
  };

  // Navigate to service pages
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
    }
  };

  // Reset success state
  const resetState = () => {
    setSuccessState('none');
    setSearchQuery('');
    setIntentResult(null);
    setHighlightedService(null);
    setUploadedFile(null);
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative z-10"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Success States */}
      <AnimatePresence mode="wait">
        {successState !== 'none' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-lg"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="glass rounded-3xl p-8 max-w-xl w-full mx-4 relative"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={resetState}
                className="absolute top-4 right-4"
              >
                <X className="w-5 h-5" />
              </Button>

              {successState === 'student' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Top Matching Opportunities</h3>
                      <p className="text-sm text-muted-foreground">Based on your profile and interests</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {MOCK_JOBS.map((job, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-4 rounded-xl border border-border/50 hover:border-accent/50 transition-colors cursor-pointer group"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-foreground group-hover:text-accent transition-colors">{job.title}</h4>
                            <p className="text-sm text-muted-foreground">{job.company} • {job.location}</p>
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent font-medium">
                            {job.match}% match
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <Button onClick={() => navigate('/educational-consultancy')} className="w-full bg-accent hover:bg-accent/90">
                    View All Opportunities
                  </Button>
                </div>
              )}

              {successState === 'employer' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                      <Building className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Request a Quote</h3>
                      <p className="text-sm text-muted-foreground">Tell us about your manpower needs</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Input placeholder="Company Name" className="h-12" />
                    <Input placeholder="Email Address" type="email" className="h-12" />
                    <Input placeholder="Number of Workers Needed" type="number" className="h-12" />
                    <textarea 
                      placeholder="Describe your requirements..."
                      className="w-full p-4 rounded-xl border border-input bg-background min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  
                  <Button className="w-full bg-accent hover:bg-accent/90">
                    Submit Request
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Hero Content */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-12 max-w-6xl w-full"
      >
        {/* Headline */}
        <motion.h1 
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-foreground tracking-tighter leading-none mb-4"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Your Global Journey
          <br />
          <span className="bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">Starts Here</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto"
        >
          Tell us what you need — our AI will route you to the right service instantly
        </motion.p>

        {/* Smart Intent Bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="relative max-w-3xl mx-auto mb-12"
        >
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground z-10" />
            <Input
              type="text"
              placeholder={PLACEHOLDER_EXAMPLES[placeholderIndex]}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-16 sm:h-20 pl-16 pr-40 text-base sm:text-lg glass rounded-2xl border-2 border-border/50 focus:border-accent transition-all duration-300 placeholder:text-muted-foreground/60"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleVoiceInput}
                className={`h-10 w-10 rounded-full hover:bg-accent/20 transition-colors ${isListening ? 'bg-accent/30 animate-pulse' : ''}`}
                aria-label="Voice input"
              >
                <Mic className={`w-5 h-5 ${isListening ? 'text-accent' : 'text-muted-foreground'}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="h-10 w-10 rounded-full hover:bg-accent/20"
                aria-label="Upload file"
              >
                <Paperclip className="w-5 h-5 text-muted-foreground" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
              />
              {(intentResult || isAnalyzing) && (
                <Button
                  onClick={handleSubmit}
                  disabled={isAnalyzing}
                  className="h-10 px-4 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl font-medium"
                >
                  {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Go <ArrowRight className="w-4 h-4 ml-1" /></>}
                </Button>
              )}
            </div>
          </div>

          {/* File Upload Indicator */}
          <AnimatePresence>
            {isUploading && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full mt-3 left-0 right-0 glass rounded-xl p-4 border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-accent" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Analyzing your profile...</p>
                    <p className="text-xs text-muted-foreground">{uploadedFile?.name}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Smart Suggestion Overlay */}
          <AnimatePresence>
            {intentResult && !isUploading && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full mt-3 left-0 right-0 glass rounded-xl p-4 border border-accent/30 shadow-lg shadow-accent/10"
              >
                <div className="flex items-center gap-4">
                  {(() => {
                    const service = SERVICES.find(s => s.id === intentResult.serviceId);
                    if (!service) return null;
                    return (
                      <>
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `hsl(${service.color})` }}
                        >
                          <service.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs text-muted-foreground">AI Suggestion</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent font-medium">
                              {Math.round(intentResult.confidence * 100)}% match
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-foreground truncate">{service.title}</h3>
                          <p className="text-xs text-muted-foreground">{intentResult.suggestedAction}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Service Cards Grid */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto"
        >
          {SERVICES.map((service, index) => {
            const isHighlighted = highlightedService === service.id;
            
            return (
              <motion.div
                key={service.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ 
                  y: 0, 
                  opacity: 1,
                  scale: isHighlighted ? 1.02 : 1,
                  boxShadow: isHighlighted 
                    ? `0 0 40px hsl(${service.color} / 0.4), 0 0 80px hsl(${service.color} / 0.2)`
                    : 'none'
                }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={() => handleServiceClick(service.id)}
                className={`group relative glass rounded-2xl p-6 cursor-pointer transition-all duration-300 overflow-hidden ${
                  isHighlighted 
                    ? 'border-2 ring-2 ring-offset-2 ring-offset-background' 
                    : 'border border-border/50 hover:border-accent/50'
                }`}
                style={{
                  borderColor: isHighlighted ? `hsl(${service.color})` : undefined,
                } as React.CSSProperties}
              >
                {/* Highlighted glow effect */}
                {isHighlighted && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.15 }}
                    className="absolute inset-0 pointer-events-none"
                    style={{ backgroundColor: `hsl(${service.color})` }}
                  />
                )}
                
                {/* Animated background glow on hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                  style={{ backgroundColor: `hsl(${service.color})` }}
                />
                
                {/* Content */}
                <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                  <motion.div
                    animate={{ 
                      scale: isHighlighted ? [1, 1.1, 1] : [1, 1.02, 1],
                    }}
                    transition={{ 
                      duration: isHighlighted ? 0.5 : 3,
                      repeat: isHighlighted ? 0 : Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: `hsl(${service.color})` }}
                  >
                    <service.icon className="w-7 h-7 text-white" strokeWidth={2} />
                  </motion.div>
                  
                  <div>
                    <h3 className="text-base font-bold text-foreground mb-0.5 tracking-tight">
                      {service.title}
                    </h3>
                    <p className="text-xs font-medium text-accent mb-1.5">
                      {service.subtitle}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                    
                    {/* Trust Metric */}
                    <div className="mt-3 pt-2 border-t border-border/30">
                      <p className="text-[10px] font-semibold text-accent/80">
                        {service.metric}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hover CTA overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/95 z-20 rounded-2xl">
                  <div className="text-center px-4">
                    <p className="text-sm font-bold text-foreground mb-1">
                      {service.id === "education" && "Start Your Education Journey"}
                      {service.id === "recruitment" && "Find Skilled Workforce"}
                      {service.id === "travel" && "Plan Your Trip"}
                      {service.id === "apostille" && "Fast-Track Documents"}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      Learn more <ArrowRight className="w-3 h-3" />
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* WhatsApp Chat Button */}
      <motion.a
        href="https://wa.me/9779743208282"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-3 glass rounded-full px-5 py-3 shadow-2xl glow-hover group"
      >
        <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center group-hover:scale-110 transition-transform">
          <MessageCircle className="w-5 h-5 text-white fill-white" />
        </div>
        <span className="text-foreground font-medium text-sm tracking-wide hidden sm:block">
          Chat with us
        </span>
      </motion.a>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="fixed bottom-6 right-6 text-right"
      >
        <p className="text-xs text-muted-foreground font-light tracking-wide">
          Registered in Estonia
        </p>
        <div className="flex gap-3 justify-end mt-1">
          <a
            href="https://linkedin.com/in/recruitly-group-1095b13a2"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-accent transition-colors"
          >
            LinkedIn
          </a>
          <a
            href="https://instagram.com/recruitlygroup"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-accent transition-colors"
          >
            Instagram
          </a>
        </div>
      </motion.footer>

      {/* Drag & Drop Overlay */}
      <div className="fixed inset-0 pointer-events-none z-30">
        <div className="absolute inset-0 border-4 border-dashed border-transparent transition-colors duration-300" />
      </div>
    </div>
  );
};

export default SmartIntentHero;
