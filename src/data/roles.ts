// "Roles we consistently fill" — one entry per role card. Each card links to /roles/:slug (see RolePage).
// Titles, summaries and photo alt text live in src/i18n/messages/home.ts (role.<slug>.title / .sum, role.alt.<slug>).
import { PHOTOS } from "@/config/images";

export interface Role {
  slug: "nurses" | "drivers" | "hospitality" | "engineers" | "artisans";
  photo: string;
  /** Optional specialised programme (slug from pages/niche/nicheData.ts). */
  programme?: string;
  /** Related industry pages (paths from config/nav.ts). */
  industries: string[];
}

export const ROLES: Role[] = [
  { slug: "nurses",      photo: PHOTOS.nurses,      programme: "bsc-nurses-germany",       industries: [] },
  { slug: "drivers",     photo: PHOTOS.drivers,     programme: "heavy-drivers-eu",         industries: ["/industries/aeronautics-mobility"] },
  { slug: "hospitality", photo: PHOTOS.hospitality,                                        industries: ["/industries/catering-hospitality"] },
  { slug: "engineers",   photo: PHOTOS.engineers,                                          industries: ["/industries/automotive", "/industries/energy", "/industries/construction"] },
  { slug: "artisans",    photo: PHOTOS.artisans,    programme: "skilled-trades-australia", industries: ["/industries/construction"] },
];

export const findRole = (slug?: string) => ROLES.find((r) => r.slug === slug);
