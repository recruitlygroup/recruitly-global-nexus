// src/config/nav.ts
// Single source of truth for the header mega-menu, mobile drawer AND footer.
// Paths follow the sitemap: lowercase-hyphenated, audience first, no trailing slash.
import {
  ClipboardList, Users, Building2, HelpCircle, Search, Handshake, Settings2, UserCheck, LayoutDashboard,
  UserSearch, MessageSquare, Info, Briefcase, MapPin, Newspaper, Mail, ShieldAlert, Calculator, TrendingDown, BarChart3,
  type LucideIcon,
} from "lucide-react";

export const EMPLOYER_DASHBOARD_URL = "https://dashboard.recruitlygroup.com";
export const APOSTILLE_SEWA_URL = "https://apostillesewa.com";

export interface NavItem { labelKey: string; descKey?: string; path: string; external?: boolean; icon?: LucideIcon }

// ── Items ────────────────────────────────────────────────────────────────────
const SEEKER_ITEMS: NavItem[] = [
  { labelKey: "nav.searchJobs",     descKey: "nav.searchJobs.d",     path: "/jobs",                        icon: Search },
  { labelKey: "nav.howToApply",     descKey: "nav.howToApply.d",     path: "/job-seekers/how-to-apply",    icon: ClipboardList },
  { labelKey: "nav.workingWithUs",  descKey: "nav.workingWithUs.d",  path: "/job-seekers/working-with-us", icon: Handshake },
  { labelKey: "nav.companies",      descKey: "nav.companies.d",      path: "/job-seekers/companies",       icon: Building2 },
  { labelKey: "nav.seekerFaq",      descKey: "nav.seekerFaq.d",      path: "/job-seekers/faq",             icon: HelpCircle },
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

// ── Audience switcher + header menus ─────────────────────────────────────────
export type AudienceId = "student" | "manpower" | "intern";

export interface Audience {
  id: AudienceId;
  /** Full label (existing pillar.* keys) and short label for narrow screens. */
  labelKey: string;
  shortKey: string;
  path: string;
  /** Path prefixes that belong to this audience (drives the active tab). */
  basePaths: string[];
}

export const AUDIENCES: Audience[] = [
  { id: "student",  labelKey: "pillar.student",  shortKey: "aud.student.s",  path: "/student-recruitment",  basePaths: ["/student-recruitment", "/study-abroad", "/universities", "/programs"] },
  { id: "manpower", labelKey: "pillar.manpower", shortKey: "aud.manpower.s", path: "/manpower-recruitment", basePaths: ["/manpower-recruitment", "/employers", "/why-recruitly", "/solutions", "/industries", "/roles", "/specializations", "/resources", "/career-center"] },
  { id: "intern",   labelKey: "pillar.intern",   shortKey: "aud.intern.s",   path: "/intern-recruitment",   basePaths: ["/intern-recruitment"] },
];

const matches = (pathname: string, bases: string[]) => bases.some((b) => pathname === b || pathname.startsWith(b + "/"));

/**
 * `active` = which audience tab is highlighted (null on the group homepage and neutral pages).
 * `menu`   = which navigation bar is shown under the switcher (employer menu is the default).
 */
export const audienceFromPath = (pathname: string): { active: AudienceId | null; menu: AudienceId } => {
  const hit = AUDIENCES.find((a) => matches(pathname, a.basePaths));
  return { active: hit?.id ?? null, menu: hit?.id ?? "manpower" };
};

export interface NavSection {
  id: string;
  labelKey: string;
  /** First item is the section overview ("Why Recruitly" → /why-recruitly). */
  items: NavItem[];
  basePaths: string[];
}

export type MenuEntry =
  | { type: "dropdown"; section: NavSection }
  | { type: "link"; item: NavItem };

export interface MenuDef {
  entries: MenuEntry[];
  faq: NavItem;
}

const WHY_SECTION: NavSection = {
  id: "why", labelKey: "menu.why", basePaths: ["/why-recruitly", "/employers/why-us", "/about", "/employers/jobs-for-refugees"],
  items: [
    { labelKey: "menu.why",       path: "/why-recruitly" },
    { labelKey: "menu.advantage", path: "/employers/why-us" },
    { labelKey: "menu.whoWeAre",  path: "/about" },
    { labelKey: "menu.refugees",  path: "/employers/jobs-for-refugees" },
  ],
};

const HOW_SECTION: NavSection = {
  id: "how", labelKey: "menu.how", basePaths: ["/employers/how-we-work", "/employers/small-business-support", "/employers/mvp", "/solutions/onsite-management", "/career-center", "/offices"],
  items: [
    { labelKey: "menu.how",           path: "/employers/how-we-work" },
    { labelKey: "menu.smallBiz",      path: "/employers/small-business-support" },
    { labelKey: "menu.mvp",           path: "/employers/mvp" },
    { labelKey: "menu.onsite",        path: "/solutions/onsite-management" },
    { labelKey: "menu.careerCenter",  path: "/career-center" },
    { labelKey: "menu.branches",      path: "/offices" },
  ],
};

const SOLUTIONS_SECTION: NavSection = {
  id: "solutions", labelKey: "menu.solutions", basePaths: ["/solutions"],
  items: [
    { labelKey: "menu.ourSolutions", path: "/solutions" },
    { labelKey: "menu.flexible",     path: "/solutions/temporary-staffing" },
    { labelKey: "menu.permanent",    path: "/solutions/permanent-recruitment" },
    { labelKey: "menu.diversity",    path: "/solutions/diversity-inclusion" },
    { labelKey: "menu.outsourcing",  path: "/solutions/outsourcing" },
    { labelKey: "menu.training",     path: "/solutions/training" },
  ],
};

const INDUSTRIES_SECTION: NavSection = {
  id: "industries", labelKey: "menu.industries", basePaths: ["/industries"],
  items: [
    { labelKey: "menu.ourIndustries", path: "/industries" },
    { labelKey: "menu.automotive",    path: "/industries/automotive" },
    { labelKey: "menu.aero",          path: "/industries/aeronautics-mobility" },
    { labelKey: "menu.catering",      path: "/industries/catering-hospitality" },
    { labelKey: "menu.construction",  path: "/industries/construction" },
    { labelKey: "menu.energy",        path: "/industries/energy" },
    { labelKey: "menu.finance",       path: "/industries/financial-institutions-consulting" },
    { labelKey: "menu.food",          path: "/industries/food-industry" },
  ],
};

export const RESOURCES_SECTION: NavSection = {
  id: "resources", labelKey: "menu.resources", basePaths: ["/resources"],
  items: [
    { labelKey: "menu.resources", path: "/resources" },
    ...RESOURCE_ITEMS,
  ],
};

/** Section pages rendered by <SectionHub/> (overview page of each dropdown). */
export const HUB_SECTIONS: Record<string, NavSection> = {
  why: WHY_SECTION,
  solutions: SOLUTIONS_SECTION,
  industries: INDUSTRIES_SECTION,
  resources: RESOURCES_SECTION,
};

export const MENUS: Record<AudienceId, MenuDef> = {
  // Employer navigation — shown under Manpower Recruitment (and on the homepage).
  manpower: {
    entries: [
      { type: "dropdown", section: WHY_SECTION },
      { type: "dropdown", section: HOW_SECTION },
      { type: "dropdown", section: SOLUTIONS_SECTION },
      { type: "dropdown", section: INDUSTRIES_SECTION },
    ],
    faq: { labelKey: "menu.faq", path: "/employers/faq" },
  },
  student: {
    entries: [
      { type: "link", item: { labelKey: "menu.universities", path: "/universities" } },
      { type: "link", item: { labelKey: "menu.programs",     path: "/programs" } },
      { type: "link", item: { labelKey: "menu.studyAbroad",  path: "/study-abroad" } },
      { type: "link", item: { labelKey: "menu.wiseScore",    path: "/student-recruitment#wisescore" } },
      { type: "link", item: { labelKey: "nav.blog",          path: "/blog" } },
    ],
    faq: { labelKey: "menu.faq", path: "/job-seekers/faq" },
  },
  intern: {
    entries: [
      { type: "link", item: { labelKey: "menu.internOverview", path: "/intern-recruitment" } },
      { type: "link", item: { labelKey: "menu.openRoles",      path: "/jobs" } },
      { type: "link", item: { labelKey: "menu.howToApply",     path: "/job-seekers/how-to-apply" } },
      { type: "link", item: { labelKey: "nav.blog",            path: "/blog" } },
    ],
    faq: { labelKey: "menu.faq", path: "/job-seekers/faq" },
  },
};

/** Right-hand header links (all audiences). Contact is rendered as the action button. */
export const HEADER_RESOURCES: NavItem = { labelKey: "menu.resources", path: "/resources" };
export const HEADER_CONTACT: NavItem = { labelKey: "menu.contact", path: "/contact" };

export const SOLUTION_ITEMS: NavItem[] = SOLUTIONS_SECTION.items.slice(1);
export const INDUSTRY_ITEMS: NavItem[] = INDUSTRIES_SECTION.items.slice(1);

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
  ...Object.values(MENUS).flatMap((m) => [
    ...m.entries.flatMap((e) => (e.type === "dropdown" ? e.section.items : [e.item])),
    m.faq,
  ]),
  ...RESOURCES_SECTION.items,
  HEADER_CONTACT,
  ...COMPANY_ITEMS,
  ...LEGAL_LINKS,
  { labelKey: "nav.investors", path: "/investors" },
];
/** Translation key for a known path (used by placeholder pages for their title). */
export const findNavLabelKey = (path: string): string | undefined =>
  FLAT.find((i) => !i.external && i.path === path)?.labelKey;
