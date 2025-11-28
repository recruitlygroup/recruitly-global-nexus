import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Check } from "lucide-react";
import { useState } from "react";
import BookingModal from "./BookingModal";

interface DivisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  division: {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    fullDescription: string;
    features: string[];
    image: string;
  } | null;
}

const DivisionModal = ({ isOpen, onClose, division }: DivisionModalProps) => {
  const [bookingOpen, setBookingOpen] = useState(false);

  if (!division) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-0 z-40 flex items-center justify-center p-4"
            >
              <div className="glass rounded-3xl p-8 md:p-12 max-w-5xl w-full max-h-[90vh] overflow-y-auto relative">
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors z-10"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                  {/* Left Column - Image */}
                  <div className="relative">
                    <motion.img
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      src={division.image}
                      alt={division.title}
                      className="w-full h-auto rounded-2xl"
                    />
                  </div>

                  {/* Right Column - Content */}
                  <div className="flex flex-col">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h2 className="text-4xl md:text-5xl font-medium tracking-wider mb-3 text-foreground">
                        {division.title}
                      </h2>
                      <p className="text-xl text-accent mb-6 font-light tracking-wide">
                        {division.subtitle}
                      </p>
                      <p className="text-muted-foreground font-light leading-relaxed mb-8">
                        {division.fullDescription}
                      </p>

                      <h3 className="text-xl font-medium tracking-wide mb-4 text-foreground">
                        Our Services
                      </h3>
                      <ul className="space-y-3 mb-8">
                        {division.features.map((feature, index) => (
                          <motion.li
                            key={index}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            className="flex items-start gap-3"
                          >
                            <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground font-light">
                              {feature}
                            </span>
                          </motion.li>
                        ))}
                      </ul>

                      <motion.button
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        onClick={() => setBookingOpen(true)}
                        className="group relative glass rounded-xl px-8 py-4 hover:scale-105 transition-all duration-300 glow-hover w-full"
                      >
                        <div className="flex items-center justify-center gap-3">
                          <Calendar className="w-5 h-5 text-accent" />
                          <span className="text-lg font-medium tracking-wide text-foreground">
                            Book Appointment
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                      </motion.button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        divisionName={division.title}
      />
    </>
  );
};

export default DivisionModal;
