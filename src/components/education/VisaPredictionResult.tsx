import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, MessageCircle, Star } from "lucide-react";
import type { VisaPredictionResult as VPResult } from "./VisaPredictorForm";

interface VisaPredictionResultProps {
  result: VPResult;
  targetCountry: string;
  onRedo: () => void;
}

const VisaPredictionResultDisplay = ({ result, targetCountry, onRedo }: VisaPredictionResultProps) => {
  const { visaScore, riskFlags, travelBoost, actionItems } = result;

  const getScoreColor = () => {
    if (visaScore >= 75) return { ring: "text-green-500", bg: "bg-green-50", label: "High Chance", labelColor: "text-green-700" };
    if (visaScore >= 50) return { ring: "text-yellow-500", bg: "bg-yellow-50", label: "Moderate", labelColor: "text-yellow-700" };
    if (visaScore >= 30) return { ring: "text-orange-500", bg: "bg-orange-50", label: "At Risk", labelColor: "text-orange-700" };
    return { ring: "text-red-500", bg: "bg-red-50", label: "High Refusal Risk", labelColor: "text-red-700" };
  };

  const colors = getScoreColor();
  const circumference = 2 * Math.PI * 60;
  const offset = circumference - (visaScore / 100) * circumference;

  const whatsappMsg = encodeURIComponent("Hi Recruitly! I just completed my Visa Prediction and need expert guidance.");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Score Gauge */}
      <Card className={`${colors.bg} border-0 shadow-lg`}>
        <CardContent className="p-8 text-center">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Visa Success Probability — {targetCountry}
          </h2>
          <div className="relative inline-flex items-center justify-center my-6">
            <svg className="w-36 h-36 -rotate-90" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="60" fill="none" stroke="currentColor" strokeWidth="10" className="text-border/30" />
              <circle
                cx="70" cy="70" r="60" fill="none" stroke="currentColor" strokeWidth="10"
                className={colors.ring}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1s ease-out" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-foreground">{visaScore}%</span>
            </div>
          </div>
          <Badge className={`${colors.bg} ${colors.labelColor} border-0 text-sm px-4 py-1`}>
            {colors.label}
          </Badge>
        </CardContent>
      </Card>

      {/* Travel History Boost */}
      {travelBoost > 0 && (
        <Card className="bg-blue-50 border-0">
          <CardContent className="p-4 flex items-center gap-3">
            <Star className="w-5 h-5 text-blue-600" />
            <p className="text-sm font-medium text-blue-800">
              +{Math.min(travelBoost, 20)}% from strong travel history 🌟
            </p>
          </CardContent>
        </Card>
      )}

      {/* Risk Flags */}
      {riskFlags.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">Risk Flags</h3>
          {riskFlags.map((flag, i) => (
            <Card key={i} className={`border-0 ${flag.startsWith("🔴") ? "bg-red-50" : "bg-orange-50"}`}>
              <CardContent className="p-3">
                <p className={`text-sm ${flag.startsWith("🔴") ? "text-red-800" : "text-orange-800"}`}>{flag}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Action Items */}
      {actionItems.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">Top Priority Actions</h3>
          <Card>
            <CardContent className="p-4 space-y-3">
              {actionItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-sm text-foreground">{item}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild className="flex-1 gap-2">
          <a href={`https://wa.me/9779743208282?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-4 h-4" /> Book Free Consultation
          </a>
        </Button>
        <Button variant="outline" onClick={onRedo} className="flex-1 gap-2">
          <RefreshCw className="w-4 h-4" /> Redo Assessment
        </Button>
      </div>
    </motion.div>
  );
};

export default VisaPredictionResultDisplay;
