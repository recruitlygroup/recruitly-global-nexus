import { motion } from "framer-motion";
import { Shield, CheckCircle, Linkedin, Instagram, Mail, Phone } from "lucide-react";

const SiteFooter = () => {
  return (
    <footer className="bg-card border-t border-border/50">
      {/* Trust Banner */}
      <div className="bg-gradient-to-r from-accent/10 via-primary/5 to-accent/10 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            {/* Estonia Registration Badge */}
            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-background border border-border shadow-lg">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
              />
              <Shield className="w-5 h-5 text-accent" />
              <span className="text-base font-semibold text-foreground">
                Registered in Estonia 🇪🇪
              </span>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
              >
                <CheckCircle className="w-5 h-5 text-green-500" />
              </motion.div>
            </div>

            {/* Trust Stats */}
            <div className="flex items-center gap-8 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">10+</p>
                <p className="text-sm text-muted-foreground">Years Experience</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div>
                <p className="text-2xl font-bold text-foreground">5000+</p>
                <p className="text-sm text-muted-foreground">Clients Served</p>
              </div>
              <div className="w-px h-10 bg-border hidden sm:block" />
              <div className="hidden sm:block">
                <p className="text-2xl font-bold text-foreground">50+</p>
                <p className="text-sm text-muted-foreground">Countries</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                <span className="text-lg font-black text-primary-foreground">RG</span>
              </div>
              <span className="text-xl font-bold text-foreground">Recruitly Global</span>
            </div>
            <p className="text-muted-foreground max-w-md mb-6">
              Your unified gateway to the world. Education, employment, documentation, and travel solutions under one roof.
            </p>
            <div className="flex gap-4">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-muted hover:bg-accent/20 flex items-center justify-center transition-colors"
              >
                <Linkedin className="w-5 h-5 text-muted-foreground hover:text-accent" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-muted hover:bg-accent/20 flex items-center justify-center transition-colors"
              >
                <Instagram className="w-5 h-5 text-muted-foreground hover:text-accent" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Services</h4>
            <ul className="space-y-3">
              <li>
                <a href="/educational-consultancy" className="text-muted-foreground hover:text-accent transition-colors">
                  Education Consultancy
                </a>
              </li>
              <li>
                <a href="/manpower-recruitment" className="text-muted-foreground hover:text-accent transition-colors">
                  Manpower Recruitment
                </a>
              </li>
              <li>
                <a href="/apostille-services" className="text-muted-foreground hover:text-accent transition-colors">
                  Apostille Services
                </a>
              </li>
              <li>
                <a href="/tours-and-travels" className="text-muted-foreground hover:text-accent transition-colors">
                  Tours & Travels
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <a href="mailto:info@recruitlyglobal.com" className="hover:text-accent transition-colors">
                  info@recruitlyglobal.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <a href="tel:+372123456" className="hover:text-accent transition-colors">
                  +372 123 456
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border/50 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Recruitly Global OÜ. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
