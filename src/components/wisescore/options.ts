// Questionnaire option data (carried over from WiseScoreFormV2, plus Destination Country).

export interface Opt { value: string; label: string; emoji?: string }

export const NATIONALITIES = [
  "Afghan","Albanian","Algerian","American","Andorran","Angolan","Argentine","Armenian","Australian","Austrian",
  "Azerbaijani","Bahamian","Bahraini","Bangladeshi","Barbadian","Belarusian","Belgian","Belizean","Beninese","Bhutanese",
  "Bolivian","Bosnian","Brazilian","British","Bruneian","Bulgarian","Burkinabe","Burmese","Burundian","Cambodian",
  "Cameroonian","Canadian","Cape Verdean","Central African","Chadian","Chilean","Chinese","Colombian","Comoran","Congolese",
  "Costa Rican","Croatian","Cuban","Cypriot","Czech","Danish","Djiboutian","Dominican","Dutch","Ecuadorian",
  "Egyptian","Emirati","English","Equatorial Guinean","Eritrean","Estonian","Ethiopian","Fijian","Filipino","Finnish",
  "French","Gabonese","Gambian","Georgian","German","Ghanaian","Greek","Grenadian","Guatemalan","Guinean",
  "Guyanese","Haitian","Honduran","Hungarian","Icelandic","Indian","Indonesian","Iranian","Iraqi","Irish",
  "Israeli","Italian","Ivorian","Jamaican","Japanese","Jordanian","Kazakh","Kenyan","Kuwaiti","Kyrgyz",
  "Laotian","Latvian","Lebanese","Liberian","Libyan","Lithuanian","Luxembourgish","Macedonian","Malagasy","Malawian",
  "Malaysian","Maldivian","Malian","Maltese","Mauritanian","Mauritian","Mexican","Moldovan","Monacan","Mongolian",
  "Montenegrin","Moroccan","Mozambican","Namibian","Nepalese","New Zealand","Nicaraguan","Nigerian","Norwegian","Omani",
  "Pakistani","Panamanian","Papua New Guinean","Paraguayan","Peruvian","Polish","Portuguese","Qatari","Romanian","Russian",
  "Rwandan","Saudi","Scottish","Senegalese","Serbian","Singaporean","Slovak","Slovenian","Somali","South African",
  "South Korean","Spanish","Sri Lankan","Sudanese","Surinamese","Swedish","Swiss","Syrian","Taiwanese","Tajik",
  "Tanzanian","Thai","Togolese","Trinidadian","Tunisian","Turkish","Turkmen","Ugandan","Ukrainian","Uruguayan",
  "Uzbek","Venezuelan","Vietnamese","Welsh","Yemeni","Zambian","Zimbabwean",
];

export const DEGREE_OPTIONS: Opt[] = [
  { value: "bachelor", label: "Bachelor's", emoji: "🎓" },
  { value: "master", label: "Master's", emoji: "📚" },
  { value: "phd", label: "PhD", emoji: "🔬" },
  { value: "non-degree", label: "Non-degree", emoji: "📋" },
];

export const STREAM_OPTIONS: Opt[] = [
  { value: "engineering", label: "Engineering / IT", emoji: "💻" },
  { value: "business", label: "Business", emoji: "💼" },
  { value: "medicine", label: "Medicine", emoji: "🏥" },
  { value: "natural-science", label: "Natural Sciences", emoji: "🧪" },
];

export const PROGRAM_OPTIONS: Record<string, Opt[]> = {
  business: [
    { value: "accounting", label: "Accounting" }, { value: "business-admin", label: "Business Administration" },
    { value: "financial-mgmt", label: "Financial Management" }, { value: "hr", label: "Human Resources" },
    { value: "intl-business", label: "International Business" }, { value: "marketing", label: "Marketing" },
    { value: "tourism", label: "Tourism & Hospitality" }, { value: "sports-mgmt", label: "Sports Management" },
  ],
  engineering: [
    { value: "aeronautical", label: "Aeronautical Engineering" }, { value: "ai", label: "Artificial Intelligence" },
    { value: "automation", label: "Automation & Robotics" }, { value: "civil", label: "Civil Engineering" },
    { value: "cs", label: "Computer Science" }, { value: "food-science", label: "Food Science & Tech" },
    { value: "aircraft-maint", label: "Aircraft Maintenance" },
  ],
  medicine: [
    { value: "mbbs", label: "MBBS / Medicine" }, { value: "pharmacy", label: "Pharmacy" }, { value: "nursing", label: "Nursing" },
    { value: "public-health", label: "Public Health" }, { value: "biomedical", label: "Biomedical Science" },
    { value: "dentistry", label: "Dentistry" }, { value: "physiotherapy", label: "Physiotherapy" },
  ],
  "natural-science": [
    { value: "biotech", label: "Biotechnology" }, { value: "enviro-science", label: "Environmental Science" },
    { value: "chemistry", label: "Chemistry" }, { value: "physics", label: "Physics" }, { value: "mathematics", label: "Mathematics" },
  ],
};

export const AGE_OPTIONS: Opt[] = [
  { value: "17-20", label: "17–20 years", emoji: "🧑" }, { value: "21-24", label: "21–24 years", emoji: "👨" },
  { value: "25-28", label: "25–28 years", emoji: "🧔" }, { value: "29-32", label: "29–32 years", emoji: "👴" },
];
export const EDUCATION_OPTIONS: Opt[] = [
  { value: "grade-12", label: "Grade 12 / High School", emoji: "📖" }, { value: "a-level", label: "A-Level", emoji: "📝" },
  { value: "3yr-bachelor", label: "3-Year Bachelor's", emoji: "🎓" }, { value: "4yr-bachelor", label: "4-Year Bachelor's", emoji: "🎓" },
  { value: "master", label: "Master's Degree", emoji: "📚" },
];
export const STATUS_OPTIONS: Opt[] = [
  { value: "studying", label: "Still Studying", emoji: "📚" }, { value: "completed", label: "Completed", emoji: "✅" },
];
export const GAP_OPTIONS: Opt[] = [
  { value: "none", label: "No Gap", emoji: "✨" }, { value: "0-1", label: "Less than 1 year", emoji: "📅" },
  { value: "1-2", label: "1–2 years", emoji: "📅" }, { value: "2-3", label: "2–3 years", emoji: "📅" },
  { value: "3+", label: "3+ years", emoji: "⚠️" },
];
export const GRADING_OPTIONS: Opt[] = [
  { value: "gpa", label: "GPA (4.0 Scale)", emoji: "📊" }, { value: "percentage", label: "Percentage (%)", emoji: "📈" },
  { value: "cgpa", label: "CGPA (10.0 Scale)", emoji: "📉" }, { value: "division", label: "Division / Class", emoji: "🏆" },
];
export const DIVISION_OPTIONS: Opt[] = [
  { value: "distinction", label: "Distinction / First Class with Distinction" }, { value: "first", label: "First Division / First Class" },
  { value: "second", label: "Second Division / Second Class" }, { value: "third", label: "Third Division / Pass" },
];
export const ENGLISH_OPTIONS: Opt[] = [
  { value: "ielts", label: "IELTS", emoji: "🇬🇧" }, { value: "pte", label: "PTE", emoji: "🌐" },
  { value: "toefl", label: "TOEFL", emoji: "🇺🇸" }, { value: "duolingo", label: "Duolingo", emoji: "🦉" },
  { value: "moi", label: "MOI / None", emoji: "📜" },
];
export const PASSPORT_OPTIONS: Opt[] = [
  { value: "yes", label: "Yes, I have a passport", emoji: "🛂" }, { value: "no", label: "No, not yet", emoji: "❌" },
];

// ── Destination countries ────────────────────────────────────────────────────
// `value` MUST equal universities.country in the database. `iso` is used for the flag image.
export interface Destination { value: string; label: string; iso: string; group: "popular" | "schengen" | "other" }

export const DESTINATIONS: Destination[] = [
  // Popular
  { value: "USA", label: "United States", iso: "us", group: "popular" },
  { value: "United Kingdom", label: "United Kingdom", iso: "gb", group: "popular" },
  { value: "Australia", label: "Australia", iso: "au", group: "popular" },
  { value: "India", label: "India", iso: "in", group: "popular" },
  { value: "Germany", label: "Germany", iso: "de", group: "popular" },
  { value: "Italy", label: "Italy", iso: "it", group: "popular" },
  // Schengen area (29 states, incl. Bulgaria & Romania)
  { value: "Austria", label: "Austria", iso: "at", group: "schengen" },
  { value: "Belgium", label: "Belgium", iso: "be", group: "schengen" },
  { value: "Bulgaria", label: "Bulgaria", iso: "bg", group: "schengen" },
  { value: "Croatia", label: "Croatia", iso: "hr", group: "schengen" },
  { value: "Czech Republic", label: "Czech Republic", iso: "cz", group: "schengen" },
  { value: "Denmark", label: "Denmark", iso: "dk", group: "schengen" },
  { value: "Estonia", label: "Estonia", iso: "ee", group: "schengen" },
  { value: "Finland", label: "Finland", iso: "fi", group: "schengen" },
  { value: "France", label: "France", iso: "fr", group: "schengen" },
  { value: "Greece", label: "Greece", iso: "gr", group: "schengen" },
  { value: "Hungary", label: "Hungary", iso: "hu", group: "schengen" },
  { value: "Iceland", label: "Iceland", iso: "is", group: "schengen" },
  { value: "Latvia", label: "Latvia", iso: "lv", group: "schengen" },
  { value: "Liechtenstein", label: "Liechtenstein", iso: "li", group: "schengen" },
  { value: "Lithuania", label: "Lithuania", iso: "lt", group: "schengen" },
  { value: "Luxembourg", label: "Luxembourg", iso: "lu", group: "schengen" },
  { value: "Malta", label: "Malta", iso: "mt", group: "schengen" },
  { value: "Netherlands", label: "Netherlands", iso: "nl", group: "schengen" },
  { value: "Norway", label: "Norway", iso: "no", group: "schengen" },
  { value: "Poland", label: "Poland", iso: "pl", group: "schengen" },
  { value: "Portugal", label: "Portugal", iso: "pt", group: "schengen" },
  { value: "Romania", label: "Romania", iso: "ro", group: "schengen" },
  { value: "Slovakia", label: "Slovakia", iso: "sk", group: "schengen" },
  { value: "Slovenia", label: "Slovenia", iso: "si", group: "schengen" },
  { value: "Spain", label: "Spain", iso: "es", group: "schengen" },
  { value: "Sweden", label: "Sweden", iso: "se", group: "schengen" },
  { value: "Switzerland", label: "Switzerland", iso: "ch", group: "schengen" },
  // Other key regions
  { value: "Canada", label: "Canada", iso: "ca", group: "other" },
  { value: "New Zealand", label: "New Zealand", iso: "nz", group: "other" },
  { value: "Ireland", label: "Ireland", iso: "ie", group: "other" },
  { value: "UAE", label: "United Arab Emirates", iso: "ae", group: "other" },
  { value: "Singapore", label: "Singapore", iso: "sg", group: "other" },
  { value: "Japan", label: "Japan", iso: "jp", group: "other" },
  { value: "China", label: "China", iso: "cn", group: "other" },
  { value: "Cyprus", label: "Cyprus", iso: "cy", group: "other" },
  { value: "Georgia", label: "Georgia", iso: "ge", group: "other" },
];

export const DESTINATION_GROUPS: { key: Destination["group"]; label: string }[] = [
  { key: "popular", label: "Most popular" },
  { key: "schengen", label: "Europe · Schengen area" },
  { key: "other", label: "Other study destinations" },
];

export const flagUrl = (iso: string) => `https://flagcdn.com/w80/${iso}.png`;
