// src/config/nav.ts
// Single source of truth for the header mega-menu, mobile drawer AND footer.
// Paths follow the sitemap: lowercase-hyphenated, audience first, no trailing slash.
import {
  Briefcase, ClipboardList, Users, Building2, HelpCircle, Search, ShieldAlert, Handshake,
  Layers, UserCheck, Settings2, MapPin, GraduationCap, HeartHandshake, Clock, Calendar, FileSignature,
  Factory, Truck, Cpu, Stethoscope, Landmark, ShoppingBag, UtensilsCrossed, HardHat, Cog, Car,
  Calculator, TrendingDown, BarChart3, Newspaper, Mail, Info, LayoutDashboard, UserSearch, MessageSquare,
  type LucideIcon,
} from "lucide-react";

export const EMPLOYER_DASHBOARD_URL = "https://dashboard.recruitlygroup.com";
export const APOSTILLE_SEWA_URL = "https://apostillesewa.com";

export interface NavItem { labelKey: string; descKey?: string; path: string; external?: boolean; icon?: LucideIcon }
export interface NavColumn { headingKey?: string; items: NavItem[] }
export interface NavFeature { titleKey: string; bodyKey: string; ctaKey: string; path: string; icon: LucideIcon }
export interface NavSection {
  id: string;
  labelKey: string;
  /** Path prefixes that mark this section as "current" */
  basePaths: string[];
  columns: NavColumn[];
  feature?: NavFeature;
}

// ── Items ────────────────────────────────────────────────────────────────────
const SEEKER_ITEMS: NavItem[] = [
  { labelKey: "nav.searchJobs",     descKey: "nav.searchJobs.d",     path: "/jobs",                        icon: Search },
  { labelKey: "nav.howToApply",     descKey: "nav.howToApply.d",     path: "/job-seekers/how-to-apply",    icon: ClipboardList },
  { labelKey: "nav.workingWithUs",  descKey: "nav.workingWithUs.d",  path: "/job-seekers/working-with-us", icon: Handshake },
  { labelKey: "nav.companies",      descKey: "nav.companies.d",      path: "/job-seekers/companies",       icon: Building2 },
  { labelKey: "nav.seekerFaq",      descKey: "nav.seekerFaq.d",      path: "/job-seekers/faq",             icon: HelpCircle },
];

const JOB_TYPE_ITEMS: NavItem[] = [
  { labelKey: "nav.type.temp",      path: "/jobs/type/temp",      icon: Clock },
  { labelKey: "nav.type.permanent", path: "/jobs/type/permanent", icon: Briefcase },
  { labelKey: "nav.type.contract",  path: "/jobs/type/contract",  icon: FileSignature },
  { labelKey: "nav.type.partTime",  path: "/jobs/type/part-time", icon: Calendar },
];

const EMPLOYER_ITEMS: NavItem[] = [
  { labelKey: "nav.whyUs",           descKey: "nav.whyUs.d",           path: "/employers/why-us",           icon: UserCheck },
  { labelKey: "nav.howWeWork",       descKey: "nav.howWeWork.d",       path: "/employers/how-we-work",      icon: Settings2 },
  { labelKey: "nav.candidateSearch", descKey: "nav.candidateSearch.d", path: "/employers/candidate-search", icon: UserSearch },
  { labelKey: "nav.requestTalent",   descKey: "nav.requestTalent.d",   path: "/employers/request-talent",   icon: MessageSquare },
];
const EMPLOYER_MORE: NavItem[] = [
  { labelKey: "nav.employerFaq", descKey: "nav.employerFaq.d", path: "/employers/faq", icon: HelpCircle },
  { labelKey: "nav.dashboard",   descKey: "nav.dashboard.d",   path: EMPLOYER_DASHBOARD_URL, external: true, icon: LayoutDashboard },
];

export const SOLUTION_ITEMS: NavItem[] = [
  { labelKey: "nav.tempStaffing",  descKey: "nav.tempStaffing.d",  path: "/solutions/temporary-staffing",     icon: Clock },
  { labelKey: "nav.permRecruit",   descKey: "nav.permRecruit.d",   path: "/solutions/permanent-recruitment",  icon: UserCheck },
  { labelKey: "nav.managed",       descKey: "nav.managed.d",       path: "/solutions/managed-services",       icon: Layers },
  { labelKey: "nav.outsourcing",   descKey: "nav.outsourcing.d",   path: "/solutions/outsourcing",            icon: Users },
  { labelKey: "nav.onsite",        descKey: "nav.onsite.d",        path: "/solutions/onsite-management",      icon: MapPin },
  { labelKey: "nav.training",      descKey: "nav.training.d",      path: "/solutions/training",               icon: GraduationCap },
  { labelKey: "nav.diversity",     descKey: "nav.diversity.d",     path: "/solutions/diversity-inclusion",    icon: HeartHandshake },
];

export const INDUSTRY_ITEMS: NavItem[] = [
  { labelKey: "ind.manufacturing", path: "/industries/manufacturing", icon: Factory },
  { labelKey: "ind.logistics",     path: "/industries/logistics",     icon: Truck },
  { labelKey: "ind.technology",    path: "/industries/technology",    icon: Cpu },
  { labelKey: "ind.healthcare",    path: "/industries/healthcare",    icon: Stethoscope },
  { labelKey: "ind.finance",       path: "/industries/finance",       icon: Landmark },
  { labelKey: "ind.retail",        path: "/industries/retail",        icon: ShoppingBag },
  { labelKey: "ind.hospitality",   path: "/industries/hospitality",   icon: UtensilsCrossed },
  { labelKey: "ind.construction",  path: "/industries/construction",  icon: HardHat },
  { labelKey: "ind.engineering",   path: "/industries/engineering",   icon: Cog },
  { labelKey: "ind.automotive",    path: "/industries/automotive",    icon: Car },
];

const COMPANY_ITEMS: NavItem[] = [
  { labelKey: "nav.aboutUs",  descKey: "nav.aboutUs.d",  path: "/about",             icon: Info },
  { labelKey: "nav.careers",  descKey: "nav.careers.d",  path: "/careers",           icon: Briefcase },
  { labelKey: "nav.offices",  descKey: "nav.offices.d",  path: "/offices",           icon: MapPin },
  { labelKey: "nav.blog",     descKey: "nav.blog.d",     path: "/blog",              icon: Newspaper },
  { labelKey: "nav.contact",  descKey: "nav.contact.d",  path: "/contact",           icon: Mail },
  { labelKey: "nav.security", descKey: "nav.security.d", path: "/security-and-scams", icon: ShieldAlert },
];
const RESOURCE_ITEMS: NavItem[] = [
  { labelKey: "nav.salaryCalc",   descKey: "nav.salaryCalc.d",   path: "/resources/salary-calculator", icon: Calculator },
  { labelKey: "nav.turnover",     descKey: "nav.turnover.d",     path: "/resources/cost-of-turnover",  icon: TrendingDown },
  { labelKey: "nav.marketReport", descKey: "nav.marketReport.d", path: "/resources/market-report",     icon: BarChart3 },
];

// ── Header / drawer structure ────────────────────────────────────────────────
export const NAV: NavSection[] = [
  {
    id: "job-seekers", labelKey: "nav.jobSeekers", basePaths: ["/job-seekers", "/jobs"],
    columns: [
      { headingKey: "mm.explore", items: SEEKER_ITEMS },
      { headingKey: "mm.byType",  items: JOB_TYPE_ITEMS },
    ],
    feature: { titleKey: "mm.safe.title", bodyKey: "mm.safe.body", ctaKey: "mm.safe.cta", path: "/security-and-scams", icon: ShieldAlert },
  },
  {
    id: "employers", labelKey: "nav.employers", basePaths: ["/employers"],
    columns: [
      { headingKey: "mm.hire", items: EMPLOYER_ITEMS },
      { headingKey: "mm.more", items: EMPLOYER_MORE },
    ],
    feature: { titleKey: "mm.talk.title", bodyKey: "mm.talk.body", ctaKey: "mm.talk.cta", path: "/employers/request-talent", icon: MessageSquare },
  },
  {
    id: "solutions", labelKey: "nav.solutions", basePaths: ["/solutions"],
    columns: [
      { items: SOLUTION_ITEMS.slice(0, 4) },
      { items: SOLUTION_ITEMS.slice(4) },
    ],
  },
  {
    id: "industries", labelKey: "nav.industries", basePaths: ["/industries"],
    columns: [
      { items: INDUSTRY_ITEMS.slice(0, 5) },
      { items: INDUSTRY_ITEMS.slice(5) },
    ],
    feature: { titleKey: "mm.sector.title", bodyKey: "mm.sector.body", ctaKey: "mm.sector.cta", path: "/contact", icon: Layers },
  },
  {
    id: "about", labelKey: "nav.about",
    basePaths: ["/about", "/careers", "/offices", "/blog", "/contact", "/resources", "/security-and-scams", "/investors"],
    columns: [
      { headingKey: "mm.company",   items: COMPANY_ITEMS },
      { headingKey: "mm.resources", items: RESOURCE_ITEMS },
    ],
  },
];

// ── Footer ───────────────────────────────────────────────────────────────────
export interface FooterColumn { headingKey: string; items: NavItem[]; twoCol?: boolean }
export const FOOTER_COLUMNS: FooterColumn[] = [
  { headingKey: "footer.candidates", items: [
      SEEKER_ITEMS[0], SEEKER_ITEMS[1], SEEKER_ITEMS[2], SEEKER_ITEMS[3], SEEKER_ITEMS[4],
      { labelKey: "nav.security", path: "/security-and-scams" },
  ] },
  { headingKey: "footer.employers", items: [
      ...EMPLOYER_ITEMS, EMPLOYER_MORE[0],
      { labelKey: "nav.dashboard", path: EMPLOYER_DASHBOARD_URL, external: true },
  ] },
  { headingKey: "footer.industries", items: INDUSTRY_ITEMS, twoCol: true },
  { headingKey: "footer.company", items: [
      COMPANY_ITEMS[0], COMPANY_ITEMS[1], COMPANY_ITEMS[2], COMPANY_ITEMS[3], COMPANY_ITEMS[4],
      { labelKey: "nav.investors", path: "/investors" },
      ...RESOURCE_ITEMS,
  ] },
];
export const FOOTER_SOLUTIONS = SOLUTION_ITEMS;

export const LEGAL_LINKS: NavItem[] = [
  { labelKey: "legal.terms",            path: "/terms" },
  { labelKey: "legal.privacy",          path: "/privacy" },
  { labelKey: "legal.cookies",          path: "/cookies" },
  { labelKey: "legal.candidatePrivacy", path: "/candidate-privacy" },
  { labelKey: "legal.eoe",              path: "/equal-opportunity" },
];

// The three existing operational programmes (kept; shown in the footer)
export const PILLARS: NavItem[] = [
  { labelKey: "pillar.student",  path: "/student-recruitment" },
  { labelKey: "pillar.manpower", path: "/manpower-recruitment" },
  { labelKey: "pillar.intern",   path: "/intern-recruitment" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const FLAT: NavItem[] = [
  ...NAV.flatMap((s) => s.columns.flatMap((c) => c.items)),
  ...LEGAL_LINKS,
  { labelKey: "nav.investors", path: "/investors" },
];
/** Translation key for a known path (used by placeholder pages for their title). */
export const findNavLabelKey = (path: string): string | undefined =>
  FLAT.find((i) => !i.external && i.path === path)?.labelKey;
