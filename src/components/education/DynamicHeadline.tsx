import { motion, AnimatePresence } from "framer-motion";

interface DynamicHeadlineProps {
  userCountry?: string;
  destinationCountry?: string;
}

const DynamicHeadline = ({ userCountry, destinationCountry }: DynamicHeadlineProps) => {
  const getHeadline = () => {
    if (destinationCountry) {
      return `Your Personalized Roadmap to Studying in ${destinationCountry}`;
    }
    if (userCountry && userCountry !== 'Global') {
      return `Students from ${userCountry} Trust Us for Their Global Education Dreams`;
    }
    return "Transform Your Academic Aspirations Into Reality";
  };

  const getSubheadline = () => {
    if (destinationCountry) {
      return `Expert guidance for ${userCountry || 'international'} students seeking admission in ${destinationCountry}`;
    }
    return "Expert guidance from WiseScore assessment to visa approval";
  };

  return (
    <div className="text-center mb-8">
      <AnimatePresence mode="wait">
        <motion.h1
          key={getHeadline()}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tighter mb-4"
        >
          {getHeadline()}
        </motion.h1>
      </AnimatePresence>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto"
      >
        {getSubheadline()}
      </motion.p>
    </div>
  );
};

export default DynamicHeadline;
