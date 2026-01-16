import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Building, Plane, FileText, MessageCircle, Search, Mic, Paperclip, Loader2, ArrowRight, X, CheckCircle2, MapPin, Briefcase, Users, Star, Globe, Sparkles } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import { supabase } from "@/integrations/supabase/client";

// Trending search chips for quick navigation
const TRENDING_SEARCHES = [
  { label: "Jobs in Romania", query: "find jobs in Romania" },
  { label: "Study in UK", query: "I want to study in UK" },
  { label: "Visa Check", query: "check my visa status" },
  { label: "Apostille Docs", query: "apostille my documents" },
];

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

// Cycling placeholder examples - more varied
const PLACEHOLDER_EXAMPLES = [
  "Find a Master's in Italy...",
  "Hire 50 skilled electricians...",
  "How do I legalize my degree?",
  "I want to study in Germany...",
  "Need construction workers for UAE project...",
  "Apostille my birth certificate..."
];

// Dynamic university data by country
const UNIVERSITY_DATA: Record<string, Array<{ name: string; location: string; program: string; ranking: string }>> = {
  italy: [
    { name: "Università di Bologna", location: "Bologna, Italy", program: "Engineering & Sciences", ranking: "#1 in Italy" },
    { name: "Politecnico di Milano", location: "Milan, Italy", program: "Design & Technology", ranking: "Top 50 Worldwide" },
    { name: "Sapienza University of Rome", location: "Rome, Italy", program: "Business & Arts", ranking: "#2 in Italy" },
  ],
  germany: [
    { name: "TU Munich", location: "Munich, Germany", program: "Engineering & Sciences", ranking: "#1 in Germany" },
    { name: "Heidelberg University", location: "Heidelberg, Germany", program: "Medicine & Research", ranking: "Top 60 Worldwide" },
    { name: "Humboldt University", location: "Berlin, Germany", program: "Arts & Humanities", ranking: "#3 in Germany" },
  ],
  uk: [
    { name: "University of Oxford", location: "Oxford, UK", program: "All Disciplines", ranking: "#1 Worldwide" },
    { name: "Imperial College London", location: "London, UK", program: "Science & Engineering", ranking: "Top 10 Worldwide" },
    { name: "University of Cambridge", location: "Cambridge, UK", program: "All Disciplines", ranking: "#2 Worldwide" },
  ],
  europe: [
    { name: "ETH Zurich", location: "Zurich, Switzerland", program: "Engineering & Technology", ranking: "Top 10 Worldwide" },
    { name: "Sorbonne University", location: "Paris, France", program: "Arts & Sciences", ranking: "#1 in France" },
    { name: "University of Amsterdam", location: "Amsterdam, Netherlands", program: "Business & Social Sciences", ranking: "Top 60 Worldwide" },
  ],
  usa: [
    { name: "MIT", location: "Cambridge, MA", program: "Engineering & Sciences", ranking: "#1 Worldwide" },
    { name: "Stanford University", location: "Stanford, CA", program: "All Disciplines", ranking: "Top 5 Worldwide" },
    { name: "Harvard University", location: "Cambridge, MA", program: "All Disciplines", ranking: "Top 3 Worldwide" },
  ],
  canada: [
    { name: "University of Toronto", location: "Toronto, Canada", program: "All Disciplines", ranking: "#1 in Canada" },
    { name: "McGill University", location: "Montreal, Canada", program: "Medicine & Sciences", ranking: "#2 in Canada" },
    { name: "University of British Columbia", location: "Vancouver, Canada", program: "Engineering & Arts", ranking: "#3 in Canada" },
  ],
  australia: [
    { name: "University of Melbourne", location: "Melbourne, Australia", program: "All Disciplines", ranking: "#1 in Australia" },
    { name: "University of Sydney", location: "Sydney, Australia", program: "Business & Arts", ranking: "#2 in Australia" },
    { name: "Australian National University", location: "Canberra, Australia", program: "Research & Sciences", ranking: "#3 in Australia" },
  ],
  default: [
    { name: "Top Global Universities", location: "Worldwide", program: "All Programs", ranking: "Highly Ranked" },
    { name: "Partner Institutions", location: "50+ Countries", program: "Diverse Fields", ranking: "Accredited" },
    { name: "Scholarship Programs", location: "Europe & Beyond", program: "Funded Studies", ranking: "Merit-Based" },
  ]
};

// Dynamic candidate data by profession
const CANDIDATE_DATA: Record<string, Array<{ title: string; experience: string; skills: string; available: string }>> = {
  electrician: [
    { title: "Senior Electrician", experience: "8+ years", skills: "Industrial, Commercial, Residential", available: "Immediate" },
    { title: "Electrical Foreman", experience: "10+ years", skills: "Team Lead, Project Management", available: "2 weeks" },
    { title: "Electrician Technician", experience: "5+ years", skills: "Wiring, Maintenance, Installation", available: "Immediate" },
  ],
  construction: [
    { title: "Site Supervisor", experience: "12+ years", skills: "Project Management, Safety", available: "Immediate" },
    { title: "Skilled Mason", experience: "7+ years", skills: "Brick, Block, Concrete", available: "1 week" },
    { title: "Construction Laborer", experience: "3+ years", skills: "General Construction", available: "Immediate" },
  ],
  workers: [
    { title: "General Laborer", experience: "5+ years", skills: "Multi-skilled, Adaptable", available: "Immediate" },
    { title: "Warehouse Worker", experience: "4+ years", skills: "Inventory, Forklift", available: "Immediate" },
    { title: "Factory Worker", experience: "6+ years", skills: "Production, Quality Control", available: "2 weeks" },
  ],
  default: [
    { title: "Skilled Workers", experience: "5+ years avg", skills: "Various Industries", available: "Ready to Deploy" },
    { title: "Technical Staff", experience: "7+ years avg", skills: "Specialized Skills", available: "On Request" },
    { title: "Management Personnel", experience: "10+ years avg", skills: "Leadership, Operations", available: "Negotiable" },
  ]
};

interface IntentResult {
  route: string;
  confidence: number;
  keywords: string[];
  suggestedAction: string;
  serviceId: string;
}

type ModalType = 'none' | 'student' | 'employer';

const SmartIntentHero = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [intentResult, setIntentResult] = useState<IntentResult | null>(null);
  const [highlightedService, setHighlightedService] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [modalType, setModalType] = useState<ModalType>('none');
  const [isListening, setIsListening] = useState(false);
  const [detectedContext, setDetectedContext] = useState<string>("default");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(searchQuery, 150); // Ultra-fast 150ms debounce

  // Check if user is actively engaged (typing or uploading)
  const isEngaged = searchQuery.length > 0 || isUploading || uploadedFile !== null;

  // Cycle through placeholder examples
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_EXAMPLES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Extract context from query (country for students, profession for employers)
  const extractContext = useCallback((query: string, route: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (route === 'B2C_Student') {
      if (lowerQuery.includes('italy') || lowerQuery.includes('italian')) return 'italy';
      if (lowerQuery.includes('germany') || lowerQuery.includes('german')) return 'germany';
      if (lowerQuery.includes('uk') || lowerQuery.includes('united kingdom') || lowerQuery.includes('britain')) return 'uk';
      if (lowerQuery.includes('usa') || lowerQuery.includes('america') || lowerQuery.includes('united states')) return 'usa';
      if (lowerQuery.includes('canada') || lowerQuery.includes('canadian')) return 'canada';
      if (lowerQuery.includes('australia') || lowerQuery.includes('australian')) return 'australia';
      if (lowerQuery.includes('europe') || lowerQuery.includes('european')) return 'europe';
    }
    
    if (route === 'B2B_Employer') {
      if (lowerQuery.includes('electrician') || lowerQuery.includes('electrical')) return 'electrician';
      if (lowerQuery.includes('construction') || lowerQuery.includes('mason') || lowerQuery.includes('builder')) return 'construction';
      if (lowerQuery.includes('worker') || lowerQuery.includes('labor')) return 'workers';
    }
    
    return 'default';
  }, []);

  // Real-time intent analysis with optimistic UI
  useEffect(() => {
    const analyzeIntent = async () => {
      if (debouncedQuery.length < 3) {
        setIntentResult(null);
        setHighlightedService(null);
        setDetectedContext("default");
        return;
      }

      setIsAnalyzing(true);
      
      // Optimistic local matching first (instant feedback)
      const localResult = localKeywordMatch(debouncedQuery);
      if (localResult) {
        setIntentResult(localResult);
        setHighlightedService(localResult.serviceId);
        setDetectedContext(extractContext(debouncedQuery, localResult.route));
      }
      
      try {
        const { data, error } = await supabase.functions.invoke('smart-intent', {
          body: { query: debouncedQuery }
        });

        if (error) throw error;

        if (data && data.route !== 'Unknown') {
          setIntentResult(data);
          setHighlightedService(data.serviceId);
          setDetectedContext(extractContext(debouncedQuery, data.route));
        }
      } catch (err) {
        console.error('Intent analysis error:', err);
        // Keep local result on error
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeIntent();
  }, [debouncedQuery, extractContext]);

  // Local keyword matching for ultra-fast response
  const localKeywordMatch = (query: string): IntentResult | null => {
    const lowerQuery = query.toLowerCase();
    
    if (/study|education|university|degree|masters|abroad|europe|usa|uk|canada|australia|germany|italy|scholarship|admission/.test(lowerQuery)) {
      return { route: 'B2C_Student', confidence: 0.85, keywords: [], suggestedAction: 'Find matching programs', serviceId: 'education' };
    }
    if (/hire|manpower|workers|staff|recruit|employees|construction|electrician|plumber|factory|skilled/.test(lowerQuery)) {
      return { route: 'B2B_Employer', confidence: 0.85, keywords: [], suggestedAction: 'Get a quote', serviceId: 'recruitment' };
    }
    if (/travel|tour|visa|trip|vacation|flight|booking/.test(lowerQuery)) {
      return { route: 'Travel', confidence: 0.85, keywords: [], suggestedAction: 'Explore packages', serviceId: 'travel' };
    }
    if (/apostille|document|legalization|certificate|authentication|notary|attest/.test(lowerQuery)) {
      return { route: 'Apostille', confidence: 0.85, keywords: [], suggestedAction: 'Start your request', serviceId: 'apostille' };
    }
    
    return null;
  };

  // Dynamic results based on context
  const dynamicUniversities = useMemo(() => {
    return UNIVERSITY_DATA[detectedContext] || UNIVERSITY_DATA.default;
  }, [detectedContext]);

  const dynamicCandidates = useMemo(() => {
    return CANDIDATE_DATA[detectedContext] || CANDIDATE_DATA.default;
  }, [detectedContext]);

  // Handle file upload via rate-limited Edge Function
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadedFile(file);
    
    try {
      // Use rate-limited Edge Function for secure uploads
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-resume`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      setSearchQuery("Analyzing your resume for job matching...");
      setHighlightedService('recruitment');
      
      // Simulate analysis delay then show employer modal
      setTimeout(() => {
        setIntentResult({
          route: 'B2C_Student',
          confidence: 0.95,
          keywords: ['resume', 'job matching'],
          suggestedAction: 'View matching opportunities',
          serviceId: 'recruitment'
        });
        setIsUploading(false);
        setModalType('student');
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

  // Handle voice input
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

  // Handle submit action - show appropriate modal
  const handleSubmit = async () => {
    if (!intentResult) return;
    
    if (intentResult.route === 'B2B_Employer') {
      setModalType('employer');
    } else if (intentResult.route === 'B2C_Student') {
      setModalType('student');
    } else if (intentResult.route === 'Travel') {
      navigate('/tours-and-travels');
    } else if (intentResult.route === 'Apostille') {
      navigate('/apostille-services');
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

  // Reset state
  const resetState = () => {
    setModalType('none');
    setSearchQuery('');
    setIntentResult(null);
    setHighlightedService(null);
    setUploadedFile(null);
    setEmail('');
    setDetectedContext('default');
  };

  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      // Store lead in database
      const formDataObj: Record<string, string> = {};
      formData.forEach((value, key) => {
        formDataObj[key] = String(value);
      });
      
      await supabase.from('intent_leads').insert([{
        intent_query: searchQuery,
        route: intentResult?.route || 'Unknown',
        confidence_score: intentResult?.confidence || 0,
        detected_keywords: intentResult?.keywords || [],
        email: formData.get('email') as string || null,
        full_name: formData.get('name') as string || null,
        metadata: JSON.parse(JSON.stringify({
          context: detectedContext,
          modalType,
          formData: formDataObj
        }))
      }]);
      
      // Navigate based on modal type
      if (modalType === 'student') {
        navigate('/educational-consultancy');
      } else {
        navigate('/manpower-recruitment');
      }
    } catch (err) {
      console.error('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative z-10"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Dimmed Background Overlay when engaged */}
      <AnimatePresence>
        {isEngaged && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/40 backdrop-blur-sm z-0 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Dynamic Modal */}
      <AnimatePresence mode="wait">
        {modalType !== 'none' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-xl p-4"
          >
            <motion.div
              initial={{ y: 30, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25 }}
              className="glass rounded-3xl p-6 sm:p-8 max-w-2xl w-full relative border border-border/50 shadow-2xl"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={resetState}
                className="absolute top-4 right-4 hover:bg-destructive/10"
              >
                <X className="w-5 h-5" />
              </Button>

              {/* Student Modal - Dynamic Universities */}
              {modalType === 'student' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center shadow-lg">
                      <GraduationCap className="w-7 h-7 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground">Top Matching Universities</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        {detectedContext !== 'default' 
                          ? `Institutions in ${detectedContext.charAt(0).toUpperCase() + detectedContext.slice(1)}` 
                          : 'Based on your interests'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {dynamicUniversities.map((uni, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-4 rounded-xl border border-border/50 hover:border-accent/50 hover:bg-accent/5 transition-all cursor-pointer group"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground group-hover:text-accent transition-colors truncate">
                              {uni.name}
                            </h4>
                            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{uni.location}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{uni.program}</p>
                          </div>
                          <span className="text-xs px-3 py-1.5 rounded-full bg-accent/10 text-accent font-medium whitespace-nowrap">
                            {uni.ranking}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={() => navigate('/educational-consultancy')} 
                      className="flex-1 bg-accent hover:bg-accent/90 h-12"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Check My WiseScore
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/educational-consultancy')}
                      className="flex-1 h-12"
                    >
                      View All Programs
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Employer Modal - Candidate Profiles + Quote Form */}
              {modalType === 'employer' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[hsl(160,80%,45%)] flex items-center justify-center shadow-lg">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground">Available Candidates</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        {detectedContext !== 'default' 
                          ? `${detectedContext.charAt(0).toUpperCase() + detectedContext.slice(1)} professionals` 
                          : 'Skilled workforce ready to deploy'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {dynamicCandidates.map((candidate, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-4 rounded-xl border border-border/50 hover:border-[hsl(160,80%,45%)]/50 hover:bg-[hsl(160,80%,45%)]/5 transition-all"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground truncate">{candidate.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{candidate.skills}</p>
                            <p className="text-xs text-muted-foreground mt-1">Experience: {candidate.experience}</p>
                          </div>
                          <span className="text-xs px-3 py-1.5 rounded-full bg-[hsl(160,80%,45%)]/10 text-[hsl(160,80%,45%)] font-medium whitespace-nowrap">
                            {candidate.available}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="border-t border-border/50 pt-4">
                    <p className="text-sm font-medium text-foreground mb-3">Request a Quote</p>
                    <form onSubmit={handleFormSubmit} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input name="name" placeholder="Company Name" className="h-11" required />
                        <Input name="email" placeholder="Email Address" type="email" className="h-11" required />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input name="workers" placeholder="Number of Workers" type="number" className="h-11" />
                        <Input name="phone" placeholder="Phone Number" className="h-11" />
                      </div>
                      <textarea 
                        name="requirements"
                        placeholder="Describe your requirements..."
                        className="w-full p-3 rounded-xl border border-input bg-background min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                      />
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-[hsl(160,80%,45%)] hover:bg-[hsl(160,80%,40%)] h-12"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>Submit Request</>
                        )}
                      </Button>
                    </form>
                  </div>
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
        className="text-center mb-8 sm:mb-12 max-w-6xl w-full relative z-10"
      >
        {/* Social Proof Row */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-2 mb-4"
        >
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium text-foreground">
              Trusted by <span className="text-accent font-bold">5,000+</span> candidates worldwide
            </span>
          </div>
        </motion.div>

        {/* Headline with animated gradient */}
        <motion.h1 
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-foreground tracking-tighter leading-none mb-4"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Your Global Journey
          <br />
          <span className="bg-gradient-to-r from-accent via-[hsl(230,80%,60%)] to-accent bg-clip-text text-transparent animate-gradient-text">
            Starts Here
          </span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-4"
        >
          Tell us what you need — our AI will route you to the right service instantly
        </motion.p>

        {/* Smart Intent Bar with Shimmer Effect */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="relative max-w-3xl mx-auto mb-4"
        >
          <div className="relative shimmer-border rounded-2xl">
            {/* AI Badge inside input */}
            <div className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent/10 border border-accent/30">
                <Sparkles className="w-3 h-3 text-accent" />
                <span className="text-[10px] font-bold text-accent uppercase tracking-wider">AI</span>
              </div>
            </div>
            <Search className="absolute left-[70px] sm:left-[85px] top-1/2 -translate-y-1/2 w-5 sm:w-5 h-5 sm:h-5 text-muted-foreground z-10" />
            <Input
              type="text"
              placeholder={PLACEHOLDER_EXAMPLES[placeholderIndex]}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 sm:h-16 md:h-20 pl-[95px] sm:pl-[110px] pr-32 sm:pr-40 text-sm sm:text-base md:text-lg bg-background rounded-2xl border-0 focus:ring-2 focus:ring-accent/50 transition-all duration-300 placeholder:text-muted-foreground/60"
            />
            <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleVoiceInput}
                className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-accent/20 transition-colors ${isListening ? 'bg-accent/30 animate-pulse' : ''}`}
                aria-label="Voice input"
              >
                <Mic className={`w-4 sm:w-5 h-4 sm:h-5 ${isListening ? 'text-accent' : 'text-muted-foreground'}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-accent/20"
                aria-label="Upload file"
              >
                <Paperclip className="w-4 sm:w-5 h-4 sm:h-5 text-muted-foreground" />
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
                  className="h-8 sm:h-10 px-3 sm:px-4 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl font-medium text-sm"
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
                className="absolute top-full mt-3 left-0 right-0 glass rounded-xl p-4 border border-accent/30 shadow-lg"
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
                          className="w-10 sm:w-12 h-10 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg"
                          style={{ backgroundColor: `hsl(${service.color})` }}
                        >
                          <service.icon className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="text-xs text-muted-foreground">AI Suggestion</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent font-medium">
                              {Math.round(intentResult.confidence * 100)}% match
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-foreground truncate">{service.title}</h3>
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

        {/* Trending Search Chips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-8 sm:mb-12"
        >
          <span className="text-xs text-muted-foreground mr-1">Trending:</span>
          {TRENDING_SEARCHES.map((chip, index) => (
            <motion.button
              key={chip.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.65 + index * 0.05 }}
              onClick={() => setSearchQuery(chip.query)}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted/50 hover:bg-accent/10 hover:text-accent border border-border/50 hover:border-accent/30 transition-all duration-200"
            >
              {chip.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Service Cards Grid - Hidden on mobile when engaged, always secondary to search */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ 
            y: 0, 
            opacity: isEngaged ? 0.6 : 1,
            scale: isEngaged ? 0.98 : 1
          }}
          transition={{ delay: 0.7 }}
          className={`grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-6xl mx-auto transition-all ${
            isEngaged ? 'hidden sm:grid' : ''
          }`}
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
                  scale: isHighlighted ? 1.03 : 1,
                  boxShadow: isHighlighted 
                    ? `0 0 40px hsl(${service.color} / 0.4), 0 0 80px hsl(${service.color} / 0.2)`
                    : 'none'
                }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={() => handleServiceClick(service.id)}
                className={`group relative glass rounded-xl sm:rounded-2xl p-4 sm:p-6 cursor-pointer transition-all duration-300 overflow-hidden ${
                  isHighlighted 
                    ? 'border-2 ring-2 ring-offset-2 ring-offset-background z-10' 
                    : 'border border-border/50 hover:border-accent/50'
                }`}
                style={{
                  borderColor: isHighlighted ? `hsl(${service.color})` : undefined,
                  ringColor: isHighlighted ? `hsl(${service.color})` : undefined,
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
                <div className="relative z-10 flex flex-col items-center text-center space-y-2 sm:space-y-3">
                  <motion.div
                    animate={{ 
                      scale: isHighlighted ? [1, 1.1, 1] : [1, 1.02, 1],
                    }}
                    transition={{ 
                      duration: isHighlighted ? 0.5 : 3,
                      repeat: isHighlighted ? 0 : Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: `hsl(${service.color})` }}
                  >
                    <service.icon className="w-5 h-5 sm:w-7 sm:h-7 text-white" strokeWidth={2} />
                  </motion.div>
                  
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-foreground mb-0.5 tracking-tight">
                      {service.title}
                    </h3>
                    <p className="text-xs font-medium text-accent mb-1 hidden sm:block">
                      {service.subtitle}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed hidden sm:block">
                      {service.description}
                    </p>
                    
                    {/* Trust Metric - Hidden on mobile */}
                    <div className="mt-2 sm:mt-3 pt-2 border-t border-border/30 hidden sm:block">
                      <p className="text-[10px] font-semibold text-accent/80">
                        {service.metric}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hover CTA overlay - Desktop only */}
                <div className="absolute inset-0 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/95 z-20 rounded-2xl">
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
        className="fixed bottom-6 left-6 z-40 flex items-center gap-3 glass rounded-full px-4 sm:px-5 py-2.5 sm:py-3 shadow-2xl glow-hover group"
      >
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#25D366] flex items-center justify-center group-hover:scale-110 transition-transform">
          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white" />
        </div>
        <span className="text-foreground font-medium text-xs sm:text-sm tracking-wide hidden sm:block">
          Chat with us
        </span>
      </motion.a>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="fixed bottom-6 right-6 text-right hidden sm:block"
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
