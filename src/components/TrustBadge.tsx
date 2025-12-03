import { motion } from "framer-motion";
import { Shield, CheckCircle } from "lucide-react";

interface TrustBadgeProps {
  className?: string;
}

const TrustBadge = ({ className = "" }: TrustBadgeProps) => {
  return (
    <motion.div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.div
        initial={{ backgroundColor: "hsl(var(--muted))" }}
        animate={{ 
          backgroundColor: ["hsl(var(--muted))", "hsl(142 76% 36%)", "hsl(var(--muted))"]
        }}
        transition={{ duration: 2, times: [0, 0.3, 1] }}
        className="w-2 h-2 rounded-full"
      />
      <Shield className="w-4 h-4 text-accent" />
      <span className="text-sm font-medium text-foreground">Registered in Estonia</span>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
        transition={{ duration: 2, delay: 0.5 }}
      >
        <CheckCircle className="w-4 h-4 text-green-500" />
      </motion.div>
    </motion.div>
  );
};

export default TrustBadge;
