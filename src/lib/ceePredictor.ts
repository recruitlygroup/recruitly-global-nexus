// CEE admission engine: exact standing (from real MEC lists) → named Nepal colleges (scholarship + paying) → pivot decision.
// Closing ranks per college are ESTIMATES derived from published seat counts and real quota closing ranks (see `ASSUMPTIONS`);
// MEC publishes no college-wise cutoffs before counselling.
import { MBBS_QUOTAS, MBBS_SCHOLARSHIP_SEATS_2082, type MbbsQuota } from "@/data/ceeCutoffs";
import { DEMAND_ORDER, FEE_CEILING_NPR, NEPAL_COLLEGES, type NepalCollege } from "@/data/nepalColleges";
import type { ResultProgram } from "@/lib/ceeResults";

export type Program = ResultProgram;
export type Tier = "high" | "borderline" | "low";
export type Category =
  | "Open" | "Female" | "Janajati" | "Madhesi" | "Dalit" | "Tharu" | "Muslim" | "Backward Area" | "Foreign";

const CATEGORY_QUOTAS: Record<Category, string[]> = {
  Open: [], Female: ["female"], Janajati: ["janajati"], Madhesi: ["madhesi", "madhesi_dalit"],
  Dalit: ["dalit", "dalit_female", "madhesi_dalit"], Tharu: ["tharu"], Muslim: ["muslim", "muslim_female"],
  "Backward Area": ["backward_area"], Foreign: [],
};

const WEIGHTS = [0.5, 0.3, 0.2] as const; // BS 2082, 2081, 2080
const RANK_SHOULDER = 0.15; // spec: borderline = within 15% beyond closing rank
const clampPct = (p: number) => Math.round(Math.min(0.97, Math.max(0.02, p)) * 100);

const chance = (rank: number, closing: number) => (rank <= closing ? 1 : Math.max(0, 1 - (rank - closing) / (RANK_SHOULDER * closing)));

export function toTier(pct: number): Tier {
  if (pct >= 75) return "high";
  if (pct >= 10) return "borderline";
  return "low";
}

const eligibleQuotas = (category: Category): MbbsQuota[] => {
  const ids = new Set(["open", ...CATEGORY_QUOTAS[category]]);
  return MBBS_QUOTAS.filter((q) => ids.has(q.id));
};

// ---- Calibration derived from real data -------------------------------------------------------------
const OPEN = MBBS_QUOTAS.find((q) => q.id === "open")!;
/** Open-merit closing rank ÷ total scholarship seats (MBBS 2082: 453 / 691). Applied to BDS/Nursing where no quota history exists. */
const OPEN_CLOSE_PER_SCHOLARSHIP_SEAT = OPEN.y2082[1] / MBBS_SCHOLARSHIP_SEATS_2082;
/** Best (largest) closing-rank uplift a reserved quota gives vs Open merit, from real MBBS quota history. */
const quotaUplift = (category: Category) =>
  Math.max(1, ...eligibleQuotas(category).map((q) => q.y2082[1] / OPEN.y2082[1]));

// ---- College ordering ------------------------------------------------------------------------------
const demandIdx = (id: string) => {
  const i = DEMAND_ORDER.indexOf(id);
  return i === -1 ? 1000 : i;
};
const inProgram = (p: Program) =>
  NEPAL_COLLEGES.filter((c) => c.seats[p] > 0).sort((a, b) => demandIdx(a.id) - demandIdx(b.id) || b.seats[p] - a.seats[p] || a.name.localeCompare(b.name));

export interface CollegeResult {
  college: NepalCollege;
  seats: number;
  probability: number; // 0-100
  tier: Tier;
  estClosingRank: number;
  feeText?: string;
  withinBudget?: boolean;
}

const lakh = (n: number) => (n / 100000).toFixed(2).replace(/\.00$/, "");

function feeFor(program: Program, c: NepalCollege): { text: string; max: number } {
  if (program === "MBBS") {
    if (c.valley) return { text: `≈ NPR ${lakh(FEE_CEILING_NPR.MBBS_INSIDE_VALLEY[0])}–${lakh(FEE_CEILING_NPR.MBBS_INSIDE_VALLEY[1])} lakh (MEC ceiling)`, max: FEE_CEILING_NPR.MBBS_INSIDE_VALLEY[1] };
    return { text: `≈ NPR ${lakh(FEE_CEILING_NPR.MBBS_OUTSIDE_VALLEY)} lakh (MEC ceiling)`, max: FEE_CEILING_NPR.MBBS_OUTSIDE_VALLEY };
  }
  const v = FEE_CEILING_NPR[program];
  return { text: `≈ NPR ${lakh(v)} lakh (MEC ceiling)`, max: v };
}

export const budgetCap = (budget: string): number =>
  budget.startsWith("Up to 45") ? 4500000 : budget.startsWith("45") ? 6000000 : Infinity;

/** Government / scholarship colleges. MBBS uses real quota history scaled by each college's share of public seats. */
export function scholarshipColleges(program: Program, rank: number, category: Category): CollegeResult[] {
  const pub = inProgram(program).filter((c) => c.type === "public");
  const privateSeats = inProgram(program).filter((c) => c.type === "private").reduce((s, c) => s + c.seats[program], 0);
  const publicSeats = pub.reduce((s, c) => s + c.seats[program], 0);
  let cum = 0;
  return pub.map((college) => {
    cum += college.seats[program];
    const share = cum / publicSeats;
    let pct: number, closing: number;
    if (program === "MBBS") {
      const qs = eligibleQuotas(category).map((q) => {
        const ys = [q.y2082[1], q.y2081[1], q.y2080[1]].map((l) => l * share);
        return { pct: ys.reduce((s, l, i) => s + chance(rank, l) * WEIGHTS[i], 0), closing: Math.round(ys[0]) };
      }).sort((a, b) => b.pct - a.pct);
      pct = clampPct(qs[0].pct); closing = qs[0].closing;
    } else {
      const scholarshipSeats = 0.75 * publicSeats + 0.1 * privateSeats; // MEC: 75% public, ~10% private scholarship seats
      closing = Math.round(OPEN_CLOSE_PER_SCHOLARSHIP_SEAT * scholarshipSeats * quotaUplift(category) * share);
      pct = clampPct(chance(rank, closing));
    }
    return { college, seats: college.seats[program], probability: pct, tier: toTier(pct), estClosingRank: closing };
  });
}

/** Private / paying colleges: seats are filled by candidates who choose to pay, in merit order, until national capacity is used.
 *  Estimated closing rank = total MEC seats for the program (every college shares the same capacity ceiling). */
export function payingColleges(program: Program, rank: number, qualified: boolean, budget: string): CollegeResult[] {
  const all = inProgram(program);
  const capacity = all.reduce((s, c) => s + c.seats[program], 0);
  const cap = budgetCap(budget);
  const pct = qualified ? clampPct(chance(rank, capacity)) : 2;
  return all.filter((c) => c.type === "private").map((c) => {
    const fee = feeFor(program, c);
    return { college: c, seats: c.seats[program], probability: pct, tier: toTier(pct), estClosingRank: capacity, feeText: fee.text, withinBudget: fee.max <= cap };
  });
}

export interface Prediction {
  program: Program;
  rank: number;
  scholarship: CollegeResult[];
  paying: CollegeResult[];
  overall: Tier;
}

const ORDER: Tier[] = ["low", "borderline", "high"];
const best = (rs: CollegeResult[]): Tier => rs.reduce<Tier>((a, r) => (ORDER.indexOf(r.tier) > ORDER.indexOf(a) ? r.tier : a), "low");

export function predict(program: Program, rank: number, qualified: boolean, category: Category, budget: string): Prediction {
  const scholarship = qualified ? scholarshipColleges(program, rank, category) : scholarshipColleges(program, 1e9, category);
  const paying = payingColleges(program, rank, qualified, budget);
  const payingWithinBudget = paying.filter((p) => p.withinBudget);
  const overall = budget === "Scholarship Only" ? best(scholarship) : best([...scholarship, ...payingWithinBudget]);
  return { program, rank, scholarship, paying, overall };
}

export const ASSUMPTIONS = [
  "Your rank, score and percentile come straight from the complete MEC MECEE-BL 2027 result lists (MBBS 10,321 · BDS 6,256 · BSc Nursing 10,805 qualified candidates).",
  "MEC publishes no college-wise cutoffs before counselling, so each college's closing rank is estimated from its seat count (MEC 2083/84 allocation) and its assumed popularity order; treat chances as guidance, not a guarantee.",
  "MBBS scholarship chances use real quota closing ranks (BS 2082 50%, 2081 30%, 2080 20%) scaled to each government college's share of public seats. Ranks up to 15% beyond the closing rank taper to 0%.",
  "BDS and BSc Nursing scholarship estimates reuse the MBBS Open-merit and quota ratios (no quota history is published for them); paying-college estimates compare your rank with total national seat capacity for the program (seats are filled in merit order by candidates who choose to pay).",
  "Fees shown are MEC ceilings for Nepali paying seats; an individual college's instalment plan and extra charges may differ.",
];
