// Content for the four specialised programme landing pages.
export interface NichePage {
  slug: string; title: string; eyebrow: string; subtitle: string; photo: string; photoAlt: string;
  requirements: string[]; process: string[]; destinations: string;
}

export const NICHE_PAGES: NichePage[] = [
  {
    slug: "bsc-nurses-germany",
    title: "BSc Nurses for Germany",
    eyebrow: "Healthcare · Germany",
    subtitle: "A specialised pipeline for BSc-qualified nurses with B2 German language proficiency, matched to German hospitals and care providers.",
    photo: "nurses.jpg", photoAlt: "Nurses at work in a hospital ward",
    destinations: "Germany",
    requirements: ["BSc Nursing degree", "German language at B2 level (certificate required)", "Valid nursing registration in country of training", "Willingness to complete German recognition (Anerkennung) procedure"],
    process: ["Profile & credential review", "Language level confirmation", "Employer matching and interviews", "Recognition & visa documentation support", "Relocation and onboarding"],
  },
  {
    slug: "heavy-drivers-eu",
    title: "Heavy Drivers for the EU",
    eyebrow: "Transport · Bulgaria, Poland, Germany",
    subtitle: "Skilled C/CE licence truck drivers for employers in Bulgaria, Poland and Germany.",
    photo: "drivers.jpg", photoAlt: "Truck driver beside a heavy goods vehicle",
    destinations: "Bulgaria, Poland, Germany",
    requirements: ["Valid C or CE category licence", "Verifiable professional driving experience", "Clean driving record", "Driver CPC / equivalent qualification (as required by the employer's country)"],
    process: ["Licence & experience verification", "Driving assessment / video demonstration", "Employer shortlisting and interview", "Work permit and visa documentation", "Arrival and onboarding"],
  },
  {
    slug: "ausbildung-germany",
    title: "Ausbildung Vocational Contracts",
    eyebrow: "Vocational training · Germany",
    subtitle: "Official Ausbildungsplatz contract placement in Germany — paid vocational training with a German employer.",
    photo: "students.jpg", photoAlt: "Trainees in a vocational workshop",
    destinations: "Germany",
    requirements: ["Secondary-school completion (equivalent recognised in Germany)", "German language level required by the training occupation", "Motivation letter and CV in German format", "Age and qualification eligibility for the chosen trade"],
    process: ["Eligibility & trade selection", "German-format CV and application", "Employer matching and interviews", "Signed Ausbildungsvertrag", "Visa and relocation support"],
  },
  {
    slug: "skilled-trades-australia",
    title: "Skilled Trades for Australia",
    eyebrow: "Carpentry & nursing · Australia",
    subtitle: "Certified carpenters and Registered Nurses placed with Australian employers.",
    photo: "artisans.jpg", photoAlt: "Carpenter at work on a construction site",
    destinations: "Australia",
    requirements: ["Trade certification (carpenters) or nursing registration (RNs)", "Documented work experience", "English language test result suited to the visa pathway", "Skills assessment where required by the relevant Australian authority"],
    process: ["Qualification and skills-assessment review", "Employer matching", "Visa pathway guidance", "Documentation support", "Arrival and onboarding"],
  },
];
