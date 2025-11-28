import { motion, AnimatePresence } from "framer-motion";
import { Building2, User, X } from "lucide-react";

interface GatewayProps {
  onSelect: (type: "b2b" | "individual") => void;
  isOpen: boolean;
  onClose: () => void;
}

const Gateway = ({ onSelect, isOpen, onClose }: GatewayProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none"
          >
            <div className="glass rounded-3xl p-8 md:p-12 max-w-4xl w-full pointer-events-auto relative shadow-2xl">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl font-light tracking-widest mb-4 text-foreground"
        >
          WHO ARE YOU?
        </motion.h1>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl text-muted-foreground mb-16 font-light tracking-wider"
        >
          Select your profile to continue
        </motion.p>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          <motion.button
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
            onClick={() => onSelect("b2b")}
            className="group relative glass rounded-2xl p-12 hover:scale-105 transition-all duration-500 glow-hover overflow-hidden"
          >
            <div className="relative z-10">
              <Building2 className="w-16 h-16 mx-auto mb-6 text-accent" />
              <h2 className="text-3xl md:text-4xl font-medium tracking-wider mb-3 text-foreground">
                I am a Company
              </h2>
              <p className="text-muted-foreground font-light tracking-wide">
                Business / B2B Solutions
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </motion.button>

          <motion.button
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
            onClick={() => onSelect("individual")}
            className="group relative glass rounded-2xl p-12 hover:scale-105 transition-all duration-500 glow-hover overflow-hidden"
          >
            <div className="relative z-10">
              <User className="w-16 h-16 mx-auto mb-6 text-accent" />
              <h2 className="text-3xl md:text-4xl font-medium tracking-wider mb-3 text-foreground">
                I am an Individual
              </h2>
              <p className="text-muted-foreground font-light tracking-wide">
                Personal Services
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Gateway;
