// src/components/SiteFooter.tsx
// Premium UI upgrade: cleaner layout, better link hover states, YouTube added

import { Linkedin, Instagram, Mail, Phone, Youtube } from "lucide-react";
import recruitlyLogo from "@/assets/recruitly-logo.png";

const SERVICES = [
  { label: "Study Abroad",      href: "/educational-consultancy" },
  { label: "Hire Top Talent",   href: "/manpower-recruitment" },
  { label: "For Employers",     href: "/for-employers" },
  { label: "Apostille Services",href: "/apostille-services" },
  { label: "Tours & Travels",   href: "/tours-and-travels" },
];

const SOCIALS = [
  {
    href: "https://linkedin.com/in/recruitly-group-1095b13a2",
    label: "LinkedIn",
    icon: Linkedin,
    hoverClass: "hover:bg-blue-100 hover:text-blue-700",
  },
  {
    href: "https://instagram.com/recruitlygroup",
    label: "Instagram",
    icon: Instagram,
    hoverClass: "hover:bg-pink-100 hover:text-pink-600",
  },
  {
    href: "https://www.youtube.com/@recruitlygroup",
    label: "YouTube",
    icon: Youtube,
    hoverClass: "hover:bg-red-100 hover:text-red-600",
  },
];

const SiteFooter = () => (
  <footer className="bg-white border-t border-border mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

        {/* Brand — spans 5 columns */}
        <div className="md:col-span-5">
          <div className="flex items-center gap-2.5 mb-3">
            <img src={recruitlyLogo} alt="Recruitly Group" className="h-10 w-10 object-contain rounded-lg" />
            <span className="text-lg font-bold text-foreground">Recruitly Group</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-5">
            Global immigration consultancy & talent acquisition partner — Study Abroad,
            Work Visas, Hire Top Talent from South Asia & GCC, and Apostille Services.
          </p>
          <div className="flex gap-2">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Recruitly Group on ${s.label}`}
                className={`w-9 h-9 rounded-lg bg-muted flex items-center justify-center transition-colors ${s.hoverClass}`}
              >
                <s.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Services — spans 3 columns */}
        <div className="md:col-span-3">
          <h4 className="text-sm font-semibold text-foreground mb-3">Services</h4>
          <ul className="space-y-2">
            {SERVICES.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  className="text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact — spans 4 columns */}
        <div className="md:col-span-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">Contact</h4>
          <ul className="space-y-2.5">
            <li>
              <a
                href="mailto:info@recruitlygroup.com"
                className="flex items-start gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                info@recruitlygroup.com
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/9779743208282"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                <Phone className="w-4 h-4 flex-shrink-0" />
                +977 974 320 8282
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Divider + copyright */}
      <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Recruitly Group. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="/blog" className="hover:text-accent transition-colors">Blog</a>
          <a href="/jobs" className="hover:text-accent transition-colors">Jobs</a>
          <a href="/educational-consultancy" className="hover:text-accent transition-colors">Study Abroad</a>
        </div>
      </div>
    </div>
  </footer>
);

export default SiteFooter;
