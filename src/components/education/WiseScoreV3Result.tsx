import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, AlertTriangle, CheckCircle2, TrendingUp, RotateCcw, MessageCircle, Lightbulb, GraduationCap, Shield, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { WiseScoreOutput, WiseScoreInputs, getCountryConfig } from "@/lib/wiseScoreEngine";
import { useUniversityData } from "@/hooks/useUniversityData";

interface Props {
  result: WiseScoreOutput;
  inputs: WiseScoreInputs;
  onReset: () => void;
}

function ScoreGauge({ score, label, icon: Icon }: { score: number; label: string; icon: React.ElementType }) {
  const color = score >= 75 ? "text-green-600" : score >= 50 ? "text-amber-600" : "text-red-600";
  const bg = score >= 75 ? "bg-green-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="text-center">
      <div className="relative w-24 h-24 mx-auto mb-2">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
          <motion.circle
            cx="50" cy="50" r="42" fill="none" stroke="currentColor"
            strokeWidth="8" strokeLinecap="round"
            strokeDasharray={264}
            initial={{ strokeDashoffset: 264 }}
            animate={{ strokeDashoffset: 264 - (264 * score) / 100 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className={color}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xl font-bold ${color}`}>{score}%</span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
    </div>
  );
}

const WiseScoreV3Result = ({ result, inputs, onReset }: Props) => {
  const { data: universities } = useUniversityData();
  const config = getCountryConfig(inputs.targetCountry);

  // Match universities to the target country
  const matchedUniversities = useMemo(() => {
    if (!universities) return { reach: [], match: [], safety: [] };
    const countryUnis = universities.filter(
      (u) => u.country.toLowerCase() === inputs.targetCountry.toLowerCase() && u.status.toUpperCase() === "OPEN"
    );

    // Simple tier logic based on CGPA requirement parsing
    const reach: typeof countryUnis = [];
    const match: typeof countryUnis = [];
    const safety: typeof countryUnis = [];

    for (const uni of countryUnis) {
      const req = uni.cgpaRequirement.toLowerCase();
      if (req.includes("no cgpa") || req === "") {
        safety.push(uni);
      } else {
        const cgpaMatch = req.match(/([\d.]+)/);
        if (cgpaMatch) {
          const required = parseFloat(cgpaMatch[1]);
          if (inputs.cgpa >= required + 0.3) safety.push(uni);
          else if (inputs.cgpa >= required - 0.2) match.push(uni);
          else reach.push(uni);
        } else {
          match.push(uni);
        }
      }
    }

    return {
      reach: reach.slice(0, 3),
      match: match.slice(0, 5),
      safety: safety.slice(0, 5),
    };
  }, [universities, inputs]);

  const riskIcon = result.rejectionRisk === "red" ? AlertTriangle : result.rejectionRisk === "yellow" ? TrendingUp : CheckCircle2;
  const riskColor = result.rejectionRisk === "red" ? "text-red-600" : result.rejectionRisk === "yellow" ? "text-amber-600" : "text-green-600";
  const riskLabel = result.rejectionRisk === "red" ? "High Risk — Fix critical items first" : result.rejectionRisk === "yellow" ? "Moderate — Proceed with caution" : "Strong Profile — Apply now";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Overall Score */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-border/50 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-6 md:p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-1">Your WiseScore</h2>
              <p className="text-sm text-muted-foreground">
                {config?.flag} {inputs.targetCountry} • {inputs.studyLevel} • {inputs.fieldOfStudy || "General"}
              </p>
            </div>

            {/* Main Score Gauge */}
            <div className="flex justify-center mb-6">
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                  <motion.circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke={result.overallScore >= 75 ? "hsl(142, 71%, 45%)" : result.overallScore >= 50 ? "hsl(38, 92%, 50%)" : "hsl(0, 84%, 60%)"}
                    strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={264}
                    initial={{ strokeDashoffset: 264 }}
                    animate={{ strokeDashoffset: 264 - (264 * result.overallScore) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    className="text-4xl font-black text-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    {result.overallScore}
                  </motion.span>
                  <span className="text-xs text-muted-foreground">out of 100</span>
                </div>
              </div>
            </div>

            {/* Sub-scores */}
            <div className="grid grid-cols-3 gap-4">
              <ScoreGauge score={result.admissionScore} label="Admission" icon={GraduationCap} />
              <ScoreGauge score={result.visaScore} label="Visa Success" icon={Shield} />
              <ScoreGauge score={result.scholarshipScore} label="Scholarship" icon={Award} />
            </div>
          </div>

          <CardContent className="p-6">
            {/* Risk Flag */}
            <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
              result.rejectionRisk === "red" ? "bg-red-50" : result.rejectionRisk === "yellow" ? "bg-amber-50" : "bg-green-50"
            }`}>
              {<riskIcon className={`w-5 h-5 ${riskColor}`} />}
              <span className={`text-sm font-medium ${riskColor}`}>{riskLabel}</span>
              <Badge variant="secondary" className="ml-auto text-xs">{result.tier}</Badge>
            </div>

            {/* Action Items */}
            <div className="space-y-2 mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-primary" /> Top Actions to Improve
              </h3>
              {result.actionItems.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary font-bold">{i + 1}.</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Country Tips */}
            {result.countrySpecificTips.length > 0 && (
              <div className="space-y-1.5 p-3 bg-muted/50 rounded-lg">
                <h4 className="text-xs font-semibold text-foreground">
                  {config?.flag} {inputs.targetCountry} Quick Tips
                </h4>
                {result.countrySpecificTips.map((tip, i) => (
                  <p key={i} className="text-xs text-muted-foreground">✅ {tip}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Matched Universities */}
      {(matchedUniversities.match.length > 0 || matchedUniversities.safety.length > 0 || matchedUniversities.reach.length > 0) && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-border/50">
            <CardContent className="p-6">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Recommended Universities for You
              </h3>

              {matchedUniversities.safety.length > 0 && (
                <UniTier label="🟢 Safety" subtitle="Score exceeds requirements" unis={matchedUniversities.safety} />
              )}
              {matchedUniversities.match.length > 0 && (
                <UniTier label="🟡 Match" subtitle="Score meets requirements" unis={matchedUniversities.match} />
              )}
              {matchedUniversities.reach.length > 0 && (
                <UniTier label="🔴 Reach" subtitle="Score slightly below" unis={matchedUniversities.reach} />
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* CTA */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-col sm:flex-row gap-3">
        <Button asChild className="flex-1 gap-2">
          <a
            href={`https://wa.me/9779743208282?text=${encodeURIComponent(`Hi Recruitly Group! My WiseScore is ${result.overallScore}/100 for ${inputs.targetCountry}. I'd like guidance on next steps.`)}`}
            target="_blank" rel="noopener noreferrer"
          >
            <MessageCircle className="w-4 h-4" /> Get Expert Guidance
          </a>
        </Button>
        <Button variant="outline" onClick={onReset} className="gap-2">
          <RotateCcw className="w-4 h-4" /> Try Another Country
        </Button>
      </motion.div>
    </div>
  );
};

function UniTier({ label, subtitle, unis }: { label: string; subtitle: string; unis: Array<{ id: string; name: string; admissionFee: string; link: string }> }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold text-sm">{label}</span>
        <span className="text-xs text-muted-foreground">— {subtitle}</span>
      </div>
      <div className="space-y-1.5">
        {unis.map((u) => (
          <div key={u.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-sm">
            <span className="text-foreground font-medium truncate flex-1">{u.name}</span>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-muted-foreground">{u.admissionFee}</span>
              {u.link && (
                <a href={u.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">
                  Visit <ArrowRight className="w-3 h-3 inline" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WiseScoreV3Result;
