// Company pages: about, careers, investors.
import type { PageSpec } from "@/components/blocks/spec";
import { SITE } from "@/config/site";
import { APOSTILLE_SEWA, RUBISCO } from "./seekers";

/** PLACEHOLDER figures — replace with verified numbers before relying on them publicly. Used on About and Advantage. */
export const PLACEHOLDER_STATS = [
  { value: "1,200+", label: "Candidates supported through placement" },
  { value: "300+", label: "Employer partners and enquiries" },
  { value: "15+", label: "Destination countries" },
  { value: "96%", label: "Document attestation success rate" },
];

export const COMPANY_PAGES: Record<string, PageSpec> = {
  about: {
    seo: { title: "Who We Are | Recruitly Group", description: "Recruitly Group is an officially registered recruitment agency in Sofia, Bulgaria, connecting employers, students and skilled workers across the EU, Nepal and South Asia." },
    hero: {
      eyebrow: "Why Recruitly", title: "Who we are",
      lead: "An officially registered recruitment agency in Sofia, Bulgaria, connecting employers, students and skilled workers across the EU, Nepal and South Asia.",
      primary: { label: "Browse openings", to: "/jobs" }, secondary: { label: "Hire talent", to: "/manpower-recruitment" },
      journey: { title: "One group, three audiences", steps: ["Students: admissions", "Manpower: skilled workers", "Interns: trained placements", "Global mobility: documents and training"] },
    },
    stats: PLACEHOLDER_STATS,
    intro: {
      title: "Recruitment that is legal, transparent and complete",
      paragraphs: [
        "Recruitly Group connects people with opportunities across borders. We recruit skilled workers for European employers, guide students to universities, and place trained interns.",
        "International hiring fails when skills are unproven or documents are incomplete. So we built the whole journey around us: training with Rubisco Tech, document attestation with Apostille Sewa, and a clear process from brief to arrival.",
      ],
      aside: { title: "What we stand for", items: ["Legal and compliant sourcing", "No placement fee for workers", "Complete files and video demonstrations", "Honest communication at every stage"] },
    },
    features: { title: "What we do", cols: 3, items: [
      { icon: "graduation", title: "Student recruitment", body: "Admission guidance, university matching and eligibility scoring with WiseScore." },
      { icon: "users", title: "Manpower recruitment", body: "Nurses, drivers, hospitality staff, engineers and artisans for employers." },
      { icon: "briefcase", title: "Intern recruitment", body: "Trained hospitality and engineering interns for global employers." },
      { icon: "stamp", title: "Document attestation", body: "Ward, MOFA and embassy legalisation with Apostille Sewa." },
      { icon: "award", title: "Training and certification", body: "CTEVT-certified courses with Rubisco Tech." },
      { icon: "globe", title: "Global mobility", body: "Visa, travel and onboarding support." },
    ] },
    partners: { title: "Our strategic partners", items: [APOSTILLE_SEWA, RUBISCO] },
    related: { title: "Learn more", items: [
      { label: "How we work", to: "/employers/how-we-work" }, { label: "Our offices", to: "/offices" },
      { label: "Careers", to: "/careers" }, { label: "Contact", to: "/contact" },
    ] },
  },

  careers: {
    seo: { title: "Careers at Recruitly | Recruitly Group", description: "Join the Recruitly team. Send your CV and tell us how you would like to contribute." },
    hero: { eyebrow: "Company", title: "Build global careers with us", lead: "We are always interested in recruiters, coordinators and specialists who care about fair, well-run international hiring.", primary: { label: "Send your CV", href: `mailto:${SITE.email}?subject=Career%20enquiry` }, secondary: { label: "About us", to: "/about" } },
    features: { title: "Why join Recruitly", cols: 3, items: [
      { icon: "globe", title: "Work across borders", body: "Collaborate with colleagues, partners and clients in several countries." },
      { icon: "heart", title: "Work that matters", body: "Help people reach better jobs and employers fill vital roles." },
      { icon: "rocket", title: "Room to grow", body: "A growing group with new programmes and partnerships." },
    ] },
    timeline: { title: "How to apply", steps: [
      { title: "Email your CV", body: "Send it to info@recruitlygroup.com with the subject “Career enquiry”." },
      { title: "Tell us how you would contribute", body: "A short note about the role you imagine and what you bring." },
      { title: "Conversation", body: "If there is a fit, we arrange a call with the team." },
    ] },
    closing: { title: "Looking for a job abroad instead?", body: "Our jobs page lists current openings for candidates.", primary: { label: "Browse openings", to: "/jobs" } },
  },

  investors: {
    seo: { title: "Investors | Recruitly Group", description: "For investor and partnership enquiries, contact Recruitly Group." },
    hero: { eyebrow: "Company", title: "Partnering with Recruitly Group", lead: "We welcome conversations with investors and strategic partners who share our commitment to fair, compliant global mobility.", primary: { label: "Email us", href: `mailto:${SITE.email}?subject=Investor%20enquiry` }, secondary: { label: "About us", to: "/about" } },
    features: { title: "Our foundations", cols: 3, items: [
      { icon: "shield", title: "Registered and compliant", body: "An officially registered recruitment agency in Sofia, Bulgaria." },
      { icon: "layers", title: "Integrated model", body: "Recruitment, training and document services working together." },
      { icon: "handshake", title: "Strategic partnerships", body: "Apostille Sewa and Rubisco Tech in Nepal." },
    ] },
    closing: { title: "Start a conversation", body: "Tell us about your interest and a member of the leadership team will respond.", primary: { label: "Email us", href: `mailto:${SITE.email}?subject=Investor%20enquiry` } },
  },
};
