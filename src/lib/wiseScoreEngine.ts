// WiseScore V3 Engine — Based on Recruitly Core Demographic Model 2026
// Computes Admission Match, Visa Success, Scholarship Eligibility, and Overall Readiness

export interface WiseScoreInputs {
  fullName: string;
  email: string;
  phone: string;
  targetCountry: string;
  studyLevel: string;
  fieldOfStudy: string;
  cgpa: number; // 0–4.0 scale
  englishTest: string; // IELTS | TOEFL | PTE | Duolingo | None
  englishScore: number;
  financialProofUSD: number;
  accommodationStatus: string; // none | hotel | lease | university
  priorVisaRefusals: string; // none | 1 | 2+
  documentReadiness: string; // poor | partial | complete | apostilled
  homeCountryTies: string; // none | family | employment | property_family
  motivationLetter: string; // none | generic | country_specific | research_specific
}

export interface WiseScoreOutput {
  admissionScore: number;
  visaScore: number;
  scholarshipScore: number;
  overallScore: number;
  rejectionRisk: "red" | "yellow" | "green";
  actionItems: string[];
  tier: string;
  countrySpecificTips: string[];
}

// Country-specific scoring configurations from the demographic model
interface CountryConfig {
  label: string;
  flag: string;
  minFunds: string;
  admissionWeights: { factor: string; weight: number }[];
  visaWeights: { factor: string; weight: number }[];
  visaFormula: string;
  scholarshipInfo: string;
  tips: string[];
}

const COUNTRY_CONFIGS: Record<string, CountryConfig> = {
  Italy: {
    label: "Italy",
    flag: "🇮🇹",
    minFunds: "€6,500–€7,000/year",
    admissionWeights: [
      { factor: "ECTS/Credit Match", weight: 0.50 },
      { factor: "CGPA", weight: 0.15 },
      { factor: "CIMEA/DOV Readiness", weight: 0.25 },
      { factor: "Portfolio", weight: 0.10 },
    ],
    visaWeights: [
      { factor: "Pre-Enrollment Timeline", weight: 0.40 },
      { factor: "Financial Proof", weight: 0.30 },
      { factor: "Accommodation Proof", weight: 0.20 },
      { factor: "Italian Language", weight: 0.10 },
    ],
    visaFormula: "P = (0.50 × CreditMatch) + (0.30 × Financial) + (0.20 × Timeline)",
    scholarshipInfo: "DSU Regional Scholarship — Family income <€23,000 = ~90% chance full waiver + €6,000 stipend.",
    tips: [
      "Complete Universitaly pre-enrollment before June",
      "Obtain CIMEA/DOV early — takes 4–8 weeks",
      "Prepare 6-month bank statements",
      "Book initial hotel (15 days minimum)",
    ],
  },
  Australia: {
    label: "Australia",
    flag: "🇦🇺",
    minFunds: "AUD $29,710/year",
    admissionWeights: [
      { factor: "CGPA/Academic Score", weight: 0.40 },
      { factor: "English Proficiency", weight: 0.30 },
      { factor: "Program Relevance", weight: 0.20 },
      { factor: "Work/Internship Experience", weight: 0.10 },
    ],
    visaWeights: [
      { factor: "GTE Assessment", weight: 0.40 },
      { factor: "Financial Capacity", weight: 0.30 },
      { factor: "Health Insurance (OSHC)", weight: 0.15 },
      { factor: "Health & Character Certs", weight: 0.15 },
    ],
    visaFormula: "P = (0.40 × GTE) + (0.30 × Financial) + (0.15 × OSHC) + (0.15 × Health)",
    scholarshipInfo: "Australia Awards (AusAID), RTP Scholarships for PhD/Research, university merit scholarships (10–50% fee waivers).",
    tips: [
      "Write a detailed GTE statement explaining return intent",
      "Show savings history (12+ months), not sudden deposits",
      "Get OSHC immediately after CoE is issued",
      "Include family ties: property, dependents, employment letters",
    ],
  },
  Canada: {
    label: "Canada",
    flag: "🇨🇦",
    minFunds: "CAD $10,000/year + tuition",
    admissionWeights: [
      { factor: "Offer Letter (DLI)", weight: 0.40 },
      { factor: "CGPA", weight: 0.25 },
      { factor: "English Proficiency", weight: 0.25 },
      { factor: "SOP/Research Intent", weight: 0.10 },
    ],
    visaWeights: [
      { factor: "Financial Proof", weight: 0.35 },
      { factor: "Home Country Ties", weight: 0.30 },
      { factor: "Study Plan/SOP", weight: 0.20 },
      { factor: "Visa History", weight: 0.15 },
    ],
    visaFormula: "P = (0.35 × Financial) + (0.30 × HomeTies) + (0.20 × StudyPlan) + (0.15 × VisaHistory)",
    scholarshipInfo: "Vanier CGS (PhD), IDRC, university entrance awards (CAD $2,000–$50,000). Most require GPA 3.5+.",
    tips: [
      "Apply to DLI-listed institutions only",
      "Draft a compelling Canada-specific study plan",
      "Disclose all prior visa refusals honestly",
      "Show 6-month consistent bank statements",
    ],
  },
  USA: {
    label: "USA",
    flag: "🇺🇸",
    minFunds: "USD $25,000–$60,000/year",
    admissionWeights: [
      { factor: "GPA (Unweighted)", weight: 0.35 },
      { factor: "TOEFL/IELTS Score", weight: 0.25 },
      { factor: "GRE/GMAT", weight: 0.20 },
      { factor: "Extracurriculars/Research", weight: 0.20 },
    ],
    visaWeights: [
      { factor: "Financial Evidence (I-20)", weight: 0.35 },
      { factor: "Ties to Home Country", weight: 0.30 },
      { factor: "Consular Interview Performance", weight: 0.20 },
      { factor: "Prior Visa History", weight: 0.15 },
    ],
    visaFormula: "P = (0.35 × Financial) + (0.30 × HomeTies) + (0.20 × Interview) + (0.15 × VisaHistory)",
    scholarshipInfo: "Fulbright, university TA/RA positions, merit-based scholarships. Top schools offer need-blind admission.",
    tips: [
      "Complete I-20 financial documentation early",
      "Practice consular interview — keep answers concise",
      "Strong SOP differentiates from Asian applicant pool",
      "GRE waiver trend increasing — check program requirements",
    ],
  },
  "New Zealand": {
    label: "New Zealand",
    flag: "🇳🇿",
    minFunds: "NZD $20,000/year",
    admissionWeights: [
      { factor: "CGPA", weight: 0.35 },
      { factor: "English Proficiency", weight: 0.30 },
      { factor: "Program Relevance", weight: 0.25 },
      { factor: "Work Experience", weight: 0.10 },
    ],
    visaWeights: [
      { factor: "Financial Proof", weight: 0.35 },
      { factor: "Genuine Student Test", weight: 0.30 },
      { factor: "Health/Character", weight: 0.20 },
      { factor: "Accommodation", weight: 0.15 },
    ],
    visaFormula: "P = (0.35 × Financial) + (0.30 × GST) + (0.20 × Health) + (0.15 × Accommodation)",
    scholarshipInfo: "NZ Excellence Awards, university-specific scholarships (NZD $5,000–$15,000).",
    tips: [
      "INZ Genuine Student test — prepare compelling statement",
      "Health insurance mandatory for visa",
      "Show clear post-study employment plan in NZ or home country",
      "Apply for scholarships alongside admission",
    ],
  },
  France: {
    label: "France",
    flag: "🇫🇷",
    minFunds: "€615/month (~€7,380/year)",
    admissionWeights: [
      { factor: "Dossier/Application Quality", weight: 0.35 },
      { factor: "CGPA", weight: 0.25 },
      { factor: "French/English Proficiency", weight: 0.25 },
      { factor: "Motivation Letter", weight: 0.15 },
    ],
    visaWeights: [
      { factor: "Campus France Interview", weight: 0.40 },
      { factor: "Financial Proof", weight: 0.30 },
      { factor: "Accommodation", weight: 0.20 },
      { factor: "Return Intent", weight: 0.10 },
    ],
    visaFormula: "P = (0.40 × CampusFrance) + (0.30 × Financial) + (0.20 × Accommodation) + (0.10 × ReturnIntent)",
    scholarshipInfo: "Eiffel Excellence Scholarship, Campus France grants, Erasmus+.",
    tips: [
      "Register on Campus France early — interview is mandatory",
      "TCF/DELF B2 for French-taught programs",
      "Accommodation proof required before visa appointment",
      "Motivation letter should be country-specific, not generic",
    ],
  },
  Portugal: {
    label: "Portugal",
    flag: "🇵🇹",
    minFunds: "€600/month (~€7,200/year)",
    admissionWeights: [
      { factor: "University Admission", weight: 0.40 },
      { factor: "CGPA", weight: 0.30 },
      { factor: "Language Proficiency", weight: 0.20 },
      { factor: "Motivation/SOP", weight: 0.10 },
    ],
    visaWeights: [
      { factor: "Financial Proof", weight: 0.35 },
      { factor: "Accommodation", weight: 0.25 },
      { factor: "Health Insurance", weight: 0.25 },
      { factor: "Criminal Record", weight: 0.15 },
    ],
    visaFormula: "P = (0.35 × Financial) + (0.25 × Accommodation) + (0.25 × Health) + (0.15 × CriminalRecord)",
    scholarshipInfo: "FCT scholarships for research, university fee waivers, Erasmus+.",
    tips: [
      "SEF (immigration) appointments fill up fast — book early",
      "NIF (tax number) can be obtained remotely before arrival",
      "Portuguese A1 certificate helps but is not mandatory",
      "Health insurance: PB4/CDAM or private insurance accepted",
    ],
  },
  Germany: {
    label: "Germany",
    flag: "🇩🇪",
    minFunds: "€11,208/year (blocked account)",
    admissionWeights: [
      { factor: "Uni-assist/APS Evaluation", weight: 0.35 },
      { factor: "CGPA", weight: 0.25 },
      { factor: "Language (German/English)", weight: 0.25 },
      { factor: "Motivation/Research Fit", weight: 0.15 },
    ],
    visaWeights: [
      { factor: "Blocked Account (€11,208)", weight: 0.45 },
      { factor: "University Enrollment", weight: 0.25 },
      { factor: "Health Insurance (GKV)", weight: 0.20 },
      { factor: "Language Certificate", weight: 0.10 },
    ],
    visaFormula: "P = (0.45 × BlockedAccount) + (0.25 × Enrollment) + (0.20 × HealthInsurance) + (0.10 × Language)",
    scholarshipInfo: "DAAD (most prestigious), Deutschlandstipendium (€300/month), Erasmus+. DAAD requires GPA equivalent to German 2.0+.",
    tips: [
      "Open Fintiba/Expatrio blocked account BEFORE applying for visa",
      "APS certificate takes 6–10 weeks (apply early if required)",
      "Most German public universities charge only €150–€350/semester admin fee",
      "DAAD scholarship application opens October for following academic year",
    ],
  },
  Belgium: {
    label: "Belgium",
    flag: "🇧🇪",
    minFunds: "€623/month",
    admissionWeights: [
      { factor: "University Admission Letter", weight: 0.40 },
      { factor: "CGPA Equivalence (NARIC)", weight: 0.30 },
      { factor: "GMAT/GRE", weight: 0.20 },
      { factor: "Language Proficiency", weight: 0.10 },
    ],
    visaWeights: [
      { factor: "Financial Resources", weight: 0.35 },
      { factor: "Enrollment + Municipality Registration", weight: 0.30 },
      { factor: "Health Insurance", weight: 0.20 },
      { factor: "Accommodation Proof", weight: 0.15 },
    ],
    visaFormula: "P = (0.35 × Financial) + (0.30 × Municipality) + (0.20 × Health) + (0.15 × Accommodation)",
    scholarshipInfo: "ARES (French-speaking), VLIRUOS (Flemish), Erasmus+. Competitive — require GPA equivalent 15/20+.",
    tips: [
      "Register at municipality within 8 days of arrival",
      "KU Leuven requires BBA Math Test for business programs",
      "Apply for VLIRUOS/ARES scholarships 1 year in advance",
      "Check Flemish vs French-speaking university language requirements",
    ],
  },
  Austria: {
    label: "Austria",
    flag: "🇦🇹",
    minFunds: "€1,000/month (~€12,000/year)",
    admissionWeights: [
      { factor: "University Admission Letter", weight: 0.40 },
      { factor: "CGPA (nostrification)", weight: 0.30 },
      { factor: "Language (German/English)", weight: 0.20 },
      { factor: "Entrance Test (STEOP)", weight: 0.10 },
    ],
    visaWeights: [
      { factor: "Financial Proof (€1,000/month)", weight: 0.40 },
      { factor: "Health Insurance", weight: 0.25 },
      { factor: "Accommodation Confirmation", weight: 0.20 },
      { factor: "Return Intent/Ties", weight: 0.15 },
    ],
    visaFormula: "P = (0.40 × Financial) + (0.25 × Insurance) + (0.20 × Accommodation) + (0.15 × Ties)",
    scholarshipInfo: "Ernst Mach grants, OeAD scholarships, Erasmus+ for partner countries.",
    tips: [
      "Apply for OeAD student housing early — limited spots",
      "STEOP entrance phase: prepare to retake within first semester",
      "Ernst Mach Grant deadline: usually February for October start",
      "Health insurance must be in place BEFORE residence permit appointment",
    ],
  },
  Georgia: {
    label: "Georgia",
    flag: "🇬🇪",
    minFunds: "USD $3,000–$6,000/year",
    admissionWeights: [
      { factor: "University Acceptance", weight: 0.40 },
      { factor: "CGPA", weight: 0.25 },
      { factor: "English Proficiency", weight: 0.25 },
      { factor: "Motivation Statement", weight: 0.10 },
    ],
    visaWeights: [
      { factor: "Financial Proof", weight: 0.35 },
      { factor: "University Enrollment", weight: 0.30 },
      { factor: "Health Insurance", weight: 0.20 },
      { factor: "Accommodation", weight: 0.15 },
    ],
    visaFormula: "P = (0.35 × Financial) + (0.30 × Enrollment) + (0.20 × Health) + (0.15 × Accommodation)",
    scholarshipInfo: "Georgian government scholarships for international students, university fee discounts.",
    tips: [
      "Georgia allows visa-free entry for 1 year for many nationalities",
      "Lowest cost of living among target countries",
      "Medical programs popular — taught in English",
      "Student residence permit is straightforward with enrollment proof",
    ],
  },
};

export function getCountryConfig(country: string): CountryConfig | undefined {
  return COUNTRY_CONFIGS[country];
}

export function getSupportedCountries(): { value: string; label: string; flag: string }[] {
  return Object.entries(COUNTRY_CONFIGS).map(([key, config]) => ({
    value: key,
    label: config.label,
    flag: config.flag,
  }));
}

// Scoring functions
function scoreCGPA(cgpa: number): number {
  if (cgpa >= 3.5) return 95;
  if (cgpa >= 3.0) return 78;
  if (cgpa >= 2.5) return 55;
  if (cgpa >= 2.0) return 35;
  return 15;
}

function scoreEnglish(test: string, score: number): number {
  if (test === "None" || score === 0) return 10;
  if (test === "IELTS") {
    if (score >= 7.0) return 95;
    if (score >= 6.5) return 80;
    if (score >= 6.0) return 60;
    if (score >= 5.5) return 40;
    return 20;
  }
  if (test === "TOEFL") {
    if (score >= 100) return 95;
    if (score >= 90) return 80;
    if (score >= 80) return 60;
    if (score >= 70) return 40;
    return 20;
  }
  if (test === "PTE") {
    if (score >= 65) return 95;
    if (score >= 58) return 80;
    if (score >= 50) return 60;
    if (score >= 42) return 40;
    return 20;
  }
  if (test === "Duolingo") {
    if (score >= 120) return 95;
    if (score >= 110) return 80;
    if (score >= 100) return 60;
    if (score >= 90) return 40;
    return 20;
  }
  return 30;
}

function scoreFinancial(usd: number, country: string): number {
  const thresholds: Record<string, number[]> = {
    Italy: [3000, 7000, 15000],
    Australia: [10000, 22000, 35000],
    Canada: [5000, 15000, 30000],
    USA: [10000, 30000, 60000],
    "New Zealand": [5000, 15000, 25000],
    France: [3000, 7500, 15000],
    Portugal: [3000, 7200, 15000],
    Germany: [5000, 11500, 20000],
    Belgium: [3000, 7500, 15000],
    Austria: [5000, 12000, 20000],
    Georgia: [1000, 4000, 8000],
  };
  const t = thresholds[country] || [5000, 15000, 30000];
  if (usd >= t[2]) return 95;
  if (usd >= t[1]) return 75;
  if (usd >= t[0]) return 50;
  return 20;
}

function scoreAccommodation(status: string): number {
  switch (status) {
    case "university": return 95;
    case "lease": return 85;
    case "hotel": return 55;
    default: return 15;
  }
}

function scoreVisaRefusals(refusals: string): number {
  switch (refusals) {
    case "none": return 95;
    case "1": return 50;
    default: return 20;
  }
}

function scoreDocuments(readiness: string): number {
  switch (readiness) {
    case "apostilled": return 95;
    case "complete": return 78;
    case "partial": return 45;
    default: return 15;
  }
}

function scoreHomeTies(ties: string): number {
  switch (ties) {
    case "property_family": return 95;
    case "employment": return 72;
    case "family": return 50;
    default: return 15;
  }
}

function scoreMotivation(letter: string): number {
  switch (letter) {
    case "research_specific": return 95;
    case "country_specific": return 78;
    case "generic": return 45;
    default: return 10;
  }
}

export function calculateWiseScore(inputs: WiseScoreInputs): WiseScoreOutput {
  const config = COUNTRY_CONFIGS[inputs.targetCountry];
  if (!config) {
    return {
      admissionScore: 0,
      visaScore: 0,
      scholarshipScore: 0,
      overallScore: 0,
      rejectionRisk: "red",
      actionItems: ["Please select a valid target country"],
      tier: "Not Assessed",
      countrySpecificTips: [],
    };
  }

  // Compute sub-scores
  const cgpaScore = scoreCGPA(inputs.cgpa);
  const englishScoreVal = scoreEnglish(inputs.englishTest, inputs.englishScore);
  const financialScore = scoreFinancial(inputs.financialProofUSD, inputs.targetCountry);
  const accommodationScore = scoreAccommodation(inputs.accommodationStatus);
  const visaRefusalScore = scoreVisaRefusals(inputs.priorVisaRefusals);
  const documentScore = scoreDocuments(inputs.documentReadiness);
  const homeTiesScore = scoreHomeTies(inputs.homeCountryTies);
  const motivationScore = scoreMotivation(inputs.motivationLetter);

  // Admission Score: weighted by country config admission weights
  const admissionInputs = [cgpaScore, englishScoreVal, motivationScore, documentScore];
  let admissionScore = 0;
  config.admissionWeights.forEach((w, i) => {
    admissionScore += w.weight * (admissionInputs[i] || 50);
  });

  // Visa Score: weighted by country config visa weights
  const visaInputs = [financialScore, homeTiesScore, accommodationScore, visaRefusalScore];
  let visaScore = 0;
  config.visaWeights.forEach((w, i) => {
    visaScore += w.weight * (visaInputs[i] || 50);
  });

  // Penalty for document readiness
  if (inputs.documentReadiness === "poor") {
    admissionScore *= 0.6;
    visaScore *= 0.6;
  }

  // Scholarship Score
  let scholarshipScore = cgpaScore * 0.5 + (inputs.financialProofUSD < 10000 ? 30 : 10) + motivationScore * 0.2;
  scholarshipScore = Math.min(100, scholarshipScore);

  // Overall weighted
  const overallScore = Math.round(admissionScore * 0.4 + visaScore * 0.4 + scholarshipScore * 0.2);

  // Rejection risk
  let rejectionRisk: "red" | "yellow" | "green" = "green";
  if (overallScore < 50 || inputs.documentReadiness === "poor" || inputs.priorVisaRefusals === "2+") {
    rejectionRisk = "red";
  } else if (overallScore < 70) {
    rejectionRisk = "yellow";
  }

  // Action items
  const actionItems: string[] = [];
  if (cgpaScore < 60) actionItems.push("Consider supplementary coursework to improve your GPA equivalent");
  if (englishScoreVal < 60) actionItems.push(`Retake ${inputs.englishTest || "language test"} to achieve a higher score`);
  if (financialScore < 60) actionItems.push(`Prepare 6-month bank statements showing consistent savings`);
  if (accommodationScore < 50) actionItems.push("Secure accommodation proof (university housing or registered lease)");
  if (documentScore < 60) actionItems.push("Complete and apostille all required documents");
  if (homeTiesScore < 50) actionItems.push("Strengthen home country ties evidence (property, employment letters)");
  if (motivationScore < 50) actionItems.push(`Write a ${inputs.targetCountry}-specific motivation/study plan letter`);
  if (actionItems.length === 0) actionItems.push("Your profile is strong — proceed with applications!");

  // Tier
  let tier = "Apply Now";
  if (overallScore >= 75) tier = "Strong Candidate";
  else if (overallScore >= 50) tier = "Needs Improvement";
  else tier = "Not Ready";

  return {
    admissionScore: Math.round(admissionScore),
    visaScore: Math.round(visaScore),
    scholarshipScore: Math.round(scholarshipScore),
    overallScore,
    rejectionRisk,
    actionItems: actionItems.slice(0, 3),
    tier,
    countrySpecificTips: config.tips,
  };
}
