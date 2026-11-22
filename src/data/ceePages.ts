// Content config for the /cee/* SEO landing pages. Numbers marked "from MEC lists" are computed from the complete
// MECEE-BL 2027 (BS 2083) result PDFs; seat counts come from the MEC 2083/84 allocation (see nepalColleges.ts).
import type { ResultProgram } from "@/lib/ceeResults";

export interface CeeFaq { q: string; a: string }
export interface CeePageConfig {
  slug: string;
  program: ResultProgram | null;
  title: string;
  h1: string;
  description: string;
  subtitle: string;
  faqs: CeeFaq[];
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
    slug: "result-2083", program: null,
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
];

export const getCeePage = (slug?: string) => CEE_PAGES.find((p) => p.slug === slug);
