import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface DivisionCardProps {
  title: string;
  subtitle: string;
  description: string;
  headline?: string;
  icon: LucideIcon;
  image: string;
  onClick: () => void;
  index: number;
}

const DivisionCard = ({
  title,
  subtitle,
  description,
  headline,
  icon: Icon,
  image,
  onClick,
  index,
}: DivisionCardProps) => {
  return (
    <motion.div
      onClick={onClick}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      className="relative flex flex-col p-6 overflow-hidden transition-all duration-500 cursor-pointer rounded-3xl aspect-square md:aspect-auto md:h-96 glass glow-hover group"
      whileHover={{ scale: 1.03, zIndex: 10 }}
    >
      {/* Pop-out Image Effect */}
      <motion.div
        className="absolute bottom-0 right-0 h-2/3 w-2/3 opacity-30 group-hover:opacity-100 transition-opacity duration-500"
        style={{ originX: 1, originY: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 10 }}
        whileHover={{ scale: 1.2, x: 20, y: 20 }}
      >
        <img
          src={image}
          alt={title}
          className="w-full h-full object-contain"
        />
      </motion.div>

      <div className="z-10 flex flex-col justify-between h-full">
        {/* Top Header */}
        <div>
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-4">
            <Icon className="w-6 h-6 text-accent" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 tracking-tight">
            {title}
          </h2>
          <p className="text-xs font-medium uppercase text-muted-foreground/70 tracking-wider mb-2">
            {subtitle}
          </p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {/* Bottom Call to Action */}
        <div className="mt-8">
          {headline && (
            <p className="text-lg font-semibold text-accent group-hover:text-foreground transition-colors duration-300 mb-2">
              {headline}
            </p>
          )}
          <div className="flex items-center text-sm text-muted-foreground group-hover:text-foreground transition-all duration-300">
            Explore <span className="ml-1 group-hover:translate-x-1 transition-transform inline-block">→</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DivisionCard;
