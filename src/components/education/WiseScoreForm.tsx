import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Loader2, Check, Send, GraduationCap, BookOpen, Globe, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Cat states for each step
const CAT_STATES = [
  {
    emoji: "🐱",
    mood: "Curious",
    message: "Hey there! Let's figure out if you're ready to study abroad. This helps us avoid wasting your time later!",
  },
  {
    emoji: "🤔",
    mood: "Thinking", 
    message: "Hmm, interesting! Your GPA tells us a lot about which universities will love your application...",
  },
  {
    emoji: "😺",
    mood: "Focused",
    message: "Almost there! This helps us match you with the perfect destination and programs...",
  },
  {
    emoji: "🎉",
    mood: "Celebrating",
    message: "Amazing! You're all set! Let me crunch the numbers and show you your WiseScore!",
  },
];

const COUNTRIES = [
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "Germany",
  "Ireland",
  "New Zealand",
  "Netherlands",
];

const ENGLISH_LEVELS = [
  { value: "ielts-7+", label: "IELTS 7.0+ / TOEFL 100+" },
  { value: "ielts-6-6.5", label: "IELTS 6.0-6.5 / TOEFL 80-99" },
  { value: "ielts-5.5", label: "IELTS 5.5 / TOEFL 70-79" },
  { value: "no-test", label: "No English Test Yet" },
  { value: "native", label: "Native English Speaker" },
];

interface FormData {
  name: string;
  gpa: string;
  englishLevel: string;
  desiredCountry: string;
}

interface WiseScoreResult {
  percentage: number;
  tier: string;
  universities: string[];
}

interface WiseScoreFormProps {
  onComplete: (result: WiseScoreResult) => void;
  onCancel: () => void;
}

const WiseScoreForm = ({ onComplete, onCancel }: WiseScoreFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    gpa: "",
    englishLevel: "",
    desiredCountry: "",
  });

  const steps = [
    { title: "Your Name", field: "name", icon: Star },
    { title: "Academic Score", field: "gpa", icon: BookOpen },
    { title: "English Level", field: "englishLevel", icon: GraduationCap },
    { title: "Dream Destination", field: "desiredCountry", icon: Globe },
  ];

  const currentCat = CAT_STATES[currentStep];

  const isCurrentStepValid = () => {
    const field = steps[currentStep].field as keyof FormData;
    return formData[field].trim() !== "";
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate AI calculation
    setTimeout(() => {
      const gpaNum = parseFloat(formData.gpa) || 3.0;
      const baseScore = Math.min(gpaNum / 4.0, 1) * 40;
      const englishBonus = formData.englishLevel.includes("7+") || formData.englishLevel === "native" ? 30 : 
                          formData.englishLevel.includes("6") ? 20 : 10;
      const randomFactor = Math.random() * 15;
      const finalScore = Math.min(Math.round(baseScore + englishBonus + randomFactor + 15), 95);

      const result: WiseScoreResult = {
        percentage: finalScore,
        tier: finalScore >= 80 ? "Tier 1 - Top Research Universities" : 
              finalScore >= 65 ? "Tier 2 - Excellent Universities" : "Tier 3 - Solid Foundation Programs",
        universities: getUniversities(formData.desiredCountry, finalScore),
      };
      onComplete(result);
    }, 2500);
  };

  const getUniversities = (country: string, score: number): string[] => {
    const unis: Record<string, string[]> = {
      "United Kingdom": ["University of Oxford", "Imperial College London", "University of Edinburgh", "UCL", "King's College London"],
      "United States": ["MIT", "Stanford University", "UC Berkeley", "NYU", "University of Michigan"],
      "Canada": ["University of Toronto", "McGill University", "UBC", "University of Waterloo", "McMaster University"],
      "Australia": ["University of Melbourne", "University of Sydney", "ANU", "UNSW", "Monash University"],
      "Germany": ["TU Munich", "Heidelberg University", "LMU Munich", "Humboldt University", "RWTH Aachen"],
      "Ireland": ["Trinity College Dublin", "University College Dublin", "NUI Galway", "Dublin City University"],
      "New Zealand": ["University of Auckland", "University of Otago", "Victoria University", "University of Canterbury"],
      "Netherlands": ["University of Amsterdam", "TU Delft", "Leiden University", "Utrecht University"],
    };
    return unis[country] || unis["United Kingdom"];
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Card className="overflow-hidden border-0 bg-background/40 backdrop-blur-xl shadow-2xl">
      <CardContent className="p-0">
        {/* Progress Bar */}
        <div className="h-1 bg-muted">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Cat Viewer Panel */}
          <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-background p-8 flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px] relative overflow-hidden">
            {/* Glassmorphism background blobs */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -left-20 w-60 h-60 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-accent/20 rounded-full blur-3xl" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: -20 }}
                transition={{ type: "spring", damping: 20 }}
                className="relative z-10 text-center"
              >
                {/* Cat Emoji */}
                <motion.div
                  className="text-8xl md:text-9xl mb-6"
                  animate={{ 
                    rotate: [0, -5, 5, 0],
                    y: [0, -10, 0],
                  }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                >
                  {currentCat.emoji}
                </motion.div>

                {/* Speech Bubble */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative bg-background/80 backdrop-blur-sm rounded-2xl p-4 max-w-xs mx-auto shadow-lg border border-border/50"
                >
                  {/* Bubble pointer */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-background/80 rotate-45 border-l border-t border-border/50" />
                  
                  <p className="text-sm text-foreground font-medium relative z-10">
                    {currentCat.message}
                  </p>
                </motion.div>

                <p className="text-xs text-muted-foreground mt-4">
                  {currentCat.mood} Cat • Step {currentStep + 1} of {steps.length}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Form Panel */}
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                {(() => {
                  const StepIcon = steps[currentStep].icon;
                  return <StepIcon className="w-5 h-5 text-accent" />;
                })()}
                {steps[currentStep].title}
              </h3>
              <Button variant="ghost" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Step 1: Name */}
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <Label htmlFor="name" className="text-foreground">What's your name?</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => updateFormData("name", e.target.value)}
                      className="h-12 text-lg bg-background/50 border-border/50 focus:border-accent"
                      autoFocus
                    />
                  </div>
                )}

                {/* Step 2: GPA */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <Label htmlFor="gpa" className="text-foreground">Your GPA or Percentage</Label>
                    <Input
                      id="gpa"
                      placeholder="e.g., 3.5 or 85%"
                      value={formData.gpa}
                      onChange={(e) => updateFormData("gpa", e.target.value)}
                      className="h-12 text-lg bg-background/50 border-border/50 focus:border-accent"
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter your GPA (on 4.0 scale) or percentage score
                    </p>
                  </div>
                )}

                {/* Step 3: English Level */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <Label className="text-foreground">Your English Proficiency</Label>
                    <Select
                      value={formData.englishLevel}
                      onValueChange={(value) => updateFormData("englishLevel", value)}
                    >
                      <SelectTrigger className="h-12 text-lg bg-background/50 border-border/50">
                        <SelectValue placeholder="Select your level" />
                      </SelectTrigger>
                      <SelectContent>
                        {ENGLISH_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Step 4: Country */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <Label className="text-foreground">Where do you dream of studying?</Label>
                    <Select
                      value={formData.desiredCountry}
                      onValueChange={(value) => updateFormData("desiredCountry", value)}
                    >
                      <SelectTrigger className="h-12 text-lg bg-background/50 border-border/50">
                        <SelectValue placeholder="Choose your destination" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={!isCurrentStepValid() || isSubmitting}
                className="gap-2 min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Calculating...
                  </>
                ) : currentStep === steps.length - 1 ? (
                  <>
                    <Send className="w-4 h-4" />
                    Get My WiseScore
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {steps.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep
                      ? "bg-accent"
                      : index < currentStep
                      ? "bg-accent/50"
                      : "bg-muted"
                  }`}
                  animate={index === currentStep ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.5 }}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WiseScoreForm;
