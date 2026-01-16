import { motion } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const EndOfPostCTA = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-accent/5 border border-accent/20 rounded-2xl p-8 text-center"
    >
      <div className="inline-flex items-center justify-center w-14 h-14 bg-accent/10 rounded-full mb-4">
        <Mail className="w-7 h-7 text-accent" />
      </div>
      
      <h3 className="text-xl font-bold text-foreground mb-3">
        Enjoyed this article?
      </h3>
      
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Get expert insights on global careers, education abroad, and immigration guidance 
        delivered straight to your inbox.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={() => navigate("/")}
          className="group"
        >
          Get Free Consultation
          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
        
        <Button
          variant="outline"
          onClick={() => navigate("/blog")}
        >
          Browse More Articles
        </Button>
      </div>
    </motion.div>
  );
};

export default EndOfPostCTA;
