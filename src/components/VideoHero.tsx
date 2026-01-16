import { motion } from "framer-motion";
import { Play, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const VideoHero = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen flex items-center justify-center pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Video Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/2"
          >
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl group cursor-pointer bg-muted">
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-full"
              >
                {/* YouTube Embed Placeholder - Replace with actual video */}
                <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <img
                    src="https://placehold.co/800x450/1e293b/a5b4fc?text=FOUNDER+VIDEO"
                    alt="Founder of Recruitly Group"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Play Button Overlay */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-background/30 transition-all duration-300 group-hover:bg-background/10"
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div
                    className="w-20 h-20 rounded-full bg-accent/90 flex items-center justify-center shadow-xl"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="w-8 h-8 text-accent-foreground ml-1" fill="currentColor" />
                  </motion.div>
                </motion.div>
              </a>
            </div>
          </motion.div>

          {/* Content Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full lg:w-1/2 text-center lg:text-left"
          >
            <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              Message from the Founder
            </p>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground leading-tight mb-6">
              Empowering Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">
                Global Journey
              </span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0">
              For over a decade, we've helped connect talent, certify futures, and guide adventures from our hub in Estonia. Your success is our mission.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                onClick={() => navigate("/educational-consultancy")}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8"
              >
                Book Consultation
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="border-border hover:bg-muted/50"
              >
                Explore Services
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default VideoHero;
