// Industry landing pages (/industries/:industry). Wording says what we recruit for, not placement volumes.
import type { IconName } from "@/components/blocks/icons";

export interface Industry {
  slug: string; title: string; icon: IconName; lead: string;
  roles: { title: string; body: string; icon: IconName }[];
  roleLinks: { label: string; to: string }[];
  journey: string[];
  note?: string;
}

export const INDUSTRIES: Industry[] = [
  { slug: "automotive", title: "Automotive", icon: "wrench", lead: "Technicians and production teams for vehicle plants, suppliers and workshops.",
    roles: [
      { title: "Production operators", body: "Assembly and line workers for manufacturing sites.", icon: "factory" },
      { title: "Mechanics and technicians", body: "Service and repair specialists.", icon: "wrench" },
      { title: "Welders and fabricators", body: "Skilled metalwork for components and frames.", icon: "zap" },
    ],
    roleLinks: [{ label: "Engineers", to: "/roles/engineers" }, { label: "Artisans", to: "/roles/artisans" }],
    journey: ["Brief", "Trade test or video demo", "Interview", "Documents", "Arrival"] },
  { slug: "aeronautics-mobility", title: "Aeronautics and Mobility", icon: "plane", lead: "Drivers, logistics teams and technical staff for transport and mobility operators.",
    roles: [
      { title: "C and CE licence drivers", body: "Truck drivers for transport and logistics firms.", icon: "truck" },
      { title: "Warehouse and logistics staff", body: "Teams for distribution and handling.", icon: "layers" },
      { title: "Technical support staff", body: "Maintenance and technical assistants, on request.", icon: "wrench" },
    ],
    roleLinks: [{ label: "Drivers", to: "/roles/drivers" }, { label: "Heavy drivers programme", to: "/specializations/heavy-drivers-eu" }],
    journey: ["Brief", "Licence check", "Driving assessment", "Documents", "Arrival"] },
  { slug: "catering-hospitality", title: "Catering and Hospitality", icon: "utensils", lead: "Hotel, restaurant and catering staff for seasonal and permanent positions.",
    roles: [
      { title: "Cooks and kitchen staff", body: "Commis chefs, cooks and kitchen assistants.", icon: "utensils" },
      { title: "Front of house", body: "Waiters, bartenders and reception staff.", icon: "users" },
      { title: "Housekeeping", body: "Room attendants and cleaning teams.", icon: "home" },
    ],
    roleLinks: [{ label: "Hospitality", to: "/roles/hospitality" }, { label: "Hospitality labour crisis", to: "/blog/hospitality-labor-crisis-eu-nz" }],
    journey: ["Brief", "Screening", "Video demo", "Interview", "Arrival"] },
  { slug: "construction", title: "Construction", icon: "hardhat", lead: "Certified trades and site teams for building and infrastructure projects.",
    roles: [
      { title: "Carpenters", body: "Certified carpenters for residential and commercial work.", icon: "hardhat" },
      { title: "Welders", body: "Structural and general welders.", icon: "zap" },
      { title: "General trades", body: "Masons, electricians and plumbers where required.", icon: "wrench" },
    ],
    roleLinks: [{ label: "Artisans", to: "/roles/artisans" }, { label: "Skilled trades for Australia", to: "/specializations/skilled-trades-australia" }, { label: "Trades labour deficit", to: "/blog/construction-trades-labor-deficit-europe-new-zealand" }],
    journey: ["Brief", "Trade certificate check", "Video demo", "Documents", "Arrival"] },
  { slug: "energy", title: "Energy", icon: "zap", lead: "Electricians, technicians and engineers for energy and utilities projects.",
    roles: [
      { title: "Electricians", body: "Installation and maintenance.", icon: "zap" },
      { title: "Technicians", body: "Plant and field technicians.", icon: "wrench" },
      { title: "Engineers", body: "Project and site engineers.", icon: "gauge" },
    ],
    roleLinks: [{ label: "Engineers", to: "/roles/engineers" }],
    journey: ["Brief", "Credential check", "Interview", "Documents", "Arrival"] },
  { slug: "financial-institutions-consulting", title: "Financial Institutions and Consulting", icon: "briefcase", lead: "Office, support and professional staff for finance and advisory firms, sourced on request.",
    roles: [
      { title: "Back-office and operations", body: "Administrative and processing teams.", icon: "list" },
      { title: "Customer support", body: "Multilingual support staff.", icon: "support" },
      { title: "Analysts and junior consultants", body: "Graduate talent, including interns.", icon: "chart" },
    ],
    roleLinks: [{ label: "Intern recruitment", to: "/intern-recruitment" }],
    journey: ["Brief", "CV and degree check", "Interviews", "Documents", "Start"],
    note: "Professional roles are sourced to order. Share your brief and we will confirm what we can supply." },
  { slug: "food-industry", title: "Food Industry", icon: "milk", lead: "Dairy, agriculture and food-processing workers, many trained through our Rubisco Tech partnership.",
    roles: [
      { title: "Dairy workers", body: "Herd care, milking and dairy handling, trained to CTEVT-certified standards.", icon: "milk" },
      { title: "Agricultural technicians", body: "Modern farming equipment and practices.", icon: "wheat" },
      { title: "Food-processing and warehouse staff", body: "Production-line and storage teams.", icon: "factory" },
    ],
    roleLinks: [{ label: "Training with Rubisco Tech", to: "/solutions/training" }, { label: "Warehouse jobs in Slovenia", to: "/blog/warehouse-jobs-slovenia-nepal" }],
    journey: ["Brief", "CTEVT training", "Skill assessment", "Documents", "Arrival"] },
];

export const findIndustry = (slug?: string) => INDUSTRIES.find((i) => i.slug === slug);
