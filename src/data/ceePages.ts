// Content config for the /cee/* SEO landing pages. Numbers marked "from MEC lists" are computed from the complete
// MECEE-BL 2027 (BS 2083) result PDFs; seat counts come from the MEC 2083/84 allocation (see nepalColleges.ts).
import type { ResultProgram } from "@/lib/ceeResults";

export interface CeeFaq { q: string; a: string }
export interface CeeSection {
  h2: string;
  paragraphs?: string[];
  bullets?: string[];
  table?: { head: string[]; rows: (string | number)[][] };
  links?: { label: string; to: string }[];
}
export interface CeePageConfig {
  slug: string;
  program: ResultProgram | null;
  title: string;
  h1: string;
  description: string;
  subtitle: string;
  faqs: CeeFaq[];
  /** Show the roll-number predictor (the result page). */
  embedPredictor?: boolean;
  /** Programs whose fact cards are shown (defaults: the page's program, or all three). */
  factsFor?: ResultProgram[];
  /** Render the MBBS scholarship quota table. */
  quotaTable?: boolean;
  /** Extra editorial sections, rendered identically by the React page and the static prerender. */
  sections?: CeeSection[];
}

export const CEE_FACTS: Record<ResultProgram, { cutoff: number; qualified: number; top: number; published: string; seats: number; colleges: number }> = {
  MBBS: { cutoff: 56.25, qualified: 10321, top: 187.5, published: "18 Nov 2026", seats: 2745, colleges: 28 },
  BDS: { cutoff: 62.25, qualified: 6256, top: 183.75, published: "19 Nov 2026", seats: 625, colleges: 15 },
  "BSc Nursing": { cutoff: 48, qualified: 10805, top: 181, published: "21 Nov 2026", seats: 2640, colleges: 59 },
};

const resultFaqs: CeeFaq[] = [
  { q: "How do I check my CEE (MECEE-BL 2027) result by roll number?", a: "Enter your roll number in the checker on this page. It matches the complete MEC result lists for MBBS, BDS and BSc Nursing and shows your exact rank, score and percentile." },
  { q: "What is the qualifying cut-off in CEE 2083?", a: "MEC's 50th-percentile qualifying scores are 56.25 for MBBS, 62.25 for BDS and 48 for BSc Nursing/Midwifery. Qualifying does not guarantee a seat; admission depends on rank, quota and seat availability." },
  { q: "When were the CEE results published?", a: "MBBS on 18 Nov 2026, BDS on 19 Nov 2026 and BSc Nursing/Midwifery on 21 Nov 2026, by the Medical Education Commission." },
  { q: "How many candidates qualified?", a: "10,321 for MBBS, 6,256 for BDS and 10,805 for BSc Nursing, per the MEC result lists." },
  { q: "What if my rank is too low for a Nepal seat?", a: "Your report shows named India and abroad alternatives. Recruitly Group charges NPR 0 for seat booking and free counselling for India and international destinations." },
];

export const CEE_PAGES: CeePageConfig[] = [
  {
    slug: "result-2083", program: null, embedPredictor: true,
    title: "CEE Result 2083 (MECEE-BL 2027): Check Rank by Roll Number | Recruitly Group",
    h1: "CEE Result 2083: Check Your Rank, Score & College Chances",
    description: "Check your MECEE-BL 2027 (CEE 2083) rank, score and percentile by roll number for MBBS, BDS and BSc Nursing, then see the Nepal scholarship and paying colleges you can target.",
    subtitle: "Enter your roll number. We match it against all 27,000+ qualified candidates in the MEC result lists and name the colleges you can realistically aim for.",
    faqs: resultFaqs,
  },
  {
    slug: "mbbs-colleges-nepal", program: "MBBS",
    title: "MBBS Colleges in Nepal 2083/84: Seats, Fees & Scholarship Cut-offs | Recruitly Group",
    h1: "MBBS Colleges in Nepal 2083/84: Seats, Fee Ceiling & Scholarship Cut-offs",
    description: "All 28 MBBS institutions in Nepal with MEC seat allocation for 2083/84, government vs private status, MEC fee ceilings and real scholarship closing ranks by quota (2080–2082).",
    subtitle: "Every MBBS college in Nepal, how many seats it has, what MEC lets it charge, and the rank that won a scholarship seat in each quota.",
    faqs: [
      { q: "How many MBBS seats are there in Nepal for 2083/84?", a: "MEC allocated 2,745 MBBS seats across 28 institutions for 2083/84. Last cycle (2082) 691 of the 2,635 seats were government scholarship seats." },
      { q: "What is the MBBS fee ceiling in Nepal?", a: "For Nepali paying seats, reported MEC ceilings are about NPR 45.96 lakh outside the Kathmandu Valley and roughly NPR 40.2–41.7 lakh inside it (sources differ). Check the current MEC fee notice before paying." },
      { q: "What rank gets an MBBS scholarship seat?", a: "In 2082 the last Open-merit scholarship seat closed at rank 453 (score 146). Reserved quotas close at higher ranks, for example Female at 2,723. The table on this page lists every quota for 2080–2082." },
      { q: "Which MBBS colleges are government colleges?", a: "IOM Maharajgunj, BPKIHS Dharan, Patan Academy of Health Sciences, Karnali Academy of Health Sciences, Pokhara Academy of Health Sciences, Madan Bhandari Academy, Madhesh Institute and Martyr Dasharath Chand University." },
      { q: "What is the CEE MBBS qualifying score for 2083?", a: "56.25, with 10,321 candidates qualifying on the MEC list published 18 Nov 2026." },
    ],
  },
  {
    slug: "bds-colleges-nepal", program: "BDS",
    title: "BDS Colleges in Nepal 2083/84: Seats & MEC Fee Ceiling | Recruitly Group",
    h1: "BDS Colleges in Nepal 2083/84: Seats, Fees & Cut-off",
    description: "All 15 BDS (dental) colleges in Nepal with MEC seat allocation for 2083/84, government vs private status and the MEC fee ceiling, plus the CEE 2083 BDS qualifying cut-off.",
    subtitle: "Dental seats are scarce: 625 seats for 6,256 qualified candidates. See where they are and what they cost.",
    faqs: [
      { q: "How many BDS seats are there in Nepal?", a: "625 BDS seats across 15 institutions in the MEC 2083/84 allocation, against 6,256 candidates who qualified." },
      { q: "What is the BDS fee in Nepal?", a: "The reported MEC ceiling for Nepali paying BDS seats is about NPR 20.92 lakh. Government colleges BPKIHS and IOM offer scholarship seats." },
      { q: "What is the CEE BDS cut-off for 2083?", a: "62.25 (50th percentile). The top BDS score was 183.75." },
      { q: "Which colleges teach BDS in Nepal?", a: "Government: BPKIHS and IOM Maharajgunj. Private: the colleges listed in the table on this page, including KUSMS, KMC, NMC, People's Dental, Kantipur Dental and others." },
    ],
  },
  {
    slug: "bsc-nursing-colleges-nepal", program: "BSc Nursing",
    title: "BSc Nursing Colleges in Nepal 2083/84: Seats, Fees & CEE Cut-off | Recruitly Group",
    h1: "BSc Nursing Colleges in Nepal 2083/84: Seats, MEC Fee & CEE Cut-off",
    description: "All 59 BSc Nursing colleges in Nepal with MEC seat allocation for 2083/84, government campuses vs private colleges, the MEC fee ceiling and the CEE 2083 qualifying cut-off.",
    subtitle: "2,640 BSc Nursing seats in 59 colleges. Find the government campuses, private colleges and what MEC allows them to charge.",
    faqs: [
      { q: "How many BSc Nursing seats are there in Nepal?", a: "2,640 seats across 59 colleges in the MEC 2083/84 allocation; 10,805 candidates qualified in the MECEE-BL 2027 nursing list." },
      { q: "What is the BSc Nursing fee ceiling in Nepal?", a: "Reported MEC ceiling for Nepali paying seats: about NPR 10.36 lakh for the programme. Government campuses give scholarship seats." },
      { q: "What is the CEE BSc Nursing cut-off for 2083?", a: "48 (50th percentile). The top score was 181." },
      { q: "Is there an alternative to Nepal for BSc Nursing?", a: "Yes. India admits BSc Nursing on merit without NEET (RGUHS-affiliated colleges in Bangalore, for example) and Recruitly Group also supports nurse pathways to Germany." },
    ],
  },
  {
    slug: "mbbs-scholarship-cutoff-rank", program: null, factsFor: ["MBBS"], quotaTable: true,
    title: "MBBS Scholarship Cut-off Rank in Nepal by Quota (2080–2082) | Recruitly Group",
    h1: "MBBS Scholarship Cut-off Rank in Nepal: Open, Female, Janajati, Dalit & Every Quota",
    description: "The last rank and score that won an MBBS scholarship seat in Nepal in each quota (Open, Female, Janajati, Madhesi, Dalit, Tharu, Muslim and more) for BS 2080, 2081 and 2082.",
    subtitle: "What rank do you need for a government MBBS scholarship? Real closing ranks for all 14 quotas across three years, from MEC results.",
    sections: [
      { h2: "What the closing ranks show", paragraphs: [
        "In BS 2082, 691 MBBS scholarship seats were filled, 380 of them on Open merit. The last Open-merit candidate admitted had rank 453 and a score of 146.",
        "Open-merit closing rank has moved up each year: 291 in 2080, 363 in 2081 and 453 in 2082. A rank that looked safe two years ago may now be borderline.",
        "Reserved quotas close much later because they compete only within the quota. Female closed at rank 2,723 in 2082, Adivasi Janajati at 3,633, Tharu at 3,998 and Dalit at 5,271.",
        "Quota closing ranks can swing a lot from year to year, especially for small quotas: Muslim moved from rank 644 (2080) to 1,734 (2082) and Disability from 1,247 (2080) to 4,171 (2081) to 3,070 (2082).",
      ] },
      { h2: "How to use these numbers", bullets: [
        "Find your quota in the table and compare your CEE rank with the 2082 closing rank. At or inside it is a strong sign; within roughly 15% beyond it is borderline.",
        "Look at all three years, not just the latest. A quota that closed much later in one year can do so again.",
        "You can compete in Open merit and in your quota at the same time. Check both.",
        "These are national quota ranks, not college-wise cut-offs. Which government college you get depends on your preference order at MEC counselling.",
      ] },
      { h2: "Check your own rank", paragraphs: ["Enter your roll number to see your exact rank in the MECEE-BL 2027 MBBS list and which named scholarship and paying colleges fit it."], links: [
        { label: "Check my rank & college chances", to: "/cee/result-2083" }, { label: "All MBBS colleges in Nepal", to: "/cee/mbbs-colleges-nepal" },
      ] },
    ],
    faqs: [
      { q: "What rank is needed for an MBBS scholarship seat in Nepal?", a: "In 2082 the last Open-merit scholarship seat closed at rank 453 (score 146). Reserved quotas close at higher ranks, for example Female 2,723, Adivasi Janajati 3,633 and Dalit 5,271." },
      { q: "How many MBBS scholarship seats are there?", a: "691 scholarship seats were filled in 2082, including 380 Open-merit seats and 85 in the Female quota." },
      { q: "Did the cut-off rank go up or down?", a: "Open-merit closing rank rose from 291 (2080) to 363 (2081) to 453 (2082). Reserved quotas moved in both directions." },
      { q: "Can I apply in Open merit and my quota?", a: "Yes. Check your rank against both the Open closing rank and your quota's closing rank." },
      { q: "Are these this year's cut-offs?", a: "No. They are the final closing ranks for BS 2080–2082. MEC publishes the 2083 closing ranks only after counselling." },
    ],
  },
  {
    slug: "mbbs-abroad-for-nepali-students", program: null, factsFor: ["MBBS"],
    title: "MBBS Abroad for Nepali Students: Georgia, Philippines, India, Italy & MEC Rules | Recruitly Group",
    h1: "MBBS Abroad for Nepali Students: Costs, MEC Eligibility Letter & What to Check",
    description: "Compare MBBS/MD in Georgia, the Philippines, India and Europe for Nepali students: indicative fees, duration and the MEC eligibility letter, Nepal Medical Council registration and NMCLE rules.",
    subtitle: "Didn't get a Nepal seat, or can't afford the paying fee? Here is how the main MBBS-abroad options compare, and the Nepal rules you must follow first.",
    sections: [
      { h2: "Compare the main options", table: {
        head: ["Destination", "Programme", "Duration", "Indicative tuition", "Key entry condition"],
        rows: [
          ["Nepal (paying seat)", "MBBS", "5.5 years", "MEC ceiling about NPR 40.2–46.0 lakh in total", "Qualify in CEE (MECEE-BL) and rank within capacity"],
          ["India", "MBBS", "5.5 years", "Varies by college; fee sheet on request", "NEET-UG qualification, plus MEC eligibility letter"],
          ["Georgia (private universities)", "MD", "6 years", "About US$5,000–8,000 per year; realistic total US$50,000–65,000 with living costs", "MEC eligibility letter; check NMC and Nepal Medical Council recognition"],
          ["Philippines", "MD", "4 years (after BSc) or 5.5–6 years (BS-MD from 10+2)", "About US$2,500–7,500 per year", "NMAT; MEC eligibility letter"],
          ["Italy (public universities)", "Medicine (English-taught)", "6 years", "Income-based tuition; DSU scholarships can cover tuition, housing and meals", "IMAT entrance test, strong English"],
          ["Germany", "Humanmedizin (no MBBS)", "About 6 years 3 months", "Tuition usually €0 (varies by state); living costs apply", "German at about C1 before you start"],
        ],
      }, paragraphs: ["Figures are indicative and come from our country guides, written from university and regulator sources. Fees change every year, so confirm them in writing before you pay anything."] },
      { h2: "Nepal rules to follow before you apply abroad", bullets: [
        "The Medical Education Commission (MEC) requires Nepali students going abroad for a medical degree to pass its entrance examination (MECEE-BL) and obtain an eligibility letter / No Objection Certificate through the official government process.",
        "Check the current MEC notice and the Ministry of Education NOC portal (noc.moest.gov.np) before applying to any university.",
        "To practise in Nepal you must have the degree recognised and registered by the Nepal Medical Council and pass the Nepal Medical Council Licensing Examination (NMCLE).",
        "Recognition is not automatic for every foreign university. Ask the Nepal Medical Council in writing how it treats the specific university and degree you are considering.",
      ] },
      { h2: "Read our country guides", links: [
        { label: "MBBS in Georgia 2027: fees and recognition", to: "/blog/mbbs-in-georgia-2027-guide-international-students" },
        { label: "MD / MBBS in the Philippines: tuition and NMAT", to: "/blog/study-medicine-md-mbbs-in-the-philippines-international-students" },
        { label: "Study medicine in Italy from Nepal", to: "/blog/study-medicine-in-italy-from-nepal" },
        { label: "MBBS in Germany 2027-28", to: "/blog/mbbs-in-germany-2027-guide-international-students" },
        { label: "Study MBBS, BDS & BSc Nursing in India with free seat booking", to: "/student-recruitment/india" },
        { label: "Check my CEE rank first", to: "/cee/result-2083" },
      ] },
    ],
    faqs: [
      { q: "Do Nepali students need MEC permission to study MBBS abroad?", a: "Yes. MEC requires passing MECEE-BL and obtaining an eligibility letter / NOC through the official process before enrolling abroad. Check the current notice before applying." },
      { q: "How much does MBBS in Georgia cost for Nepali students?", a: "Tuition is roughly US$5,000–8,000 per year at private universities, and a realistic six-year total including living costs is about US$50,000–65,000, per our Georgia guide." },
      { q: "How much does MD in the Philippines cost?", a: "Annual MD tuition is roughly US$2,500–7,500 depending on the university, plus living costs. Entry is through the NMAT." },
      { q: "Will a foreign MBBS be valid in Nepal?", a: "You must have the degree recognised and registered by the Nepal Medical Council and pass the NMCLE. Recognition is not automatic for every university, so ask in writing before you enrol." },
      { q: "Does Recruitly Group charge for seat booking?", a: "No. Recruitly Group charges NPR 0 for seat booking and free counselling for India and international destinations." },
    ],
  },
];

export const getCeePage = (slug?: string) => CEE_PAGES.find((p) => p.slug === slug);
