// Content generator for /cee/colleges/:slug pages. Used by BOTH the React page and the static prerender script, so the two
// can never drift apart. Only facts we hold are used: MEC 2083/84 seat allocation, MEC fee ceilings, government/private type.
import { NEPAL_COLLEGES, type NepalCollege } from "@/data/nepalColleges";
import { MBBS_QUOTAS, MBBS_SCHOLARSHIP_SEATS_2082 } from "@/data/ceeCutoffs";
import { feeFor } from "@/lib/ceePredictor";
import type { ResultProgram } from "@/lib/ceeResults";

export const PROGRAMS: ResultProgram[] = ["MBBS", "BDS", "BSc Nursing"];

export function collegeSlug(c: NepalCollege): string {
  const n = c.name.replace(/\(([^)]*)\)/g, "$1").toLowerCase().replace(/&/g, "and").replace(/'/g, "");
  return n.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
/** Short display name for titles. "Full Name (ACR), Campus" -> "ACR, Campus" only when ACR really abbreviates Full Name;
 *  otherwise the parentheses are just removed ("Lalitpur Nursing Campus (PAHS)" -> "Lalitpur Nursing Campus PAHS"). */
export const shortName = (name: string) => {
  const m = name.match(/^([^,(]*?)\s*\(([A-Za-z]{2,10})\)/);
  if (!m) return name;
  const words = m[1].split(/\s+/).filter(Boolean);
  const initials = (skipSmall: boolean) => words.filter((w) => !(skipSmall && /^(of|and|for|the)$/i.test(w))).map((w) => (/^[A-Z]{2,}$/.test(w) ? w : w[0].toUpperCase())).join("");
  const abbreviates = [initials(false), initials(true)].includes(m[2].toUpperCase());
  return name.replace(m[0], abbreviates ? m[2] : `${m[1]} ${m[2]}`);
};
export const getCollegeBySlug = (slug?: string) => NEPAL_COLLEGES.find((c) => collegeSlug(c) === slug);
export const programsOf = (c: NepalCollege) => PROGRAMS.filter((p) => c.seats[p] > 0);

const programLabel = (p: ResultProgram) => (p === "BSc Nursing" ? "BSc Nursing" : p);
const ordinal = (n: number) => { const s = ["th", "st", "nd", "rd"], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };

export interface CollegeFaq { q: string; a: string }
export interface CollegeContent {
  slug: string; title: string; h1: string; description: string; intro: string;
  facts: [string, string][];
  comparison: string[];
  rankNote: string[];
  similar: { program: ResultProgram; colleges: NepalCollege[] }[];
  faqs: CollegeFaq[];
}

export function collegeContent(c: NepalCollege): CollegeContent {
  const progs = programsOf(c);
  const gov = c.type === "public";
  const kind = gov ? "government" : "private";
  const progText = progs.map(programLabel).join(", ");
  const seatText = progs.map((p) => `${c.seats[p]} ${programLabel(p)}`).join(", ");
  const where = c.city ? ` in ${c.city}` : "";

  const feeLines = progs.map((p) => (gov ? `${programLabel(p)}: scholarship seats carry a subsidised fee (confirm with the college); paying seats follow MEC rules` : `${programLabel(p)}: ${feeFor(p, c).text}`));

  const facts: [string, string][] = [
    ["Type", gov ? "Government / government-funded (about 75% of seats are scholarship seats)" : "Private (about 10% of seats are scholarship seats; the rest pay MEC-capped tuition)"],
    ...(c.city ? [["Location", c.city] as [string, string]] : []),
    ...(c.affiliation ? [["Affiliation", c.affiliation] as [string, string]] : []),
    ["Seats (MEC 2083/84)", seatText],
    ["Tuition", feeLines.join(" · ")],
  ];

  const comparison = progs.map((p) => {
    const all = NEPAL_COLLEGES.filter((x) => x.seats[p] > 0).sort((a, b) => b.seats[p] - a.seats[p]);
    const pos = all.findIndex((x) => x.seats[p] === c.seats[p]); // competition ranking: equal seats share a rank
    const tied = all.filter((x) => x.seats[p] === c.seats[p]).length - 1;
    const govN = all.filter((x) => x.type === "public").length;
    return `${programLabel(p)}: ${c.name} has ${c.seats[p]} seats. By seat count it ranks ${tied > 0 ? "joint " : ""}${ordinal(pos + 1)} of the ${all.length} colleges offering ${programLabel(p)} in Nepal (${govN} government, ${all.length - govN} private)${tied > 0 ? `, level with ${tied} other ${tied === 1 ? "college" : "colleges"}` : ""}.`;
  });

  const rankNote: string[] = [
    "MEC publishes college-wise closing ranks only after counselling, so no website can give you an exact rank for one college in advance.",
    ...(progs.includes("MBBS") ? [`For MBBS scholarship seats, the last Open-merit rank in BS 2082 was ${MBBS_QUOTAS.find((q) => q.id === "open")!.y2082[1]} (of ${MBBS_SCHOLARSHIP_SEATS_2082} scholarship seats across all colleges). Reserved quotas close at higher ranks: see the full quota table.`] : []),
    "Enter your roll number in our checker to see your exact rank and which colleges, by name, fit it.",
  ];

  const similar = progs.map((p) => ({
    program: p,
    colleges: NEPAL_COLLEGES.filter((x) => x.id !== c.id && x.seats[p] > 0 && x.type === c.type).sort((a, b) => b.seats[p] - a.seats[p] || a.name.localeCompare(b.name)).slice(0, 6),
  })).filter((s) => s.colleges.length);

  const faqs: CollegeFaq[] = [
    { q: `How many seats does ${c.name} have?`, a: `In the MEC 2083/84 allocation, ${c.name} has ${seatText} seats.` },
    { q: `What is the fee at ${c.name}?`, a: gov
        ? `${c.name} is a government-funded institution. Scholarship seats carry a subsidised fee set by the institution, while paying seats follow MEC rules. Confirm the current fee with the college before you apply.`
        : `MEC's reported fee ceiling for Nepali paying seats is: ${feeLines.join("; ")}. Individual colleges set instalment schedules and may charge extra items, so confirm in writing before you pay.` },
    { q: `How do I check if my rank is enough for ${c.name}?`, a: "Enter your CEE roll number in the Recruitly Group checker to see your exact rank, score and percentile, and the named scholarship and paying colleges that fit it. College-wise cut-offs are published by MEC only after counselling." },
  ];

  return {
    slug: collegeSlug(c),
    title: (() => { const t = `${shortName(c.name)} Seats & Fees 2083/84`; return t.length <= 52 ? `${t} | Recruitly Group` : t; })(),
    h1: `${c.name}: Seats, Fees and Admission (2083/84)`,
    description: `${c.name}${where} is a ${kind} college with ${seatText} seats in the MEC 2083/84 allocation. See seats, tuition rules, scholarship share and how to check your CEE rank.`,
    intro: `${c.name}${where} is a ${kind} institution offering ${progText} in Nepal. This page summarises its MEC 2083/84 seat allocation, tuition rules and how it compares with other colleges. Figures come from MEC notices; fees and seat counts can change each year.`,
    facts, comparison, rankNote, similar, faqs,
  };
}

