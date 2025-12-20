import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Loader2, Check, Search, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const DESTINATION_COUNTRIES = [
  "United Kingdom", "United States", "Canada", "Australia", "Germany", "Ireland", "New Zealand", "Netherlands", "France", "Sweden"
];

const EDUCATION_LEVELS = [
  { value: "high_school", label: "High School / Secondary" },
  { value: "bachelor", label: "Bachelor's Degree" },
  { value: "master", label: "Master's Degree" },
  { value: "phd", label: "PhD / Doctorate" },
];

const GRADING_SCHEMES = [
  { value: "gpa_4", label: "GPA (4.0 Scale)" },
  { value: "percentage", label: "Percentage (%)" },
  { value: "cgpa_10", label: "CGPA (10.0 Scale)" },
  { value: "grade_letter", label: "Letter Grades (A-F)" },
];

const ACADEMIC_DIVISIONS = [
  { value: "distinction", label: "Distinction / First Class with Distinction", points: 35 },
  { value: "first", label: "First Division / First Class", points: 20 },
  { value: "second_upper", label: "Second Division Upper / 2:1", points: 15 },
  { value: "second_lower", label: "Second Division Lower / 2:2", points: 10 },
  { value: "third", label: "Third Division / Pass", points: 5 },
];

const ENGLISH_TESTS = [
  { value: "ielts", label: "IELTS Academic" },
  { value: "toefl", label: "TOEFL iBT" },
  { value: "pte", label: "PTE Academic" },
  { value: "duolingo", label: "Duolingo English Test" },
  { value: "cambridge", label: "Cambridge (CAE/CPE)" },
  { value: "none", label: "No English Test Yet" },
];

const STANDARDIZED_TESTS = [
  { value: "gmat", label: "GMAT" },
  { value: "gre", label: "GRE" },
  { value: "sat", label: "SAT" },
  { value: "act", label: "ACT" },
  { value: "lsat", label: "LSAT" },
];

const INTAKES = [
  { value: "sep_2025", label: "September 2025" },
  { value: "jan_2026", label: "January 2026" },
  { value: "sep_2026", label: "September 2026" },
  { value: "jan_2027", label: "January 2027" },
];

const PROGRAM_LEVELS = [
  { value: "bachelor", label: "Bachelor's Degree" },
  { value: "master", label: "Master's Degree" },
  { value: "phd", label: "PhD / Doctorate" },
  { value: "diploma", label: "Diploma / Certificate" },
];

// Dynamic cat messages based on context
const getCatMessage = (step: number, formData: FormData): { emoji: string; message: string } => {
  const name = formData.fullName?.split(" ")[0] || "";
  
  const messages: Record<number, { emoji: string; message: string }> = {
    0: { emoji: "😺", message: "Hi! I'm your WiseGuide. Let's find your global match! 🌍" },
    1: { emoji: "📧", message: `${name ? `Nice to meet you, ${name}! ` : ""}What's the best way to reach you?` },
    2: { emoji: "📱", message: "A phone number helps us connect faster if you need urgent guidance!" },
    3: { emoji: "🌍", message: "Your nationality affects visa requirements. Choose carefully!" },
    4: { emoji: "🎓", message: "What level of education have you completed so far?" },
    5: { emoji: "📊", message: "Different countries use different grading systems. Pick yours!" },
    6: { emoji: "📈", message: formData.academicDivision === "distinction" ? "Distinction? Wow! Top-tier universities love that focus. 📈" : "Your grades help us match you with the right universities!" },
    7: { emoji: "📝", message: formData.gradingScheme === "gpa_4" ? "Enter your GPA out of 4.0" : formData.gradingScheme === "percentage" ? "What's your percentage score?" : formData.gradingScheme === "cgpa_10" ? "Enter your CGPA out of 10" : "What's your grade?" },
    8: { emoji: "📚", message: "Research experience can significantly boost your application!" },
    9: { emoji: "🚀", message: formData.hasResearchPapers ? "Research papers are like a fast-pass for your visa! 🚀" : "No worries! Many successful applicants start fresh." },
    10: { emoji: "📝", message: "Standardized tests like GMAT, GRE, or SAT can strengthen your profile!" },
    11: { emoji: "✨", message: formData.hasStandardizedTests ? "Great! What test did you take?" : "Which test would you like to take?" },
    12: { emoji: "💯", message: "Enter your test score. Higher scores = more options!" },
    13: { emoji: "🗣️", message: "English proficiency is crucial for visa approval and university admission!" },
    14: { emoji: "📊", message: "Your English score matters a lot. Be accurate!" },
    15: { emoji: "🌏", message: "Where do you dream of studying? Pick your destination!" },
    16: { emoji: "📅", message: "When do you plan to start your studies?" },
    17: { emoji: "🎯", message: "What level of program are you aiming for?" },
    18: { emoji: "🎉", message: "Calculated! Your future looks bright! Let me crunch the numbers... 🎉" },
  };
  
  return messages[step] || { emoji: "😺", message: "Let's continue your journey!" };
};

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  nationality: string;
  currentEducation: string;
  gradingScheme: string;
  academicDivision: string;
  academicGrade: string;
  hasResearchPapers: boolean;
  researchDetails: string;
  hasStandardizedTests: boolean;
  testType: string;
  testScore: string;
  englishTest: string;
  englishScore: string;
  destinationCountry: string;
  preferredIntake: string;
  programLevel: string;
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

const WiseScoreFormV2 = ({ onComplete, onCancel }: WiseScoreFormV2Props) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nationalityOpen, setNationalityOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    nationality: "",
    currentEducation: "",
    gradingScheme: "",
    academicDivision: "",
    academicGrade: "",
    hasResearchPapers: false,
    researchDetails: "",
    hasStandardizedTests: false,
    testType: "",
    testScore: "",
    englishTest: "",
    englishScore: "",
    destinationCountry: "",
    preferredIntake: "",
    programLevel: "",
  });

  // Calculate steps based on conditional logic
  const steps = useMemo(() => {
    const baseSteps = [
      { id: "name", title: "What's your name?", field: "fullName", type: "text" },
      { id: "email", title: "Your email address?", field: "email", type: "email" },
      { id: "phone", title: "Phone number (optional)", field: "phone", type: "tel", optional: true },
      { id: "nationality", title: "Your nationality?", field: "nationality", type: "searchable" },
      { id: "education", title: "Current education level?", field: "currentEducation", type: "buttons", options: EDUCATION_LEVELS },
      { id: "grading", title: "Your grading scheme?", field: "gradingScheme", type: "buttons", options: GRADING_SCHEMES },
      { id: "division", title: "Your academic division?", field: "academicDivision", type: "buttons", options: ACADEMIC_DIVISIONS },
      { id: "grade", title: "Your exact grade/score?", field: "academicGrade", type: "text" },
      { id: "research_q", title: "Have you published any research papers?", field: "hasResearchPapers", type: "yesno" },
    ];

    // Only show research details if they have papers and doing Masters/PhD
    if (formData.hasResearchPapers && formData.currentEducation !== "high_school" && formData.currentEducation !== "bachelor") {
      baseSteps.push({ id: "research_details", title: "Tell us about your research", field: "researchDetails", type: "text", optional: true });
    }

    baseSteps.push({ id: "tests_q", title: "Do you have GMAT, GRE, SAT, or similar scores?", field: "hasStandardizedTests", type: "yesno" });

    if (formData.hasStandardizedTests) {
      baseSteps.push(
        { id: "test_type", title: "Which test did you take?", field: "testType", type: "buttons", options: STANDARDIZED_TESTS },
        { id: "test_score", title: "Your test score?", field: "testScore", type: "text" }
      );
    }

    baseSteps.push(
      { id: "english", title: "English proficiency test?", field: "englishTest", type: "buttons", options: ENGLISH_TESTS },
    );

    if (formData.englishTest && formData.englishTest !== "none") {
      baseSteps.push({ id: "english_score", title: "Your English test score?", field: "englishScore", type: "text" });
    }

    baseSteps.push(
      { id: "destination", title: "Dream study destination?", field: "destinationCountry", type: "buttons", options: DESTINATION_COUNTRIES.map(c => ({ value: c, label: c })) },
      { id: "intake", title: "When do you plan to start?", field: "preferredIntake", type: "buttons", options: INTAKES },
      { id: "program", title: "Target program level?", field: "programLevel", type: "buttons", options: PROGRAM_LEVELS },
    );

    return baseSteps;
  }, [formData.hasResearchPapers, formData.hasStandardizedTests, formData.englishTest, formData.currentEducation]);

  const currentStepData = steps[currentStep];
  const catState = getCatMessage(currentStep, formData);
  const progress = ((currentStep + 1) / steps.length) * 100;

  const isCurrentStepValid = useCallback(() => {
    if (!currentStepData) return false;
    const field = currentStepData.field as keyof FormData;
    if (currentStepData.optional) return true;
    
    const value = formData[field];
    if (typeof value === "boolean") return true;
    return value?.toString().trim() !== "";
  }, [currentStepData, formData]);

  const updateFormData = useCallback((field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const calculateScore = useCallback((): WiseScoreResult => {
    let score = 0;
    
    // Academic Division (max 35)
    const divisionPoints = ACADEMIC_DIVISIONS.find(d => d.value === formData.academicDivision)?.points || 0;
    score += divisionPoints;
    
    // Research Papers (+15)
    if (formData.hasResearchPapers) {
      score += 15;
    }
    
    // Standardized Tests (+20)
    if (formData.hasStandardizedTests && formData.testScore) {
      score += 20;
    }
    
    // English Proficiency (+30 max)
    if (formData.englishTest !== "none" && formData.englishScore) {
      const englishScore = parseFloat(formData.englishScore) || 0;
      if (formData.englishTest === "ielts" && englishScore >= 7) {
        score += 30;
      } else if (formData.englishTest === "ielts" && englishScore >= 6) {
        score += 20;
      } else if (formData.englishTest === "toefl" && englishScore >= 100) {
        score += 30;
      } else if (formData.englishTest === "toefl" && englishScore >= 80) {
        score += 20;
      } else {
        score += 15;
      }
    }
    
    // Check visa risk
    const isSouthAsian = SOUTH_ASIAN_NATIONALITIES.includes(formData.nationality);
    const hasNoEnglishTest = formData.englishTest === "none";
    const hasVisaRisk = isSouthAsian && hasNoEnglishTest;
    
    // Risk offset
    if (hasVisaRisk) {
      score -= 15;
    }
    
    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));
    
    // Determine tier and advice
    let tier: string;
    let advice: string;
    let universities: string[];
    
    if (score >= 80) {
      tier = "Top Candidate";
      advice = "Excellent! You qualify for QS Top 200 Universities. Your profile is highly competitive.";
      universities = ["University of Oxford", "Imperial College London", "MIT", "Stanford University", "University of Toronto"];
    } else if (score >= 65) {
      tier = "Strong Candidate";
      advice = "Great profile! You have good chances at top-tier universities. Consider strengthening with research or test scores.";
      universities = ["University of Edinburgh", "King's College London", "UC Berkeley", "McGill University", "University of Melbourne"];
    } else if (score >= 50) {
      tier = "Developing Candidate";
      advice = "You have potential! We recommend taking IELTS/PTE to boost your visa chances and improve your profile.";
      universities = ["University of Bristol", "University of Leeds", "Arizona State University", "University of Alberta"];
    } else {
      tier = "High Risk - Needs Improvement";
      advice = "We strongly recommend taking a PTE/IELTS to boost your visa chances. Consider improving your academic credentials.";
      universities = ["Pathway Programs", "Foundation Courses", "Pre-Masters Programs"];
    }
    
    if (hasVisaRisk) {
      advice = "⚠️ VISA RISK DETECTED: " + advice + " Taking an English test is critical for your visa application.";
    }
    
    return { score, tier, advice, universities, hasVisaRisk };
  }, [formData]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  }, [currentStep, steps.length]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const result = calculateScore();
      
      // Submit to edge function
      const { error } = await supabase.functions.invoke("submit-wisescore", {
        body: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          nationality: formData.nationality,
          currentEducation: formData.currentEducation,
          gradingScheme: formData.gradingScheme,
          academicGrade: formData.academicGrade,
          academicDivision: formData.academicDivision,
          hasResearchPapers: formData.hasResearchPapers,
          hasStandardizedTests: formData.hasStandardizedTests,
          testType: formData.testType,
          testScore: formData.testScore,
          englishTest: formData.englishTest,
          englishScore: formData.englishScore,
          hasVisaRisk: result.hasVisaRisk,
          destinationCountry: formData.destinationCountry,
          preferredIntake: formData.preferredIntake,
          programLevel: formData.programLevel,
          wiseScore: result.score,
          scoreTier: result.tier,
          advice: result.advice,
        },
      });

      if (error) {
        console.error("Submission error:", error);
        toast({
          title: "Submission saved locally",
          description: "We couldn't reach our servers, but your score is ready!",
          variant: "default",
        });
      }

      onComplete(result, formData);
    } catch (err) {
      console.error("Error:", err);
      // Still show result even if submission fails
      const result = calculateScore();
      onComplete(result, formData);
    }
  };

  const handleButtonSelect = (field: keyof FormData, value: string) => {
    updateFormData(field, value);
    // Auto-advance after selection
    setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    }, 300);
  };

  const handleYesNo = (field: keyof FormData, value: boolean) => {
    updateFormData(field, value);
    setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    }, 300);
  };

  const renderStepContent = () => {
    if (!currentStepData) return null;

    switch (currentStepData.type) {
      case "text":
      case "email":
      case "tel":
        return (
          <div className="space-y-4">
            <Input
              type={currentStepData.type}
              placeholder={currentStepData.type === "email" ? "your@email.com" : currentStepData.type === "tel" ? "+1 234 567 8900" : "Type here..."}
              value={formData[currentStepData.field as keyof FormData] as string}
              onChange={(e) => updateFormData(currentStepData.field as keyof FormData, e.target.value)}
              className="h-14 text-lg bg-background/50 border-border/50 focus:border-accent rounded-xl"
              autoFocus
            />
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
                className="w-full h-14 justify-between text-lg bg-background/50 border-border/50 rounded-xl"
              >
                {formData.nationality || "Search your nationality..."}
                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search nationality..." />
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
                          setTimeout(() => setCurrentStep(prev => prev + 1), 300);
                        }}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            formData.nationality === nat ? "opacity-100" : "opacity-0"
                          }`}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(currentStepData.options as Array<{ value: string; label: string }>)?.map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleButtonSelect(currentStepData.field as keyof FormData, option.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  formData[currentStepData.field as keyof FormData] === option.value
                    ? "border-accent bg-accent/10 text-accent-foreground"
                    : "border-border/50 bg-background/50 hover:border-accent/50 hover:bg-accent/5"
                }`}
              >
                <span className="font-medium">{option.label}</span>
              </motion.button>
            ))}
          </div>
        );

      case "yesno":
        return (
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleYesNo(currentStepData.field as keyof FormData, true)}
              className={`p-6 rounded-xl border-2 transition-all ${
                formData[currentStepData.field as keyof FormData] === true
                  ? "border-green-500 bg-green-500/10"
                  : "border-border/50 bg-background/50 hover:border-green-500/50"
              }`}
            >
              <span className="text-2xl mb-2 block">✅</span>
              <span className="font-bold text-lg">Yes</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleYesNo(currentStepData.field as keyof FormData, false)}
              className={`p-6 rounded-xl border-2 transition-all ${
                formData[currentStepData.field as keyof FormData] === false
                  ? "border-orange-500 bg-orange-500/10"
                  : "border-border/50 bg-background/50 hover:border-orange-500/50"
              }`}
            >
              <span className="text-2xl mb-2 block">❌</span>
              <span className="font-bold text-lg">No</span>
            </motion.button>
          </div>
        );

      default:
        return null;
    }
  };

  // Check for visa risk warning
  const showVisaRiskWarning = formData.englishTest === "none" && SOUTH_ASIAN_NATIONALITIES.includes(formData.nationality);

  return (
    <Card className="overflow-hidden border-0 bg-background/40 backdrop-blur-xl shadow-2xl max-w-2xl mx-auto">
      <CardContent className="p-0">
        {/* Progress Bar */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Question {currentStep + 1} of {steps.length}</span>
            <span className="text-sm font-medium text-accent">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="p-6 md:p-8">
          {/* Cat Guide */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="text-center mb-8"
            >
              <motion.div
                className="text-6xl mb-4 inline-block"
                animate={{ 
                  rotate: [0, -5, 5, 0],
                  y: [0, -5, 0],
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              >
                {catState.emoji}
              </motion.div>
              
              {/* Speech Bubble */}
              <div className="relative bg-accent/10 backdrop-blur-sm rounded-2xl p-4 max-w-md mx-auto border border-accent/20">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-accent/10 rotate-45 border-l border-t border-accent/20" />
                <p className="text-sm text-foreground font-medium relative z-10">
                  {catState.message}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Question Title */}
          <motion.h2
            key={`title-${currentStep}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-foreground mb-6 text-center"
          >
            {currentStepData?.title}
          </motion.h2>

          {/* Visa Risk Warning */}
          {showVisaRiskWarning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-orange-600 dark:text-orange-400">Visa Risk Warning</p>
                <p className="text-sm text-muted-foreground">
                  Without an English test, your visa application may face challenges. We recommend taking IELTS or PTE.
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
              transition={{ duration: 0.2 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/30">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="text-muted-foreground"
              >
                Cancel
              </Button>

              {(currentStepData?.type === "text" || currentStepData?.type === "email" || currentStepData?.type === "tel") && (
                <Button
                  onClick={handleNext}
                  disabled={!isCurrentStepValid() || isSubmitting}
                  className="gap-2 min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Calculating...
                    </>
                  ) : currentStep === steps.length - 1 ? (
                    <>
                      Get Score
                      <Check className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Step Dots */}
          <div className="flex justify-center gap-1.5 mt-6 flex-wrap">
            {steps.slice(0, Math.min(steps.length, 20)).map((_, index) => (
              <motion.div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep
                    ? "bg-accent"
                    : index < currentStep
                    ? "bg-accent/50"
                    : "bg-muted"
                }`}
              />
            ))}
            {steps.length > 20 && (
              <span className="text-xs text-muted-foreground ml-1">+{steps.length - 20}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WiseScoreFormV2;
