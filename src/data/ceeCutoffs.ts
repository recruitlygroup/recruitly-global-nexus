// Source: Recruitly CEE benchmark sheet (MEC results, BS 2080–2082). 2027 (BS 2083) results live in ceeResults2027.json.
// Every cutoff is [closingScore, closingRank] for the LOWEST FINAL admitted candidate in that quota.
// Do not edit by hand — regenerate from the source sheet when MEC publishes a new session.

export type CutoffPair = readonly [score: number, rank: number];

export interface MbbsQuota {
  id: string;
  name: string;
  seats2082: number;
  y2082: CutoffPair;
  y2081: CutoffPair;
  y2080: CutoffPair;
}

export const MBBS_QUOTAS: MbbsQuota[] = [
  { id: "open", name: "Open scholarship", seats2082: 380, y2082: [146.0, 453], y2081: [138.5, 363], y2080: [146.0, 291] },
  { id: "madhesi", name: "Madhesi quota", seats2082: 28, y2082: [143.5, 524], y2081: [134.5, 469], y2080: [140.75, 434] },
  { id: "khas_arya", name: "Khas Arya quota", seats2082: 51, y2082: [132.5, 903], y2081: [125.75, 740], y2080: [132.25, 736] },
  { id: "backward_area", name: "Backward area quota", seats2082: 12, y2082: [127.5, 1094], y2081: [118.25, 1054], y2080: [128.0, 911] },
  { id: "muslim", name: "Muslim quota", seats2082: 7, y2082: [114.25, 1734], y2081: [115.75, 1173], y2080: [134.5, 644] },
  { id: "female", name: "Female quota", seats2082: 85, y2082: [98.75, 2723], y2081: [90.0, 2707], y2080: [104.5, 2128] },
  { id: "disability", name: "Person with disability quota", seats2082: 8, y2082: [94.25, 3070], y2081: [74.25, 4171], y2080: [120.25, 1247] },
  { id: "janajati", name: "Adivasi Janajati quota", seats2082: 46, y2082: [87.5, 3633], y2081: [78.25, 3705], y2080: [99.25, 2483] },
  { id: "tharu", name: "Tharu quota", seats2082: 12, y2082: [83.75, 3998], y2081: [72.5, 4368], y2080: [94.25, 2884] },
  { id: "martyr", name: "Martyr / conflict-affected family quota", seats2082: 7, y2082: [78.75, 4506], y2081: [64.5, 5350], y2080: [101.0, 2354] },
  { id: "muslim_female", name: "Muslim female quota", seats2082: 8, y2082: [77.0, 4685], y2081: [69.0, 4781], y2080: [91.25, 3156] },
  { id: "madhesi_dalit", name: "Madhesi Dalit quota", seats2082: 10, y2082: [72.75, 5214], y2081: [78.25, 3707], y2080: [89.25, 3331] },
  { id: "dalit", name: "Dalit quota", seats2082: 27, y2082: [72.25, 5271], y2081: [77.0, 3872], y2080: [85.0, 3720] },
  { id: "dalit_female", name: "Dalit female quota", seats2082: 10, y2082: [65.25, 6261], y2081: [63.0, 5534], y2080: [64.5, 6062] },
];

export interface ProgramBenchmark {
  year: number; // BS
  passMark: number;
  passed: number;
  topScore: number;
  seats: number;
}

export const MBBS_BENCHMARKS: ProgramBenchmark[] = [
  { year: 2082, passMark: 52.25, passed: 8772, topScore: 185, seats: 2635 },
  { year: 2081, passMark: 49.5, passed: 7847, topScore: 178, seats: 2525 },
  { year: 2080, passMark: 59, passed: 6832, topScore: 182.5, seats: 2400 },
];

export const BDS_BENCHMARKS: ProgramBenchmark[] = [
  { year: 2082, passMark: 63.75, passed: 4544, topScore: 186, seats: 625 },
  { year: 2081, passMark: 57.25, passed: 3416, topScore: 176.25, seats: 600 },
  { year: 2080, passMark: 55, passed: 2682, topScore: 162.75, seats: 580 },
];

export const MBBS_SCHOLARSHIP_SEATS_2082 = 691;
