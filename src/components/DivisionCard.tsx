import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface DivisionCardProps {
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  image: string;
  onClick: () => void;
  index: number;
}

const DivisionCard = ({
  title,
  subtitle,
  description,
  icon: Icon,
  image,
  onClick,
  index,
}: DivisionCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, type: "spring", stiffness: 80 }}
      onClick={onClick}
      className="group relative glass rounded-3xl p-8 md:p-10 cursor-pointer hover:scale-105 transition-all duration-500 glow-hover overflow-hidden"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Icon */}
      <div className="relative z-10 mb-6">
        <Icon className="w-12 h-12 text-accent" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-3xl md:text-4xl font-medium tracking-wider mb-2 text-foreground">
          {title}
        </h3>
        <p className="text-lg text-accent font-light tracking-wide mb-4">
          {subtitle}
        </p>
        <p className="text-muted-foreground font-light leading-relaxed">
          {description}
        </p>
      </div>

      {/* Image with parallax effect */}
      <motion.div
        className="absolute bottom-0 right-0 w-48 h-48 md:w-64 md:h-64 opacity-20 group-hover:opacity-40 transition-opacity duration-500"
        whileHover={{ scale: 1.2, x: 10, y: -10 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <img
          src={image}
          alt={title}
          className="w-full h-full object-contain mix-blend-luminosity"
        />
      </motion.div>
    </motion.div>
  );
};

export default DivisionCard;
