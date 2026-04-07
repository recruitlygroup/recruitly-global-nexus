import { motion } from "framer-motion";

const STATS = [
  { label: "EU Driver Vacancies", value: "400K+", icon: "🚛" },
  { label: "Caregiver Shortage", value: "1.2M", icon: "🏥" },
  { label: "Avg Fill Time", value: "4–6 wks", icon: "⏱️" },
  { label: "Retention Rate", value: "95%", icon: "✅" },
];

const ShortageStatsBar = () => {
  return (
    <section className="py-8 bg-muted/30 border-y border-border">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <span className="text-2xl">{stat.icon}</span>
              <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShortageStatsBar;
