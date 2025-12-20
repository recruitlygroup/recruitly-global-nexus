import { motion } from "framer-motion";
import { GraduationCap, UserCheck, FileCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const TRUST_ITEMS = [
  {
    title: "Academic Assessment",
    description: "We analyze your GPA, test scores, and academic background to match you with universities where you'll thrive.",
    icon: GraduationCap,
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-400",
  },
  {
    title: "Profile Evaluation",
    description: "Extracurriculars, work experience, and personal strengths are evaluated for a holistic university match.",
    icon: UserCheck,
    gradient: "from-violet-500/20 to-purple-500/20",
    iconColor: "text-violet-400",
  },
  {
    title: "Visa Readiness",
    description: "Financial capacity, documentation strength, and visa interview readiness are assessed for success.",
    icon: FileCheck,
    gradient: "from-emerald-500/20 to-green-500/20",
    iconColor: "text-emerald-400",
  },
];

const TrustGrid = () => {
  return (
    <section className="py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
          What WiseScore Evaluates
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Our AI analyzes three critical dimensions to give you an accurate admission probability
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {TRUST_ITEMS.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 }}
          >
            <Card className="h-full border-0 bg-background/40 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden">
              <CardContent className="p-6 relative">
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-50 group-hover:opacity-70 transition-opacity`} />
                
                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 backdrop-blur-sm bg-background/30" />

                <div className="relative z-10">
                  <motion.div
                    className={`w-14 h-14 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 flex items-center justify-center mb-4 ${item.iconColor}`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <item.icon className="w-7 h-7" />
                  </motion.div>

                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {item.title}
                  </h3>

                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default TrustGrid;
