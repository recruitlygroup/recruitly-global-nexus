import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Lock, ArrowRight, GraduationCap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface HeraScoreResult {
  percentage: number;
  tier: string;
  universities: string[];
}

interface HeraScoreSectionProps {
  onLoginRequired: () => void;
  userCountry?: string;
}

const HeraScoreSection = ({ onLoginRequired, userCountry }: HeraScoreSectionProps) => {
  const [showTallyForm, setShowTallyForm] = useState(false);
  const [heraScoreResult, setHeraScoreResult] = useState<HeraScoreResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleTallySubmit = () => {
    setIsCalculating(true);
    // Simulate AI calculation
    setTimeout(() => {
      const mockResult: HeraScoreResult = {
        percentage: Math.floor(Math.random() * 30) + 65, // 65-95%
        tier: "Tier 1 - Top Research Universities",
        universities: [
          "University of Toronto",
          "McGill University", 
          "University of British Columbia",
          "University of Melbourne",
          "University of Oxford"
        ]
      };
      setHeraScoreResult(mockResult);
      setIsCalculating(false);
    }, 2500);
  };

  return (
    <section className="relative py-12 md:py-20">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-accent/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {/* Main CTA - Pulsating */}
        <AnimatePresence mode="wait">
          {!showTallyForm && !heraScoreResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.02, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Card className="glass border-accent/30 overflow-hidden">
                  <CardContent className="p-8 md:p-12">
                    <div className="flex justify-center mb-6">
                      <motion.div
                        className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center"
                        animate={{
                          boxShadow: [
                            "0 0 20px hsl(var(--accent) / 0.3)",
                            "0 0 40px hsl(var(--accent) / 0.6)",
                            "0 0 20px hsl(var(--accent) / 0.3)",
                          ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Sparkles className="w-10 h-10 text-accent-foreground" />
                      </motion.div>
                    </div>

                    <h2 className="text-2xl md:text-4xl font-black text-foreground mb-4">
                      Do you know where you stand?
                    </h2>
                    <p className="text-lg md:text-xl text-muted-foreground mb-8">
                      I can tell you in 2 minutes.
                    </p>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        size="lg"
                        onClick={() => setShowTallyForm(true)}
                        className="text-lg px-8 py-6 h-auto font-bold tracking-wide group"
                      >
                        <span>Check your HeraScore now!</span>
                        <motion.span
                          className="ml-2 inline-block"
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          🚀
                        </motion.span>
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}

          {/* Tally Form Embed */}
          {showTallyForm && !heraScoreResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="glass border-accent/30 overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 border-b border-border/50 flex items-center justify-between">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-accent" />
                      HeraScore Assessment
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowTallyForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                  
                  {/* Tally Form iframe */}
                  <div className="relative">
                    <iframe
                      src="https://tally.so/r/wAEyYk"
                      width="100%"
                      height="500"
                      frameBorder="0"
                      marginHeight={0}
                      marginWidth={0}
                      title="HeraScore Assessment Form"
                      className="w-full"
                    />
                    
                    {/* Overlay button to simulate form completion */}
                    <div className="p-4 border-t border-border/50">
                      <Button 
                        onClick={handleTallySubmit}
                        className="w-full"
                        disabled={isCalculating}
                      >
                        {isCalculating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Calculating your HeraScore...
                          </>
                        ) : (
                          "Submit & Calculate My Score"
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* HeraScore Results Card */}
          {heraScoreResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass border-accent/30 overflow-hidden">
                <CardContent className="p-8 md:p-12">
                  {/* Animated Score Display */}
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="inline-block"
                    >
                      <div className="relative w-40 h-40 mx-auto mb-6">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          {/* Background circle */}
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="hsl(var(--muted))"
                            strokeWidth="8"
                          />
                          {/* Animated progress circle */}
                          <motion.circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="hsl(var(--accent))"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${heraScoreResult.percentage * 2.83} 283`}
                            initial={{ strokeDasharray: "0 283" }}
                            animate={{ strokeDasharray: `${heraScoreResult.percentage * 2.83} 283` }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.span
                            className="text-4xl font-black text-foreground"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                          >
                            {heraScoreResult.percentage}%
                          </motion.span>
                        </div>
                      </div>
                    </motion.div>

                    <motion.h3
                      className="text-2xl md:text-3xl font-bold text-foreground mb-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      Your Estimated Acceptance Chance
                    </motion.h3>
                    
                    <motion.p
                      className="text-lg text-accent font-semibold"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                    >
                      {heraScoreResult.tier}
                    </motion.p>
                  </div>

                  {/* Locked Universities Section */}
                  <motion.div
                    className="relative rounded-xl overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background z-10" />
                    
                    <div className="p-6 bg-muted/30 rounded-xl blur-sm">
                      <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5" />
                        Your Matched Universities
                      </h4>
                      <ul className="space-y-2">
                        {heraScoreResult.universities.map((uni, i) => (
                          <li key={i} className="text-muted-foreground">
                            • {uni}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Lock Overlay */}
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Lock className="w-12 h-12 text-accent mb-4" />
                      </motion.div>
                      
                      <Button
                        size="lg"
                        onClick={onLoginRequired}
                        className="font-bold"
                      >
                        Log In to Unlock Your Matches
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      
                      <p className="text-sm text-muted-foreground mt-3">
                        + Get your Personalized Letter of Intent Draft
                      </p>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default HeraScoreSection;
