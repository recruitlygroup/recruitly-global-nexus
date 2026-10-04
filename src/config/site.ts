// src/config/site.ts — single source of truth for brand + contact details.
// Contact details are unchanged from the existing site.
export const SITE = {
  name: "Recruitly Group",
  tagline: "Connecting talent with opportunity, worldwide.",
  domain: "recruitlygroup.com",
  url: "https://www.recruitlygroup.com",
  email: "info@recruitlygroup.com",
  phoneDisplay: "+977 974 320 8282",
  whatsappUrl: "https://wa.me/9779743208282",
  languages: ["en", "bg"] as const,
  socials: [
    { label: "LinkedIn",  href: "https://linkedin.com/in/recruitly-group-1095b13a2" },
    { label: "Instagram", href: "https://instagram.com/recruitlygroup" },
    { label: "YouTube",   href: "https://www.youtube.com/@recruitlygroup" },
  ],
} as const;
