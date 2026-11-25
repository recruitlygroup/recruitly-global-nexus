// Nepal college seat matrix for MBBS, BDS and BSc Nursing.
// Source: MEC seat allocation for academic session 2083/84 (notice dated 2083/06/30 BS), as republished by abroadinfonepal.com
// (collegeinfonepal.com/information/cee-result-mec). Re-verify against the MEC notice before each admission cycle.
// `type: "public"` = government-funded (75% of seats are scholarship seats); `private` = paying college (about 10-20% scholarship seats).
// `valley` matters only for the MBBS fee ceiling. `demand` ordering lives in nepalColleges demand list below and is a Recruitly assumption.

export type CollegeType = "public" | "private";

export interface NepalCollege {
  id: string;
  name: string;
  type: CollegeType;
  seats: { MBBS: number; BDS: number; "BSc Nursing": number };
  valley: boolean;
  affiliation?: string;
  city?: string;
  /** Set for institutions run by a body other than a private owner/government campus; changes the label shown. */
  operator?: "army";
}

export const NEPAL_COLLEGES: NepalCollege[] = [
  { id: "bpkihs", name: "BP Koirala Institute of Health Sciences (BPKIHS)", type: "public", seats: { MBBS: 130, BDS: 50, "BSc Nursing": 60 }, valley: false, affiliation: "BPKIHS", city: "Dharan" },
  { id: "iom", name: "Institute of Medicine (IOM), Maharajgunj Medical Campus", type: "public", seats: { MBBS: 100, BDS: 25, "BSc Nursing": 0 }, valley: true, affiliation: "TU", city: "Kathmandu" },
  { id: "iom_nursing", name: "Maharajgunj Nursing Campus", type: "public", seats: { MBBS: 0, BDS: 0, "BSc Nursing": 60 }, valley: true, affiliation: "TU", city: "Kathmandu" },
  { id: "pahs", name: "Patan Academy of Health Sciences (PAHS)", type: "public", seats: { MBBS: 65, BDS: 0, "BSc Nursing": 0 }, valley: true, affiliation: "PAHS", city: "Lalitpur" },
  { id: "pahs_nursing", name: "Lalitpur Nursing Campus (PAHS)", type: "public", seats: { MBBS: 0, BDS: 0, "BSc Nursing": 60 }, valley: true, affiliation: "PAHS", city: "Lalitpur" },
  { id: "nams", name: "National Academy of Medical Sciences (NAMS), Bir Hospital", type: "public", seats: { MBBS: 0, BDS: 0, "BSc Nursing": 140 }, valley: true, affiliation: "NAMS", city: "Kathmandu" },
  { id: "kahs", name: "Karnali Academy of Health Sciences (KAHS)", type: "public", seats: { MBBS: 50, BDS: 0, "BSc Nursing": 20 }, valley: false, affiliation: "KAHS", city: "Jumla" },
  { id: "poahs", name: "Pokhara Academy of Health Sciences", type: "public", seats: { MBBS: 50, BDS: 0, "BSc Nursing": 40 }, valley: false, city: "Pokhara" },
  { id: "pokhara_nursing", name: "Pokhara Nursing Campus", type: "public", seats: { MBBS: 0, BDS: 0, "BSc Nursing": 40 }, valley: false, city: "Pokhara" },
  { id: "biratnagar_nursing", name: "Biratnagar Nursing Campus", type: "public", seats: { MBBS: 0, BDS: 0, "BSc Nursing": 50 }, valley: false, city: "Biratnagar" },
  { id: "birgunj_nursing", name: "Birgunj Nursing Campus", type: "public", seats: { MBBS: 0, BDS: 0, "BSc Nursing": 50 }, valley: false, city: "Birgunj" },
  { id: "nepalgunj_nursing", name: "Nepalgunj Nursing Campus", type: "public", seats: { MBBS: 0, BDS: 0, "BSc Nursing": 40 }, valley: false, city: "Nepalgunj" },
  { id: "mbahs", name: "Madan Bhandari Academy of Health Sciences", type: "public", seats: { MBBS: 50, BDS: 0, "BSc Nursing": 40 }, valley: false, city: "Hetauda, Makwanpur" },
  { id: "mihs", name: "Madhesh Institute of Health Sciences", type: "public", seats: { MBBS: 50, BDS: 0, "BSc Nursing": 20 }, valley: false, city: "Janakpur" },
  { id: "mdcu", name: "Martyr Dasharath Chand University", type: "public", seats: { MBBS: 50, BDS: 0, "BSc Nursing": 20 }, valley: false, city: "Geta (Godawari-05), Kailali" },
  { id: "rapti", name: "Rapti Academy of Health Sciences", type: "public", seats: { MBBS: 0, BDS: 0, "BSc Nursing": 30 }, valley: false, city: "Dang" },
  { id: "fwu", name: "Faculty of Health Sciences, Far Western University", type: "public", seats: { MBBS: 0, BDS: 0, "BSc Nursing": 20 }, valley: false },
  { id: "narayani", name: "N.P.I. Narayani Samudayik Hospital", type: "public", seats: { MBBS: 0, BDS: 0, "BSc Nursing": 40 }, valley: false, city: "Birgunj" },
  { id: "kmc", name: "Kathmandu Medical College", type: "private", seats: { MBBS: 130, BDS: 45, "BSc Nursing": 50 }, valley: true, affiliation: "KU", city: "Kathmandu" },
  { id: "nmc", name: "Nepal Medical College", type: "private", seats: { MBBS: 130, BDS: 45, "BSc Nursing": 50 }, valley: true, affiliation: "KU", city: "Kathmandu" },
  { id: "kusms", name: "Kathmandu University School of Medical Sciences", type: "private", seats: { MBBS: 130, BDS: 50, "BSc Nursing": 60 }, valley: false, affiliation: "KU", city: "Dhulikhel" },
  { id: "cmc", name: "Chitwan Medical College", type: "private", seats: { MBBS: 130, BDS: 45, "BSc Nursing": 60 }, valley: false, city: "Bharatpur" },
  { id: "cms", name: "College of Medical Sciences Teaching Hospital", type: "private", seats: { MBBS: 130, BDS: 50, "BSc Nursing": 60 }, valley: false, city: "Bharatpur" },
  { id: "manipal", name: "Manipal College of Medical Sciences", type: "private", seats: { MBBS: 120, BDS: 0, "BSc Nursing": 60 }, valley: false, affiliation: "KU", city: "Pokhara" },
  { id: "naihs", name: "Nepalese Army Institute of Health Sciences", type: "private", seats: { MBBS: 130, BDS: 0, "BSc Nursing": 50 }, valley: true, city: "Kathmandu", operator: "army" },
  { id: "ucms", name: "Universal College of Medical Sciences", type: "private", seats: { MBBS: 120, BDS: 50, "BSc Nursing": 50 }, valley: false, affiliation: "TU", city: "Bhairahawa" },
  { id: "kist", name: "KIST Medical College", type: "private", seats: { MBBS: 120, BDS: 40, "BSc Nursing": 0 }, valley: true, affiliation: "TU", city: "Lalitpur" },
  { id: "natmed", name: "National Medical College", type: "private", seats: { MBBS: 120, BDS: 25, "BSc Nursing": 40 }, valley: false, affiliation: "TU", city: "Birgunj" },
  { id: "nobel", name: "Nobel Medical College", type: "private", seats: { MBBS: 130, BDS: 35, "BSc Nursing": 60 }, valley: false, affiliation: "KU", city: "Biratnagar" },
  { id: "birat", name: "Birat Medical College", type: "private", seats: { MBBS: 130, BDS: 0, "BSc Nursing": 60 }, valley: false, affiliation: "KU", city: "Biratnagar" },
  { id: "nepalgunj_mc", name: "Nepalgunj Medical College", type: "private", seats: { MBBS: 130, BDS: 15, "BSc Nursing": 50 }, valley: false, affiliation: "KU", city: "Nepalgunj" },
  { id: "gandaki", name: "Gandaki Medical College", type: "private", seats: { MBBS: 120, BDS: 30, "BSc Nursing": 50 }, valley: false, affiliation: "TU", city: "Pokhara" },
  { id: "lumbini", name: "Lumbini Medical College", type: "private", seats: { MBBS: 120, BDS: 0, "BSc Nursing": 60 }, valley: false, affiliation: "KU", city: "Palpa" },
  { id: "devdaha", name: "Devdaha Medical College", type: "private", seats: { MBBS: 90, BDS: 0, "BSc Nursing": 50 }, valley: false, city: "Rupandehi" },
  { id: "janaki", name: "Janaki Medical College", type: "private", seats: { MBBS: 60, BDS: 0, "BSc Nursing": 30 }, valley: false, affiliation: "TU", city: "Janakpur" },
  { id: "bc", name: "B & C Medical College", type: "private", seats: { MBBS: 60, BDS: 0, "BSc Nursing": 40 }, valley: false, affiliation: "KU", city: "Birtamod" },
  { id: "pusm", name: "Purbanchal University School of Medicine", type: "private", seats: { MBBS: 50, BDS: 0, "BSc Nursing": 0 }, valley: false, affiliation: "PU", city: "Morang" },
  { id: "sanjeevani", name: "Sanjeevani College of Medical Sciences", type: "private", seats: { MBBS: 50, BDS: 0, "BSc Nursing": 20 }, valley: false, city: "Nepalgunj, Banke (campus also in Butwal, Rupandehi)" },
  { id: "kantipur_dental", name: "Kantipur Dental College", type: "private", seats: { MBBS: 0, BDS: 60, "BSc Nursing": 0 }, valley: true, city: "Kathmandu" },
  { id: "peoples_dental", name: "People's Dental College", type: "private", seats: { MBBS: 0, BDS: 60, "BSc Nursing": 0 }, valley: true, affiliation: "TU", city: "Kathmandu" },
  { id: "nobel_college", name: "Nobel College", type: "private", seats: { MBBS: 0, BDS: 0, "BSc Nursing": 50 }, valley: false },
  { id: "asian", name: "Asian College for Advance Studies", type: "private", seats: { MBBS: 0, BDS: 0, "BSc Nursing": 30 }, valley: false },
  { id: "bb", name: "B & B Medical Institute", type: "private", seats: { MBBS: 0, BDS: 0, "BSc Nursing": 40 }, valley: false, city: "Lalitpur" },
  { id: "chakrabarti", name: "Chakrabarti Habi Education Academy", type: "private", seats: { MBBS: 0, BDS: 0, "BSc Nursing": 40 }, valley: false },
  { id: "charak", name: "Charak Academy, Pokhara", type: "private", seats: { MBBS: 0, BDS: 0, "BSc Nursing": 30 }, valley: false, city: "Pokhara" },
  { id: "crimson", name: "Crimson College of Technology", type: "private", seats: { MBBS: 0, BDS: 0, "BSc Nursing": 50 }, valley: false, city: "Butwal" },
  { id: "everest", name: "Everest College of Nursing", type: "private", seats: { MBBS: 0, BDS: 0, "BSc Nursing": 40 }, valley: false },
  { id: "hamro", name: "Hamro School of Nursing", type: "private", seats: { MBBS: 0, BDS: 0, "BSc Nursing": 40 }, valley: false },
  { id: "hope", name: "Hope International College & Hospital", type: "private", seats: { MBBS: 0, BDS: 0, "BSc Nursing": 40 }, valley: false },
  { id: "jf", name: "JF Institute of Health Science", type: "private", seats: { MBBS: 0, BDS: 0, "BSc Nursing": 40 }, valley: false },
  { id: "kantipur_academy", name: "Kantipur Academy of Health Science", type: "private", seats: { MBBS: 0, BDS: 0, "BSc Nursing": 40 }, valley: false, city: "Kathmandu" },
  { id: "kmh_nursing", name: "Kathmandu Model Hospital School of Nursing", type: "private", seats: { MBBS: 0, BDS: 0, "BSc Nursing": 40 }, valley: true, city: "Kathmandu" },
  { id: "krishna", name: "Krishna Medical & Technical Research Centre", type: "private", seats: { MBBS: 0, BDS: 0, "BSc Nursing": 40 }, valley: false },
  { id: "mmih", name: "Manmohan Memorial Institute of Health Sciences", type: "private", seats: { MBBS: 0, BDS: 0, "BSc Nursing": 50 }, valley: true, city: "Kathmandu" },
  { id: "nagarik", name: "Nagarik College of Health Sciences", type: "private", seats: { MBBS: 0, BDS: 0, "BSc Nursing": 40 }, valley: false },
  { id: "nams_academy", name: "National Academy For Medical Science", type: "private", seats: { MBBS: 0, BDS: 0, "BSc Nursing": 40 }, valley: false },
  { id: "norvic", name: "Norvic College of Health Sciences", type: "private", seats: { MBBS: 0, BDS: 0, "BSc Nursing": 50 }, valley: true, city: "Kathmandu" },
  { id: "oasis", name: "Oasis Medical College", type: "private", seats: { MBBS: 0, BDS: 0, "BSc Nursing": 20 }, valley: false },
  { id: "om", name: "Om Health Campus", type: "private", seats: { MBBS: 0, BDS: 0, "BSc Nursing": 40 }, valley: false },
  { id: "pusohs", name: "Purbanchal University School of Health Sciences", type: "private", seats: { MBBS: 0, BDS: 0, "BSc Nursing": 40 }, valley: false },
  { id: "scheer", name: "Scheer Memorial Adventist Hospital (Nursing)", type: "private", seats: { MBBS: 0, BDS: 0, "BSc Nursing": 60 }, valley: false, city: "Banepa" },
  { id: "shas", name: "School of Health and Allied Sciences (SHAS)", type: "private", seats: { MBBS: 0, BDS: 0, "BSc Nursing": 30 }, valley: false, city: "Pokhara" },
  { id: "shree", name: "Shree College of Technology", type: "private", seats: { MBBS: 0, BDS: 0, "BSc Nursing": 40 }, valley: false },
  { id: "suvekchya", name: "Suvekchya International Hospital", type: "private", seats: { MBBS: 0, BDS: 0, "BSc Nursing": 40 }, valley: false },
  { id: "yeti", name: "Yeti Health Science Academy", type: "private", seats: { MBBS: 0, BDS: 0, "BSc Nursing": 40 }, valley: false, city: "Kathmandu" },
];

/** ASSUMPTION (needs MEC counselling-history review): relative popularity of colleges among candidates, most in-demand first.
 *  Used to estimate each college's closing rank as the cumulative seat count in this order. Colleges not listed follow in seat-count order. */
export const DEMAND_ORDER: string[] = [
  "iom", "bpkihs", "pahs", "nams", "iom_nursing", "pahs_nursing", "kusms", "kmc", "nmc", "manipal", "cms", "cmc",
  "peoples_dental", "biratnagar_nursing", "birgunj_nursing", "pokhara_nursing", "nepalgunj_nursing", "poahs", "naihs", "ucms",
  "kist", "kantipur_dental", "natmed", "nobel", "birat", "nepalgunj_mc", "gandaki", "lumbini", "devdaha", "janaki", "bc",
  "pusm", "sanjeevani", "kahs", "mbahs", "mihs", "mdcu", "rapti", "fwu", "narayani",
];

// MEC fee ceilings for Nepali paying seats, session 2083 (NPR). Sources differ on the inside-valley MBBS figure
// (40,23,250 vs 41,68,090); the lower and upper values are both shown. Confirm on the current MEC fee notice.
export const FEE_CEILING_NPR = {
  MBBS_INSIDE_VALLEY: [4023250, 4168090] as const,
  MBBS_OUTSIDE_VALLEY: 4595720,
  BDS: 2092290,
  "BSc Nursing": 1036000,
};

export const MEC_SEAT_SOURCE_NOTE = "Seat matrix: MEC allocation for 2083/84. Fees: MEC ceilings for Nepali paying seats; colleges may publish different instalment schedules.";
