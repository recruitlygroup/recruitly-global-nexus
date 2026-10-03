// Scroll-triggered fade-in-up reveal. Thin wrapper around Framer Motion's
// whileInView so sections animate once as the user scrolls to them, not on mount.
// Keep motion crisp and purposeful: 300ms, small travel distance, fires once.
import { motion } from "framer-motion";

export const Reveal = ({
  children, delay = 0, className,
}: { children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 14 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.3, delay, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);
