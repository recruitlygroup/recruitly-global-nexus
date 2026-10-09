// Austria admission-route check. Like eligibility.ts, it NEVER returns a made-up percentage.
//
// Why: Austrian public universities do not publish GPA cut-offs. Whether you can be admitted depends first on whether your
// school/degree certificate counts as the "general university-entrance qualification". For Nepal, India, Bangladesh, Sri Lanka and
// Afghanistan, ENIC NARIC Austria (with the ministry) publishes explicit recommendations (valid from 1 Sep 2025 "until further notice").
// This file encodes those recommendations as rules. They are a RECOMMENDATION — each university decides.
//
// Source: https://oead.at/fileadmin/Dokumente/oead.at/OeAD_Hauptmenueseiten/Studieren_Forschen_Lehren/ENIC_NARIC_PDFs/Asien_EmpfZul_Checkliste_Sept_2025.pdf

export type AdmissionCategory =
  | "direct" //          certificate accepted as-is (subject to the listed checks)
  | "conditional" //     admission possible with supplementary exams (Ergänzungsprüfungen, EPs) or similar
  | "bridge_required" // certificate alone does not qualify; extra study first
  | "needs_review"; //   outside the published rules, or we lack the input to apply them

export interface AdmissionInput {
  nationality?: string; //          form label, e.g. "Nepalese"
  targetLevel?: string; //          form "degree": bachelor | master | phd | non-degree
  highestEducation?: string; //     form value: grade-12 | a-level | 3yr-bachelor | 4yr-bachelor | master
  gradingScheme?: string; //        form value: gpa | percentage | cgpa | division
  gradeValue?: string; //           raw value the student typed / picked
}

export interface AdmissionAssessment {
  category: AdmissionCategory;
  headline: string;
  detail: string;
  /** Things that must also be true (shown as a checklist). */
  checks: string[];
  /** Ways to close the gap when category is conditional / bridge_required. */
  bridges: string[];
  country: string | null;
  sourceUrl: string;
  asOf: string;
  dataStatus: "verified" | "unknown";
}

const SOURCE = "https://oead.at/fileadmin/Dokumente/oead.at/OeAD_Hauptmenueseiten/Studieren_Forschen_Lehren/ENIC_NARIC_PDFs/Asien_EmpfZul_Checkliste_Sept_2025.pdf";
const AS_OF = "2025-09-01";

const COUNTRY_BY_NATIONALITY: Record<string, string> = {
  Nepalese: "NP", Indian: "IN", Bangladeshi: "BD", "Sri Lankan": "LK", Afghan: "AF",
};

// Note: nationality is a stand-in for "country where the certificate was issued". Ask for that directly when you can.

function pct(a: AdmissionInput): number | null {
  if (a.gradingScheme !== "percentage") return null;
  const v = parseFloat(a.gradeValue ?? "");
  return isNaN(v) || v < 0 || v > 100 ? null : v;
}

const make = (
  country: string | null, category: AdmissionCategory, headline: string, detail: string,
  checks: string[] = [], bridges: string[] = [], dataStatus: "verified" | "unknown" = "verified",
): AdmissionAssessment => ({ category, headline, detail, checks, bridges, country, sourceUrl: SOURCE, asOf: AS_OF, dataStatus });

const NEEDS_PERCENT = (country: string) =>
  make(country, "needs_review", "We need your marks as a percentage",
    "The Austrian recommendation sets its thresholds as percentages of the maximum marks. Your grading scheme cannot be converted reliably, so we won't guess.",
    ["Enter your final marks as a percentage (total marks obtained ÷ total marks possible × 100)."]);

export function assessAustriaAdmission(a: AdmissionInput | null): AdmissionAssessment {
  const country = a?.nationality ? COUNTRY_BY_NATIONALITY[a.nationality] ?? null : null;
  const level = a?.targetLevel;
  const edu = a?.highestEducation;

  if (!a || !level || !edu) {
    return make(country, "needs_review", "Not enough information", "Select your target degree and highest completed education.", [], [], "unknown");
  }
  if (!country) {
    return make(null, "needs_review", "Check your certificate with the university or ENIC NARIC Austria",
      "We hold published rules only for Nepal, India, Bangladesh, Sri Lanka and Afghanistan. Other countries are decided individually from your certificate.",
      ["Ask the university's admissions office, or request an evaluation from ENIC NARIC Austria (OeAD)."], [], "unknown");
  }

  const schoolLeaver = edu === "grade-12" || edu === "a-level";
  const hasBachelor = edu === "3yr-bachelor" || edu === "4yr-bachelor";
  const p = pct(a);

  /* ---------------------------- BACHELOR TARGET --------------------------- */
  if (level === "bachelor") {
    if (!schoolLeaver) {
      return make(country, "needs_review", "You already hold a degree",
        "With prior university study you may be admitted to a bachelor's on the basis of that study (credits can be recognised). The university decides how much.",
        ["Send your transcripts to the university for a credit assessment."]);
    }
    switch (country) {
      case "NP": {
        const checks = ["Grade XII subjects must meet the Austrian subject canon (the university checks the exact subjects)."];
        const bridges = ["Alternative: two exam-active full-time years (≥ 80 %) at a recognised higher-education institution can substitute for missing requirements."];
        if (p === null) return NEEDS_PERCENT(country);
        if (p > 85) return make(country, "conditional", "Possible with 2 supplementary exams",
          "Above 85 % with the required subjects, ENIC NARIC recommends admission to a bachelor's with 2 Ergänzungsprüfungen. Nepal's Grade XII is never accepted without supplementary exams.", checks, bridges);
        if (p >= 70) return make(country, "conditional", "Possible with at least 3 supplementary exams",
          "Between 70 % and 85 %, the recommendation is admission with at least 3 Ergänzungsprüfungen.", checks, bridges);
        return make(country, "bridge_required", "Grade XII below 70 % does not qualify on its own",
          "Below 70 % there is no route through supplementary exams in the recommendation.", checks, bridges);
      }
      case "IN": {
        const checks = ["The university checks your subject combination (§ 64 Abs. 2 UG)."];
        const bridges = ["Up to 4 supplementary exams can be required if subjects are missing."];
        if (p === null) return NEEDS_PERCENT(country);
        if (p > 75) return make(country, "direct", "Class XII can be accepted directly", "Above 75 % of maximum marks, direct admission is possible when the subject combination fits.", checks, bridges);
        if (p >= 60) return make(country, "conditional", "Possible with at least 2 supplementary exams", "Between 60 % and 75 %, admission is possible with at least 2 Ergänzungsprüfungen.", checks, bridges);
        return make(country, "needs_review", "Below 60 %: no standard route is published",
          "The recommendation defines no route under 60 %. The university decides case by case; expect a low likelihood.", checks);
      }
      case "BD":
        return make(country, "bridge_required", "HSC alone does not qualify for a bachelor's",
          "The Higher Secondary Certificate does not give general university-entrance qualification, and supplementary exams cannot make up the gap.", [],
          ["Two exam-active full-time years with ≥ 80 % at a recognised higher-education institution, together with the HSC.", "Or choose a pathway programme / foundation year in another system, then re-apply."]);
      case "AF":
        return make(country, "bridge_required", "Grade 12 alone does not qualify for a bachelor's",
          "Supplementary exams cannot replace the missing entrance qualification.", [],
          ["Two exam-active full-time years with ≥ 85 % at a recognised higher-education institution, plus 4 supplementary exams."]);
      case "LK": {
        const checks = ["GCE A-Levels with at least grade C (≥ 50 %) in every subject taken.", "Common General Paper result of at least 30.", "O-Levels checked for the required general-education subjects."];
        if (edu !== "a-level") return make(country, "bridge_required", "O-Levels alone do not qualify", "Sri Lanka's recommendation requires 13 school years (GCE A-Levels).", [], ["Complete A-Levels first."]);
        return make(country, "direct", "A-Levels can be accepted when all checks pass", "Up to 4 supplementary exams may be imposed for missing subjects.", checks, ["Supplementary exams for missing subjects (up to 4)."]);
      }
    }
  }

  /* ----------------------------- MASTER TARGET ---------------------------- */
  if (level === "master") {
    if (edu === "master") {
      return make(country, "needs_review", "You already hold a master's",
        "The thresholds apply to the bachelor's degree. Send your bachelor's transcript (and master's) to the university for assessment.");
    }
    if (!hasBachelor) {
      return make(country, "bridge_required", "A master's needs a completed bachelor's", "A school-leaving certificate does not qualify for a master's programme.", [], ["Complete a recognised bachelor's degree first."]);
    }
    const years3 = edu === "3yr-bachelor";
    if (p === null) return NEEDS_PERCENT(country);
    switch (country) {
      case "NP":
        if (years3) return make(country, "bridge_required", "A 3-year Nepali bachelor's is treated as an associate-level degree",
          "It does not give access to a master's. It can support admission to a bachelor's with credit recognition.", [],
          ["2-year bachelor + 2-year master, each ≥ 80 %, can qualify with up to 4 supplementary exams (≤ 40 ECTS)."]);
        if (p >= 90) return make(country, "direct", "4-year bachelor's accepted directly", "From 90 %, direct master's access is recommended.", ["Your university/college status and affiliation throughout your studies are checked."]);
        if (p >= 80) return make(country, "conditional", "Possible with up to 4 supplementary exams (≤ 40 ECTS)", "Between 80 % and 90 %, the university decides how many exams after reviewing the transcript.", ["Your university/college status and affiliation are checked."]);
        return make(country, "needs_review", "Below 80 %: no standard route is published", "The university decides case by case.");
      case "IN": {
        if (p >= 75) return make(country, "direct", "Bachelor's accepted directly", "From 75 %, direct access is recommended even for colleges in the third UGC category.", ["College status on the current UGC list and continuous affiliation are checked."]);
        if (p >= 60) return make(country, "conditional", "Direct, or 1–2 supplementary exams, depending on your college", "At 60–75 %, direct access applies to Section 1 and 2 colleges. For Section 3 state colleges the university adds 1–2 exams (≤ 20 ECTS); private colleges without a UGC review get 3 or more.", ["Find your college's UGC section."]);
        return make(country, "needs_review", "Below 60 %: no standard route is published", "A 50–60 % bachelor's plus a master's of 60 %+ can be upgraded; otherwise the university decides.");
      }
      case "BD":
        if (years3) return make(country, "needs_review", "3-year degrees are not covered by the published rules", "Ask the university.");
        if (p >= 90) return make(country, "direct", "4-year bachelor's accepted directly (if your institution is Section 1)", "From 90 %, direct access applies to institutions the recommendation classes as Section 1.", ["Your institution's Section (1, 2 or 3) decides whether the degree counts as a bachelor's. Section 2 and 3 degrees are treated as associate degrees."]);
        if (p >= 80) return make(country, "conditional", "Possible with up to 4 supplementary exams (≤ 40 ECTS)", "Applies to Section 1 institutions.", ["Institution must be Section 1."]);
        return make(country, "needs_review", "Below 80 %: no standard route is published", "The university decides.");
      case "AF":
        return make(country, "bridge_required", "A 4-year Afghan bachelor's does not reach bachelor-equivalence",
          "Direct access to a master's is not possible. Admission to a bachelor's with credit recognition is.", [],
          ["Bachelor's (≥ 80 %) + master's (≥ 80 %) can be upgraded with up to 4 supplementary exams (≤ 40 ECTS)."]);
      case "LK":
        if (years3) return make(country, "needs_review", "3-year degrees are not covered by the published rules", "Ask the university.");
        if (p >= 85) return make(country, "direct", "4-year bachelor's accepted directly", "From 85 % with an accredited institution and programme.", ["Institution and programme are on the UGC Sri Lanka recognised lists.", "GCE A-Levels are also presented."]);
        if (p >= 70) return make(country, "conditional", "Possible with up to 4 supplementary exams (≤ 40 ECTS)", "Between 70 % and 85 %.", ["Institution and programme are accredited."]);
        return make(country, "needs_review", "Below 70 %: no standard route is published", "The university decides.");
    }
  }

  return make(country, "needs_review", "Outside the published rules", "PhD and non-degree routes are decided by the university.", [], [], "unknown");
}
