// src/config/nav.ts
// Single source of truth for the header menu AND the footer mega-menu.
export const EMPLOYER_DASHBOARD_URL = "https://dashboard.recruitlygroup.com";
export const APOSTILLE_SEWA_URL = "https://apostillesewa.com";

export interface NavLink { labelKey: string; path: string; external?: boolean }
export interface NavGroup { labelKey: string; links: NavLink[] }

export const NAV_GROUPS: NavGroup[] = [
  {
    labelKey: "nav.solutions",
    links: [
      { labelKey: "nav.permanent",   path: "/solutions/permanent-placement" },
      { labelKey: "nav.temporary",   path: "/solutions/temporary-placement" },
      { labelKey: "nav.training",    path: "/solutions/training" },
      { labelKey: "nav.diversity",   path: "/solutions/diversity-inclusion" },
      { labelKey: "nav.outsourcing", path: "/solutions/outsourcing" },
    ],
  },
  {
    labelKey: "nav.jobSeekers",
    links: [
      { labelKey: "nav.findJob",      path: "/jobs" },
      { labelKey: "nav.workingWith",  path: "/job-seekers/working-with-recruitly" },
      { labelKey: "nav.jobSeekerFaq", path: "/job-seekers/faq" },
    ],
  },
  {
    labelKey: "nav.employers",
    links: [
      { labelKey: "nav.advantage",   path: "/employers/advantage" },
      { labelKey: "nav.howWeWork",   path: "/employers/how-we-work" },
      { labelKey: "nav.sectors",     path: "/employers/industry-sectors" },
      { labelKey: "nav.hrSolutions", path: "/employers/recruitment-hr-solutions" },
      { labelKey: "nav.dashboard",   path: EMPLOYER_DASHBOARD_URL, external: true },
      { labelKey: "nav.contact",     path: "/contact" },
    ],
  },
  {
    labelKey: "nav.about",
    links: [
      { labelKey: "nav.findJob",     path: "/jobs" },
      { labelKey: "nav.whoWeAre",    path: "/about" },
      { labelKey: "nav.resources",   path: "/blog" },
      { labelKey: "nav.careers",     path: "/careers" },
      { labelKey: "nav.employerFaq", path: "/employers/faq" },
      { labelKey: "nav.investors",   path: "/investors" },
    ],
  },
];

// The three operational pillars (shown in the header strip, hero and footer)
export const PILLARS: NavLink[] = [
  { labelKey: "pillar.student",  path: "/student-recruitment" },
  { labelKey: "pillar.manpower", path: "/manpower-recruitment" },
  { labelKey: "pillar.intern",   path: "/intern-recruitment" },
];
