import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight, GraduationCap, MessageCircle, Mail, Star, AlertTriangle, CheckCircle2, TrendingUp, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface WiseScoreResult {
  score: number;
  tier: string;
  advice: string;
  universities: string[];
  hasVisaRisk: boolean;
}

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

interface WiseScoreResultV2Props {
  result: WiseScoreResult;
  formData: FormData;
  onLoginRequired: () => void;
  onReset: () => void;
}

const WiseScoreResultV2 = ({ result, formData, onLoginRequired, onReset }: WiseScoreResultV2Props) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session?.user);
      setUserId(session?.user?.id || null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsLoggedIn(!!session?.user);
      setUserId(session?.user?.id || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Save WiseScore results when logged in
  useEffect(() => {
    if (!isLoggedIn || !userId || saved) return;
    const saveResults = async () => {
      // Save to localStorage for match engine
      localStorage.setItem("wiseScoreAnswers", JSON.stringify(formData));

      await supabase.from("wisescore_results").insert({
        user_id: userId,
        target_country: formData.stream || null,
        study_level: formData.degree || null,
        field: formData.program || null,
        specific_program: formData.program || null,
        nationality: formData.nationality || null,
        age_range: formData.ageRange || null,
        highest_education: formData.highestEducation || null,
        current_status: formData.educationStatus || null,
        education_gap: formData.educationGap || null,
        grading_system: formData.gradingScheme || null,
        academic_score: formData.gradeValue ? parseFloat(formData.gradeValue) : null,
        english_test: formData.englishTest || null,
        english_score: formData.englishScore ? parseFloat(formData.englishScore) : null,
        has_passport: formData.hasPassport === "yes",
        whatsapp: formData.whatsapp || null,
        email: formData.email || null,
        wise_score: result.score,
        admission_score: Math.min(100, Math.round(result.score * 0.85 + Math.random() * 10)),
        visa_score: null,
        scholarship_score: Math.min(100, Math.round(result.score * 0.7 + Math.random() * 15)),
        rejection_risk: result.score >= 75 ? "Low" : result.score >= 50 ? "Medium" : "High",
        top_universities: result.universities.map((u, i) => ({
          name: u,
          country: formData.stream || "Unknown",
          matchPct: Math.max(40, Math.round(result.score - i * 8 + Math.random() * 5)),
        })),
        action_items: [
          result.hasVisaRisk ? "Take IELTS/PTE English proficiency test" : null,
          result.score < 70 ? "Improve your academic GPA to 3.0+" : null,
          formData.hasPassport !== "yes" ? "Apply for passport immediately" : null,
          "Prepare a strong Statement of Purpose (SOP)",
          "Gather all academic transcripts and certificates",
        ].filter(Boolean),
      } as any);
      setSaved(true);
    };
    saveResults();
  }, [isLoggedIn, userId, saved, formData, result]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 65) return "text-blue-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return "from-green-500 to-emerald-400";
    if (score >= 65) return "from-blue-500 to-cyan-400";
    if (score >= 50) return "from-yellow-500 to-orange-400";
    return "from-red-500 to-orange-400";
  };

  const firstName = formData.fullName?.split(" ")[0] || "there";

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi! I just took the WiseScore assessment and scored ${result.score}/100. I'm interested in studying ${formData.degree} in ${formData.stream}. Can you help me with my application?`
    );
    window.open(`https://wa.me/9779743208282?text=${message}`, "_blank");
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`WiseScore Consultation Request - ${formData.fullName}`);
    const body = encodeURIComponent(
      `Hello WiseAdmit Team,\n\nI took the WiseScore assessment and received a score of ${result.score}/100.\n\nMy Details:\n- Name: ${formData.fullName}\n- Email: ${formData.email}\n- Stream: ${formData.stream}\n- Program: ${formData.program}\n- Degree: ${formData.degree}\n\nI would like to discuss my study abroad options.\n\nThank you!`
    );
    window.open(`mailto:info@recruitlygroup.com?subject=${subject}&body=${body}`, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <Card className="overflow-hidden border-0 bg-background/40 backdrop-blur-xl shadow-2xl">
        <CardContent className="p-6 md:p-10">
          {/* Celebrating */}
          <motion.div
            className="text-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <motion.div
              className="text-7xl mb-4 inline-block"
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
                y: [0, -10, 0],
              }}
              transition={{ duration: 1, repeat: 2 }}
            >
              🎉
            </motion.div>
            <h2 className="text-2xl font-bold text-foreground">
              Congratulations, {firstName}!
            </h2>
            <p className="text-muted-foreground">Your WiseScore is ready</p>
          </motion.div>

          {/* Score Display */}
          <motion.div
            className="text-center mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.3 }}
          >
            <div className="relative w-48 h-48 mx-auto mb-6">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                <motion.circle
                  cx="50" cy="50" r="45" fill="none"
                  stroke={`url(#scoreGradient-${result.score})`}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${result.score * 2.83} 283`}
                  initial={{ strokeDasharray: "0 283" }}
                  animate={{ strokeDasharray: `${result.score * 2.83} 283` }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  transform="rotate(-90 50 50)"
                />
                <defs>
                  <linearGradient id={`scoreGradient-${result.score}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={result.score >= 65 ? "#22c55e" : "#ef4444"} />
                    <stop offset="100%" stopColor={result.score >= 65 ? "#10b981" : "#f97316"} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  className={`text-5xl font-black ${getScoreColor(result.score)}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  {result.score}
                </motion.span>
                <span className="text-sm text-muted-foreground font-medium">out of 100</span>
              </div>
            </div>

            {/* Tier Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mb-4"
            >
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${getScoreGradient(result.score)} text-white`}>
                {result.score >= 65 ? <CheckCircle2 className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                <span className="text-sm font-semibold">{result.tier}</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Visa Risk Warning */}
          {result.hasVisaRisk && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 }}
              className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-start gap-3"
            >
              <AlertTriangle className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-orange-600 dark:text-orange-400">Visa Risk Detected</p>
                <p className="text-sm text-muted-foreground">
                  Without an English proficiency test, your visa application may face significant challenges.
                </p>
              </div>
            </motion.div>
          )}

          {/* Advice Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="mb-8 p-6 bg-accent/5 border border-accent/20 rounded-2xl"
          >
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-accent" />
              Our Recommendation
            </h3>
            <p className="text-foreground/80">{result.advice}</p>
          </motion.div>

          {/* Universities Section - Conditional on auth */}
          <motion.div
            className="relative rounded-2xl overflow-hidden mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            {isLoggedIn ? (
              /* UNLOCKED - Show full university list */
              <div className="p-6 bg-muted/30 rounded-2xl border border-border/30">
                <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Unlock className="w-5 h-5 text-green-600" />
                  Your Matched Universities for {formData.stream}
                </h4>
                <ul className="space-y-2">
                  {result.universities.map((uni, i) => (
                    <li key={i} className="text-foreground flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                      {uni}
                    </li>
                  ))}
                </ul>
                <div className="mt-4">
                  <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
                    View Full Analysis in Dashboard →
                  </Button>
                </div>
              </div>
            ) : (
              /* LOCKED - Blur with overlay */
              <>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background z-10" />
                <div className="p-6 bg-muted/30 rounded-2xl backdrop-blur-sm border border-border/30">
                  <h4 className="font-bold text-foreground mb-4 flex items-center gap-2 blur-[2px]">
                    <GraduationCap className="w-5 h-5" />
                    Your Matched Universities for {formData.stream}
                  </h4>
                  <ul className="space-y-2 blur-[2px]">
                    {result.universities.map((uni, i) => (
                      <li key={i} className="text-muted-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        {uni}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    <Lock className="w-12 h-12 text-accent mb-4" />
                  </motion.div>
                  <p className="text-foreground font-semibold mb-3">🔒 Log in to unlock your personalized university list</p>
                  <div className="flex gap-3">
                    <Button onClick={() => navigate("/auth?mode=login")}>
                      Log In
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/auth?mode=register")}>
                      Create Free Account
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">+ Get your Personalized Study Plan</p>
                </div>
              </>
            )}
          </motion.div>

          {/* Contact Options */}
          <motion.div
            className="grid md:grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
          >
            <Card className="bg-background/50 backdrop-blur-sm border-border/30 hover:border-green-500/30 transition-colors cursor-pointer" onClick={handleWhatsApp}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Chat on WhatsApp</p>
                  <p className="text-sm text-muted-foreground">Get instant guidance</p>
                </div>
                <Button variant="outline" size="sm" className="border-green-500/30 text-green-600 hover:bg-green-500/10">
                  Chat Now
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-background/50 backdrop-blur-sm border-border/30 hover:border-blue-500/30 transition-colors cursor-pointer" onClick={handleEmail}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Email Us</p>
                  <p className="text-sm text-muted-foreground">Detailed consultation</p>
                </div>
                <Button variant="outline" size="sm" className="border-blue-500/30 text-blue-600 hover:bg-blue-500/10">
                  Send Email
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Profile Summary */}
          <motion.div
            className="mt-8 p-4 bg-muted/20 rounded-xl border border-border/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
          >
            <h4 className="font-semibold text-foreground mb-3 text-sm">Your Profile Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Stream:</span>
                <p className="font-medium text-foreground">{formData.stream || "Not set"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Degree:</span>
                <p className="font-medium text-foreground">{formData.degree || "Not set"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Education:</span>
                <p className="font-medium text-foreground">{formData.highestEducation || "Not set"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">English:</span>
                <p className="font-medium text-foreground">
                  {formData.englishTest === "moi" ? "MOI/None" : `${formData.englishTest?.toUpperCase()} ${formData.englishScore || ""}`}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Try Again */}
          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
          >
            <Button variant="ghost" onClick={onReset} className="text-muted-foreground">
              ← Take Assessment Again
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WiseScoreResultV2;
