import { motion } from "framer-motion";
import { ClipboardCheck, Users, FileStack, Plane, ArrowRight } from "lucide-react";

const ROADMAP_STEPS = [
  {
    number: 1,
    title: "Assessment",
    description: "Take the WiseScore test to discover your admission probability",
    icon: ClipboardCheck,
    color: "from-blue-500 to-cyan-500",
  },
  {
    number: 2,
    title: "Matching",
    description: "Get matched with universities that fit your profile perfectly",
    icon: Users,
    color: "from-violet-500 to-purple-500",
  },
  {
    number: 3,
    title: "Documents",
    description: "We guide you through every document and application step",
    icon: FileStack,
    color: "from-amber-500 to-orange-500",
  },
  {
    number: 4,
    title: "Visa",
    description: "Expert visa preparation with our 98% success rate track record",
    icon: Plane,
    color: "from-emerald-500 to-green-500",
  },
];

const WiseAdmitRoadmap = () => {
  return (
    <section className="py-16 md:py-24 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
          Your Journey to Studying Abroad
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A clear 4-step path from assessment to your study visa
        </p>
      </motion.div>

      {/* Desktop Horizontal / Mobile Vertical */}
      <div className="relative">
        {/* Connecting Line - Desktop */}
        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-muted via-accent/30 to-muted -translate-y-1/2 z-0" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 relative z-10">
          {ROADMAP_STEPS.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              {/* Mobile connecting line */}
              {index < ROADMAP_STEPS.length - 1 && (
                <div className="md:hidden absolute left-7 top-16 bottom-0 w-0.5 bg-gradient-to-b from-accent/50 to-muted h-full -mb-8" />
              )}

              {/* Step Card */}
              <div className="flex md:flex-col items-start md:items-center gap-4 md:gap-0">
                {/* Icon Circle */}
                <motion.div
                  className={`relative w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg flex-shrink-0`}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <step.icon className="w-7 h-7 md:w-10 md:h-10 text-white" />
                  
                  {/* Step number badge */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border-2 border-accent flex items-center justify-center">
                    <span className="text-xs font-bold text-accent">{step.number}</span>
                  </div>
                </motion.div>

                {/* Content */}
                <div className="flex-1 md:text-center md:mt-6">
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow for desktop */}
                {index < ROADMAP_STEPS.length - 1 && (
                  <div className="hidden md:flex absolute -right-2 top-10 z-20">
                    <ArrowRight className="w-4 h-4 text-accent" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WiseAdmitRoadmap;
