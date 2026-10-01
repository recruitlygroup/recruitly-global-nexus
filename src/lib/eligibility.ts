// Eligibility indicator. Runs in the browser on ONE university's requirement text — no requests, instant.
// It never returns a made-up percentage: it compares the student's numbers with minimums that are
// actually stated in our data, and says "unknown" when they are not.
import type { DataStatus } from "./universityApi";

export interface StudentAnswers { gradingScheme?: string; gradeValue?: string; englishTest?: string; englishScore?: string }
export type Check = "meets" | "below" | "unknown";
export interface EligibilityResult {
  overall: "likely" | "below" | "unknown";
  gpa: Check; english: Check;
  notes: string[];
  dataStatus: DataStatus;
}

export function loadStudentAnswers(): StudentAnswers | null {
  try { const raw = localStorage.getItem("wiseScoreAnswers"); return raw ? JSON.parse(raw) : null; } catch { return null; }
}

// student grade -> approx 4.0 scale (only for schemes we can convert honestly)
function toGpa4(a: StudentAnswers): number | null {
  const v = parseFloat(a.gradeValue ?? "");
  if (isNaN(v)) return null;
  if (a.gradingScheme === "gpa") return v <= 4.5 ? v : null;
  if (a.gradingScheme === "cgpa") return v <= 10 ? (v / 10) * 4 : null; // 10-point CGPA, linear approximation
  if (a.gradingScheme === "percentage") return null; // no defensible conversion
  return null;
}

export function checkEligibility(a: StudentAnswers | null, req: { cgpa?: string | null; english?: string | null; dataStatus: DataStatus }): EligibilityResult {
  const notes: string[] = [];
  let gpa: Check = "unknown", english: Check = "unknown";

  const minGpa = req.cgpa?.match(/(\d(?:\.\d+)?)\s*(?:\+|gpa|cgpa)?/i);
  const gpaVal = minGpa ? parseFloat(minGpa[1]) : NaN;
  if (a && /(min|minimum|gpa|cgpa)/i.test(req.cgpa ?? "") && !isNaN(gpaVal) && gpaVal > 0 && gpaVal <= 4.5) {
    const s = toGpa4(a);
    if (s === null) notes.push("Your grading scheme can't be converted reliably — check the university's own conversion rules.");
    else gpa = s >= gpaVal ? "meets" : "below";
  } else if (req.cgpa) notes.push(`Stated academic requirement: ${req.cgpa}`);

  const test = (a?.englishTest ?? "").toLowerCase();
  const re = test === "ielts" ? /ielts\s*(\d(?:\.\d)?)/i : test === "toefl" ? /toefl\s*(\d{2,3})/i : null;
  const m = re && req.english ? req.english.match(re) : null;
  if (a && m) english = parseFloat(a.englishScore ?? "") >= parseFloat(m[1]) ? "meets" : "below";
  else if (test === "moi" && req.english && /moi/i.test(req.english)) english = "meets";
  else if (req.english) notes.push(`Stated English requirement: ${req.english}`);

  const known = [gpa, english].filter((c) => c !== "unknown");
  const overall = known.length === 0 ? "unknown" : known.includes("below") ? "below" : "likely";
  return { overall, gpa, english, notes, dataStatus: req.dataStatus };
}
