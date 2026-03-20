import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Loader2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WiseScoreInputs, calculateWiseScore, getSupportedCountries, WiseScoreOutput } from "@/lib/wiseScoreEngine";

interface Props {
  onComplete: (result: WiseScoreOutput, inputs: WiseScoreInputs) => void;
  onCancel: () => void;
}

const STEPS = [
  { title: "Personal Info", subtitle: "Tell us about yourself" },
  { title: "Academic Profile", subtitle: "Your educational background" },
  { title: "Target Country", subtitle: "Where do you want to study?" },
  { title: "English Proficiency", subtitle: "Language test scores" },
  { title: "Financial & Documents", subtitle: "Readiness assessment" },
  { title: "Visa Factors", subtitle: "Additional factors" },
];

const WiseScoreV3Form = ({ onComplete, onCancel }: Props) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState<WiseScoreInputs>({
    fullName: "",
    email: "",
    phone: "",
    targetCountry: "",
    studyLevel: "",
    fieldOfStudy: "",
    cgpa: 0,
    englishTest: "",
    englishScore: 0,
    financialProofUSD: 0,
    accommodationStatus: "none",
    priorVisaRefusals: "none",
    documentReadiness: "partial",
    homeCountryTies: "family",
    motivationLetter: "none",
  });

  const update = (field: keyof WiseScoreInputs, value: string | number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const countries = getSupportedCountries();
  const progress = ((step + 1) / STEPS.length) * 100;

  const canNext = (): boolean => {
    switch (step) {
      case 0: return !!inputs.fullName && !!inputs.email;
      case 1: return !!inputs.studyLevel && inputs.cgpa > 0;
      case 2: return !!inputs.targetCountry;
      case 3: return true;
      case 4: return inputs.financialProofUSD > 0;
      case 5: return true;
      default: return true;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    const result = calculateWiseScore(inputs);
    setLoading(false);
    onComplete(result, inputs);
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else handleSubmit();
  };

  return (
    <Card className="max-w-2xl mx-auto border-border/50 shadow-lg">
      <CardContent className="p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-lg">WiseScore Assessment</h2>
            <p className="text-xs text-muted-foreground">Step {step + 1} of {STEPS.length}: {STEPS[step].subtitle}</p>
          </div>
        </div>

        <Progress value={progress} className="h-1.5 mb-6" />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {step === 0 && (
              <>
                <div>
                  <Label>Full Name *</Label>
                  <Input value={inputs.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Ahmed Khan" />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input type="email" value={inputs.email} onChange={(e) => update("email", e.target.value)} placeholder="ahmed@example.com" />
                </div>
                <div>
                  <Label>Phone (WhatsApp)</Label>
                  <Input value={inputs.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+977 9800000000" />
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div>
                  <Label>Study Level *</Label>
                  <Select value={inputs.studyLevel} onValueChange={(v) => update("studyLevel", v)}>
                    <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bachelor">Bachelor's</SelectItem>
                      <SelectItem value="Master">Master's</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                      <SelectItem value="Diploma">Diploma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Field of Study</Label>
                  <Input value={inputs.fieldOfStudy} onChange={(e) => update("fieldOfStudy", e.target.value)} placeholder="e.g. Computer Science, Business" />
                </div>
                <div>
                  <Label>Current CGPA (on 4.0 scale) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="4"
                    value={inputs.cgpa || ""}
                    onChange={(e) => update("cgpa", parseFloat(e.target.value) || 0)}
                    placeholder="3.2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {inputs.cgpa >= 3.5 ? "✅ Excellent" : inputs.cgpa >= 3.0 ? "👍 Good" : inputs.cgpa >= 2.5 ? "⚡ Medium" : inputs.cgpa > 0 ? "⚠️ Low — consider improvement" : ""}
                  </p>
                </div>
              </>
            )}

            {step === 2 && (
              <div>
                <Label>Target Country *</Label>
                <Select value={inputs.targetCountry} onValueChange={(v) => update("targetCountry", v)}>
                  <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.flag} {c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {inputs.targetCountry && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Scoring will use the {inputs.targetCountry}-specific demographic model with country-specific admission and visa weights.
                  </p>
                )}
              </div>
            )}

            {step === 3 && (
              <>
                <div>
                  <Label>English Test Type</Label>
                  <Select value={inputs.englishTest} onValueChange={(v) => update("englishTest", v)}>
                    <SelectTrigger><SelectValue placeholder="Select test" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IELTS">IELTS</SelectItem>
                      <SelectItem value="TOEFL">TOEFL iBT</SelectItem>
                      <SelectItem value="PTE">PTE Academic</SelectItem>
                      <SelectItem value="Duolingo">Duolingo</SelectItem>
                      <SelectItem value="None">Not taken yet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {inputs.englishTest && inputs.englishTest !== "None" && (
                  <div>
                    <Label>Score</Label>
                    <Input
                      type="number"
                      step={inputs.englishTest === "IELTS" ? "0.5" : "1"}
                      value={inputs.englishScore || ""}
                      onChange={(e) => update("englishScore", parseFloat(e.target.value) || 0)}
                      placeholder={inputs.englishTest === "IELTS" ? "6.5" : inputs.englishTest === "TOEFL" ? "90" : "65"}
                    />
                  </div>
                )}
              </>
            )}

            {step === 4 && (
              <>
                <div>
                  <Label>Available Funds (USD equivalent) *</Label>
                  <Input
                    type="number"
                    value={inputs.financialProofUSD || ""}
                    onChange={(e) => update("financialProofUSD", parseFloat(e.target.value) || 0)}
                    placeholder="15000"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Total available funds including family support</p>
                </div>
                <div>
                  <Label>Document Readiness</Label>
                  <Select value={inputs.documentReadiness} onValueChange={(v) => update("documentReadiness", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apostilled">Apostilled & Complete</SelectItem>
                      <SelectItem value="complete">All Documents Ready</SelectItem>
                      <SelectItem value="partial">Partially Ready</SelectItem>
                      <SelectItem value="poor">Not Started</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Motivation / Study Plan Letter</Label>
                  <Select value={inputs.motivationLetter} onValueChange={(v) => update("motivationLetter", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="research_specific">Research-Specific Letter</SelectItem>
                      <SelectItem value="country_specific">Country-Specific Letter</SelectItem>
                      <SelectItem value="generic">Generic Letter</SelectItem>
                      <SelectItem value="none">Not Written Yet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {step === 5 && (
              <>
                <div>
                  <Label>Accommodation Status</Label>
                  <Select value={inputs.accommodationStatus} onValueChange={(v) => update("accommodationStatus", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="university">University Housing Confirmed</SelectItem>
                      <SelectItem value="lease">Registered Lease</SelectItem>
                      <SelectItem value="hotel">Hotel Booking</SelectItem>
                      <SelectItem value="none">No Accommodation Yet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Prior Visa Refusals</Label>
                  <Select value={inputs.priorVisaRefusals} onValueChange={(v) => update("priorVisaRefusals", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Prior Refusals</SelectItem>
                      <SelectItem value="1">1 Refusal</SelectItem>
                      <SelectItem value="2+">2+ Refusals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Home Country Ties</Label>
                  <Select value={inputs.homeCountryTies} onValueChange={(v) => update("homeCountryTies", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="property_family">Property + Family</SelectItem>
                      <SelectItem value="employment">Employment</SelectItem>
                      <SelectItem value="family">Family Only</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button variant="ghost" onClick={step === 0 ? onCancel : () => setStep(step - 1)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> {step === 0 ? "Cancel" : "Back"}
          </Button>
          <Button onClick={handleNext} disabled={!canNext() || loading}>
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Calculating...</>
            ) : step === STEPS.length - 1 ? (
              "Calculate WiseScore"
            ) : (
              <>Next <ArrowRight className="w-4 h-4 ml-1" /></>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WiseScoreV3Form;
