// All university/program reads go through here: server-side filter + pagination, only needed columns.
import { supabase } from "@/integrations/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

// New columns are not in the generated types yet, so use an untyped handle.
const db = supabase as unknown as SupabaseClient;

export const PAGE_SIZE = 24;
export type DataStatus = "verified" | "partial" | "unknown";

export interface UniListItem {
  id: string; slug: string; university_name: string; country: string;
  type: string | null; website_url: string | null; data_status: DataStatus; status: string | null;
}
export interface UniDetail extends UniListItem {
  city: string | null; admissions_url: string | null; source_url: string | null; verified_at: string | null;
  admission_fee: string | null; english_cert: string | null; admission_date: string | null; deadline: string | null;
  cgpa_requirement: string | null; fee_numeric: number | null;
}
export interface ProgramListItem {
  id: string; slug: string; course_name: string; university_name: string; university_id: string | null;
  country: string; level: string | null; department: string | null; tuition_fee: string | null; data_status: DataStatus;
}
export interface ProgramDetail extends ProgramListItem {
  admission_requirement: string | null; program_url: string | null; link: string | null; source_url: string | null; status: string | null;
  university: { slug: string; website_url: string | null; admissions_url: string | null; cgpa_requirement: string | null; english_cert: string | null; data_status: DataStatus } | null;
}

const UNI_LIST = "id,slug,university_name,country,type,website_url,data_status,status";
const PROG_LIST = "id,slug,course_name,university_name,university_id,country,level,department,tuition_fee,data_status";
const clean = (q: string) => q.replace(/[%_,()]/g, " ").trim();

// Fetch PAGE_SIZE+1 rows: tells us "has next page" without an expensive COUNT.
async function page<T>(q: any, p: number): Promise<{ rows: T[]; hasMore: boolean }> {
  const from = p * PAGE_SIZE;
  const { data, error } = await q.range(from, from + PAGE_SIZE);
  if (error) throw error;
  const all = (data ?? []) as T[];
  return { rows: all.slice(0, PAGE_SIZE), hasMore: all.length > PAGE_SIZE };
}

export function searchUniversities(o: { q?: string; country?: string; page?: number }) {
  let q = db.from("universities").select(UNI_LIST).order("university_name");
  if (o.country) q = q.eq("country", o.country);
  if (o.q && clean(o.q)) q = q.ilike("university_name", `%${clean(o.q)}%`);
  return page<UniListItem>(q, o.page ?? 0);
}

export function searchPrograms(o: { q?: string; country?: string; level?: string; department?: string; universityId?: string; page?: number }) {
  let q = db.from("university_programs").select(PROG_LIST).order("course_name");
  if (o.country) q = q.eq("country", o.country);
  if (o.level) q = q.eq("level", o.level);
  if (o.department) q = q.eq("department", o.department);
  if (o.universityId) q = q.eq("university_id", o.universityId);
  if (o.q && clean(o.q)) q = q.ilike("course_name", `%${clean(o.q)}%`);
  return page<ProgramListItem>(q, o.page ?? 0);
}

export async function getUniversity(slug: string): Promise<UniDetail | null> {
  const { data, error } = await db.from("universities").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data as UniDetail | null;
}

export async function getProgram(slug: string): Promise<ProgramDetail | null> {
  const { data, error } = await db.from("university_programs")
    .select("*, university:universities(slug,website_url,admissions_url,cgpa_requirement,english_cert,data_status)").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data as ProgramDetail | null;
}

export async function getCountryStats(country: string) {
  const head = (t: string) => db.from(t).select("id", { count: "exact", head: true }).eq("country", country);
  const [u, p, d] = await Promise.all([
    head("universities"), head("university_programs"),
    db.from("university_programs").select("department").eq("country", country).not("department", "is", null).limit(1000),
  ]);
  const tally: Record<string, number> = {};
  for (const r of (d.data ?? []) as { department: string }[]) tally[r.department] = (tally[r.department] ?? 0) + 1;
  const topDepartments = Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k]) => k);
  return { universities: u.count ?? 0, programs: p.count ?? 0, topDepartments };
}
