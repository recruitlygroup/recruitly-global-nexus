import { motion } from "framer-motion";
import { Play, ChevronRight, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import BubbleMenu from "./BubbleMenu";

interface HeroProps {
  onExplore: () => void;
  onUserTypeSelect: (type: string) => void;
}

const Hero = ({ onExplore, onUserTypeSelect }: HeroProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative z-10">
      {/* Bubble Menu */}
      <BubbleMenu onUserTypeSelect={onUserTypeSelect} />
      {/* Main Hero Content */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-12 max-w-5xl"
      >
        <motion.h1 
          className="text-5xl sm:text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-foreground to-accent tracking-tighter leading-none mb-6"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Recruitly Global
        </motion.h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-light tracking-wide mb-8">
          Your unified gateway to international opportunities
        </p>
        <p className="text-base md:text-lg text-muted-foreground/80 font-light leading-relaxed max-w-2xl mx-auto mb-12">
          Connecting talent with opportunities worldwide. We help candidates find jobs, 
          study abroad, travel the world, and handle all legal documentation.
        </p>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button 
            size="lg" 
            onClick={onExplore}
            className="group text-lg px-8 py-6 h-auto"
          >
            Explore Our Services
            <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </motion.div>

      {/* Video Promo Block */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="max-w-5xl w-full mb-12"
      >
        <div className="glass rounded-3xl p-6 md:p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            {/* Text Content */}
            <div className="text-left w-full md:w-1/2">
              <h2 className="text-base font-medium text-muted-foreground mb-2">
                Message from the Founder
              </h2>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-snug mb-4">
                We are <span className="text-accent">Recruitly Global</span>, your unified gateway to the world.
              </p>
              <p className="text-muted-foreground/80 text-sm md:text-base">
                For over a decade, we've helped connect talent, certify futures, and guide adventures from our hub in Estonia.
              </p>
            </div>

            {/* Video Thumbnail */}
            <div className="relative w-full md:w-96 h-48 md:h-64 rounded-2xl overflow-hidden shadow-xl group cursor-pointer">
              <a 
                href="https://www.youtube.com"
                target="_blank" 
                rel="noopener noreferrer" 
                className="block w-full h-full"
              >
                <img
                  src="https://placehold.co/600x400/1e293b/a5b4fc?text=FOUNDER+MESSAGE"
                  alt="Founder of Recruitly Global"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                <motion.div
                  initial={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="absolute inset-0 flex items-center justify-center bg-background/30 transition-all duration-300 group-hover:bg-background/10"
                >
                  <Play className="w-12 h-12 md:w-16 md:h-16 text-destructive fill-destructive opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
                </motion.div>
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* WhatsApp Chat Button */}
      <motion.a
        href="https://wa.me/1234567890"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 left-8 z-50 flex items-center gap-3 glass rounded-full px-6 py-4 shadow-2xl glow-hover group"
      >
        <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center group-hover:scale-110 transition-transform">
          <MessageCircle className="w-6 h-6 text-white fill-white" />
        </div>
        <span className="text-foreground font-medium tracking-wide">
          Chat with me
        </span>
      </motion.a>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="fixed bottom-8 right-8 text-right"
      >
        <p className="text-sm text-muted-foreground font-light tracking-wide">
          Registered in Estonia
        </p>
        <div className="flex gap-4 justify-end mt-2">
          <a
            href="#"
            className="text-muted-foreground hover:text-accent transition-colors"
          >
            LinkedIn
          </a>
          <a
            href="#"
            className="text-muted-foreground hover:text-accent transition-colors"
          >
            Instagram
          </a>
        </div>
      </motion.footer>
    </div>
  );
};

export default Hero;
