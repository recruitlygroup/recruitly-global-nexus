import { motion } from "framer-motion";
import { Shield, MapPin, Award, Users, CheckCircle2, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const STATS = [
  { value: "5,000+", label: "Candidates Placed", icon: Users },
  { value: "98%", label: "Visa Success Rate", icon: Award },
  { value: "15+", label: "Destination Countries", icon: Globe },
  { value: "10+", label: "Years Experience", icon: Shield },
];

const OFFICES = [
  { city: "Kathmandu, Nepal", role: "Head Office", flag: "🇳🇵" },
  { city: "Dubai, UAE", role: "Regional Office", flag: "🇦🇪" },
];

const TrustAndCredibility = () => {
  return (
    <section className="py-14 bg-muted/30 relative z-10">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Trusted Recruitment Partner
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Licensed, experienced, and trusted by thousands of candidates and employers worldwide
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="text-center border-border/50 hover:border-accent/30 transition-colors">
                <CardContent className="p-5">
                  <stat.icon className="w-8 h-8 text-accent mx-auto mb-2" />
                  <p className="text-2xl sm:text-3xl font-black text-foreground">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Offices & Credentials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Office Locations */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="h-full">
              <CardContent className="p-6">
                <h3 className="font-bold text-foreground text-lg mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-accent" />
                  Our Offices
                </h3>
                <div className="space-y-4">
                  {OFFICES.map((office) => (
                    <div key={office.city} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <span className="text-2xl">{office.flag}</span>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{office.city}</p>
                        <p className="text-xs text-muted-foreground">{office.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Credentials */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="h-full">
              <CardContent className="p-6">
                <h3 className="font-bold text-foreground text-lg mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent" />
                  Why Trust Us
                </h3>
                <ul className="space-y-3">
                  {[
                    "Licensed manpower recruitment agency",
                    "Verified employer partnerships across EU & GCC",
                    "Transparent fee structure — no hidden costs",
                    "Full documentation and visa assistance",
                    "Post-deployment candidate support",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TrustAndCredibility;
