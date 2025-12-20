import { motion } from "framer-motion";
import { Lock, ArrowRight, GraduationCap, MessageCircle, Mail, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface WiseScoreResult {
  percentage: number;
  tier: string;
  universities: string[];
}

interface WiseScoreResultProps {
  result: WiseScoreResult;
  onLoginRequired: () => void;
  onReset: () => void;
}

const WiseScoreResultComponent = ({ result, onLoginRequired, onReset }: WiseScoreResultProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <Card className="overflow-hidden border-0 bg-background/40 backdrop-blur-xl shadow-2xl">
        <CardContent className="p-8 md:p-12">
          {/* Animated Score Display */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="inline-block"
            >
              <div className="relative w-44 h-44 mx-auto mb-6">
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
                    stroke="url(#scoreGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${result.percentage * 2.83} 283`}
                    initial={{ strokeDasharray: "0 283" }}
                    animate={{ strokeDasharray: `${result.percentage * 2.83} 283` }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    transform="rotate(-90 50 50)"
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(var(--accent))" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    className="text-5xl font-black text-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    {result.percentage}%
                  </motion.span>
                  <span className="text-xs text-muted-foreground font-medium">WiseScore</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 mb-4">
                <Star className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold text-accent">{result.tier}</span>
              </div>
            </motion.div>

            <motion.h3
              className="text-2xl md:text-3xl font-bold text-foreground mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              Your Estimated Acceptance Chance
            </motion.h3>

            <motion.p
              className="text-muted-foreground max-w-lg mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              Based on your academic profile, you have a strong chance of admission to top universities!
            </motion.p>
          </div>

          {/* Locked Universities Section */}
          <motion.div
            className="relative rounded-2xl overflow-hidden mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background z-10" />

            <div className="p-6 bg-muted/30 rounded-2xl backdrop-blur-sm border border-border/30">
              <h4 className="font-bold text-foreground mb-4 flex items-center gap-2 blur-[2px]">
                <GraduationCap className="w-5 h-5" />
                Your Matched Universities
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
                className="font-bold shadow-lg"
              >
                Log In to Unlock Your Matches
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <p className="text-sm text-muted-foreground mt-3">
                + Get your Personalized Letter of Intent Draft
              </p>
            </div>
          </motion.div>

          {/* Contact Options */}
          <motion.div
            className="grid md:grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
          >
            <Card className="bg-background/50 backdrop-blur-sm border-border/30 hover:border-accent/30 transition-colors">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Chat on WhatsApp</p>
                  <p className="text-sm text-muted-foreground">Get instant guidance</p>
                </div>
                <Button variant="outline" size="sm">
                  Chat Now
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-background/50 backdrop-blur-sm border-border/30 hover:border-accent/30 transition-colors">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Email Us</p>
                  <p className="text-sm text-muted-foreground">Detailed consultation</p>
                </div>
                <Button variant="outline" size="sm">
                  Send Email
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Try Again */}
          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
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

export default WiseScoreResultComponent;
