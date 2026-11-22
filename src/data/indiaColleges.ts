// Named Indian institutions shown to Nepali candidates whose Nepal chances are low/borderline (or who prefer private options abroad).
// Fees appear ONLY where Recruitly holds the college's own fee circular (the two Bangalore nursing colleges). All other fees: "on request".
// Seat availability for Nepali nationals and fees change every year; counsellors confirm current figures before any commitment.

export type IndiaProgram = "MBBS" | "BDS" | "BSc Nursing";

export interface IndiaCollege {
  name: string;
  city: string;
  note?: string;
  programs: IndiaProgram[];
  fee?: {
    currency: "INR";
    yearly: { f?: number[]; m?: number[]; all?: number[] }; // year 1..4
    includes: string;
    extras: string[];
  };
}

const NURSING_EXTRAS = ["University fee ₹10,000", "Uniform ₹6,000", "Hostel deposit ₹10,000"];

export const INDIA_COLLEGES: IndiaCollege[] = [
  { name: "Kasturba Medical College (Manipal & Mangalore)", city: "Manipal / Mangalore, Karnataka", note: "MAHE deemed university", programs: ["MBBS", "BDS"] },
  { name: "M S Ramaiah Medical College", city: "Bengaluru, Karnataka", programs: ["MBBS", "BDS"] },
  { name: "JSS Medical College", city: "Mysuru, Karnataka", note: "JSS AHER deemed university", programs: ["MBBS", "BDS"] },
  { name: "Yenepoya Medical College", city: "Mangalore, Karnataka", note: "Yenepoya deemed university", programs: ["MBBS", "BDS"] },
  { name: "KLE Academy of Higher Education (J N Medical College)", city: "Belagavi, Karnataka", programs: ["MBBS", "BDS"] },
  { name: "SRM Medical College Hospital", city: "Chennai, Tamil Nadu", programs: ["MBBS", "BDS"] },
  { name: "Sharda University", city: "Greater Noida, Delhi NCR", programs: ["MBBS", "BDS"] },
  { name: "Bharati Vidyapeeth Medical College", city: "Pune, Maharashtra", note: "Deemed university", programs: ["MBBS", "BDS"] },
  { name: "Symbiosis Medical College for Women", city: "Pune, Maharashtra", programs: ["MBBS"] },
  { name: "Krupanidhi College of Nursing", city: "Bengaluru, Karnataka", note: "RGUHS-affiliated", programs: ["BSc Nursing"] },
  {
    name: "Bangalore College of Nursing", city: "Chandapura, Bengaluru", note: "RGUHS-affiliated · approved by Karnataka Nursing Council & Indian Nursing Council", programs: ["BSc Nursing"],
    fee: {
      currency: "INR",
      yearly: { f: [370000, 165000, 165000, 165000], m: [390000, 175000, 175000, 175000] },
      includes: "Food and accommodation",
      extras: [...NURSING_EXTRAS, "Books ₹5,000/year"],
    },
  },
  {
    name: "Gloria Group of Institutions", city: "Electronic City, Bengaluru", note: "RGUHS-affiliated · recognised by Govt. of Karnataka · approved by INC & KNC", programs: ["BSc Nursing"],
    fee: {
      currency: "INR",
      yearly: { all: [275000, 175000, 175000, 175000] },
      includes: "Food and accommodation",
      extras: NURSING_EXTRAS,
    },
  },
];

export const totalFee = (y: number[]) => y.reduce((a, b) => a + b, 0);
