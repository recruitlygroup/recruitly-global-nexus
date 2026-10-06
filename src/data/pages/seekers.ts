// Job-seeker, partner and trust pages. One PageSpec per page; rendered by <ContentPage/>.
// Facts used here come from the brief and the existing site only. Anything that needs the team's confirmation is
// listed in HANDOVER.md (no invented fees, timelines or placement statistics).
import type { PageSpec, Partner } from "@/components/blocks/spec";
import { APOSTILLE_SEWA_URL } from "@/config/nav";
import { SITE } from "@/config/site";

export const APOSTILLE_SEWA: Partner = {
  name: "Apostille Sewa", role: "Document verification and legal services, Nepal", icon: "stamp", href: APOSTILLE_SEWA_URL,
  body: "Our strategic partner in Nepal for document attestation, police clearance certificates (PCC) and legal services. Candidates get one team that knows which office comes next.",
  points: [
    "Local ward and municipality attestations",
    "Ministry of Foreign Affairs (MOFA) Nepal, Kathmandu",
    "Consular legalisation at the Nepal Embassy in New Delhi and at EU embassies",
    "Police clearance certificate (PCC) support",
  ],
};

export const RUBISCO: Partner = {
  name: "Rubisco Tech Private Limited", role: "Agrotech and dairytech training partner, Nepal", icon: "graduation", href: "https://www.rubisco.com.np",
  body: "Our training partner in Nepal. Candidates build certified skills before they travel, so employers receive workers who are ready on day one.",
  points: [
    "CTEVT-certified courses in dairy management",
    "Modern agricultural technology and vocational skill-building",
    "Skill certification that employers can verify",
    "Employer-readiness preparation before placement",
  ],
};

const PROCESS_JOURNEY = ["Choose a role", "Apply on WhatsApp or online", "Screening call", "Skills certified (if needed)", "Documents attested", "Employer interview", "Visa and travel"];

export const SEEKER_PAGES: Record<string, PageSpec> = {
  /* ─────────────────────────────── HOW TO APPLY ─────────────────────────────── */
  "how-to-apply": {
    seo: { title: "How to Apply for Jobs Abroad | Recruitly Group", description: "Seven clear steps from application to arrival. Apply on WhatsApp or with our online form. Placement is free for workers." },
    hero: {
      eyebrow: "For job seekers", title: "How to apply for a job abroad with Recruitly",
      lead: "Seven clear steps from your first message to your first day at work. You never pay Recruitly a placement fee.",
      primary: { label: "Browse openings", to: "/jobs" }, secondary: { label: "Verify documents", to: "/solutions/document-attestation" },
      journey: { title: "Your path to placement", steps: PROCESS_JOURNEY.slice(0, 6) },
    },
    stats: [
      { value: "€0", label: "Placement fee charged to workers" },
      { value: "2", label: "Ways to apply: WhatsApp or online form" },
      { value: "7", label: "Steps from application to arrival" },
      { value: "2", label: "Partners for training and documents" },
    ],
    flow: {
      title: "Your route at a glance",
      lead: "Most candidates follow this path. If your skills need a boost, we send you to training first and then re-assess you.",
      nodes: [
        { title: "Apply", body: "WhatsApp or the online form on our jobs page.", icon: "chat" },
        { title: "Profile and screening", body: "We check your experience, qualifications and the role you want.", icon: "usercheck" },
        { title: "Skills match the role?", kind: "decision", icon: "target", body: "We compare your skills with the employer's needs.", branch: { label: "Not yet", text: "Prepare with CTEVT-certified training at Rubisco Tech, then we re-assess you." } },
        { title: "Documents attested", kind: "partner", tag: "Apostille Sewa", icon: "stamp", body: "Municipality, MOFA and embassy steps handled together." },
        { title: "Interview and placement", kind: "end", icon: "plane", body: "Employer interview, contract, visa support and travel." },
      ],
    },
    timeline: {
      title: "The seven steps in detail",
      steps: [
        { title: "Choose a role", body: "Browse verified openings by country, category and salary on our jobs page.", bullets: ["Check the vacancies and the status of the role", "Read the requirements before you apply"] },
        { title: "Apply on WhatsApp or online", body: "Use the Apply button on any job. You can send a quick WhatsApp message or complete the online form with your CV.", tag: "Your choice" },
        { title: "Screening call", body: "A recruiter reviews your profile, confirms your experience and explains the next steps for that employer and country." },
        { title: "Get your skills certified", body: "If the role needs a certificate or practical skills, you can train with our partner Rubisco Tech, whose courses are CTEVT-certified.", tag: "Rubisco Tech" },
        { title: "Attest your documents", body: "Apostille Sewa guides your certificates and police clearance through the ward or municipality, MOFA Nepal and the required embassy.", tag: "Apostille Sewa" },
        { title: "Interview with the employer", body: "We prepare you for the interview and, where useful, record a short video that shows your skills." },
        { title: "Contract, visa and travel", body: "We support the work-permit and visa paperwork, explain your contract, and help you plan arrival and onboarding." },
      ],
    },
    checklists: {
      title: "Have these ready before you apply",
      lead: "The exact list depends on the role and the destination country. This is what most applications need.",
      groups: [
        { title: "Identity", items: ["Passport valid for at least 12 months", "Recent passport-size photographs", "Citizenship certificate"] },
        { title: "Education and work", items: ["Academic certificates and transcripts", "Trade licences or professional registration", "Experience letters from previous employers", "An updated CV"] },
        { title: "Clearance and health", items: ["Police clearance certificate (PCC)", "Medical examination, if the employer or country requires it", "Language certificate, where the role needs one"] },
      ],
    },
    partners: { title: "Two partners make your preparation easier", lead: "We work with specialists in Nepal so training and paperwork do not slow you down.", items: [RUBISCO, APOSTILLE_SEWA] },
    apply: true,
    faqs: { items: [
      { q: "Do I pay Recruitly a placement fee?", a: "No. Placement is free of charge to workers. Third-party costs such as government document fees, medical tests or visa fees are paid to the issuing office or provider, and you should always receive an official receipt." },
      { q: "How long does the process take?", a: "It depends on the role, the destination country and embassy processing times. At your screening call we give you a realistic estimate for your case." },
      { q: "Can I apply for more than one job?", a: "Yes. Tell the recruiter which roles interest you and we will match you to the best fit." },
      { q: "What if I do not have the required certificate?", a: "We can point you to training with Rubisco Tech, where CTEVT-certified courses build verifiable skills in dairy, agriculture and vocational trades." },
      { q: "I cannot use WhatsApp. Can I still apply?", a: "Yes. Use the online form on the jobs page or email info@recruitlygroup.com with your CV and the role you want." },
    ] },
    related: { title: "Keep exploring", items: [
      { label: "Open jobs", body: "Verified roles in Europe and the GCC.", to: "/jobs" },
      { label: "Career centre", body: "CV, interview and document guides.", to: "/career-center" },
      { label: "Document attestation", body: "How Apostille Sewa verifies your papers.", to: "/solutions/document-attestation" },
      { label: "Avoid scams", body: "Know how a real recruiter works.", to: "/security-and-scams" },
    ] },
    closing: { title: "Questions before you apply?", body: "Message us and a recruiter will explain the process for your role and country.", primary: { label: "Browse openings", to: "/jobs" } },
  },

  /* ─────────────────────────────── WORKING WITH US ─────────────────────────────── */
  "working-with-recruitly": {
    seo: { title: "Working with Recruitly | Recruitly Group", description: "What to expect as a candidate: free placement, honest guidance, training, document support and relocation help." },
    hero: {
      eyebrow: "For job seekers", title: "What it is like to work with Recruitly",
      lead: "We guide you from the first conversation to your first shift, with training, document support and clear answers at every stage.",
      primary: { label: "Browse openings", to: "/jobs" }, secondary: { label: "How to apply", to: "/job-seekers/how-to-apply" },
      journey: { steps: ["Free profile", "Honest screening", "Skills preparation", "Verified documents", "Employer match", "Relocation support"] },
    },
    features: { title: "What you can expect from us", cols: 3, items: [
      { icon: "badge", title: "Free for workers", body: "Recruitly Group does not charge workers a placement fee." },
      { icon: "usercheck", title: "Honest matching", body: "We assess you on skills and qualifications, then tell you plainly which roles fit." },
      { icon: "graduation", title: "Training before travel", body: "Certified skill-building and language preparation through our partners." },
      { icon: "stamp", title: "Documents handled together", body: "Attestation, police clearance and embassy steps coordinated with Apostille Sewa." },
      { icon: "video", title: "Show your skills", body: "A short video demonstration helps employers see what you can do before the interview." },
      { icon: "plane", title: "Support on arrival", body: "We help with visa paperwork, travel planning and onboarding with your employer." },
    ] },
    comparison: { title: "Recruitly compared with applying alone", columns: ["Applying alone", "With Recruitly"], highlight: 1, rows: [
      { label: "Pay a placement fee", cells: ["Often unclear", "Never charged to workers"] },
      { label: "Document attestation", cells: ["You work out the order of offices", "Coordinated with Apostille Sewa"] },
      { label: "Skills certification", cells: ["Find a course yourself", "CTEVT-certified training via Rubisco Tech"] },
      { label: "Employer interview preparation", cells: [false, true] },
      { label: "Registered agency you can verify", cells: [false, true] },
    ] },
    partners: { title: "Our partners in Nepal", items: [RUBISCO, APOSTILLE_SEWA] },
    apply: true,
  },

  /* ─────────────────────────────── JOB SEEKER FAQ ─────────────────────────────── */
  "faq": {
    seo: { title: "Job Seeker FAQ | Recruitly Group", description: "Answers to common questions about fees, documents, training, timelines and applying through Recruitly Group." },
    hero: { eyebrow: "For job seekers", title: "Job seeker FAQ", lead: "Straight answers about fees, documents, training and timelines.", primary: { label: "Browse openings", to: "/jobs" }, secondary: { label: "Ask on WhatsApp", href: SITE.whatsappUrl } },
    faqs: { title: "Your questions answered", items: [
      { q: "Do I pay a placement fee?", a: "No. Placement is free of charge to workers. Costs paid to third parties, such as government document fees, medical tests or visa fees, go to the issuing office or provider and should come with an official receipt." },
      { q: "Is Recruitly Group a registered agency?", a: "Yes. Recruitly Group is an officially registered recruitment agency in Sofia, Bulgaria (Strandscha St 44, 1303 Sofia Center)." },
      { q: "How do I apply?", a: "Open recruitlygroup.com/jobs, choose a role and press Apply. You can send a quick WhatsApp message or complete the online form." },
      { q: "Which documents will I need?", a: "Usually a valid passport, education and experience certificates, a police clearance certificate and sometimes a medical report or language certificate. Your recruiter confirms the exact list for your role." },
      { q: "Who handles document attestation?", a: "Our partner Apostille Sewa coordinates ward and municipality attestations, MOFA Nepal in Kathmandu, and consular legalisation at the Nepal Embassy in New Delhi and EU embassies." },
      { q: "What if I need training first?", a: "Our partner Rubisco Tech runs CTEVT-certified courses in dairy management, modern agricultural technology and vocational skills." },
      { q: "Will you guarantee me a job?", a: "No recruiter can honestly promise that. We promise a transparent process: honest screening, real openings and help at each step." },
      { q: "How do I know a message is really from Recruitly?", a: "We contact you only from our official channels. Read our scam-safety guide to see how to check." },
    ] },
    related: { title: "More help", items: [
      { label: "How to apply", to: "/job-seekers/how-to-apply" },
      { label: "Security and scams", to: "/security-and-scams" },
      { label: "Contact us", to: "/contact" },
    ] },
  },

  /* ─────────────────────────────── COMPANIES / DESTINATIONS ─────────────────────────────── */
  "companies": {
    seo: { title: "Where Our Candidates Work | Recruitly Group", description: "The sectors and destination regions where Recruitly Group places skilled workers, from healthcare and hospitality to construction and logistics." },
    hero: { eyebrow: "For job seekers", title: "Where our candidates work", lead: "We recruit for employers in Europe, Australasia and the Gulf. Employer names are shared at the interview stage, once your profile is matched.", primary: { label: "Browse openings", to: "/jobs" }, secondary: { label: "How to apply", to: "/job-seekers/how-to-apply" } },
    features: { title: "Sectors we recruit for", cols: 3, items: [
      { icon: "stethoscope", title: "Healthcare", body: "Registered and BSc-qualified nurses for hospitals and care providers." },
      { icon: "truck", title: "Transport and logistics", body: "C and CE licence drivers and warehouse teams." },
      { icon: "utensils", title: "Hospitality", body: "Hotel and restaurant staff for seasonal and permanent roles." },
      { icon: "hardhat", title: "Construction and trades", body: "Carpenters, welders and certified tradespeople." },
      { icon: "factory", title: "Engineering and manufacturing", body: "Engineers and technicians for plants and project sites." },
      { icon: "milk", title: "Food, dairy and agriculture", body: "Skilled workers trained through our Rubisco Tech partnership." },
    ] },
    checklists: { title: "Destination regions", lead: "Openings change often. The jobs page always shows what is available right now.", groups: [
      { title: "Europe", items: ["Bulgaria", "Poland", "Germany (nurses, Ausbildung)", "Slovenia", "Romania", "Greece"] },
      { title: "Australia and New Zealand", items: ["Registered nurses", "Certified carpenters", "Hospitality and beauty technicians"] },
      { title: "Gulf (GCC)", items: ["Drivers and logistics", "Hospitality", "Skilled trades"] },
    ] },
    related: { title: "Explore by sector", items: [
      { label: "Nurses", to: "/roles/nurses" }, { label: "Drivers", to: "/roles/drivers" }, { label: "Hospitality", to: "/roles/hospitality" },
      { label: "Engineers", to: "/roles/engineers" }, { label: "Artisans", to: "/roles/artisans" },
    ] },
    apply: true,
  },

  /* ─────────────────────────────── CAREER CENTRE ─────────────────────────────── */
  "career-center": {
    seo: { title: "Career Centre | Recruitly Group", description: "Practical guides for candidates: CV tips, video skill demonstrations, interview preparation, document checklists and training." },
    hero: { eyebrow: "For job seekers", title: "Career centre", lead: "Everything you need to prepare a strong application, from your CV to your interview and your documents.", primary: { label: "Browse openings", to: "/jobs" }, secondary: { label: "Read the blog", to: "/blog" } },
    features: { title: "Prepare like a professional", cols: 3, items: [
      { icon: "file", title: "Write a clear CV", body: "One page per ten years of experience, newest role first, with exact dates, employers and duties." },
      { icon: "video", title: "Record a skills video", body: "Film a short, well-lit demonstration of your trade. Employers value seeing real skills." },
      { icon: "chat", title: "Practise your interview", body: "Prepare short answers about your experience, safety habits and why you want this role." },
      { icon: "languages", title: "Build your language level", body: "Even basic workplace phrases help. Some roles, like nursing in Germany, require a certified level." },
      { icon: "graduation", title: "Certify your skills", body: "CTEVT-certified courses through Rubisco Tech give employers proof of what you can do." },
      { icon: "stamp", title: "Prepare your documents", body: "Start attestation early. Apostille Sewa can tell you which steps your papers need." },
    ] },
    timeline: { title: "A four-week preparation plan", lead: "A simple rhythm you can follow while you wait for the right opening.", steps: [
      { title: "Week 1: Organise", body: "Collect certificates, passport and experience letters. Scan them clearly and name each file." },
      { title: "Week 2: Present", body: "Update your CV and record your skills video." },
      { title: "Week 3: Upskill", body: "Take a short course or language class that matches the roles you want.", tag: "Rubisco Tech" },
      { title: "Week 4: Verify", body: "Begin document attestation and apply for your police clearance certificate.", tag: "Apostille Sewa" },
    ] },
    related: { title: "Read next", items: [
      { label: "How to apply for NZ nursing roles", to: "/blog/how-to-apply-for-nz-nurse" },
      { label: "Ausbildung in Germany", to: "/blog/ausbidung_recruitlygroup_information" },
      { label: "Jobs in Slovenia", to: "/blog/warehouse-jobs-slovenia-nepal" },
      { label: "Training programmes", to: "/solutions/training" },
    ] },
    apply: true,
  },

  /* ─────────────────────────────── SECURITY AND SCAMS ─────────────────────────────── */
  "security-and-scams": {
    seo: { title: "Security and Scam Awareness | Recruitly Group", description: "How to recognise fake job offers and verify that a message is really from Recruitly Group. Official contact channels and how to report fraud." },
    hero: { eyebrow: "Stay safe", title: "Spot fake job offers before they cost you", lead: "Recruitment fraud is common. Use this page to check any message that claims to come from Recruitly Group.", primary: { label: "Report a suspicious message", href: `mailto:${SITE.email}?subject=Suspicious%20message` }, secondary: { label: "Official contacts", to: "/contact" } },
    notice: { tone: "warning", title: "Recruitly Group never charges workers a placement fee", body: "If someone asks you to pay to be placed, stop and contact us on our official channels." },
    flow: {
      title: "Is this message really from us?",
      lead: "Answer each question in order. One red flag is enough to stop.",
      nodes: [
        { title: "Does it ask for a placement fee?", kind: "decision", icon: "ban", body: "Placement is free for workers.", branch: { label: "Yes", text: "Stop. This is not Recruitly. Report it." } },
        { title: "Is the contact on our list?", kind: "decision", icon: "phone", body: "info@recruitlygroup.com or +977 974 320 8282.", branch: { label: "No", text: "Do not reply. Message us to check." } },
        { title: "Does the job appear on our jobs page?", kind: "decision", icon: "search", body: "Real openings are listed at recruitlygroup.com/jobs.", branch: { label: "No", text: "Ask us to confirm before sharing documents." } },
        { title: "Safe to continue", kind: "end", icon: "shield", body: "Keep receipts for any third-party fee you pay to an official office." },
      ],
    },
    features: { title: "Common warning signs", cols: 3, items: [
      { icon: "money", title: "Requests for money to “secure” a job", body: "Genuine placement for workers is free at Recruitly Group." },
      { icon: "alert", title: "Pressure and tight deadlines", body: "Scammers rush you so you do not check. Real recruiters give you time." },
      { icon: "mail", title: "Free email addresses and look-alike domains", body: "Our email addresses end in @recruitlygroup.com." },
      { icon: "fingerprint", title: "Requests for your passport or bank PIN", body: "Never send banking passwords or one-time codes to anyone." },
      { icon: "receipt", title: "Payments with no receipt", body: "Official offices give receipts. Ask for one every time." },
      { icon: "eye", title: "Offers that sound too good", body: "Unusually high pay with no skills or experience is a classic hook." },
    ] },
    checklists: { title: "Our official channels", groups: [
      { title: "Contact us only here", items: ["Website: www.recruitlygroup.com", `Email: ${SITE.email}`, `Phone and WhatsApp: ${SITE.phoneDisplay}`, "Office: Strandscha St 44, 1303 Sofia Center, Sofia, Bulgaria"] },
      { title: "If you suspect fraud", items: ["Stop sending money or documents", "Take screenshots of the messages", "Email us the details", "Report it to your local police or cyber-crime unit"] },
    ] },
    closing: { title: "Not sure about a message?", body: "Send it to us. We would rather check a hundred real messages than let one scam through.", primary: { label: "Email us", href: `mailto:${SITE.email}` } },
  },

  /* ─────────────────────────────── OFFICES ─────────────────────────────── */
  "offices": {
    seo: { title: "Offices and Branches | Recruitly Group", description: "Recruitly Group is registered in Sofia, Bulgaria, with operations and partners in Nepal." },
    hero: { eyebrow: "Company", title: "Where to find us", lead: "A registered recruitment agency in Sofia with a team and trusted partners in Nepal.", primary: { label: "Contact us", to: "/contact" }, secondary: { label: "Message on WhatsApp", href: SITE.whatsappUrl } },
    features: { title: "Our locations", cols: 2, items: [
      { icon: "building", title: "Sofia, Bulgaria (registered office)", body: "Strandscha St 44, 1303 Sofia Center, Sofia, Bulgaria. Email info@recruitlygroup.com." },
      { icon: "pin", title: "Nepal operations", body: "Candidate screening, training and document support in Nepal, with partners Rubisco Tech and Apostille Sewa. Phone and WhatsApp +977 974 320 8282." },
    ] },
    partners: { title: "Partners on the ground in Nepal", items: [RUBISCO, APOSTILLE_SEWA] },
    related: { title: "Next steps", items: [
      { label: "Contact the team", to: "/contact" }, { label: "Browse openings", to: "/jobs" },
    ] },
  },

  /* ─────────────────────────────── CONTACT ─────────────────────────────── */
  "contact": {
    seo: { title: "Contact Recruitly Group", description: "Reach Recruitly Group by WhatsApp, phone or email. Candidates, employers and students: choose your route." },
    hero: { eyebrow: "Contact", title: "Talk to Recruitly Group", lead: "Choose the route that fits you. A real person replies.", primary: { label: "Message on WhatsApp", href: SITE.whatsappUrl }, secondary: { label: "Email us", href: `mailto:${SITE.email}` } },
    features: { title: "Who are you?", cols: 3, items: [
      { icon: "users", title: "I am a candidate", body: "Browse openings and apply by WhatsApp or the online form at recruitlygroup.com/jobs." },
      { icon: "building", title: "I am an employer", body: "Submit a hiring request through the Employer Dashboard or write to us with your brief." },
      { icon: "graduation", title: "I am a student", body: "Ask about admissions, universities and your WiseScore." },
    ] },
    checklists: { title: "Reach us directly", groups: [
      { title: "Phone and WhatsApp", items: [SITE.phoneDisplay] },
      { title: "Email", items: [SITE.email] },
      { title: "Registered office", items: ["Strandscha St 44", "1303 Sofia Center, Sofia, Bulgaria"] },
    ] },
    faqs: { title: "Before you write", items: [
      { q: "How fast do you reply?", a: "WhatsApp is the fastest route. Email is best when you need to attach documents." },
      { q: "Can I visit the office?", a: "Please message us first so a recruiter can meet you at the right time." },
    ] },
    closing: { title: "Prefer to apply right now?", body: "Open the jobs page, pick a role and press Apply.", primary: { label: "Browse openings", to: "/jobs" } },
  },

  /* ─────────────────────────────── DOCUMENT ATTESTATION (Apostille Sewa) ─────────────────────────────── */
  "document-attestation": {
    seo: { title: "Document Attestation and Embassy Verification | Recruitly Group", description: "Ward and municipality attestation, MOFA Nepal, Nepal Embassy New Delhi and EU embassy legalisation, plus police clearance, handled with our partner Apostille Sewa." },
    hero: {
      eyebrow: "Global mobility", title: "Verified documents, from Kathmandu to the embassy",
      lead: "International employers and visa offices only accept properly attested papers. With our partner Apostille Sewa, every step happens in the right order.",
      primary: { label: "Verify documents", href: APOSTILLE_SEWA_URL }, secondary: { label: "Browse openings", to: "/jobs" },
      journey: { title: "A document's journey", steps: ["Original certificate", "Ward / municipality", "MOFA Nepal, Kathmandu", "Embassy legalisation", "Ready for visa"] },
    },
    stats: [
      { value: "3", label: "Attestation stages: local, MOFA, embassy" },
      { value: "2", label: "Embassy routes: New Delhi and EU" },
      { value: "1", label: "Partner coordinating the whole chain" },
      { value: "PCC", label: "Police clearance support included in the file" },
    ],
    flow: {
      title: "The attestation chain",
      lead: "Each stamp validates the one before it. Skip a step, or do them out of order, and the embassy will reject the document.",
      nodes: [
        { title: "Original document", icon: "file", body: "Certificate, transcript, birth or experience record." },
        { title: "Ward or municipality", icon: "landmark", kind: "partner", tag: "Apostille Sewa", body: "Local attestation confirms the document is genuine." },
        { title: "MOFA Nepal, Kathmandu", icon: "flag", kind: "partner", tag: "Apostille Sewa", body: "The Ministry of Foreign Affairs authenticates the local stamp." },
        { title: "Embassy legalisation", icon: "stamp", kind: "partner", tag: "Apostille Sewa", body: "Nepal Embassy in New Delhi or the relevant EU embassy." },
        { title: "Accepted abroad", kind: "end", icon: "badge", body: "Ready for your visa application and employer." },
      ],
    },
    timeline: { title: "How we run your document file", steps: [
      { title: "Document review", body: "We check each paper against the requirements of your destination country and employer." },
      { title: "Police clearance certificate", body: "Apostille Sewa supports your PCC application so it is ready when your visa file is.", tag: "Apostille Sewa" },
      { title: "Local attestation", body: "Ward and municipality attestations are completed first.", tag: "Apostille Sewa" },
      { title: "MOFA Nepal", body: "Documents move to the Ministry of Foreign Affairs in Kathmandu for authentication.", tag: "Apostille Sewa" },
      { title: "Consular legalisation", body: "The final stamp comes from the Nepal Embassy in New Delhi or the relevant EU embassy.", tag: "Apostille Sewa" },
      { title: "Hand-over to your visa file", body: "Finished documents join your visa and work-permit application, with copies kept for your records." },
    ] },
    checklists: { title: "Documents we commonly verify", groups: [
      { title: "Education", items: ["School and college certificates", "University degrees and transcripts", "CTEVT and vocational certificates"] },
      { title: "Work", items: ["Experience letters", "Trade licences", "Professional registration (for example nursing)"] },
      { title: "Personal", items: ["Police clearance certificate (PCC)", "Birth certificate", "Marriage certificate, for family applications"] },
    ] },
    partners: { title: "Handled by Apostille Sewa", lead: "Apostille Sewa is our strategic partner in Nepal for document verification and legal services.", items: [APOSTILLE_SEWA] },
    comparison: { title: "Why route documents through Recruitly", columns: ["On your own", "With Recruitly and Apostille Sewa"], highlight: 1, rows: [
      { label: "Knowing the correct order of offices", cells: ["Trial and error", "Planned before you start"] },
      { label: "Checked against employer and visa needs", cells: [false, true] },
      { label: "Single team to ask for updates", cells: [false, true] },
      { label: "Linked to your placement file", cells: [false, true] },
    ] },
    faqs: { items: [
      { q: "Is this service free?", a: "Government and embassy fees are paid to those offices. Ask your recruiter for the current fee schedule for your documents." },
      { q: "Do I need to start before I get a job offer?", a: "Starting early saves time. Your recruiter will tell you which documents are safe to start with." },
      { q: "Can employers use this service?", a: "Yes. Employers can ask us to check that a candidate's documents are fully attested before arrival." },
    ] },
    closing: { title: "Start your document file today", body: "Send us your list of documents and we will tell you what each one needs.", primary: { label: "Verify documents", href: APOSTILLE_SEWA_URL } },
  },

  /* ─────────────────────────────── TRAINING (Rubisco / CTEVT) ─────────────────────────────── */
  "training": {
    seo: { title: "Training and Skill Certification | Recruitly Group", description: "CTEVT-certified training with Rubisco Tech in dairy management, modern agricultural technology and vocational skills, linked directly to international placement." },
    hero: {
      eyebrow: "Solutions", title: "Train, certify, then travel",
      lead: "Candidates build verifiable skills before placement. With Rubisco Tech, employers receive workers who are ready from day one.",
      primary: { label: "Browse openings", to: "/jobs" }, secondary: { label: "Verify documents", to: "/solutions/document-attestation" },
      journey: { title: "From classroom to workplace", steps: ["CTEVT-certified training", "Skill assessment", "Legalisation via Apostille Sewa", "Placement"] },
    },
    flow: {
      title: "The Recruitly preparation pathway",
      lead: "One connected route, so no candidate reaches an employer unprepared.",
      nodes: [
        { title: "CTEVT-certified training", icon: "graduation", kind: "partner", tag: "Rubisco Tech", body: "Dairy management, modern agricultural technology and vocational skills." },
        { title: "Skill assessment", icon: "gauge", body: "Practical and written checks against the employer's standard.", branch: { label: "Not ready", text: "Extra practice, then reassessment." } },
        { title: "Legalisation", icon: "stamp", kind: "partner", tag: "Apostille Sewa", body: "Certificates attested through MOFA and the relevant embassy." },
        { title: "Placement", icon: "plane", kind: "end", body: "Employer interview, contract, visa support and arrival." },
      ],
    },
    features: { title: "What candidates can learn", cols: 3, items: [
      { icon: "milk", title: "Dairy management", body: "Herd care, milking systems, hygiene and quality standards." },
      { icon: "wheat", title: "Modern agricultural technology", body: "Mechanised and technology-assisted farming practice." },
      { icon: "wrench", title: "Vocational skill-building", body: "Practical trade skills that employers can test and verify." },
      { icon: "languages", title: "Language preparation", body: "Workplace language for your destination country." },
      { icon: "award", title: "Certification", body: "CTEVT-certified courses give your skills formal recognition." },
      { icon: "handshake", title: "Employer readiness", body: "Workplace safety, teamwork and expectations before you fly." },
    ] },
    partners: { title: "Our training partner", items: [RUBISCO] },
    comparison: { title: "Trained candidates versus untrained", columns: ["Without preparation", "Through Recruitly pathway"], highlight: 1, rows: [
      { label: "Recognised skill certificate", cells: [false, true] },
      { label: "Tested against employer needs", cells: [false, true] },
      { label: "Documents ready for legalisation", cells: [false, true] },
      { label: "Prepared for workplace culture", cells: [false, true] },
    ] },
    employerCta: true,
    faqs: { items: [
      { q: "What does CTEVT certification mean?", a: "CTEVT-certified courses are recognised vocational training in Nepal, so employers can verify what a candidate has learned." },
      { q: "Do I have to train before I apply?", a: "Not always. If your current skills match the role, you can apply directly. Training is for candidates who need or want a certificate." },
      { q: "Can employers request custom training?", a: "Yes. Tell us the skills you need and we will discuss a plan with Rubisco Tech." },
    ] },
  },
};
