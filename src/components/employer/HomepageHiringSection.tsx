import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HomepageHiringSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            European Employer? We Source Your Workforce.
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Pre-vetted truck drivers, caregivers, welders, and skilled trades from Nepal — 
            delivered visa-ready in 4–6 weeks. Germany, Bulgaria, Romania specialist.
          </p>
          <Button
            onClick={() => navigate("/for-employers")}
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Hire Workers Now <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default HomepageHiringSection;
