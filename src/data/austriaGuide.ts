// Austria study + residence-permit guide data for the wiseScore walkthrough pages.
//
// Rules for this file (same philosophy as src/lib/eligibility.ts):
//  - Every record says how sure we are: "verified" = read from an official/primary source on `asOf`,
//    "partial" = from a secondary page or only part of the picture, "unknown" = placeholder, do not show as fact.
//  - Money amounts and legal time limits change every January. Show `asOf` next to them in the UI and
//    re-check them against the OeAD page below at the start of each year.
import type { DataStatus } from "@/lib/universityApi";

export const OEAD_STUDENT_PERMIT_URL =
  "https://oead.at/de/nach-oesterreich/einreise-und-aufenthalt/aufenthaltsbewilligung-student-kein-mobilitaetsprogramm";
export const ENIC_NARIC_ASIA_URL =
  "https://oead.at/fileadmin/Dokumente/oead.at/OeAD_Hauptmenueseiten/Studieren_Forschen_Lehren/ENIC_NARIC_PDFs/Asien_EmpfZul_Checkliste_Sept_2025.pdf";

/* -------------------------------------------------------------------------- */
/* 1. Verified constants (Aufenthaltsbewilligung – Student, "Stand 2026")      */
/* -------------------------------------------------------------------------- */

export const AUSTRIA_PERMIT_FACTS = {
  asOf: "2026-10-08",
  dataStatus: "verified" as DataStatus,
  source: OEAD_STUDENT_PERMIT_URL,
  funds: {
    // Monthly amounts, proven for TWELVE months in advance.
    perMonthUnder24: 722.58,
    perMonthFrom24: 1308.39,
    perMonthCouple: 2064.12,
    perMonthPerChild: 201.88,
    // Rent above this is added on top of the monthly amount, as is the cost of health insurance.
    rentAllowancePerMonth: 386.43,
    monthsProvenUpfront: 12,
    // Derived (12 x monthly) — computed here once so the UI never does its own maths.
    annualUnder24: 722.58 * 12, // 8,670.96
    annualFrom24: 1308.39 * 12, // 15,700.68
    // Official wording: a savings book / bank account IN THE APPLICANT'S NAME that can be accessed from Austria.
    // Alternatives: Haftungserklärung (liability declaration by a person living in the EU), traveller cheques, scholarship letter.
    // There is NO mandatory German-style "Sperrkonto" for Austria.
    acceptedProofs: [
      "Savings book or bank account in the applicant's own name, accessible from Austria",
      "Haftungserklärung (liability declaration) from a person resident in the EU",
      "Traveller cheques",
      "Scholarship confirmation",
    ],
  },
  applicationFeeEur: 218, // non-refundable, even if rejected or withdrawn
  studentSelfInsuranceEurPerMonth: 78.84, // ÖGK Studierendenselbstversicherung
  travelInsuranceMinCoverEur: 30000, // needed only for entry, until the full-cover insurance starts
  permitValidityMonths: 12,
  decisionDays: 90, // +90 more if documents must be supplemented
  decisionExtensionDays: 90,
  recommendedFilingMonthsBeforeEntry: { minimum: 3, ideal: 6 },
  visaDValidityMonths: 4,
  visaDApplyWithinMonthsOfApproval: 3,
  collectPermitWithinMonthsOfApproval: 6,
  policeCertificateMaxAgeMonths: 3, // at the time of filing; must be legalised, THEN translated
  passportPhotoMaxAgeMonths: 6,
  meldezettelWithinWorkingDays: 3, // registration of residence after arrival
  renewal: { earliestMonthsBeforeExpiry: 3, ectsPerStudyYear: 16, orSemesterHoursPerYear: 8 },
  work: {
    maxHoursPerWeek: 20,
    // Not automatic: the EMPLOYER must obtain a Beschäftigungsbewilligung from AMS before the first day,
    // including for marginal (geringfügig) jobs. No labour-market test for <= 20 h/week.
    needsEmployerPermit: true,
  },
  afterGraduation: { jobSearchExtensionMonths: 12, times: 1 }, // Aufenthaltsbewilligung can be extended once for job search / founding a company
} as const;

/** Funds the applicant must show, using only official 2026 figures. Pass rent only if known. */
export function requiredFunds(opts: { ageFrom24: boolean; monthlyRent?: number; monthlyInsurance?: number }) {
  const f = AUSTRIA_PERMIT_FACTS.funds;
  const base = opts.ageFrom24 ? f.perMonthFrom24 : f.perMonthUnder24;
  const rentExtra = Math.max(0, (opts.monthlyRent ?? 0) - f.rentAllowancePerMonth);
  const insurance = opts.monthlyInsurance ?? AUSTRIA_PERMIT_FACTS.studentSelfInsuranceEurPerMonth;
  const r2 = (n: number) => Math.round(n * 100) / 100;
  const perMonth = r2(base + rentExtra + insurance);
  return { perMonth, total12Months: r2(perMonth * f.monthsProvenUpfront), base, rentExtra: r2(rentExtra), insurance };
}

/* -------------------------------------------------------------------------- */
/* 2. Institution sectors                                                      */
/* -------------------------------------------------------------------------- */

export interface HeiSector {
  key: "public" | "fh" | "private" | "teacher";
  label: string;
  germanName: string;
  reportedCounts: { value: number; source: string }[];
  admissionModel: string;
  dataStatus: DataStatus;
}

// NOTE: the "63 institutions" figure in the original brief does not match the published sector counts.
// Official sources give 22–23 public, 21 FH, 16–17 private, and 14 (not 2) teacher-education colleges.
export const AUSTRIA_HEI_SECTORS: HeiSector[] = [
  {
    key: "public",
    label: "Public universities",
    germanName: "Universitäten",
    reportedCounts: [
      { value: 22, source: "Eurydice / OECD / Study in Austria (older)" },
      { value: 23, source: "BMFWF-successor higher-education page (current)" },
    ],
    admissionModel:
      "Admission by general university-entrance qualification (equivalence of your school/degree certificate). Registration windows, with an early window for third-country applicants. A few fields use entrance exams or a selection phase in the first semesters.",
    dataStatus: "partial",
  },
  {
    key: "fh",
    label: "Universities of applied sciences",
    germanName: "Fachhochschulen (FH)",
    reportedCounts: [{ value: 21, source: "Eurydice / BMFWF" }],
    admissionModel:
      "Each programme runs its own entrance procedure with fixed places (tests, interviews, relevant professional qualification). Own deadlines. Some programmes require German.",
    dataStatus: "verified",
  },
  {
    key: "private",
    label: "Private universities",
    germanName: "Privatuniversitäten / Privathochschulen",
    reportedCounts: [
      { value: 16, source: "Eurydice (since the 2021 Private Higher Education Act)" },
      { value: 17, source: "BMFWF page" },
    ],
    admissionModel: "Own admission rules, deadlines and tuition; often an interview or portfolio instead of the general entrance qualification.",
    dataStatus: "partial",
  },
  {
    key: "teacher",
    label: "University colleges of teacher education",
    germanName: "Pädagogische Hochschulen",
    reportedCounts: [{ value: 14, source: "Eurydice / BMFWF" }],
    admissionModel: "Teacher-training programmes, generally German-taught; sufficient German is required.",
    dataStatus: "verified",
  },
];

/* -------------------------------------------------------------------------- */
/* 3. Deadlines (only rows actually read from the institution's own page)      */
/* -------------------------------------------------------------------------- */

export interface IntakeDeadline {
  institution: string;
  type: "public" | "fh" | "private";
  intake: string; // "Winter 2026/27"
  euWindow: string;
  thirdCountryWindow: string;
  note?: string;
  sourceUrl: string;
  checkedOn: string;
  dataStatus: DataStatus;
}

export const AUSTRIA_DEADLINES: IntakeDeadline[] = [
  {
    institution: "University of Vienna",
    type: "public",
    intake: "Winter 2026/27",
    euWindow: "22 Jun – 5 Sep 2026",
    thirdCountryWindow: "22 Jun – 3 Aug 2026",
    note: "Read from the 'change of / additional master programme' page; confirm on the general application-periods page. Programmes with an entrance procedure have separate dates.",
    sourceUrl: "https://studieren.univie.ac.at/en/studying-and-learning/managing-my-studies/change-or-additional-master-programme",
    checkedOn: "2026-10-08",
    dataStatus: "partial",
  },
  {
    institution: "University of Vienna",
    type: "public",
    intake: "Summer 2027",
    euWindow: "16 Nov 2026 – 5 Feb 2027",
    thirdCountryWindow: "16 Nov 2026 – 7 Jan 2027",
    note: "Same caveat as above.",
    sourceUrl: "https://studieren.univie.ac.at/en/studying-and-learning/managing-my-studies/change-or-additional-master-programme",
    checkedOn: "2026-10-08",
    dataStatus: "partial",
  },
  {
    institution: "BOKU University (Vienna)",
    type: "public",
    intake: "Winter 2026/27",
    euWindow: "Bachelor 16 Jun – 5 Sep 2026; Master/Doctoral 16 Jun – 31 Oct 2026",
    thirdCountryWindow: "Application deadline until 31 Jul 2026",
    sourceUrl: "https://boku.ac.at/fileadmin/data/H05000/H11100/Zulassung/Academic_calendar_2026_27_ENGL.pdf",
    checkedOn: "2026-10-08",
    dataStatus: "verified",
  },
  {
    institution: "BOKU University (Vienna)",
    type: "public",
    intake: "Summer 2027",
    euWindow: "Bachelor 7 Jan – 5 Feb 2027; Master/Doctoral 7 Jan – 31 Mar 2027",
    thirdCountryWindow: "Application deadline until 31 Dec 2026",
    sourceUrl: "https://boku.ac.at/fileadmin/data/H05000/H11100/Zulassung/Academic_calendar_2026_27_ENGL.pdf",
    checkedOn: "2026-10-08",
    dataStatus: "verified",
  },
];

/* -------------------------------------------------------------------------- */
/* 4. Walkthrough steps (feed these to the timeline component)                  */
/* -------------------------------------------------------------------------- */

export interface WalkthroughStep {
  id: string;
  order: number;
  title: string;
  /** Short label for the timeline rail, e.g. "T-9 to T-6 months". T = planned arrival date. */
  timeline: string;
  /** "official" = a time limit set by the authority; "planning" = our practical estimate. Show planning ones as "typically". */
  timelineBasis: "official" | "planning";
  /** Hand to the animation designer / component. `nodes` are drawn left-to-right and lit up in order. */
  visual: { concept: string; nodes: string[]; motion: string };
  actions: string[];
  authorities: string[];
  documents: string[];
  warnings: string[];
  proTips: string[];
  sourceUrl: string;
  dataStatus: DataStatus;
}

export const PATHWAY_A_STEPS: WalkthroughStep[] = [
  {
    id: "a-admission",
    order: 1,
    title: "University admission (Zulassungsbescheid)",
    timeline: "T-12 to T-9 months",
    timelineBasis: "planning",
    visual: {
      concept: "Application envelope travels to a university gate; a stamped 'Zulassungsbescheid' letter comes back.",
      nodes: ["Your documents", "Credential check", "University", "Zulassungsbescheid"],
      motion: "Envelope slides right, gate opens, letter card flips in with a green tick.",
    },
    actions: [
      "Apply inside the university's third-country window (these close months before the semester starts).",
      "If the programme has an entrance exam, ask for a 'bedingter Zulassungsbescheid' (conditional admission) — it is enough to file the permit application.",
    ],
    authorities: ["The university's admissions office (the OeAD does not handle applications)"],
    documents: ["School-leaving certificate and/or degree + transcripts", "Language proof required by the programme", "Passport copy"],
    warnings: [
      "For students from Nepal, India, Bangladesh, Sri Lanka and Afghanistan the school certificate alone may NOT qualify for a bachelor's — see the admission check.",
      "Admission is the university's decision; the ENIC NARIC document is a recommendation.",
    ],
    proTips: ["Sort out equivalence before paying for legalisation: legalising documents that later turn out insufficient is the costliest mistake."],
    sourceUrl: "https://studyinaustria.at/en/study/admission",
    dataStatus: "verified",
  },
  {
    id: "a-legalise",
    order: 2,
    title: "Legalise and translate documents",
    timeline: "T-9 to T-6 months",
    timelineBasis: "planning",
    visual: {
      concept: "A document moves along a conveyor: Home ministry → Apostille / diplomatic legalisation stamp → Sworn translator → Ready folder.",
      nodes: ["Original document", "Home-country ministry", "Apostille or full legalisation", "Sworn translation", "Ready for filing"],
      motion: "Stamp thuds onto the page, page slides into the translator's booth, comes out with a seal.",
    },
    actions: [
      "Check which route your issuing country needs (apostille, full diplomatic legalisation, or none) on the Austrian foreign ministry (BMEIA) legalisation page.",
      "Translate AFTER legalising, using a generally sworn and court-certified interpreter.",
      "Order the police certificate LAST — it must be no older than 3 months on the day you file.",
    ],
    authorities: ["Home-country foreign ministry / apostille office", "Austrian embassy (legalisation where required)", "BMEIA legalisation guidance"],
    documents: ["Legalised diploma and transcripts", "Police clearance certificate from country of residence (sometimes also home country), legalised and translated", "Birth/marriage certificates if family joins"],
    warnings: [
      "Legalisation can take several months depending on the issuing state (OeAD).",
      "Police certificate older than 3 months at filing = application problem. Time it carefully.",
    ],
    proTips: ["English documents are partly accepted, but German translations are recommended and the authority may demand them."],
    sourceUrl: OEAD_STUDENT_PERMIT_URL,
    dataStatus: "verified",
  },
  {
    id: "a-funds",
    order: 3,
    title: "Prepare funds, housing and insurance",
    timeline: "T-8 to T-5 months",
    timelineBasis: "planning",
    visual: {
      concept: "A calculator card splits into monthly blocks that stack into a 12-month bar; rent and insurance blocks click on top.",
      nodes: ["Bank / sponsor", "12 months of funds", "+ rent above €386.43", "+ health insurance", "Proof folder"],
      motion: "Bar fills month by month, extra blocks drop in and the total counter ticks up.",
    },
    actions: [
      "Show 12 months of funds in advance: €722.58/month if under 24, €1,308.39/month from age 24 (2026). Rent above €386.43/month and insurance cost are added on top.",
      "Put the money in a savings book or bank account in YOUR name that is accessible from Austria — or use a Haftungserklärung from an EU-resident person, traveller cheques, or a scholarship letter.",
      "Document where the money comes from: 6 months of statements, employment/tax proof of the sponsor, and the OeAD 'Erklärung über die Herkunft der Geldmittel'.",
      "Secure housing for at least 3 months (rental contract, dorm agreement, or Wohnrechtsvereinbarung).",
      "Insurance: travel cover (min. €30,000) for entry; then ÖGK student self-insurance (€78.84/month, 2026) after arrival. State this on the application.",
    ],
    authorities: ["Your bank", "ÖGK (Österreichische Gesundheitskasse)"],
    documents: ["Bank statements (last 6 months)", "Source-of-funds declaration", "Accommodation proof", "Declaration of regular expenses (loans, maintenance payments)"],
    warnings: [
      "Austria does not require a German-style 'Sperrkonto'. Do not sell one as mandatory. Many third-party blogs quote a flat '€12,000' — the real figure depends on age, rent and insurance.",
      "Large unexplained deposits shortly before filing invite questions.",
    ],
    proTips: ["Age is the hinge: the amount rises by roughly €586/month at 24. If you are close to 24, check which side of the line you are on at filing."],
    sourceUrl: OEAD_STUDENT_PERMIT_URL,
    dataStatus: "verified",
  },
  {
    id: "a-file",
    order: 4,
    title: "File the residence-permit application at the embassy",
    timeline: "T-6 to T-3 months",
    timelineBasis: "official",
    visual: {
      concept: "Applicant stands at an embassy counter; a folder with a €218 coin slides across; a 'received' stamp lands.",
      nodes: ["Book appointment", "Embassy counter", "Folder + €218 fee", "Case sent to Austria"],
      motion: "Calendar slot pulses, folder slides over the counter, receipt card appears.",
    },
    actions: [
      "Apply in person for 'Aufenthaltsbewilligung – Student' at the Austrian embassy/consulate with visa authority in your country of residence, and wait for the decision there.",
      "Bring the signed application form + copies; originals are shown, not handed over.",
      "Pay the €218 fee at filing.",
      "OeAD recommends filing at least 3 months before travel, ideally 6.",
    ],
    authorities: ["Austrian embassy / consulate in your country of residence"],
    documents: [
      "Signed application form",
      "Valid passport + copy of ALL pages",
      "Passport photo, ICAO standard, 3.5×4.5 cm, colour, not older than 6 months",
      "Zulassungsbescheid",
      "Funds, source-of-funds, accommodation and insurance proof (previous step)",
      "Legalised, translated police certificate (≤ 3 months old)",
    ],
    warnings: ["The €218 fee is non-refundable, even if the application is rejected or withdrawn.", "Embassy appointments can have long waiting times — book first."],
    proTips: ["If your programme needs an entrance exam, file with the conditional Zulassungsbescheid: funding and housing then only need to be 'credible' at this stage."],
    sourceUrl: OEAD_STUDENT_PERMIT_URL,
    dataStatus: "verified",
  },
  {
    id: "a-decision",
    order: 5,
    title: "Austrian authority decides (MA 35 in Vienna / local authority elsewhere)",
    timeline: "Usually within 90 days (up to +90)",
    timelineBasis: "official",
    visual: {
      concept: "Case file travels from the embassy to a desk in Austria; a progress ring counts toward 90 days; an optional 'documents requested' flag extends it.",
      nodes: ["Embassy", "Austrian residence authority", "Decision", "Embassy informed"],
      motion: "Ring fills; if documents are requested the ring extends once with an amber pulse.",
    },
    actions: [
      "Answer any request for further documents quickly — each request can extend the decision time by 90 days.",
      "Stay in your country of residence until you are told the permit is approved.",
    ],
    authorities: ["MA 35 (Vienna); other provinces: the competent Aufenthaltsbehörde — see the OeAD 'Inlandsbehörden' list"],
    documents: ["Supplementary documents on request"],
    warnings: ["Do not book non-refundable flights before approval."],
    proTips: ["Complete files move fastest. Missing documents are the main cause of delay (OeAD)."],
    sourceUrl: OEAD_STUDENT_PERMIT_URL,
    dataStatus: "verified",
  },
  {
    id: "a-visad",
    order: 6,
    title: "Apply for Visa D and travel",
    timeline: "Within 3 months of approval",
    timelineBasis: "official",
    visual: {
      concept: "A green 'approved' card unlocks a passport page; a Visa D sticker (4-month timer) is applied; a plane icon takes off.",
      nodes: ["Approval notice", "Visa D application", "Visa D sticker (4 months)", "Flight to Austria"],
      motion: "Sticker snaps into the passport; countdown ring starts at 4 months.",
    },
    actions: [
      "After the authority approves, apply at the embassy for a Visa D (valid 4 months). You have 3 months from notification to apply.",
      "The permit itself must be collected in Austria within 6 months of notification.",
    ],
    authorities: ["Austrian embassy / consulate"],
    documents: ["Passport", "Approval notice", "Travel insurance (min. €30,000 cover)"],
    warnings: ["Visa D only gets you in. The residence permit card is collected after arrival."],
    proTips: ["Visa-free nationals have an alternative: they may file directly with the authority in Austria."],
    sourceUrl: OEAD_STUDENT_PERMIT_URL,
    dataStatus: "verified",
  },
  {
    id: "a-arrive",
    order: 7,
    title: "Arrive: register address, insurance, final enrolment",
    timeline: "Within 3 working days of arrival",
    timelineBasis: "official",
    visual: {
      concept: "Map pin drops on an Austrian address; a Meldezettel form stamps; a health-insurance card slides in beside it.",
      nodes: ["Arrival", "Meldeamt", "Meldezettel", "ÖGK insurance confirmation", "University enrolment"],
      motion: "Pin drop, form stamp, card slide, three ticks appear.",
    },
    actions: [
      "Register your address (Meldezettel) at the local registration office within 3 working days. Not needed only if you stay ≤ 2 months in a hotel/guesthouse-type accommodation.",
      "Complete final enrolment at the university.",
      "Take out ÖGK student self-insurance (if you declared this at filing) and get the confirmation.",
    ],
    authorities: ["Meldeamt (local registration office)", "ÖGK", "University registrar"],
    documents: ["Meldezettel form", "Rental contract/landlord signature", "Enrolment confirmation", "ÖGK insurance confirmation"],
    warnings: ["The residence authority will ask for the Meldezettel AND the final enrolment when you collect the card."],
    proTips: ["Book the collection appointment early — it is the last gate before you can legally work part-time."],
    sourceUrl: OEAD_STUDENT_PERMIT_URL,
    dataStatus: "verified",
  },
  {
    id: "a-collect",
    order: 8,
    title: "Collect your residence-permit card",
    timeline: "Before the Visa D expires",
    timelineBasis: "official",
    visual: {
      concept: "A blank card outline fills with photo and details and flips to show '12 months'.",
      nodes: ["Appointment", "Authority counter", "Card issued (12 months)"],
      motion: "Card outline draws itself, photo fades in, validity badge pops.",
    },
    actions: ["Collect the Aufenthaltsbewilligung – Student in person at the competent authority (MA 35 in Vienna).", "Carry the card at all times — it doubles as ID."],
    authorities: ["MA 35 (Vienna) / competent Aufenthaltsbehörde"],
    documents: ["Passport + Visa D", "Meldezettel", "Final enrolment confirmation", "Insurance confirmation"],
    warnings: ["Collection must happen within the validity of the Visa D."],
    proTips: ["Copy the card and keep it separate from the original in case of loss or theft."],
    sourceUrl: OEAD_STUDENT_PERMIT_URL,
    dataStatus: "verified",
  },
  {
    id: "a-stay",
    order: 9,
    title: "Work rules and renewal",
    timeline: "Ongoing; renew from 3 months before expiry",
    timelineBasis: "official",
    visual: {
      concept: "Two meters: a work-hours gauge capped at 20 h/week and a progress bar for 16 ECTS per study year.",
      nodes: ["Work ≤ 20 h/week", "16 ECTS per year", "Renewal ≥ 3 months before expiry"],
      motion: "Gauges fill; the ECTS bar turns green at 16.",
    },
    actions: [
      "Part-time work up to 20 h/week is allowed, but the employer must first obtain a Beschäftigungsbewilligung from AMS (no labour-market test up to 20 h).",
      "To renew: continuation confirmation, study record (Studienbuchblatt) and 16 ECTS (or 8 semester hours) per study year.",
      "After graduating you can extend once, for 12 months, to look for a job or start a business.",
    ],
    authorities: ["AMS (employer's permit)", "MA 35 / competent Aufenthaltsbehörde (renewal)"],
    documents: ["Study success proof", "Funds proof again", "KSV 1870 self-disclosure (renewal)"],
    warnings: ["Working without the employer's permit puts your permit at risk.", "File the renewal BEFORE expiry; the earliest is 3 months before."],
    proTips: ["Study success is checked at every renewal — plan your course load around 16 ECTS."],
    sourceUrl: OEAD_STUDENT_PERMIT_URL,
    dataStatus: "verified",
  },
];

/**
 * Pathway B — non-EU citizen who already LIVES in another EU/Schengen state.
 * What the official sources say, which differs from the 'apply directly in Austria' assumption:
 *  - A degree student normally files at the Austrian embassy in the country of residence (that can be in the EU) and waits there.
 *  - Direct filing in Austria is possible only for visa-free nationals, or if you entered on a visa not issued for study.
 *  - A short-stay (Schengen) visa or tourist stay does not create a right to switch to a study permit inside Austria.
 *  - Another EU state's student permit gives up to 360 days visa-free ONLY for mobility-programme / inter-university-agreement students,
 *    not for a full degree. For longer stays apply for the Austrian permit.
 */
export const PATHWAY_B_STEPS: WalkthroughStep[] = [
  PATHWAY_A_STEPS[0],
  {
    id: "b-route",
    order: 2,
    title: "Find your route: mobility, visa-free filing, or embassy filing",
    timeline: "Before you apply",
    timelineBasis: "planning",
    visual: {
      concept: "A decision tree: 'Mobility programme + EU student permit?' → 360 days visa-free; 'Visa-free nationality?' → file in Austria; otherwise → Austrian embassy where you live.",
      nodes: ["Your situation", "Mobility student?", "Visa-free nationality?", "Embassy in residence country"],
      motion: "Branches light up as the user answers; the matching route glows.",
    },
    actions: [
      "Exchange/mobility student (Erasmus+ or an agreement between two universities) holding a valid 'Student' permit from another EU state (not Denmark/Ireland): you may enter and stay in Austria visa-free for up to 360 days.",
      "Degree student: file at the Austrian embassy in the country where you live — it may be in the EU — and wait for the decision there.",
      "Nationals who may enter visa-free, or applicants who entered on a visa not issued for study: they may file directly with the Austrian authority (MA 35 in Vienna).",
    ],
    authorities: ["Austrian embassy in your country of residence", "MA 35 (Vienna) / competent Aufenthaltsbehörde"],
    documents: ["Current residence title from your EU state", "Mobility confirmation (if applicable)"],
    warnings: [
      "Do NOT plan to 'convert' a tourist or Schengen short-stay visa into a study permit inside Austria.",
      "Overstaying a visa-free or visa period is not allowed; file as early as possible.",
    ],
    proTips: ["If a mobility stay may run past 360 days, apply for the Austrian permit in addition."],
    sourceUrl: "https://oead.at/en/to-austria/entry-and-residence/visa-free-entry-for-students",
    dataStatus: "verified",
  },
  {
    id: "b-docs",
    order: 3,
    title: "Documents from your EU country of residence",
    timeline: "T-9 to T-5 months",
    timelineBasis: "planning",
    visual: {
      concept: "A document passes a branching point: 'EU-issued with multilingual form' skips translation; otherwise it goes through a sworn translator.",
      nodes: ["EU-issued document", "Multilingual form attached?", "Skip translation or sworn translation", "Filing folder"],
      motion: "Document splits down one of two lanes and merges at the folder.",
    },
    actions: [
      "Police certificate from the country where you live (sometimes also from your home country), not older than 3 months at filing.",
      "Documents issued by an EU member state need translating only if no multilingual form is attached.",
      "Documents from outside the EU still need legalisation, then sworn translation.",
      "Prove 12 months of funds and 'full-cover' health insurance exactly as in Pathway A.",
    ],
    authorities: ["Local police / municipality in your EU country", "Sworn translator"],
    documents: ["Same checklist as Pathway A, plus your current residence permit for the EU country"],
    warnings: ["An EU residence permit does not replace the Austrian financial proof — funds are assessed the same way."],
    proTips: ["Do not leave your EU country of residence for long periods while the case is open; the embassy handles the file where you live."],
    sourceUrl: OEAD_STUDENT_PERMIT_URL,
    dataStatus: "verified",
  },
  { ...PATHWAY_A_STEPS[3], id: "b-file", order: 4, title: "File at the Austrian embassy in your country of residence" },
  { ...PATHWAY_A_STEPS[4], id: "b-decision", order: 5 },
  { ...PATHWAY_A_STEPS[5], id: "b-visad", order: 6, warnings: ["Visa D is requested only after approval, unless your nationality or EU residence title already allows entry without it."] },
  { ...PATHWAY_A_STEPS[6], id: "b-arrive", order: 7 },
  { ...PATHWAY_A_STEPS[7], id: "b-collect", order: 8 },
  { ...PATHWAY_A_STEPS[8], id: "b-stay", order: 9 },
];

export type AustriaPathway = "A" | "B";
export const AUSTRIA_PATHWAYS: Record<AustriaPathway, { label: string; audience: string; steps: WalkthroughStep[] }> = {
  A: { label: "Pathway A", audience: "Non-EU citizen living outside the EU", steps: PATHWAY_A_STEPS },
  B: { label: "Pathway B", audience: "Non-EU citizen already living in another EU/Schengen country", steps: PATHWAY_B_STEPS },
};
