import { motion } from "framer-motion";
import { Play, Award, Globe, Users, TrendingUp } from "lucide-react";
import BubbleMenu from "./BubbleMenu";

const Hero = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative z-10">
      {/* Bubble Menu Navigation */}
      <BubbleMenu />
      {/* Main Hero Content */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-16 max-w-5xl"
      >
        <h1 className="text-6xl md:text-8xl font-light tracking-widest mb-6 text-foreground">
          RECRUITLY GLOBAL
        </h1>
        <p className="text-2xl md:text-3xl text-accent font-light tracking-wider mb-8">
          Estonia's Premier Gateway
        </p>
        <p className="text-lg md:text-xl text-muted-foreground font-light tracking-wide max-w-3xl mx-auto leading-relaxed">
          A comprehensive ecosystem of services designed to empower businesses and individuals 
          across education, recruitment, legal documentation, and travel solutions.
        </p>
      </motion.div>

      {/* Meet the Expert Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="max-w-4xl w-full mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-light tracking-wider mb-8 text-center text-foreground">
          Meet the Expert
        </h2>
        
        <a
          href="https://www.youtube.com"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block glass rounded-3xl overflow-hidden hover:scale-[1.02] transition-all duration-500 glow-hover"
        >
          {/* Video Thumbnail Placeholder */}
          <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
            {/* Portrait placeholder - replace with actual image */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
            
            {/* Play Button Overlay */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative z-10 w-20 h-20 md:w-24 md:h-24 rounded-full bg-destructive flex items-center justify-center shadow-2xl"
            >
              <Play className="w-10 h-10 md:w-12 md:h-12 text-white fill-white ml-1" />
            </motion.div>

            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
          </div>

          {/* Expert Info */}
          <div className="p-8 relative z-10">
            <h3 className="text-2xl md:text-3xl font-medium tracking-wide mb-2 text-foreground group-hover:text-accent transition-colors">
              Our Founder's Vision
            </h3>
            <p className="text-muted-foreground font-light tracking-wide">
              Discover how Recruitly Global is transforming the landscape of international services
            </p>
          </div>
        </a>
      </motion.div>

      {/* Key Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-6xl w-full mb-16"
      >
        {[
          { icon: Globe, label: "Global Reach", value: "50+ Countries" },
          { icon: Users, label: "Happy Clients", value: "10,000+" },
          { icon: Award, label: "Success Rate", value: "98%" },
          { icon: TrendingUp, label: "Years Experience", value: "15+" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 + index * 0.1 }}
            className="glass rounded-2xl p-6 text-center"
          >
            <stat.icon className="w-8 h-8 mx-auto mb-3 text-accent" />
            <div className="text-2xl md:text-3xl font-light tracking-wider mb-1 text-foreground">
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground font-light tracking-wide">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA to explore divisions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center"
      >
        <p className="text-muted-foreground font-light tracking-wide mb-4">
          Select your profile above to explore our services
        </p>
      </motion.div>

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
