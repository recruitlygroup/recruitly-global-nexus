import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  divisionName: string;
}

const BookingModal = ({ isOpen, onClose, divisionName }: BookingModalProps) => {
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
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="glass rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-3xl md:text-4xl font-medium tracking-wider mb-2 text-foreground">
                Book Appointment
              </h2>
              <p className="text-lg text-accent mb-8 font-light tracking-wide">
                {divisionName}
              </p>

              {/* Placeholder for calendar integration */}
              <div className="aspect-video rounded-xl bg-muted/20 border border-border flex items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground mb-2 font-light">
                    Calendar Integration
                  </p>
                  <p className="text-sm text-muted-foreground font-light">
                    Calendly/Booking System will be embedded here
                  </p>
                </div>
              </div>

              <div className="mt-8 p-6 glass rounded-xl">
                <h3 className="font-medium text-lg mb-3 text-foreground tracking-wide">
                  What to expect:
                </h3>
                <ul className="space-y-2 text-muted-foreground font-light">
                  <li>• Personalized consultation session</li>
                  <li>• Expert guidance from our team</li>
                  <li>• Tailored solutions for your needs</li>
                  <li>• Follow-up support included</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;
