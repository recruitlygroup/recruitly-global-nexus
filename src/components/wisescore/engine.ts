/* eslint-disable @typescript-eslint/no-explicit-any */
// WiseScore engine: scoring + admin-driven acceptance chance + Top-5 recommendations.
// Everything that used to be hard-coded (the South-Asian "no English test" penalty) is now read from
// `wisescore_demographics`, and per-university numbers come from `universities` / `wisescore_acceptance_overrides`.
import { supabase } from "@/integrations/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PROGRAM_OPTIONS, STREAM_OPTIONS, DEGREE_OPTIONS } from "./options";

// New tables/columns are not in the generated Supabase types yet → untyped handle (same approach as lib/universityApi.ts).
const db = supabase as unknown as SupabaseClient;

export interface FormState {
  fullName: string; email: string; phone: string;
  degree: string; destination: string; stream: string; program: string;
  nationality: string; ageRange: string; highestEducation: string; educationStatus: string; educationGap: string;
  gradingScheme: string; gradeValue: string; englishTest: string; englishScore: string; hasPassport: string;
}
export const EMPTY_FORM: FormState = {
  fullName: "", email: "", phone: "", degree: "", destination: "", stream: "", program: "", nationality: "",
  ageRange: "", highestEducation: "", educationStatus: "", educationGap: "", gradingScheme: "", gradeValue: "",
  englishTest: "", englishScore: "", hasPassport: "",
};

export interface Demographic {
  id: string; label: string; nationalities: string[];
  no_english_penalty: number; acceptance_adjust: number; is_default: boolean;
}

// Used only if the table cannot be read (offline / migration not yet applied) — mirrors the original hard-coded rule.
export const FALLBACK_DEMOGRAPHICS: Demographic[] = [
  { id: "fallback-south-asian", label: "South Asian", is_default: false, no_english_penalty: 15, acceptance_adjust: 0,
    nationalities: ["Indian", "Pakistani", "Bangladeshi", "Nepalese", "Sri Lankan", "Afghan", "Maldivian", "Bhutanese"] },
  { id: "fallback-default", label: "All other nationalities", is_default: true, no_english_penalty: 0, acceptance_adjust: 0, nationalities: [] },
];

export async function loadDemographics(): Promise<Demographic[]> {
  try {
    const { data, error } = await db.from("wisescore_demographics").select("id,label,nationalities,no_english_penalty,acceptance_adjust,is_default").eq("is_active", true).order("sort_order");
    if (error || !data?.length) return FALLBACK_DEMOGRAPHICS;
    return data as Demographic[];
  } catch { return FALLBACK_DEMOGRAPHICS; }
}

export const pickDemographic = (list: Demographic[], nationality: string): Demographic =>
  list.find((d) => d.nationalities.includes(nationality)) ?? list.find((d) => d.is_default) ?? list[list.length - 1];

// ── Score (same weights as the previous WiseScoreFormV2; only the visa-risk penalty is now data-driven) ──
export interface ScoreResult { score: number; tier: string; advice: string; hasVisaRisk: boolean; demographic: Demographic }

export function computeScore(f: FormState, demographic: Demographic): ScoreResult {
  let score = 0;
  const g = parseFloat(f.gradeValue) || 0;
  if (f.gradingScheme === "division") score += { distinction: 35, first: 20, second: 10 }[f.gradeValue as "distinction"] ?? 5;
  else if (f.gradingScheme === "gpa") score += g >= 3.7 ? 35 : g >= 3.3 ? 25 : g >= 3.0 ? 20 : 10;
  else if (f.gradingScheme === "percentage") score += g >= 85 ? 35 : g >= 70 ? 25 : g >= 60 ? 15 : 10;
  else if (f.gradingScheme === "cgpa") score += g >= 9 ? 35 : g >= 8 ? 25 : g >= 7 ? 20 : 10;

  if (f.englishTest !== "moi" && f.englishScore) {
    const s = parseFloat(f.englishScore) || 0;
    const t = f.englishTest;
    if (t === "ielts") score += s >= 7 ? 30 : s >= 6 ? 20 : 15;
    else if (t === "toefl") score += s >= 100 ? 30 : s >= 80 ? 20 : 15;
    else if (t === "pte") score += s >= 65 ? 30 : s >= 55 ? 20 : 15;
    else score += 15;
  }
  score += ({ master: 15, "4yr-bachelor": 12, "3yr-bachelor": 10, "a-level": 8 } as Record<string, number>)[f.highestEducation] ?? 5;
  score += ({ none: 10, "0-1": 8, "1-2": 5 } as Record<string, number>)[f.educationGap] ?? 0;
  if (f.hasPassport === "yes") score += 5;

  const penalty = demographic.no_english_penalty || 0;
  const hasVisaRisk = f.englishTest === "moi" && penalty > 0;
  if (hasVisaRisk) score -= penalty;
  score = Math.max(0, Math.min(100, score));

  let tier: string, advice: string;
  if (score >= 80) { tier = "Top Candidate"; advice = "Your grades and English score are strong. Compare them with each university's stated requirements and apply early."; }
  else if (score >= 65) { tier = "Strong Candidate"; advice = "Good profile. Strengthening your English score may widen your options."; }
  else if (score >= 50) { tier = "Developing Candidate"; advice = "You have potential. An English test (IELTS/PTE) can strengthen your profile."; }
  else { tier = "High Risk - Needs Improvement"; advice = "Some requirements may not be met yet. An English test and stronger grades can help; ask us about pathway options."; }
  if (hasVisaRisk) advice = "⚠️ VISA RISK: " + advice + " Taking an English test is critical for your visa application.";
  return { score, tier, advice, hasVisaRisk, demographic };
}

// ── Acceptance chance ───────────────────────────────────────────────────────
//   start  = admin override for (program|university, demographic)   — exact % the admin typed
//            otherwise  program.base ?? university.base  + demographic.acceptance_adjust
//   chance = start + (WiseScore − 60) × 0.4, clamped to 5…97
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
export function computeChance(o: { score: number; base: number; demographicAdjust: number; override?: number | null }): number {
  const start = o.override ?? clamp(o.base + o.demographicAdjust, 1, 99);
  return clamp(Math.round(start + (o.score - 60) * 0.4), 5, 97);
}
export const matchLabel = (chance: number) => chance >= 70 ? "Strong match" : chance >= 45 ? "Good match" : "Ambitious reach";

// ── Recommendations ─────────────────────────────────────────────────────────
export interface MatchedProgram {
  id: string; course_name: string; level: string | null; tuition_fee: string | null;
  external_link: string | null; internal_link: string | null;
}
export interface Recommendation {
  id: string; slug: string | null; name: string; country: string; type: string | null;
  website: string | null; imageUrl: string | null; applyEmail: string | null;
  chance: number; label: string; program: MatchedProgram | null; verified: boolean;
}

// The imported dataset contains some non-university rows (e.g. "1", "ID", banner text) — never recommend those.
const isRealUniversityName = (n: string) => /[A-Za-zÀ-ÿ]{3}/.test(n) && !/^\d+$/.test(n.trim()) && !/study programs/i.test(n) && n.trim().length >= 4;

const programLabel = (f: FormState) => PROGRAM_OPTIONS[f.stream]?.find((p) => p.value === f.program)?.label ?? "";
export const streamLabel = (f: FormState) => STREAM_OPTIONS.find((s) => s.value === f.stream)?.label ?? f.stream;
export const degreeLabel = (f: FormState) => DEGREE_OPTIONS.find((d) => d.value === f.degree)?.label ?? f.degree;

const LEVEL_RE: Record<string, RegExp> = { bachelor: /bachel|undergrad|\bbsc\b|\bba\b/i, master: /master|\bmsc\b|\bma\b|\bmba\b|postgrad/i, phd: /ph\.?d|doctor/i };

function pickProgram(progs: any[], f: FormState): any | null {
  const label = programLabel(f).toLowerCase();
  if (!label || !progs.length) return null;
  const tokens = label.split(/[^a-z]+/).filter((t) => t.length > 3 && !["science", "management", "engineering", "technology"].includes(t));
  let best: any = null, bestScore = 0;
  for (const p of progs) {
    const hay = `${p.course_name ?? ""} ${p.department ?? ""}`.toLowerCase();
    let s = hay.includes(label) ? 3 : 0;
    s += tokens.filter((t) => hay.includes(t)).length;
    if (s === 0) continue;
    if (LEVEL_RE[f.degree]?.test(p.level ?? "")) s += 1;
    if (s > bestScore) { best = p; bestScore = s; }
  }
  return best;
}

export async function fetchRecommendations(f: FormState, result: ScoreResult): Promise<Recommendation[]> {
  const { data: unis, error } = await db.from("universities")
    .select("id,slug,university_name,country,type,website_url,link,image_url,apply_email,base_acceptance,wisescore_rank,data_status")
    .eq("country", f.destination).neq("status", "CLOSED").eq("wisescore_enabled", true)
    .order("wisescore_rank", { ascending: true, nullsFirst: false })
    .order("university_name").limit(60);
  if (error) throw error;

  const w = (s: string | null) => (s === "verified" ? 0 : s === "partial" ? 1 : 2);
  const top = ((unis ?? []) as any[])
    .filter((u) => isRealUniversityName(u.university_name))
    .sort((a, b) => (a.wisescore_rank ?? 999) - (b.wisescore_rank ?? 999) || w(a.data_status) - w(b.data_status) || a.university_name.localeCompare(b.university_name))
    .slice(0, 5);
  if (!top.length) return [];

  const ids = top.map((u) => u.id), names = top.map((u) => u.university_name);
  const demo = result.demographic;
  const hasRealDemo = !demo.id.startsWith("fallback");

  const [progRes, ovRes] = await Promise.all([
    db.from("university_programs").select("id,university_id,university_name,course_name,level,department,tuition_fee,base_acceptance,external_link,internal_link,link,program_url")
      .eq("country", f.destination).in("university_name", names).neq("status", "CLOSED").limit(1500),
    hasRealDemo
      ? db.from("wisescore_acceptance_overrides").select("university_id,program_id,acceptance_pct").in("university_id", ids).eq("demographic_id", demo.id)
      : Promise.resolve({ data: [] as any[] }),
  ]);
  const progs = ((progRes as any).data ?? []) as any[];
  const overrides = ((ovRes as any).data ?? []) as any[];

  return top.map((u): Recommendation => {
    const uProgs = progs.filter((p) => p.university_id === u.id || p.university_name === u.university_name);
    const prog = pickProgram(uProgs, f);
    const ovProg = prog ? overrides.find((o) => o.program_id === prog.id)?.acceptance_pct : undefined;
    const ovUni = overrides.find((o) => o.university_id === u.id && !o.program_id)?.acceptance_pct;
    const chance = computeChance({
      score: result.score,
      base: prog?.base_acceptance ?? u.base_acceptance ?? 60,
      demographicAdjust: demo.acceptance_adjust,
      override: ovProg ?? ovUni ?? null,
    });
    return {
      id: u.id, slug: u.slug, name: u.university_name, country: u.country, type: u.type,
      website: u.website_url || u.link || null, imageUrl: u.image_url || null, applyEmail: u.apply_email || null,
      chance, label: matchLabel(chance), verified: u.data_status === "verified",
      program: prog ? {
        id: prog.id, course_name: prog.course_name, level: prog.level, tuition_fee: prog.tuition_fee,
        external_link: prog.external_link || prog.program_url || prog.link || null, internal_link: prog.internal_link || null,
      } : null,
    };
  });
}

// ── University photo ────────────────────────────────────────────────────────
// Admin-set `image_url` always wins. Otherwise we look up the lead photo from the university's Wikipedia page
// (free, CORS-enabled) and cache it for the session. Logos/seals are rejected; the card falls back to a designed placeholder.
const BAD_IMG = /logo|seal|coat_of_arms|crest|emblem|wordmark|\.svg/i;
export async function lookupUniversityPhoto(name: string): Promise<string | null> {
  const key = `ws-photo:${name}`;
  try { const c = sessionStorage.getItem(key); if (c !== null) return c || null; } catch { /* storage unavailable */ }
  const title = name.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim().replace(/ /g, "_");
  let url: string | null = null;
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
    if (res.ok) {
      const j = await res.json();
      const src: string | undefined = j?.originalimage?.source || j?.thumbnail?.source;
      if (src && j?.type === "standard" && !BAD_IMG.test(src)) {
        url = j?.thumbnail?.source && /\/\d+px-/.test(j.thumbnail.source) ? j.thumbnail.source.replace(/\/\d+px-/, "/960px-") : src;
      }
    }
  } catch { /* offline / blocked → placeholder */ }
  try { sessionStorage.setItem(key, url ?? ""); } catch { /* ignore */ }
  return url;
}
