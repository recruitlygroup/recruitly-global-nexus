// CEE admission probability engine. Pure functions, runs client-side.
// All thresholds come from src/data/ceeCutoffs.ts (MEC results BS 2080–2082).
import {
  BDS_BENCHMARKS, MBBS_BENCHMARKS, MBBS_QUOTAS, MBBS_SCHOLARSHIP_SEATS_2082,
  NURSING_2025, type MbbsQuota,
} from "@/data/ceeCutoffs";

export type Program = "MBBS" | "BDS" | "BSc Nursing";
export type Tier = "high" | "borderline" | "low";
export type Category =
  | "Open" | "Female" | "Janajati" | "Madhesi" | "Dalit" | "Tharu" | "Muslim" | "Backward Area" | "Foreign";

// Form category → quota ids it is eligible for (Open is always added).
const CATEGORY_QUOTAS: Record<Category, string[]> = {
  Open: [],
  Female: ["female"],
  Janajati: ["janajati"],
  Madhesi: ["madhesi", "madhesi_dalit"],
  Dalit: ["dalit", "dalit_female", "madhesi_dalit"],
  Tharu: ["tharu"],
  Muslim: ["muslim", "muslim_female"],
  "Backward Area": ["backward_area"],
  Foreign: [],
};

export interface Candidate { rank?: number; score?: number }

/** Weighted (2082 50%, 2081 30%, 2080 20%) chance of clearing the closing mark, with a soft shoulder. */
const WEIGHTS = [0.5, 0.3, 0.2] as const;
const RANK_SHOULDER = 0.15; // spec: borderline = within 15% beyond closing rank
const SCORE_SHOULDER = 0.08; // score shortfall tolerated before probability hits 0

function yearChance(c: Candidate, closing: readonly [number, number]): number | null {
  const [cScore, cRank] = closing;
  if (c.rank != null) {
    if (c.rank <= cRank) return 1;
    return Math.max(0, 1 - (c.rank - cRank) / (RANK_SHOULDER * cRank));
  }
  if (c.score != null) {
    if (c.score >= cScore) return 1;
    return Math.max(0, 1 - (cScore - c.score) / (SCORE_SHOULDER * cScore));
  }
  return null;
}

export function toTier(prob: number): Tier {
  if (prob >= 0.75) return "high";
  if (prob >= 0.1) return "borderline";
  return "low";
}

const clampPct = (p: number) => Math.round(Math.min(0.97, Math.max(0.02, p)) * 100);

export interface QuotaResult {
  quota: MbbsQuota;
  probability: number; // 0-100
  tier: Tier;
  clearedYears: number; // of last 3
}

export function mbbsScholarship(c: Candidate, category: Category): QuotaResult[] {
  const ids = new Set(["open", ...CATEGORY_QUOTAS[category]]);
  return MBBS_QUOTAS.filter((q) => ids.has(q.id)).map((quota) => {
    const years = [quota.y2082, quota.y2081, quota.y2080];
    const chances = years.map((y) => yearChance(c, y) ?? 0);
    const prob = chances.reduce((s, v, i) => s + v * WEIGHTS[i], 0);
    const probability = clampPct(prob);
    return { quota, probability, tier: toTier(probability / 100), clearedYears: chances.filter((v) => v === 1).length };
  }).sort((a, b) => b.probability - a.probability);
}

export interface PayingResult {
  program: "MBBS" | "BDS";
  seats: number;
  passed: number;
  passMark: number;
  qualified: boolean;
  probability: number;
  tier: Tier;
  paying?: number;
}

/** Paying/institutional seats: no college-wise data exists, so the benchmark is total national seat capacity
 *  (rank within seat count ≈ placed). Qualification is the MEC pass mark / pass list. */
export function payingSeats(c: Candidate, program: "MBBS" | "BDS"): PayingResult {
  const b = (program === "MBBS" ? MBBS_BENCHMARKS : BDS_BENCHMARKS)[0];
  const qualified = c.rank != null ? c.rank <= b.passed : (c.score ?? 0) >= b.passMark;
  let chance = 0;
  if (qualified) {
    if (c.rank != null) chance = c.rank <= b.seats ? 1 : Math.max(0.1, 1 - (c.rank - b.seats) / (RANK_SHOULDER * b.seats * 4));
    else chance = (c.score ?? 0) >= b.passMark ? 0.9 : 0;
  }
  const probability = qualified ? clampPct(chance) : 2;
  return {
    program, seats: b.seats, passed: b.passed, passMark: b.passMark, qualified,
    probability, tier: qualified ? toTier(probability / 100) : "low",
    paying: program === "MBBS" ? b.seats - MBBS_SCHOLARSHIP_SEATS_2082 : undefined,
  };
}

export interface NursingResult { estRank: number | null; qualified: boolean; percentile: number | null }

/** Estimates rank position from the 2025 BSc Nursing score distribution (linear interpolation). */
export function nursingEstimate(c: Candidate): NursingResult {
  const N = NURSING_2025.qualified;
  if (c.rank != null) return { estRank: c.rank, qualified: c.rank <= N, percentile: Math.max(0, Math.round((1 - c.rank / N) * 100)) };
  if (c.score == null) return { estRank: null, qualified: false, percentile: null };
  if (c.score < NURSING_2025.cutoffScore) return { estRank: null, qualified: false, percentile: null };
  const pts = NURSING_2025.scoreToCount; // descending score
  let est = pts[0][1];
  for (let i = 0; i < pts.length; i++) {
    const [s, n] = pts[i];
    if (c.score >= s) {
      if (i === 0) { est = Math.max(1, n); break; }
      const [s0, n0] = pts[i - 1];
      est = Math.round(n0 + ((s0 - c.score) / (s0 - s)) * (n - n0));
      break;
    }
  }
  return { estRank: est, qualified: true, percentile: Math.max(0, Math.round((1 - est / N) * 100)) };
}

export interface Prediction {
  overall: Tier;
  mbbs?: { scholarship: QuotaResult[]; paying: PayingResult; best: number };
  bds?: { paying: PayingResult };
  nursing?: NursingResult;
}

const RANK_ORDER: Tier[] = ["low", "borderline", "high"];
const bestTier = (tiers: Tier[]) => tiers.reduce((a, b) => (RANK_ORDER.indexOf(b) > RANK_ORDER.indexOf(a) ? b : a), "low" as Tier);

export function predict(c: Candidate, program: Program | "All Programs", category: Category, scholarshipOnly: boolean): Prediction {
  const want = (p: Program) => program === "All Programs" || program === p;
  const tiers: Tier[] = [];
  const out: Prediction = { overall: "low" };
  if (want("MBBS")) {
    const scholarship = mbbsScholarship(c, category);
    const paying = payingSeats(c, "MBBS");
    const best = scholarship[0]?.probability ?? 0;
    out.mbbs = { scholarship, paying, best };
    tiers.push(scholarshipOnly ? scholarship[0].tier : bestTier([scholarship[0].tier, paying.tier]));
  }
  if (want("BDS")) {
    out.bds = { paying: payingSeats(c, "BDS") };
    tiers.push(out.bds.paying.tier);
  }
  if (want("BSc Nursing")) {
    out.nursing = nursingEstimate(c);
    // No college-wise nursing cutoffs in the dataset: qualifying only proves eligibility, so cap at "borderline".
    tiers.push(out.nursing.qualified ? "borderline" : "low");
  }
  out.overall = bestTier(tiers);
  return out;
}

export const ASSUMPTIONS = [
  "Rank-based probability = weighted share (2082: 50%, 2081: 30%, 2080: 20%) of past years in which your rank would have cleared that quota's last admitted rank; ranks up to 15% beyond the closing rank taper to 0%.",
  "Score-based probability uses the closing score with an 8% tolerance and is less reliable than rank.",
  "Paying/private seat estimates compare your rank with total national seat capacity and the MEC pass list. College-wise closing ranks and fees are not in the dataset.",
  "BSc Nursing: rank position is estimated from the MECEE-BL 2025 score distribution (5,533 qualified). No college-wise nursing cutoffs are in the dataset, so no admission % is shown.",
];
