// src/data/studyCountries.ts
//
// Single source of truth for the student-recruitment country hubs
// (/student-recruitment and /student-recruitment/:slug).
//
// EVERY COUNTRY DEFINES ITS OWN ROADMAP (`steps`). There is deliberately no shared
// template: pre-enrollment, scholarships, DOV/CIMEA, visa offices and checklists are
// different in each country (e.g. Universitaly pre-enrollment and DSU scholarships are
// Italy-only; the Google visa checklists are country-specific). Only add a step to a
// country if it genuinely applies there.
//
// HOW TO ADD A COUNTRY
//   1. Append one object to STUDY_COUNTRIES (copy the closest existing entry and
//      rewrite the steps from the country's official sources).
//   2. Tag blog posts with the country, e.g. `category: "Study in Poland"`, or add
//      "Study in Poland" to `tags`. The hub picks them up through `blog.matchTags`.
//   3. Run `npm run sitemap` (also runs on every build) to list the new URL.
//
// Fees, deadlines and permit rules change every year, so copy points students to the
// official source for anything numeric. Re-verify each country at least once per intake.

import { APOSTILLE_SEWA_URL } from "@/config/nav";
import type { BlogPost } from "@/hooks/useHashnodeBlog";

// ── Shared resources ─────────────────────────────────────────────────────────
export const STUDENT_RESOURCES = {
  wisescore: "/wisescore",
  apostille: APOSTILLE_SEWA_URL,
} as const;

/** Italy-only resources. Do NOT attach these to other countries. */
const ITALY_ONLY = {
  visaChecklist: "https://docs.google.com/document/d/10vvxUy0ZpqRZUcAIvsnduFZa3yutbNYM3O6zDt43GDk/edit?usp=sharing",
  scholarshipSheet:
    "https://docs.google.com/spreadsheets/d/1kb-voQmWtme1QQiSiz86IR2HEwjcD5PS/edit?usp=sharing&ouid=116131303549482668853&rtpof=true&sd=true",
  universitaly: "https://www.universitaly.it",
  visaPortal: "https://vistoperitalia.esteri.it",
} as const;

export const SOCIAL_LINKS = [
  { id: "youtube", label: "YouTube", handle: "@recruitlygroup", url: "https://www.youtube.com/@recruitlygroup" },
  { id: "instagram", label: "Instagram", handle: "@recruitlygroup", url: "https://www.instagram.com/recruitlygroup" },
  { id: "tiktok", label: "TikTok", handle: "@recruitlygroup", url: "https://www.tiktok.com/@recruitlygroup" },
] as const;

export const ORIENTATION_NOTICE =
  "Join our weekly orientation program where we guide students through their complete study visa journey.";

// ── Types ────────────────────────────────────────────────────────────────────
export type RoadmapStepId = "score" | "documents" | "admission" | "preenrollment" | "legalization" | "visa" | "scholarships" | "costs";

export interface RoadmapLink { label: string; url: string; internal?: boolean }

export interface RoadmapStep {
  id: RoadmapStepId;
  title: string;
  summary: string;
  bullets: string[];
  links: RoadmapLink[];
}

export interface StudyCountry {
  slug: string;
  name: string;
  flag: string;
  /** Hero subtitle (one or two sentences). */
  tagline: string;
  overview: {
    intro: string;
    paragraphs: string[];
    highlights: { title: string; body: string }[];
  };
  /** This country's own roadmap, in order. Only steps that really apply. */
  steps: RoadmapStep[];
  /** Free self-application WhatsApp community. */
  community?: { label: string; url: string };
  /** How blog posts are mapped to this hub. All comparisons are case-insensitive. */
  blog: {
    /** A post matches if its category or any tag equals one of these. */
    matchTags: string[];
    /** Optional: also match when the TITLE or SLUG contains one of these words. */
    titleKeywords?: string[];
    /** Posts in these categories never match (e.g. recruiter-facing guides). */
    excludeCategories?: string[];
  };
}

// ── Step builders (only the parts that are genuinely identical everywhere) ───
const scoreStep = (name: string): RoadmapStep => ({
  id: "score",
  title: "Check your AI score and shortlist universities",
  summary: `Start with a free WiseScore. It estimates how strong your profile is for ${name} and suggests universities that fit.`,
  bullets: [
    "Enter your grades, English level, study gap and intended program.",
    "Use the AI shortlist to pick realistic universities, not just famous ones.",
    "Check each shortlisted university's intake dates, language of instruction and fees on its official website.",
  ],
  links: [{ label: "Check my WiseScore", url: STUDENT_RESOURCES.wisescore, internal: true }],
});

const apostilleLink: RoadmapLink = { label: "Document help: Apostille Sewa", url: STUDENT_RESOURCES.apostille };

// ── Countries ────────────────────────────────────────────────────────────────
export const STUDY_COUNTRIES: StudyCountry[] = [
  // ───────────────────────────── INDIA ─────────────────────────────
  {
    slug: "india",
    name: "India",
    flag: "🇮🇳",
    tagline: "English-taught degrees close to home, with no visa needed for Nepali citizens. Strong in nursing, medicine, pharmacy and engineering.",
    overview: {
      intro:
        "India has one of the largest higher-education systems in the world, with thousands of universities and colleges teaching in English. For Nepali students it is the closest and most affordable route to a recognized degree.",
      paragraphs: [
        "Nepali citizens do not need a visa to study in India, so there is no embassy appointment, no visa file and no proof-of-funds interview to prepare for. The real risk is choosing the wrong college, because quality and regulation vary widely between institutions.",
        "That is why verifying recognition before you pay anything matters: Indian Nursing Council and state nursing council approval for nursing, National Medical Commission rules for medicine, and whether your home-country council will accept the degree when you return. Degrees in nursing, pharmacy, engineering, management and IT are especially popular.",
      ],
      highlights: [
        { title: "No visa for Nepali citizens", body: "Nepali citizens can study in India without a student visa. Students of other nationalities should check the rule for their passport with the Indian mission." },
        { title: "Education quality", body: "Wide choice, but not all colleges are equal. Always verify regulator approval for your exact program." },
        { title: "Cost", body: "Lower than most of Europe, but fees differ a lot between colleges. Ask for a written, itemized fee list." },
        { title: "Funding", body: "There is no general need-based scholarship for nursing students. Treat anyone promising one with caution." },
      ],
    },
    steps: [
      scoreStep("India"),
      {
        id: "documents",
        title: "Prepare your documents",
        summary: "Gather the academic and identity documents the college will ask for at admission.",
        bullets: [
          "Citizenship certificate or passport.",
          "Academic transcripts and certificates, including the subjects and marks the program requires (for nursing, usually science subjects including biology).",
          "Recent passport-size photos.",
          "Any documents your chosen college lists as mandatory. Ask for this list in writing.",
        ],
        links: [],
      },
      {
        id: "admission",
        title: "Verify the college, then apply",
        summary: "Do the checks before you pay any seat or registration fee.",
        bullets: [
          "Confirm the college and program are recognized by the relevant regulator, for example the Indian Nursing Council and the state nursing council for nursing.",
          "Check that the degree will be accepted in Nepal if you plan to return, for example by the Nepal Nursing Council for nursing.",
          "Ask for the full fee structure in writing and pay only against official receipts.",
          "Be wary of colleges that promise guaranteed admission, guaranteed jobs or a scholarship that needs an upfront payment.",
        ],
        links: [],
      },
      {
        id: "legalization",
        title: "Attest your documents if the college asks",
        summary: "Some colleges ask for attested copies or extra verification of foreign certificates. Confirm exactly what yours needs before you spend money on it.",
        bullets: [
          "Ask the admissions office which documents need attestation and who must attest them.",
          "Keep several attested copies. You will need them again for registration and later council applications.",
        ],
        links: [apostilleLink],
      },
      {
        id: "visa",
        title: "Entry: no visa for Nepali citizens",
        summary: "Nepali citizens do not need a visa to study in India, so there is no visa checklist or embassy appointment to prepare for.",
        bullets: [
          "Travel with your passport or citizenship document, admission letter and fee receipts.",
          "If you are not a Nepali citizen, check the current student visa rules on the Indian mission's website for your country before you travel.",
        ],
        links: [],
      },
      {
        id: "costs",
        title: "Plan your costs",
        summary: "Budget for the full course, not just the first year.",
        bullets: [
          "There is no general need-based scholarship for nursing students in India, so plan to fund the full program.",
          "Ask about hostel, food, clinical placement, exam and uniform costs, and whether fees rise each year.",
          "Use our community group to compare real costs with students who are already there.",
        ],
        links: [],
      },
    ],
    community: { label: "Journey to India Study Visa", url: "https://chat.whatsapp.com/E9xw95owGPQLckTfWmS74n" },
    blog: {
      matchTags: ["Study in India", "Study nursing in India", "Nursing Programs"],
      titleKeywords: ["india", "indian"],
      excludeCategories: ["Employer Guides", "State Guides", "College Partnerships"],
    },
  },

  // ───────────────────────────── ITALY ─────────────────────────────
  {
    slug: "italy",
    name: "Italy",
    flag: "🇮🇹",
    tagline: "Public universities with income-based fees and regional DSU scholarships, with a national pre-enrollment process through Universitaly.",
    overview: {
      intro:
        "Italy combines some of Europe's oldest universities with public tuition tied to family income, and regional scholarships (DSU) that can cover tuition, accommodation and meals for eligible students. It is one of the most popular European destinations for students from Nepal.",
      paragraphs: [
        "International applicants first pre-enroll on the national Universitaly portal and then follow the university's own admission process. Medicine and some health programs use entrance exams such as IMAT, so timing matters. Your visa is applied for in Nepal once your pre-enrollment is in place.",
        "Public universities set fees according to income documents, which is why correctly legalized family financial documents matter for both fees and the DSU scholarship. Graduates may be able to stay after their degree to look for work, subject to the permit rules at the time.",
      ],
      highlights: [
        { title: "Education quality", body: "Long-established public universities, with many English-taught Bachelor's and Master's programs." },
        { title: "Cost", body: "Fees at public universities depend on income documents, and DSU regional scholarships can reduce costs further." },
        { title: "Visa in Nepal", body: "You can lodge your visa application in Kathmandu at the VFS centre in Thapathali." },
        { title: "After graduation", body: "Graduates can apply for a permit that lets them stay to look for work, subject to current rules." },
      ],
    },
    steps: [
      scoreStep("Italy"),
      {
        id: "documents",
        title: "Prepare your documents",
        summary: "Start early. Several Italian documents take weeks to issue and must be legalized in the right order.",
        bullets: [
          "Valid passport.",
          "Academic transcripts and certificates, with the translations your university requires.",
          "English test result or language certificate, if your program asks for one.",
          "Family income and financial documents. These decide your fee band and your DSU scholarship eligibility.",
          "Recent passport-size photos and birth certificate.",
        ],
        links: [],
      },
      {
        id: "preenrollment",
        title: "Pre-enroll on Universitaly (one university only)",
        summary: "Pre-enrollment on Universitaly exists only for Italy. You can select only one university, so decide before you submit.",
        bullets: [
          "Choose the university and program you most want. Changing it after pre-enrollment is difficult and can cost you the intake.",
          "Check the pre-enrollment window and any entrance test dates on Universitaly and on the university's website.",
          "Save every application number, email and portal screenshot in one folder.",
        ],
        links: [{ label: "Open Universitaly", url: ITALY_ONLY.universitaly }],
      },
      {
        id: "legalization",
        title: "Legalize your documents (DOV and CIMEA)",
        summary: "Italian universities and the Italian authorities need your qualification verified. Plan for DOV, CIMEA and legalization.",
        bullets: [
          "DOV (Dichiarazione di Valore) is issued by the Italian diplomatic mission. Confirm with your university whether it still requires it.",
          "CIMEA issues a Statement of Comparability that many universities accept in place of, or alongside, a DOV.",
          "Documents for the DSU scholarship are legalized by the Italian mission in Kolkata, submitted through VFS.",
          "Order sworn translations after legalization if the receiving office needs them.",
        ],
        links: [apostilleLink],
      },
      {
        id: "visa",
        title: "Apply for your visa in Nepal",
        summary: "Once your pre-enrollment or admission is confirmed, build your visa file against the checklist and lodge it in Kathmandu.",
        bullets: [
          "Visa applications are lodged in Nepal at the VFS centre in Thapathali, Kathmandu.",
          "Download the checklist and tick off each item before your appointment.",
          "Match every name, date and amount across your documents. Small inconsistencies are a common cause of delay.",
        ],
        links: [
          { label: "Download the Italy visa checklist", url: ITALY_ONLY.visaChecklist },
          { label: "Official visa portal", url: ITALY_ONLY.visaPortal },
        ],
      },
      {
        id: "scholarships",
        title: "Regional DSU scholarships and application windows",
        summary: "DSU scholarships have fixed windows and are applied for through each region's student-services body. Track them from day one.",
        bullets: [
          "Check the deadline of the region where your university is located.",
          "Scholarship documents must be legalized through Kolkata (via VFS), so build that time into your plan.",
          "Our live sheet tracks regional scholarship deadlines in one place.",
        ],
        links: [{ label: "Open the scholarship deadline sheet", url: ITALY_ONLY.scholarshipSheet }],
      },
    ],
    community: { label: "Journey to Italy Study Visa", url: "https://chat.whatsapp.com/FHkIkv9D02z1czNzskPqEO" },
    blog: { matchTags: ["Study in Italy", "Italy"] },
  },

  // ───────────────────────────── AUSTRIA ─────────────────────────────
  {
    slug: "austria",
    name: "Austria",
    flag: "🇦🇹",
    tagline: "No tuition at public universities for Nepali citizens, high-ranked research universities and a safe, well-organized student life.",
    overview: {
      intro:
        "Austria offers respected public universities, strong technical and medical schools and a very high quality of life. For Nepali citizens, public universities charge no tuition, which makes Austria one of the most affordable routes to a European degree.",
      paragraphs: [
        "Austria exempts citizens of countries on the OECD list of least developed countries from tuition at public universities, and Nepal is covered. You still pay the compulsory students' union (ÖH) fee each semester, and this is a tuition waiver, not a scholarship: your living costs, health insurance and accommodation are not funded.",
        "Public universities set minimum academic requirements, and many Bachelor's programs are taught in German, so check the language and grade requirements of your exact program before applying. Your residence permit file is built around proof of admission, funds, accommodation and health insurance.",
      ],
      highlights: [
        { title: "Education quality", body: "Respected public universities with strong research, technical and health programs." },
        { title: "Cost", body: "No tuition at public universities for Nepali citizens. Students' union fee, living costs and insurance still apply." },
        { title: "Not fully funded", body: "The waiver covers tuition only. You must show proof of funds for your living costs." },
        { title: "Language", body: "English-taught programs are most common at Master's level. Many Bachelor's programs need German." },
      ],
    },
    steps: [
      scoreStep("Austria"),
      {
        id: "documents",
        title: "Prepare your documents",
        summary: "Austrian authorities read your file closely, so every document must be complete, legalized and translated.",
        bullets: [
          "Valid passport.",
          "Academic transcripts and certificates. Public universities set minimum grade requirements, so check yours for the program.",
          "German or English language certificate, depending on the program's language.",
          "Motivation letter, CV and passport-size photos.",
          "Proof of funds, proof of accommodation and health insurance for your residence permit.",
        ],
        links: [],
      },
      {
        id: "admission",
        title: "Apply to your university and get the admission letter",
        summary: "Apply directly through the university's own application portal. Many Austrian universities close applications months before the semester.",
        bullets: [
          "Check the application window, language requirement and entry requirements for your program on the university's website.",
          "The admission letter is the core document of your residence permit file.",
          "Public universities charge Nepali citizens no tuition, but you pay the students' union fee within the deadline or the admission can lapse.",
        ],
        links: [],
      },
      {
        id: "legalization",
        title: "Legalize your documents in Kathmandu",
        summary: "Legalization of your documents is done at the Austrian consulate in Kathmandu. Translations are needed in German or English.",
        bullets: [
          "Legalize your academic and personal documents before you book your residence permit appointment.",
          "Certified translations are needed for documents that are not in German or English.",
          "Keep originals and several copies. The embassy asks to see originals.",
        ],
        links: [apostilleLink],
      },
      {
        id: "visa",
        title: "Apply for the student residence permit in New Delhi",
        summary: "Nepali students apply for the Student Residence Permit (Aufenthaltsbewilligung Student) in person at the Austrian Embassy in New Delhi. You must travel there for your appointment.",
        bullets: [
          "Book your appointment early. The application is document-based and you must submit it in person.",
          "Download the checklist and complete every item before you travel to Delhi.",
          "Confirm the current requirements and fees on the embassy's official website.",
        ],
        links: [
          { label: "Download the Austria visa checklist", url: "https://docs.google.com/document/d/1k2oi8o8kM3S77bxRGDOL21YXIhZft3AKk2MbL4aAyd8/edit?usp=sharing" },
          { label: "Official embassy page", url: "https://www.aussenministerium.at/newdelhi" },
        ],
      },
    ],
    community: { label: "Journey to Austria Study Visa", url: "https://chat.whatsapp.com/JNjKdYbY85dG8t3IQYQHR3" },
    blog: { matchTags: ["Study in Austria", "Austria"] },
  },

  // ───────────────────────────── LITHUANIA ─────────────────────────────
  {
    slug: "lithuania",
    name: "Lithuania",
    flag: "🇱🇹",
    tagline: "A Schengen and EU country with affordable living, many English-taught programs and a fast-growing international student community.",
    overview: {
      intro:
        "Lithuania is a small, digital-first EU country with modern universities in Vilnius, Kaunas and Klaipėda. It has built a reputation for English-taught programs, good value and a welcoming student environment.",
      paragraphs: [
        "Universities offer English-taught Bachelor's and Master's degrees in business, IT, engineering, health and social sciences. Tuition is charged by the university and differs by program, and living costs are lower than in much of Western Europe.",
        "Nepali students apply through the Lithuanian Embassy in New Delhi, which covers Nepal. Study in Lithuania's official guidance describes a national (D) visa and a temporary residence permit that is applied for through the MIGRIS system, so confirm with your university which route it recommends for your intake.",
      ],
      highlights: [
        { title: "Education quality", body: "Modern universities with a growing catalogue of English-taught programs." },
        { title: "Cost", body: "Lower living costs than many Western European destinations. Tuition depends on the university and program." },
        { title: "Student experience", body: "Compact capital, fast internet and an active international student community." },
        { title: "Visa route", body: "Applications for Nepal go through the Lithuanian Embassy in New Delhi." },
      ],
    },
    steps: [
      scoreStep("Lithuania"),
      {
        id: "documents",
        title: "Prepare your documents",
        summary: "Collect your academic and personal documents. Some must be legalized and translated before you submit them.",
        bullets: [
          "Valid passport.",
          "Academic transcripts and certificates, with translations where required.",
          "English language certificate, if the program asks for one.",
          "Criminal record statement from Nepal. Universities and the migration office ask for a legalized copy.",
          "Proof of funds, accommodation and health insurance.",
        ],
        links: [],
      },
      {
        id: "admission",
        title: "Apply to your university and get the admission letter",
        summary: "Apply through the university's own application system. Your admission letter is the base of your visa and residence permit file.",
        bullets: [
          "Check the application window, tuition and entry requirements on the university's official website.",
          "Ask the university whether it recommends a national (D) visa, a residence permit application, or both for your intake.",
        ],
        links: [],
      },
      {
        id: "legalization",
        title: "Legalize your documents",
        summary: "Lithuanian universities and the migration authorities require foreign documents to be authenticated. The exact route depends on whether your country is party to the Hague Apostille Convention.",
        bullets: [
          "Ask your university and the Lithuanian Embassy which authentication route applies to Nepali documents.",
          "The criminal record statement usually needs legalization and a certified translation.",
          "Some universities complete a second legalization step for you after arrival. Ask before you pay for it twice.",
        ],
        links: [apostilleLink],
      },
      {
        id: "visa",
        title: "Prepare your visa and residence permit",
        summary: "Nepal is served by the Lithuanian Embassy in New Delhi. Build your file against the checklist and confirm the current process on the official sites.",
        bullets: [
          "Check with your university whether to apply for the national (D) visa, the temporary residence permit through MIGRIS, or both.",
          "Apply well ahead of your start date, since the permit can take weeks.",
          "Match every name, date and amount across your documents.",
        ],
        links: [
          { label: "Download the Lithuania visa checklist", url: "https://docs.google.com/document/d/1NZ7bi7vDWfu2e-hUyrv_fJ_DYr7dtMu271hjUsI0zlA/edit?usp=sharing" },
          { label: "Official guide: visas and permits", url: "https://studyin.lt/visas/" },
        ],
      },
    ],
    community: { label: "Journey to Lithuania Study Visa", url: "https://chat.whatsapp.com/IzuaaHV6ML55CfpV6wfRMh" },
    blog: { matchTags: ["Study in Lithuania", "Lithuania"] },
  },

  // ───────────────────────────── SLOVAKIA ─────────────────────────────
  {
    slug: "slovakia",
    name: "Slovakia",
    flag: "🇸🇰",
    tagline: "Central European universities with English-taught medicine, engineering and business programs, and a clear recognition process for your earlier certificates.",
    overview: {
      intro:
        "Slovakia is a Schengen and EU country with long-established universities in Bratislava, Košice and other cities. It is known for English-taught medicine and health programs, along with engineering and business degrees.",
      paragraphs: [
        "Slovak universities require your previous qualification to be recognized in Slovakia, a step called nostrification: your secondary school certificate for a Bachelor's program, or your Bachelor's degree for a Master's program. It must be completed before enrollment, so start it early.",
        "Students from outside the EU who stay longer than 90 days need a temporary residence permit for study. You apply at the Slovak embassy responsible for your country, either for a national (D) visa first or directly for temporary residence, and the university will tell you which route applies.",
      ],
      highlights: [
        { title: "Education quality", body: "Established universities with English-taught medicine, health, engineering and business programs." },
        { title: "Recognition (nostrification)", body: "Your previous certificate must be recognized in Slovakia before enrollment. Start it early." },
        { title: "Authentication", body: "Foreign documents need an apostille or consular legalization, plus translation into Slovak." },
        { title: "After graduation", body: "Students who finish a full degree in Slovakia can apply to extend their residence to look for work or start a business." },
      ],
    },
    steps: [
      scoreStep("Slovakia"),
      {
        id: "documents",
        title: "Prepare your documents",
        summary: "Gather your academic and personal documents. Documents used for the residence application must not be older than 90 days at submission.",
        bullets: [
          "Valid passport.",
          "Secondary school certificate and transcripts for a Bachelor's program, or your Bachelor's degree and transcripts for a Master's program.",
          "Language certificate if the program asks for one, and any entrance-exam results.",
          "Criminal record extract, health insurance and proof of funds.",
          "Recent passport-size photos.",
        ],
        links: [],
      },
      {
        id: "admission",
        title: "Apply to your university and get the admission decision",
        summary: "Apply through the university's own application process and follow its entrance procedure.",
        bullets: [
          "Check the deadline, entrance exam and language requirement on the university's international admissions page.",
          "Some universities admit you conditionally until your certificate is recognized. Ask your university which applies.",
          "The decision on admission and a confirmation of study are core documents for your residence application.",
        ],
        links: [],
      },
      {
        id: "legalization",
        title: "Authenticate and recognize (nostrify) your documents",
        summary: "Your documents must be authenticated, translated into Slovak and then recognized before enrollment.",
        bullets: [
          "Authenticate foreign documents with an apostille, or with consular legalization at the Slovak embassy if your country is not party to the Hague Convention. Confirm the route for Nepali documents with the embassy.",
          "Translate documents into Slovak with a certified translator.",
          "Apply for nostrification (recognition) of your secondary certificate or Bachelor's degree. It must be done before enrollment.",
        ],
        links: [apostilleLink],
      },
      {
        id: "visa",
        title: "Apply for the national visa or temporary residence for study",
        summary: "Apply at the Slovak embassy that handles Nepal. Book your appointment through the instructions your university gives you.",
        bullets: [
          "Ask your university contact whether to apply for a national (D) visa first or for temporary residence directly at the embassy.",
          "Submit original documents. An incomplete application is returned.",
          "Apply at least three months before your planned arrival.",
        ],
        links: [
          { label: "Download the Slovakia visa checklist", url: "https://docs.google.com/document/d/1Ulf5ZKz5KnIKNNOeOuba0SJNqwlHjSCNI0hcrLZEicI/edit?usp=sharing" },
          { label: "Official embassy page: residence for study", url: "https://www.mzv.sk/web/dilli-en/residence-of-foreigners-in-the-territory-of-the-slovak-republic" },
        ],
      },
    ],
    community: { label: "Journey to Slovakia Study Visa", url: "https://chat.whatsapp.com/Kciy5lxB4v04FuaWG4b2ZU" },
    blog: { matchTags: ["Study in Slovakia", "Slovakia"] },
  },

  // ───────────────────────────── SLOVENIA ─────────────────────────────
  {
    slug: "slovenia",
    name: "Slovenia",
    flag: "🇸🇮",
    tagline: "A safe, green EU country with English-taught programs at public and private universities. Nepali citizens apply for their first permit before arriving.",
    overview: {
      intro:
        "Slovenia is small, safe and well connected, with universities in Ljubljana, Maribor, Koper and Nova Gorica, plus private institutions offering English-taught degrees. Students get a high quality of life with easy travel to Italy, Austria and Croatia.",
      paragraphs: [
        "International students choose between public universities and private schools in business, health and humanities. Programs, tuition and application windows vary widely, so compare them and check each university's current English price list and calendar.",
        "Nepali citizens need a visa to enter Slovenia, so the first temporary residence permit for study is applied for at the Slovenian embassy before you travel. Many programs interview applicants online before issuing the admission letter, and that letter is the core of your permit file.",
      ],
      highlights: [
        { title: "Education quality", body: "Public and private universities with a range of English-taught Bachelor's and Master's programs." },
        { title: "Cost", body: "Living costs are moderate for Europe. Tuition differs a lot between public and private institutions." },
        { title: "Permit before arrival", body: "Nepali citizens apply for the first temporary residence permit at the Slovenian embassy before entering Slovenia." },
        { title: "Student experience", body: "Safe, green and compact, with a strong outdoor and café culture." },
      ],
    },
    steps: [
      scoreStep("Slovenia"),
      {
        id: "documents",
        title: "Prepare your documents",
        summary: "Collect your academic and personal documents. Several must be legalized and translated.",
        bullets: [
          "Valid passport.",
          "Academic transcripts and certificates, with certified translations where required.",
          "English language certificate, if the program asks for one.",
          "Police clearance certificate. It must be legalized, and Slovenia asks for a new one every two years when you renew.",
          "Proof of funds and health insurance covering Slovenia or the EU.",
        ],
        links: [],
      },
      {
        id: "admission",
        title: "Apply to your university and get the admission letter",
        summary: "Apply through the university's own application process. Some programs hold an online interview before they issue the letter.",
        bullets: [
          "Check the application window, tuition and English price list on the university's official website.",
          "Prepare for the online interview if your program holds one.",
          "Ask the university for the letter of confirmation of enrollment needed for the permit application.",
        ],
        links: [],
      },
      {
        id: "legalization",
        title: "Legalize your documents",
        summary: "Slovenian institutions and authorities need foreign public documents authenticated. The route depends on whether your country issues an apostille.",
        bullets: [
          "Use an apostille if your country issues one. If it does not, the documents must be legalized through the proper diplomatic route. Confirm the route for Nepali documents with the embassy.",
          "Order certified translations into Slovenian or English as the university and embassy require.",
        ],
        links: [apostilleLink],
      },
      {
        id: "visa",
        title: "Apply for your first temporary residence permit at the embassy",
        summary: "Nepali citizens need a visa to enter Slovenia, so you apply for the first study permit at the Slovenian embassy before you travel.",
        bullets: [
          "The Slovenian Embassy in New Delhi lists Nepal among the countries whose citizens need a visa.",
          "You give your fingerprints at the embassy and the permit is delivered there for pickup.",
          "Register your residence in Slovenia after you collect the card.",
        ],
        links: [
          { label: "Download the Slovenia visa checklist", url: "https://docs.google.com/document/d/1Xkcj32TWENHX6E7YCNZtGRVc6Gnxh2VHXwJYWe4RvTk/edit?usp=sharing" },
          { label: "Official embassy visa information", url: "https://www.gov.si/en/representations/embassy-new-delhi/visa-information" },
        ],
      },
    ],
    community: { label: "Journey to Slovenia Study Visa", url: "https://chat.whatsapp.com/Kn41Xkw9cbsGS9BQ9SWN4W" },
    blog: { matchTags: ["Study in Slovenia", "Slovenia"] },
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
export const getStudyCountry = (slug?: string): StudyCountry | undefined =>
  STUDY_COUNTRIES.find((c) => c.slug === (slug ?? "").toLowerCase());

const norm = (s: string) => s.trim().toLowerCase();

/** Does a blog post belong to this country hub? Uses category + tags (merged into `post.tags`). */
export function postMatchesCountry(post: BlogPost, country: StudyCountry): boolean {
  const tags = (post.tags ?? []).map(norm);
  const { matchTags, titleKeywords = [], excludeCategories = [] } = country.blog;

  // The first tag is the post's category (see toDisplayPost in useHashnodeBlog).
  const category = tags[0];
  if (category && excludeCategories.map(norm).includes(category)) return false;

  const wanted = matchTags.map(norm);
  if (tags.some((t) => wanted.includes(t))) return true;

  if (titleKeywords.length) {
    const hay = `${post.title} ${post.slug}`.toLowerCase();
    return titleKeywords.some((k) => new RegExp(`\\b${k.toLowerCase()}\\b`).test(hay.replace(/-/g, " ")));
  }
  return false;
}

export const filterPostsByCountry = (posts: BlogPost[], country: StudyCountry): BlogPost[] =>
  posts.filter((p) => postMatchesCountry(p, country));
