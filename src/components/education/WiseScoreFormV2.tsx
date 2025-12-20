import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Loader2, Check, Search, AlertTriangle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// All nationalities
const NATIONALITIES = [
  "Afghan", "Albanian", "Algerian", "American", "Andorran", "Angolan", "Argentine", "Armenian", "Australian", "Austrian",
  "Azerbaijani", "Bahamian", "Bahraini", "Bangladeshi", "Barbadian", "Belarusian", "Belgian", "Belizean", "Beninese", "Bhutanese",
  "Bolivian", "Bosnian", "Brazilian", "British", "Bruneian", "Bulgarian", "Burkinabe", "Burmese", "Burundian", "Cambodian",
  "Cameroonian", "Canadian", "Cape Verdean", "Central African", "Chadian", "Chilean", "Chinese", "Colombian", "Comoran", "Congolese",
  "Costa Rican", "Croatian", "Cuban", "Cypriot", "Czech", "Danish", "Djiboutian", "Dominican", "Dutch", "Ecuadorian",
  "Egyptian", "Emirati", "English", "Equatorial Guinean", "Eritrean", "Estonian", "Ethiopian", "Fijian", "Filipino", "Finnish",
  "French", "Gabonese", "Gambian", "Georgian", "German", "Ghanaian", "Greek", "Grenadian", "Guatemalan", "Guinean",
  "Guyanese", "Haitian", "Honduran", "Hungarian", "Icelandic", "Indian", "Indonesian", "Iranian", "Iraqi", "Irish",
  "Israeli", "Italian", "Ivorian", "Jamaican", "Japanese", "Jordanian", "Kazakh", "Kenyan", "Kuwaiti", "Kyrgyz",
  "Laotian", "Latvian", "Lebanese", "Liberian", "Libyan", "Lithuanian", "Luxembourgish", "Macedonian", "Malagasy", "Malawian",
  "Malaysian", "Maldivian", "Malian", "Maltese", "Mauritanian", "Mauritian", "Mexican", "Moldovan", "Monacan", "Mongolian",
  "Montenegrin", "Moroccan", "Mozambican", "Namibian", "Nepalese", "New Zealand", "Nicaraguan", "Nigerian", "Norwegian", "Omani",
  "Pakistani", "Panamanian", "Papua New Guinean", "Paraguayan", "Peruvian", "Polish", "Portuguese", "Qatari", "Romanian", "Russian",
  "Rwandan", "Saudi", "Scottish", "Senegalese", "Serbian", "Singaporean", "Slovak", "Slovenian", "Somali", "South African",
  "South Korean", "Spanish", "Sri Lankan", "Sudanese", "Surinamese", "Swedish", "Swiss", "Syrian", "Taiwanese", "Tajik",
  "Tanzanian", "Thai", "Togolese", "Trinidadian", "Tunisian", "Turkish", "Turkmen", "Ugandan", "Ukrainian", "Uruguayan",
  "Uzbek", "Venezuelan", "Vietnamese", "Welsh", "Yemeni", "Zambian", "Zimbabwean"
];

const SOUTH_ASIAN_NATIONALITIES = ["Indian", "Pakistani", "Bangladeshi", "Nepalese", "Sri Lankan", "Afghan", "Maldivian", "Bhutanese"];

const DEGREE_OPTIONS = [
  { value: "bachelor", label: "Bachelor's", emoji: "🎓" },
  { value: "master", label: "Master's", emoji: "📚" },
  { value: "phd", label: "PhD", emoji: "🔬" },
  { value: "non-degree", label: "Non-degree", emoji: "📋" },
];

const STREAM_OPTIONS = [
  { value: "engineering", label: "Engineering/IT", emoji: "💻" },
  { value: "business", label: "Business", emoji: "💼" },
  { value: "medicine", label: "Medicine", emoji: "🏥" },
  { value: "natural-science", label: "Natural Sciences", emoji: "🔬" },
];

const PROGRAM_OPTIONS: Record<string, Array<{ value: string; label: string }>> = {
  business: [
    { value: "accounting", label: "Accounting" },
    { value: "business-admin", label: "Business Administration" },
    { value: "financial-mgmt", label: "Financial Management" },
    { value: "hr", label: "Human Resources" },
    { value: "intl-business", label: "International Business" },
    { value: "marketing", label: "Marketing" },
    { value: "tourism", label: "Tourism & Hospitality" },
    { value: "sports-mgmt", label: "Sports Management" },
  ],
  engineering: [
    { value: "aeronautical", label: "Aeronautical Engineering" },
    { value: "ai", label: "Artificial Intelligence" },
    { value: "automation", label: "Automation & Robotics" },
    { value: "civil", label: "Civil Engineering" },
    { value: "cs", label: "Computer Science" },
    { value: "food-science", label: "Food Science & Tech" },
    { value: "aircraft-maint", label: "Aircraft Maintenance" },
  ],
  medicine: [
    { value: "mbbs", label: "MBBS / Medicine" },
    { value: "pharmacy", label: "Pharmacy" },
    { value: "nursing", label: "Nursing" },
    { value: "public-health", label: "Public Health" },
    { value: "biomedical", label: "Biomedical Science" },
    { value: "dentistry", label: "Dentistry" },
    { value: "physiotherapy", label: "Physiotherapy" },
  ],
  "natural-science": [
    { value: "biotech", label: "Biotechnology" },
    { value: "enviro-science", label: "Environmental Science" },
    { value: "chemistry", label: "Chemistry" },
    { value: "physics", label: "Physics" },
    { value: "mathematics", label: "Mathematics" },
  ],
};

const AGE_OPTIONS = [
  { value: "17-20", label: "17-20 years", emoji: "🧑" },
  { value: "21-24", label: "21-24 years", emoji: "👨" },
  { value: "25-28", label: "25-28 years", emoji: "🧔" },
  { value: "29-32", label: "29-32 years", emoji: "👴" },
];

const EDUCATION_OPTIONS = [
  { value: "grade-12", label: "Grade 12 / High School", emoji: "📖" },
  { value: "a-level", label: "A-Level", emoji: "📝" },
  { value: "3yr-bachelor", label: "3-Year Bachelor's", emoji: "🎓" },
  { value: "4yr-bachelor", label: "4-Year Bachelor's", emoji: "🎓" },
  { value: "master", label: "Master's Degree", emoji: "📚" },
];

const STATUS_OPTIONS = [
  { value: "studying", label: "Still Studying", emoji: "📚" },
  { value: "completed", label: "Completed", emoji: "✅" },
];

const GAP_OPTIONS = [
  { value: "none", label: "No Gap", emoji: "✨" },
  { value: "0-1", label: "Less than 1 year", emoji: "📅" },
  { value: "1-2", label: "1-2 years", emoji: "📅" },
  { value: "2-3", label: "2-3 years", emoji: "📅" },
  { value: "3+", label: "3+ years", emoji: "⚠️" },
];

const GRADING_OPTIONS = [
  { value: "gpa", label: "GPA (4.0 Scale)", emoji: "📊" },
  { value: "percentage", label: "Percentage (%)", emoji: "📈" },
  { value: "cgpa", label: "CGPA (10.0 Scale)", emoji: "📉" },
  { value: "division", label: "Division/Class", emoji: "🏆" },
];

const DIVISION_OPTIONS = [
  { value: "distinction", label: "Distinction / First Class with Distinction" },
  { value: "first", label: "First Division / First Class" },
  { value: "second", label: "Second Division / Second Class" },
  { value: "third", label: "Third Division / Pass" },
];

const ENGLISH_OPTIONS = [
  { value: "ielts", label: "IELTS", emoji: "🇬🇧" },
  { value: "pte", label: "PTE", emoji: "🌐" },
  { value: "toefl", label: "TOEFL", emoji: "🇺🇸" },
  { value: "duolingo", label: "Duolingo", emoji: "🦉" },
  { value: "moi", label: "MOI / None", emoji: "📜" },
];

const PASSPORT_OPTIONS = [
  { value: "yes", label: "Yes, I have a passport", emoji: "🛂" },
  { value: "no", label: "No, not yet", emoji: "❌" },
];

interface FormData {
  fullName: string;
  email: string;
  whatsapp: string;
  degree: string;
  stream: string;
  program: string;
  nationality: string;
  ageRange: string;
  highestEducation: string;
  educationStatus: string;
  educationGap: string;
  gradingScheme: string;
  gradeValue: string;
  englishTest: string;
  englishScore: string;
  hasPassport: string;
}

interface WiseScoreResult {
  score: number;
  tier: string;
  advice: string;
  universities: string[];
  hasVisaRisk: boolean;
}

interface WiseScoreFormV2Props {
  onComplete: (result: WiseScoreResult, formData: FormData) => void;
  onCancel: () => void;
}

// Dynamic cat messages
const getCatMessage = (stepId: string, formData: FormData): { emoji: string; message: string } => {
  const name = formData.fullName?.split(" ")[0] || "";
  
  const messages: Record<string, { emoji: string; message: string }> = {
    name: { emoji: "🐱", message: "Hi! I'm your WiseGuide. Let's find your global match! 🌍" },
    greeting: { emoji: "😺", message: `👋 Hi ${name}! Ready to discover your opportunities? Let's check your WiseScore.` },
    degree: { emoji: "🎓", message: "What level of study are you aiming for?" },
    stream: { emoji: "💡", message: "Pick your field of interest!" },
    program: { emoji: "📚", message: "Choose your specific program area." },
    nationality: { emoji: "🌍", message: "Your nationality affects visa requirements. Choose carefully!" },
    ageRange: { emoji: "📅", message: "Age can affect certain scholarship eligibility!" },
    highestEducation: { emoji: "🎓", message: "What's the highest level you've completed?" },
    educationStatus: { emoji: "📖", message: "Are you currently in school or have you graduated?" },
    educationGap: { emoji: "⏰", message: "Any gaps in your education? No worries either way!" },
    gradingScheme: { emoji: "📊", message: "Different countries use different grading systems." },
    gradeValue: { emoji: "✨", message: formData.gradingScheme === "division" && formData.gradeValue === "distinction" ? "Distinction? Wow! Top-tier universities love that focus. 📈" : "Enter your academic score." },
    englishTest: { emoji: "🗣️", message: "English proficiency is crucial for visa approval!" },
    englishScore: { emoji: "💯", message: "Your English score matters a lot. Be accurate!" },
    hasPassport: { emoji: "🛂", message: "Having a passport ready speeds up the process!" },
    leadCapture: { emoji: "🎉", message: "Almost there! Get your eligible university list instantly!" },
    calculating: { emoji: "🚀", message: "Calculated! Your future looks bright! 🎉" },
  };
  
  return messages[stepId] || { emoji: "😺", message: "Let's continue your journey!" };
};

const WiseScoreFormV2 = ({ onComplete, onCancel }: WiseScoreFormV2Props) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nationalityOpen, setNationalityOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    whatsapp: "",
    degree: "",
    stream: "",
    program: "",
    nationality: "",
    ageRange: "",
    highestEducation: "",
    educationStatus: "",
    educationGap: "",
    gradingScheme: "",
    gradeValue: "",
    englishTest: "",
    englishScore: "",
    hasPassport: "",
  });

  // Build steps dynamically
  const steps = useMemo(() => {
    const baseSteps: Array<{ id: string; title: string; field: keyof FormData; type: string; options?: any[]; placeholder?: string }> = [
      { id: "name", title: "What's your name?", field: "fullName", type: "text", placeholder: "Enter your full name..." },
    ];

    // Show greeting after name
    if (formData.fullName) {
      baseSteps.push({ id: "greeting", title: "", field: "fullName", type: "greeting" });
    }

    baseSteps.push(
      { id: "degree", title: "What degree are you pursuing?", field: "degree", type: "buttons", options: DEGREE_OPTIONS },
      { id: "stream", title: "What's your field of study?", field: "stream", type: "buttons", options: STREAM_OPTIONS },
    );

    // Conditional programs based on stream
    if (formData.stream && PROGRAM_OPTIONS[formData.stream]) {
      baseSteps.push({ id: "program", title: "Select your program", field: "program", type: "buttons", options: PROGRAM_OPTIONS[formData.stream] });
    }

    baseSteps.push(
      { id: "nationality", title: "Your nationality?", field: "nationality", type: "searchable" },
      { id: "ageRange", title: "Your age range?", field: "ageRange", type: "buttons", options: AGE_OPTIONS },
      { id: "highestEducation", title: "Highest education completed?", field: "highestEducation", type: "buttons", options: EDUCATION_OPTIONS },
      { id: "educationStatus", title: "What's your current status?", field: "educationStatus", type: "buttons", options: STATUS_OPTIONS },
      { id: "educationGap", title: "Any gap in your education?", field: "educationGap", type: "buttons", options: GAP_OPTIONS },
      { id: "gradingScheme", title: "Your grading system?", field: "gradingScheme", type: "buttons", options: GRADING_OPTIONS },
    );

    // Show grade input based on scheme
    if (formData.gradingScheme) {
      if (formData.gradingScheme === "division") {
        baseSteps.push({ id: "gradeValue", title: "Your academic division?", field: "gradeValue", type: "buttons", options: DIVISION_OPTIONS });
      } else {
        const placeholder = formData.gradingScheme === "gpa" ? "e.g., 3.5" : formData.gradingScheme === "percentage" ? "e.g., 75" : "e.g., 8.5";
        baseSteps.push({ id: "gradeValue", title: "Enter your score", field: "gradeValue", type: "text", placeholder });
      }
    }

    baseSteps.push({ id: "englishTest", title: "Have you taken an English proficiency test?", field: "englishTest", type: "buttons", options: ENGLISH_OPTIONS });

    // Show score input if test selected
    if (formData.englishTest && formData.englishTest !== "moi") {
      const placeholder = formData.englishTest === "ielts" ? "e.g., 7.0" : formData.englishTest === "toefl" ? "e.g., 100" : "e.g., 65";
      baseSteps.push({ id: "englishScore", title: `Your ${formData.englishTest.toUpperCase()} score?`, field: "englishScore", type: "text", placeholder });
    }

    baseSteps.push(
      { id: "hasPassport", title: "Do you have a passport?", field: "hasPassport", type: "buttons", options: PASSPORT_OPTIONS },
      { id: "leadCapture", title: "Get your eligible university list instantly!", field: "email", type: "leadCapture" },
    );

    return baseSteps;
  }, [formData.fullName, formData.stream, formData.gradingScheme, formData.englishTest]);

  const currentStepData = steps[currentStep];
  const catState = getCatMessage(currentStepData?.id || "name", formData);
  const progress = ((currentStep + 1) / steps.length) * 100;

  const updateFormData = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const calculateScore = useCallback((): WiseScoreResult => {
    let score = 0;
    
    // Academic Division/Grade (max 35)
    if (formData.gradingScheme === "division") {
      if (formData.gradeValue === "distinction") score += 35;
      else if (formData.gradeValue === "first") score += 20;
      else if (formData.gradeValue === "second") score += 10;
      else score += 5;
    } else if (formData.gradingScheme === "gpa") {
      const gpa = parseFloat(formData.gradeValue) || 0;
      if (gpa >= 3.7) score += 35;
      else if (gpa >= 3.3) score += 25;
      else if (gpa >= 3.0) score += 20;
      else score += 10;
    } else if (formData.gradingScheme === "percentage") {
      const pct = parseFloat(formData.gradeValue) || 0;
      if (pct >= 85) score += 35;
      else if (pct >= 70) score += 25;
      else if (pct >= 60) score += 15;
      else score += 10;
    } else if (formData.gradingScheme === "cgpa") {
      const cgpa = parseFloat(formData.gradeValue) || 0;
      if (cgpa >= 9.0) score += 35;
      else if (cgpa >= 8.0) score += 25;
      else if (cgpa >= 7.0) score += 20;
      else score += 10;
    }
    
    // English Proficiency (max 30)
    if (formData.englishTest !== "moi" && formData.englishScore) {
      const englishScore = parseFloat(formData.englishScore) || 0;
      if (formData.englishTest === "ielts" && englishScore >= 7) score += 30;
      else if (formData.englishTest === "ielts" && englishScore >= 6) score += 20;
      else if (formData.englishTest === "toefl" && englishScore >= 100) score += 30;
      else if (formData.englishTest === "toefl" && englishScore >= 80) score += 20;
      else if (formData.englishTest === "pte" && englishScore >= 65) score += 30;
      else if (formData.englishTest === "pte" && englishScore >= 55) score += 20;
      else score += 15;
    }
    
    // Education Level Bonus (max 15)
    if (formData.highestEducation === "master") score += 15;
    else if (formData.highestEducation === "4yr-bachelor") score += 12;
    else if (formData.highestEducation === "3yr-bachelor") score += 10;
    else if (formData.highestEducation === "a-level") score += 8;
    else score += 5;

    // No Gap Bonus (max 10)
    if (formData.educationGap === "none") score += 10;
    else if (formData.educationGap === "0-1") score += 8;
    else if (formData.educationGap === "1-2") score += 5;
    else score += 0;

    // Passport Ready Bonus
    if (formData.hasPassport === "yes") score += 5;
    
    // Check visa risk
    const isSouthAsian = SOUTH_ASIAN_NATIONALITIES.includes(formData.nationality);
    const hasNoEnglishTest = formData.englishTest === "moi";
    const hasVisaRisk = isSouthAsian && hasNoEnglishTest;
    
    // Risk offset
    if (hasVisaRisk) score -= 15;
    
    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));
    
    // Determine tier and advice
    let tier: string;
    let advice: string;
    let universities: string[];
    
    if (score >= 80) {
      tier = "Top Candidate";
      advice = "Excellent! You qualify for QS Top 200 Universities. Your profile is highly competitive. High visa probability!";
      universities = ["University of Oxford", "Imperial College London", "MIT", "Stanford University", "University of Toronto"];
    } else if (score >= 65) {
      tier = "Strong Candidate";
      advice = "Great profile! You have good chances at top-tier universities. Consider strengthening with better English scores.";
      universities = ["University of Edinburgh", "King's College London", "UC Berkeley", "McGill University", "University of Melbourne"];
    } else if (score >= 50) {
      tier = "Developing Candidate";
      advice = "You have potential! We recommend taking IELTS/PTE to boost your visa chances and improve your profile.";
      universities = ["University of Bristol", "University of Leeds", "Arizona State University", "University of Alberta"];
    } else {
      tier = "High Risk - Needs Improvement";
      advice = "We strongly recommend taking a PTE/IELTS to boost your visa chances. Consider pathway programs.";
      universities = ["Pathway Programs", "Foundation Courses", "Pre-Masters Programs"];
    }
    
    if (hasVisaRisk) {
      advice = "⚠️ VISA RISK: " + advice + " Taking an English test is critical for your visa application.";
    }
    
    return { score, tier, advice, universities, hasVisaRisk };
  }, [formData]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, steps.length]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleButtonSelect = (field: keyof FormData, value: string) => {
    updateFormData(field, value);
    // Auto-advance after selection
    setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    }, 250);
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.whatsapp) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = calculateScore();
      
      // Submit to edge function
      const { error } = await supabase.functions.invoke("submit-wisescore", {
        body: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.whatsapp,
          nationality: formData.nationality,
          currentEducation: formData.highestEducation,
          gradingScheme: formData.gradingScheme,
          academicGrade: formData.gradeValue,
          academicDivision: formData.gradingScheme === "division" ? formData.gradeValue : null,
          hasResearchPapers: false,
          hasStandardizedTests: false,
          testType: null,
          testScore: null,
          englishTest: formData.englishTest,
          englishScore: formData.englishScore,
          hasVisaRisk: result.hasVisaRisk,
          destinationCountry: null,
          preferredIntake: null,
          programLevel: formData.degree,
          wiseScore: result.score,
          scoreTier: result.tier,
          advice: result.advice,
          // Additional fields
          stream: formData.stream,
          program: formData.program,
          ageRange: formData.ageRange,
          educationStatus: formData.educationStatus,
          educationGap: formData.educationGap,
          hasPassport: formData.hasPassport,
        },
      });

      if (error) {
        console.error("Submission error:", error);
        toast({
          title: "Score calculated!",
          description: "We couldn't save to our servers, but your score is ready!",
        });
      }

      onComplete(result, formData);
    } catch (err) {
      console.error("Error:", err);
      const result = calculateScore();
      onComplete(result, formData);
    }
  };

  // Check for visa risk warning
  const showVisaRiskWarning = formData.englishTest === "moi" && SOUTH_ASIAN_NATIONALITIES.includes(formData.nationality);

  const renderStepContent = () => {
    if (!currentStepData) return null;

    // Special greeting step
    if (currentStepData.type === "greeting") {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <motion.div
            className="text-6xl mb-6"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            👋
          </motion.div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Hi {formData.fullName.split(" ")[0]}!
          </h2>
          <p className="text-muted-foreground mb-8">
            Ready to discover your opportunities? Let's check your WiseScore.
          </p>
          <Button onClick={handleNext} size="lg" className="gap-2">
            Let's Go <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      );
    }

    // Lead capture step
    if (currentStepData.type === "leadCapture") {
      return (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <Sparkles className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground">Get Your Results!</h3>
            <p className="text-muted-foreground">Enter your contact details to receive your personalized university list.</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">WhatsApp Number *</label>
              <Input
                type="tel"
                placeholder="+971 50 123 4567"
                value={formData.whatsapp}
                onChange={(e) => updateFormData("whatsapp", e.target.value)}
                className="h-14 text-lg bg-background/60 backdrop-blur-sm border-border/50 focus:border-accent rounded-xl"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Email Address *</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                className="h-14 text-lg bg-background/60 backdrop-blur-sm border-border/50 focus:border-accent rounded-xl"
              />
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.email || !formData.whatsapp}
            className="w-full h-14 text-lg font-bold gap-2"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Calculating Your WiseScore...
              </>
            ) : (
              <>
                Get My WiseScore
                <Sparkles className="w-5 h-5" />
              </>
            )}
          </Button>
        </div>
      );
    }

    switch (currentStepData.type) {
      case "text":
        return (
          <div className="space-y-4">
            <Input
              type="text"
              placeholder={currentStepData.placeholder || "Type here..."}
              value={formData[currentStepData.field] as string}
              onChange={(e) => updateFormData(currentStepData.field, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && formData[currentStepData.field]) {
                  handleNext();
                }
              }}
              className="h-16 text-xl bg-background/60 backdrop-blur-sm border-border/50 focus:border-accent rounded-2xl text-center font-medium"
              autoFocus
            />
            <Button
              onClick={handleNext}
              disabled={!formData[currentStepData.field]}
              className="w-full h-12 gap-2"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        );

      case "searchable":
        return (
          <Popover open={nationalityOpen} onOpenChange={setNationalityOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={nationalityOpen}
                className="w-full h-16 justify-between text-lg bg-background/60 backdrop-blur-sm border-border/50 rounded-2xl"
              >
                {formData.nationality || "Search your nationality..."}
                <Search className="ml-2 h-5 w-5 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 bg-background/95 backdrop-blur-xl" align="start">
              <Command>
                <CommandInput placeholder="Search nationality..." className="h-12" />
                <CommandList>
                  <CommandEmpty>No nationality found.</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    {NATIONALITIES.map((nat) => (
                      <CommandItem
                        key={nat}
                        value={nat}
                        onSelect={() => {
                          updateFormData("nationality", nat);
                          setNationalityOpen(false);
                          setTimeout(() => setCurrentStep(prev => prev + 1), 250);
                        }}
                        className="h-12 text-base"
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${formData.nationality === nat ? "opacity-100" : "opacity-0"}`}
                        />
                        {nat}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        );

      case "buttons":
        return (
          <div className="grid grid-cols-2 gap-3">
            {(currentStepData.options as Array<{ value: string; label: string; emoji?: string }>)?.map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleButtonSelect(currentStepData.field, option.value)}
                className={`p-4 rounded-2xl border-2 text-center transition-all backdrop-blur-sm ${
                  formData[currentStepData.field] === option.value
                    ? "border-accent bg-accent/20 shadow-lg shadow-accent/20"
                    : "border-border/30 bg-background/40 hover:border-accent/50 hover:bg-accent/5"
                }`}
              >
                {option.emoji && <span className="text-2xl mb-2 block">{option.emoji}</span>}
                <span className="font-semibold text-foreground">{option.label}</span>
              </motion.button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  // Get progress bar color based on progress
  const getProgressColor = () => {
    if (progress < 33) return "from-orange-500 to-yellow-500";
    if (progress < 66) return "from-yellow-500 to-green-500";
    return "from-green-500 to-emerald-500";
  };

  return (
    <Card className="overflow-hidden border-0 bg-background/30 backdrop-blur-2xl shadow-2xl max-w-xl mx-auto ring-1 ring-border/20">
      <CardContent className="p-0">
        {/* Animated Progress Bar */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-bold text-accent">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${getProgressColor()} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="p-6 md:p-8">
          {/* Brown Cat Guide */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.3 }}
              className="text-center mb-8"
            >
              <motion.div
                className="relative inline-block"
                animate={{ 
                  rotate: [0, -3, 3, 0],
                  y: [0, -4, 0],
                }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 0.5 }}
              >
                <span className="text-7xl">{catState.emoji}</span>
              </motion.div>
              
              {/* Speech Bubble */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="relative bg-gradient-to-br from-accent/10 to-accent/5 backdrop-blur-xl rounded-2xl p-4 mt-4 max-w-sm mx-auto border border-accent/20 shadow-lg"
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-accent/10 rotate-45 border-l border-t border-accent/20" />
                <p className="text-sm text-foreground font-medium relative z-10">
                  {catState.message}
                </p>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Question Title */}
          {currentStepData?.type !== "greeting" && currentStepData?.type !== "leadCapture" && (
            <motion.h2
              key={`title-${currentStep}`}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center"
            >
              {currentStepData?.title}
            </motion.h2>
          )}

          {/* Visa Risk Warning */}
          {showVisaRiskWarning && currentStepData?.id === "englishTest" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex items-start gap-3 backdrop-blur-sm"
            >
              <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-orange-600 dark:text-orange-400">Visa Risk Warning</p>
                <p className="text-sm text-muted-foreground">
                  Without an English test, your visa application may face challenges.
                </p>
              </div>
            </motion.div>
          )}

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {currentStepData?.type !== "greeting" && currentStepData?.type !== "leadCapture" && (
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-border/20">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="text-muted-foreground hover:text-destructive"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WiseScoreFormV2;
