import { motion } from "framer-motion";
import { GraduationCap, Users, FileCheck, Plane, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const services = [
  {
    id: "wiseadmit",
    title: "WiseAdmit",
    subtitle: "Student Consultancy",
    description: "Your pathway to global education excellence. University applications, visa guidance, and career counseling.",
    icon: GraduationCap,
    path: "/educational-consultancy",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    id: "recruitly",
    title: "Recruitly",
    subtitle: "Find a Job",
    description: "Connect with opportunities that match your skills. Executive search, technical recruitment, and staffing solutions.",
    icon: Users,
    path: "/manpower-recruitment",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: "veridocs",
    title: "VeriDocs",
    subtitle: "Legal & Apostille",
    description: "Professional document authentication and legal services. Apostille, notarization, and embassy services.",
    icon: FileCheck,
    path: "/apostille-services",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    id: "odyssey",
    title: "Odyssey",
    subtitle: "Tours & Travels",
    description: "Curated travel experiences for unforgettable journeys. Custom itineraries, visa assistance, and 24/7 support.",
    icon: Plane,
    path: "/tours-and-travels",
    gradient: "from-rose-500 to-pink-600",
  },
];

const ServicesSection = () => {
  const navigate = useNavigate();

  return (
    <section id="services" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-4">
            Our Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose your path to success. We offer comprehensive solutions for education, employment, documentation, and travel.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              onClick={() => navigate(service.path)}
              className="group cursor-pointer"
            >
              <div className="relative h-full p-6 sm:p-8 rounded-2xl bg-card border border-border/50 hover:border-accent/30 transition-all duration-300 hover:shadow-xl overflow-hidden">
                {/* Background Gradient */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${service.gradient} opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-20`} />

                <div className="relative z-10 flex flex-col h-full">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-5 shadow-lg`}>
                    <service.icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {service.subtitle}
                    </p>
                    <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-accent transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {service.description}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-2 mt-6 text-accent font-medium">
                    <span>Learn More</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
