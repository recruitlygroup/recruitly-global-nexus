// Exact lookup against the complete MECEE-BL 2027 (BS 2083) result lists published by MEC (roll no., score, rank only — no names).
// The JSON (~140 KB gzipped) is loaded lazily on first lookup so it never blocks the page.
export type ResultProgram = "MBBS" | "BDS" | "BSc Nursing";

interface ProgramData { cutoff: number; date: string; n: number; rolls: number[]; scores: number[]; ranks: number[] }
interface Loaded { programs: Record<ResultProgram, ProgramData>; rollIndex: Map<number, [ResultProgram, number]> }

let cache: Promise<Loaded> | null = null;

export function loadResults(): Promise<Loaded> {
  cache ??= import("@/data/ceeResults2027.json").then((m) => {
    const programs = (m.default ?? m).programs as Record<ResultProgram, ProgramData>;
    const rollIndex = new Map<number, [ResultProgram, number]>();
    (Object.keys(programs) as ResultProgram[]).forEach((p) => programs[p].rolls.forEach((r, i) => rollIndex.set(r, [p, i])));
    return { programs, rollIndex };
  });
  return cache;
}

export interface Standing {
  program: ResultProgram;
  rank: number;
  score: number | null; // null when only a rank was entered and no exact record exists
  qualified: number; // N qualified candidates on the list
  cutoff: number; // 50th percentile qualifying score
  aheadOfPercent: number; // % of qualified candidates ranked below
  exact: boolean; // true = a real record was matched
}

const build = (d: ProgramData, p: ResultProgram, i: number): Standing => ({
  program: p, rank: d.ranks[i], score: d.scores[i], qualified: d.n, cutoff: d.cutoff,
  aheadOfPercent: Math.round(((d.n - d.ranks[i]) / d.n) * 1000) / 10, exact: true,
});

export async function lookupByRoll(roll: number): Promise<Standing | null> {
  const { programs, rollIndex } = await loadResults();
  const hit = rollIndex.get(roll);
  return hit ? build(programs[hit[0]], hit[0], hit[1]) : null;
}

/** Rank → record. Ties/gaps are handled by taking the nearest record at or below the rank. */
export async function lookupByRank(program: ResultProgram, rank: number): Promise<Standing | null> {
  const { programs } = await loadResults();
  const d = programs[program];
  if (rank < 1 || rank > d.ranks[d.ranks.length - 1]) return null;
  let lo = 0, hi = d.ranks.length - 1;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (d.ranks[mid] < rank) lo = mid + 1; else hi = mid; }
  const s = build(programs[program], program, lo);
  return { ...s, exact: d.ranks[lo] === rank };
}

/** Score → first (best) rank holding that score. Scores below the cut-off are reported as not qualified (null). */
export async function lookupByScore(program: ResultProgram, score: number): Promise<Standing | null> {
  const { programs } = await loadResults();
  const d = programs[program];
  if (score < d.cutoff) return null;
  let lo = 0, hi = d.scores.length - 1; // scores are descending
  while (lo < hi) { const mid = (lo + hi) >> 1; if (d.scores[mid] > score) lo = mid + 1; else hi = mid; }
  const s = build(d, program, lo);
  return { ...s, exact: d.scores[lo] === score };
}

export async function programStats(program: ResultProgram) {
  const { programs } = await loadResults();
  const d = programs[program];
  return { cutoff: d.cutoff, qualified: d.n, date: d.date };
}
