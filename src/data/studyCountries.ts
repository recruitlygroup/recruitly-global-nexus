// src/data/studyCountries.ts
//
// Single source of truth for the student-recruitment country hubs
// (/student-recruitment and /student-recruitment/:slug).
//
// HOW TO ADD A COUNTRY
//   1. Append one object to STUDY_COUNTRIES below (copy any existing entry).
//   2. Tag your blog posts with the country, e.g. `category: "Study in Poland"`
//      or add "Study in Poland" to `tags` in the post frontmatter. The hub picks
//      them up automatically through `blog.matchTags` — no component changes.
//   3. Run `npm run sitemap` (it also runs on every build) to list the new URL.
//
// EDITORIAL NOTE: figures such as fees, deadlines and permit durations change
// every year, so the copy deliberately points students to the official source
// instead of quoting numbers. Have the admissions team review before launch.

import { APOSTILLE_SEWA_URL } from "@/config/nav";
import type { BlogPost } from "@/hooks/useHashnodeBlog";

// ── Shared resources (same for every country unless overridden) ──────────────
export const STUDENT_RESOURCES = {
  wisescore: "/wisescore",
  apostille: APOSTILLE_SEWA_URL,
  visaChecklist: "https://docs.google.com/document/d/10vvxUy0ZpqRZUcAIvsnduFZa3yutbNYM3O6zDt43GDk/edit?usp=sharing",
  scholarshipSheet:
    "https://docs.google.com/spreadsheets/d/1kb-voQmWtme1QQiSiz86IR2HEwjcD5PS/edit?usp=sharing&ouid=116131303549482668853&rtpof=true&sd=true",
} as const;

export const SOCIAL_LINKS = [
  { id: "youtube", label: "YouTube", handle: "@recruitlygroup", url: "https://www.youtube.com/@recruitlygroup" },
  { id: "instagram", label: "Instagram", handle: "@recruitlygroup", url: "https://www.instagram.com/recruitlygroup" },
  { id: "tiktok", label: "TikTok", handle: "@recruitlygroup", url: "https://www.tiktok.com/@recruitlygroup" },
] as const;

export const ORIENTATION_NOTICE =
  "Join our weekly orientation program where we guide students through their complete study visa journey.";

// ── Types ────────────────────────────────────────────────────────────────────
export type RoadmapStepId = "score" | "documents" | "preenrollment" | "legalization" | "visa" | "scholarships";

export interface RoadmapLink { label: string; url: string; internal?: boolean }

export interface RoadmapStep {
  id: RoadmapStepId;
  title: string;
  summary: string;
  bullets: string[];
  links: RoadmapLink[];
}

/** Per-country tweaks to the uniform roadmap. Anything omitted falls back to the shared default. */
export type RoadmapOverrides = Partial<Record<RoadmapStepId, Partial<Pick<RoadmapStep, "title" | "summary" | "bullets">> & { extraBullets?: string[] }>>;

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
  roadmap?: RoadmapOverrides;
  /** Free self-application WhatsApp community, if one exists yet. */
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

// ── Default roadmap ──────────────────────────────────────────────────────────
function baseRoadmap(c: StudyCountry): RoadmapStep[] {
  const o = c.roadmap ?? {};
  const merge = (id: RoadmapStepId, base: Omit<RoadmapStep, "id">): RoadmapStep => {
    const ov = o[id] ?? {};
    return {
      id,
      title: ov.title ?? base.title,
      summary: ov.summary ?? base.summary,
      bullets: [...(ov.bullets ?? base.bullets), ...(ov.extraBullets ?? [])],
      links: base.links,
    };
  };

  return [
    merge("score", {
      title: "Check your AI score and shortlist universities",
      summary: `Start with a free WiseScore. It estimates how strong your profile is for ${c.name} and suggests universities that fit.`,
      bullets: [
        "Enter your grades, English level, study gap and intended program.",
        "Use the AI shortlist to pick 3–5 realistic universities, not just famous ones.",
        "Compare each shortlisted university's intake dates, language of instruction and fees on its official site.",
      ],
      links: [{ label: "Check my WiseScore", url: STUDENT_RESOURCES.wisescore, internal: true }],
    }),
    merge("documents", {
      title: "Prepare your documents",
      summary: "Gather the general documents almost every university and embassy asks for. Start early: some take weeks to issue.",
      bullets: [
        "Valid passport (check the minimum validity your embassy requires).",
        "Academic transcripts, certificates and graduation/leaving certificates.",
        "English test result or medium-of-instruction letter, if the program asks for one.",
        "CV and motivation letter written for the specific program.",
        "Recent passport-size photos and birth certificate.",
        "Proof of funds and a sponsor's financial documents.",
        "Police clearance and medical documents, often needed at the visa stage.",
      ],
      links: [],
    }),
    merge("preenrollment", {
      title: "Apply to one university for pre-enrollment",
      summary: "Pick a single university for your pre-enrollment and visa file. Switching after you apply costs time and can cost the intake.",
      bullets: [
        "Choose one university and one program as your main choice before you lodge anything.",
        "Apply to backup universities only at the admission stage, and withdraw them before your visa application.",
        "Never submit visa files tied to two universities. Embassies assess one admission letter at a time.",
        "Save every application number, email and portal screenshot in one folder.",
      ],
      links: [],
    }),
    merge("legalization", {
      title: "Legalize your documents (apostille and recognition)",
      summary: "Foreign academic documents usually need authentication before a university or embassy accepts them.",
      bullets: [
        "Authenticate certificates through the steps your country and the destination require. This is commonly the home-country authorities followed by an apostille or embassy legalization.",
        "Where recognition or comparability is required, such as DOV or CIMEA for Italy, apply early because it can take several weeks.",
        "Order sworn or certified translations after legalization if the receiving country needs them.",
      ],
      links: [{ label: "Apostille and legalization with Apostille Sewa", url: STUDENT_RESOURCES.apostille }],
    }),
    merge("visa", {
      title: "Prepare for your visa",
      summary: "Once you hold an admission letter, build your visa file against the official checklist and book your appointment.",
      bullets: [
        "Download the official visa checklist and tick off each item before your appointment.",
        "Match every name, date and amount across documents. Small inconsistencies are a common reason for delays.",
        "Rules and fees change, so confirm requirements on the embassy or immigration website before you submit.",
      ],
      links: [{ label: "Download the visa checklist", url: STUDENT_RESOURCES.visaChecklist }],
    }),
    merge("scholarships", {
      title: "Find regional scholarships and application windows",
      summary: "Scholarships have fixed windows, and several close before your university decision. Track them from day one.",
      bullets: [
        "Check university merit awards and national or regional funding for your intake.",
        "Note each deadline next to your document timeline, since legalized documents are often required.",
        "Our live sheet tracks regional scholarship deadlines in one place.",
      ],
      links: [{ label: "Open the scholarship deadline sheet", url: STUDENT_RESOURCES.scholarshipSheet }],
    }),
  ];
}

export const buildRoadmap = baseRoadmap;

// ── Countries ────────────────────────────────────────────────────────────────
export const STUDY_COUNTRIES: StudyCountry[] = [
  {
    slug: "india",
    name: "India",
    flag: "🇮🇳",
    tagline: "Affordable, English-taught degrees with a huge choice of universities. Strong in nursing, medicine, engineering and IT.",
    overview: {
      intro:
        "India has one of the largest higher-education systems in the world, with thousands of universities and colleges teaching in English. For many students from South Asia it is the closest and most affordable route to a recognized degree.",
      paragraphs: [
        "Choice is the biggest strength and the biggest risk. Government and well-established private institutions offer strong teaching and clinical or industry exposure, while some colleges are poorly regulated. That is why verifying recognition (for example Indian Nursing Council and state council approval for nursing, or National Medical Commission rules for medicine) matters before you pay anything.",
        "Tuition and living costs are far lower than in most Western destinations, and campus life, hostels and food are familiar for students from the region. Degrees in nursing, pharmacy, engineering, management and IT are especially popular, and graduates often continue to further study or work at home or abroad.",
      ],
      highlights: [
        { title: "Education quality", body: "Wide choice of accredited universities. Check recognition with the regulator for your field before applying." },
        { title: "Cost", body: "Tuition and living costs are generally lower than in Europe, but fees vary a lot between colleges." },
        { title: "Entry rules", body: "Entry requirements depend on your nationality. Some citizens need no student visa, others do, so confirm yours with the Indian mission." },
        { title: "After graduation", body: "A recognized Indian degree opens doors to postgraduate study and to licensing in your home country, where the home regulator accepts it." },
      ],
    },
    roadmap: {
      preenrollment: {
        extraBullets: ["Confirm the college's regulator approval and your program's recognition in your home country before paying any seat or registration fee."],
      },
      legalization: {
        extraBullets: ["Some universities ask for an equivalence certificate for foreign school or bachelor's qualifications, for example from the Association of Indian Universities. Ask your university which one it accepts."],
      },
      visa: {
        summary: "Whether you need a student visa depends on your nationality. If you do, apply with your admission letter and the official checklist.",
        extraBullets: ["Check the current rule for your passport on the official Indian mission or immigration website before booking travel."],
      },
    },
    community: { label: "Journey to India Study Visa", url: "https://chat.whatsapp.com/E9xw95owGPQLckTfWmS74n" },
    blog: {
      matchTags: ["Study in India", "Study nursing in India", "Nursing Programs"],
      titleKeywords: ["india", "indian"],
      excludeCategories: ["Employer Guides", "State Guides", "College Partnerships"],
    },
  },
  {
    slug: "italy",
    name: "Italy",
    flag: "🇮🇹",
    tagline: "Public universities with income-based fees, regional scholarships and a clear pre-enrollment process through Universitaly.",
    overview: {
      intro:
        "Italy combines some of Europe's oldest universities with public tuition that is tied to family income, and generous regional scholarships. It is one of the most popular European destinations for students from South Asia.",
      paragraphs: [
        "Admission runs through the Universitaly portal and the university's own platform. International applicants usually complete pre-enrollment first, then sit any required entrance test or evaluation, and apply for a visa with the admission or pre-enrollment confirmation. Medicine and some health programs use national entrance exams such as IMAT, so timing matters.",
        "Public universities charge fees based on income documents, and regional bodies award DSU scholarships that can cover tuition, accommodation and meals for eligible students. Graduates may be able to stay after their degree to look for work, subject to the permit rules at the time.",
      ],
      highlights: [
        { title: "Education quality", body: "Long-established public universities, with many English-taught Bachelor's and Master's programs." },
        { title: "Cost", body: "Fees at public universities depend on income documents, and regional DSU scholarships can reduce costs further." },
        { title: "Student experience", body: "Compact, walkable university cities with student housing, canteens and strong international communities." },
        { title: "After graduation", body: "Graduates can apply for a permit that lets them stay to look for work, subject to current rules." },
      ],
    },
    roadmap: {
      preenrollment: {
        summary: "Italy's Universitaly pre-enrollment lets you select only one university. Choose it carefully before you submit.",
        extraBullets: ["Check the pre-enrollment window and any entrance test dates for your program on the Universitaly portal and the university site."],
      },
      legalization: {
        summary: "Italian universities and embassies often need your qualification verified. Plan for DOV, CIMEA and an apostille.",
        extraBullets: [
          "DOV (Dichiarazione di Valore) is issued by the Italian diplomatic mission in your country. Confirm whether your university and embassy still require it.",
          "CIMEA issues a Statement of Comparability that many universities accept in place of, or alongside, a DOV.",
        ],
      },
      scholarships: {
        extraBullets: ["DSU regional scholarships are applied for through each region's student-services body, and income and merit documents must be legalized and translated."],
      },
    },
    // No WhatsApp community link supplied yet: the page shows a "contact us" fallback.
    blog: { matchTags: ["Study in Italy", "Italy"] },
  },
  {
    slug: "austria",
    name: "Austria",
    flag: "🇦🇹",
    tagline: "High-ranked public universities in the heart of Europe, with moderate tuition and a safe, well-organized student life.",
    overview: {
      intro:
        "Austria offers research-focused public universities, strong technical and medical schools, and consistently high quality of life. Vienna, Graz, Innsbruck and Klagenfurt are all well-regarded student cities.",
      paragraphs: [
        "Most Bachelor's programs are taught in German, while English-taught options are concentrated at Master's level. If your program is in German you will need to prove your language level. Admission eligibility for your school-leaving qualification varies, so confirm it with the university before applying.",
        "Public university tuition for non-EU students is moderate by international standards, with an administrative student fee on top. Living costs in Vienna are higher than in smaller cities, and the study residence permit requires proof of funds, accommodation and health insurance.",
      ],
      highlights: [
        { title: "Education quality", body: "Respected public universities with strong research, technical and health programs." },
        { title: "Cost", body: "Moderate public tuition for non-EU students, but a funds requirement applies to your residence permit." },
        { title: "Language", body: "English-taught programs are most common at Master's level. German is needed for many Bachelor's programs." },
        { title: "After graduation", body: "Graduates can apply for a permit to look for qualified work, subject to current rules." },
      ],
    },
    roadmap: {
      preenrollment: {
        extraBullets: ["Apply to one university for your visa file and confirm its admission deadlines, since many Austrian universities close applications months before the semester starts."],
      },
      legalization: {
        extraBullets: ["Austrian universities and authorities typically want apostilled or legalized documents plus certified German or English translations. Ask your university what it accepts."],
      },
      visa: {
        summary: "Most non-EU students need a study residence permit. Build your file around proof of admission, funds, accommodation and health insurance.",
      },
    },
    community: { label: "Journey to Austria Study Visa", url: "https://chat.whatsapp.com/JNjKdYbY85dG8t3IQYQHR3" },
    blog: { matchTags: ["Study in Austria", "Austria"] },
  },
  {
    slug: "lithuania",
    name: "Lithuania",
    flag: "🇱🇹",
    tagline: "A Schengen and EU country with affordable living, many English-taught programs and a fast-growing international student community.",
    overview: {
      intro:
        "Lithuania is a small, digital-first EU country with modern universities in Vilnius, Kaunas and Klaipėda. It has built a reputation for English-taught programs, good value and a welcoming student environment.",
      paragraphs: [
        "Universities offer English-taught Bachelor's and Master's degrees in business, IT, engineering, health and social sciences. Tuition and living costs are lower than in much of Western Europe, which makes it attractive for families comparing budgets.",
        "As an EU and Schengen member, Lithuania also gives students a base to travel and to build a European network. Prior qualifications are usually assessed for recognition, so check which documents your chosen university needs early in the process.",
      ],
      highlights: [
        { title: "Education quality", body: "Modern universities with a growing catalogue of English-taught programs." },
        { title: "Cost", body: "Lower tuition and living costs than many Western European destinations." },
        { title: "Student experience", body: "Compact capital, fast internet and an active international student community." },
        { title: "After graduation", body: "Graduates may be able to stay to look for work, subject to current migration rules." },
      ],
    },
    roadmap: {
      legalization: {
        extraBullets: ["Lithuanian universities may need your prior qualification recognized, which goes through the national quality assessment body. Ask your university whether it handles this or you must."],
      },
    },
    community: { label: "Journey to Lithuania Study Visa", url: "https://chat.whatsapp.com/IzuaaHV6ML55CfpV6wfRMh" },
    blog: { matchTags: ["Study in Lithuania", "Lithuania"] },
  },
  {
    slug: "slovakia",
    name: "Slovakia",
    flag: "🇸🇰",
    tagline: "Central European universities with English-taught medicine, engineering and business programs at accessible tuition.",
    overview: {
      intro:
        "Slovakia is a Schengen and EU country with long-established universities in Bratislava, Košice and other cities. It is known for English-taught medicine and health programs, along with engineering and business degrees.",
      paragraphs: [
        "Fees and living costs are lower than in Western Europe, while the degrees follow the European higher-education framework. Universities commonly ask for recognition of your previous school or university certificates, so allow time for this step.",
        "Because requirements differ between public universities and programs, always confirm the exact documents, language requirements and deadlines on the university's international admissions page before you commit.",
      ],
      highlights: [
        { title: "Education quality", body: "Established universities with English-taught medicine, health, engineering and business programs." },
        { title: "Cost", body: "Lower living costs than Western Europe. Tuition varies by program and university." },
        { title: "Recognition", body: "Previous certificates often need recognition and certified translation. Start this early." },
        { title: "Student experience", body: "Compact cities, student housing and easy travel across Central Europe." },
      ],
    },
    roadmap: {
      legalization: {
        extraBullets: ["Slovak universities often require recognition of your earlier certificates and certified translations into Slovak. Ask your university which recognition route it expects."],
      },
    },
    community: { label: "Journey to Slovakia Study Visa", url: "https://chat.whatsapp.com/Kciy5lxB4v04FuaWG4b2ZU" },
    blog: { matchTags: ["Study in Slovakia", "Slovakia"] },
  },
  {
    slug: "slovenia",
    name: "Slovenia",
    flag: "🇸🇮",
    tagline: "A safe, green EU country with English-taught programs at public and private universities, from Ljubljana to Maribor.",
    overview: {
      intro:
        "Slovenia is small, safe and well connected, with universities in Ljubljana, Maribor, Koper and Nova Gorica, plus private institutions offering English-taught degrees. Students get a high quality of life with easy travel to Italy, Austria and Croatia.",
      paragraphs: [
        "International students choose between public universities and private schools such as business, health and humanities institutions. Programs, tuition and application windows vary widely, so compare them side by side and always check the university's current English price list and calendar.",
        "Many programs interview applicants online before issuing an admission letter. The admission letter is then the core of your temporary residence permit file, together with proof of funds and accommodation.",
      ],
      highlights: [
        { title: "Education quality", body: "Public and private universities with a range of English-taught Bachelor's and Master's programs." },
        { title: "Cost", body: "Living costs are moderate for Europe. Tuition differs a lot between public and private institutions." },
        { title: "Student experience", body: "Safe, green and compact, with a strong outdoor and café culture." },
        { title: "After graduation", body: "Graduates may be able to stay to look for work, subject to current residence-permit rules." },
      ],
    },
    roadmap: {
      preenrollment: {
        extraBullets: ["Some Slovenian universities hold an online interview before issuing an admission letter. Prepare for it like a visa interview."],
      },
      legalization: {
        extraBullets: ["Expect apostilled documents with certified translations, and ask your university whether it needs recognition of your previous qualification."],
      },
    },
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
