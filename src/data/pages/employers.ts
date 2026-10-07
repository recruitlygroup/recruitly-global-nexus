// Employer + solutions pages. Process wording matches the existing site: brief → sourcing → screening →
// shortlist & video demos → interviews → documentation → arrival and onboarding.
import type { PageSpec } from "@/components/blocks/spec";
import { SITE } from "@/config/site";
import { APOSTILLE_SEWA, RUBISCO } from "./seekers";
import { PLACEHOLDER_STATS } from "./company";

const BOOK = { label: "Book a consultation", to: "/schedule-a-call" };
const BRIEF = { label: "Request talent", to: "/employers/request-talent" };
const SEVEN = ["Brief", "Sourcing", "Screening", "Shortlist and video demos", "Interviews", "Documentation", "Arrival and onboarding"];

const PROCESS_STEPS: PageSpec["timeline"] = {
  title: "Our seven-step hiring process",
  lead: "Every placement follows the same transparent path, so you always know what happens next.",
  steps: [
    { title: "Brief", body: "You tell us the role, number of workers, start date, pay and housing.", icon: "clipboard" },
    { title: "Sourcing", body: "We search Bulgaria, Nepal, South Asia and EU countries, in line with applicable immigration and labour rules." },
    { title: "Screening", body: "Candidates are interviewed and their qualifications and documents are checked.", tag: "Rubisco Tech for skills" },
    { title: "Shortlist and video demonstrations", body: "You receive complete candidate files and short videos that show real skills before you commit." },
    { title: "Interviews", body: "Your team interviews the shortlist. We arrange the schedule and interpreters." },
    { title: "Documentation", body: "Contracts, work permits and visas are prepared, and personal documents are attested.", tag: "Apostille Sewa" },
    { title: "Arrival and onboarding", body: "We coordinate travel and help your new colleagues settle into the job." },
  ],
};

export const EMPLOYER_PAGES: Record<string, PageSpec> = {
  /* ───────────────────── SOLUTIONS ───────────────────── */
  "permanent-placement": {
    seo: { title: "Permanent Recruitment | Recruitly Group", description: "Long-term hires for EU employers, sourced and legally supplied by a registered Bulgarian agency, with full candidate files and video demonstrations." },
    hero: { eyebrow: "Solutions", title: "Permanent recruitment for the roles that keep you running", lead: "We find, screen and present candidates for long-term positions, and support them through documents, travel and onboarding.", primary: BOOK, secondary: BRIEF, journey: { title: "How a permanent hire happens", steps: SEVEN.slice(0, 6) } },
    features: { title: "What you get", cols: 3, items: [
      { icon: "file", title: "Complete candidate files", body: "Qualifications, experience and verified documents in one place." },
      { icon: "video", title: "Video demonstrations", body: "See practical skills before you decide to interview." },
      { icon: "shield", title: "Legal and compliant", body: "A registered Bulgarian agency supplying talent under applicable rules." },
      { icon: "stamp", title: "Documents attested", body: "Credential verification coordinated with Apostille Sewa." },
      { icon: "graduation", title: "Pre-departure preparation", body: "Training and language preparation before the candidate arrives." },
      { icon: "handshake", title: "Onboarding support", body: "Help in the first weeks so new hires settle in." },
    ] },
    timeline: PROCESS_STEPS,
    employerCta: true,
    faqs: { items: [
      { q: "Which sectors do you cover?", a: "Healthcare, transport, hospitality, engineering, construction and skilled trades, food and agriculture." },
      { q: "Can I hire several people at once?", a: "Yes. Tell us the numbers and timeline in your brief and we will plan the pipeline." },
    ] },
  },

  "temporary-placement": {
    seo: { title: "Flexible and Temporary Staffing | Recruitly Group", description: "Seasonal and project-based workers for hospitality, logistics and construction, with documentation handled for you." },
    hero: { eyebrow: "Solutions", title: "Flexible staffing for seasonal peaks and projects", lead: "Short-term and seasonal workers for hospitality, logistics, construction and more, with the paperwork handled for you.", primary: BOOK, secondary: BRIEF, journey: { steps: ["Share your dates", "We source", "You review files", "Interviews", "Documents ready", "Team arrives"] } },
    comparison: { title: "Choosing the right model", columns: ["Flexible placement", "Permanent recruitment", "Managed services"], highlight: 0, rows: [
      { label: "Best for", cells: ["Seasons and projects", "Long-term roles", "Ongoing large teams"] },
      { label: "Contract length", cells: ["Fixed term", "Open ended", "Agreed per programme"] },
      { label: "Candidate files and video demos", cells: [true, true, true] },
      { label: "Documentation handled", cells: [true, true, true] },
      { label: "Day-to-day coordination", cells: [false, false, true] },
    ] },
    features: { title: "Why employers use flexible placement", cols: 3, items: [
      { icon: "clock", title: "Plan around your calendar", body: "Tell us the start and end dates and we work backwards." },
      { icon: "utensils", title: "Hospitality and seasonal work", body: "Hotel and restaurant staff for peak periods." },
      { icon: "truck", title: "Logistics and warehouses", body: "Warehouse teams and drivers for busy seasons." },
      { icon: "hardhat", title: "Project crews", body: "Construction and trade workers for defined projects." },
    ] },
    employerCta: true,
  },

  "outsourcing": {
    seo: { title: "Recruitment Outsourcing | Recruitly Group", description: "Let Recruitly run all or part of your international recruitment pipeline: sourcing, screening and documentation as an extension of your HR team." },
    hero: { eyebrow: "Solutions", title: "Recruitment outsourcing as an extension of your HR team", lead: "We can run all or part of your recruitment pipeline: sourcing, screening and documentation.", primary: BOOK, secondary: BRIEF },
    flow: { title: "Pick the stages you want us to own", lead: "Outsource one stage or the whole chain.", nodes: [
      { title: "Sourcing", icon: "search", body: "Finding candidates in Bulgaria, Nepal, South Asia and the EU." },
      { title: "Screening", icon: "usercheck", body: "Interviews, skills checks and document verification." },
      { title: "Shortlisting", icon: "video", body: "Candidate files and video demonstrations." },
      { title: "Documentation", icon: "stamp", kind: "partner", tag: "Apostille Sewa", body: "Attestation, permits and visas." },
      { title: "Onboarding", icon: "handshake", kind: "end", body: "Arrival, induction and early check-ins." },
    ] },
    features: { title: "Benefits", cols: 3, items: [
      { icon: "layers", title: "Less admin for your team", body: "We handle the repetitive, document-heavy work." },
      { icon: "scale", title: "One accountable partner", body: "A single agency from first brief to arrival." },
      { icon: "eye", title: "Visibility at each stage", body: "Track progress through the Employer Dashboard." },
    ] },
    employerCta: true,
  },

  "managed-services": {
    seo: { title: "Managed Services | Recruitly Group", description: "A dedicated Recruitly team to plan, recruit and coordinate your international workforce under one agreed programme." },
    hero: { eyebrow: "Solutions", title: "Managed workforce services", lead: "A dedicated team that plans, recruits and coordinates your international workforce under one agreed programme.", primary: BOOK, secondary: BRIEF, journey: { title: "A managed programme", steps: ["Workforce plan", "Recruitment waves", "Documents and travel", "Onboarding", "Ongoing review"] } },
    features: { title: "What a managed programme covers", cols: 3, items: [
      { icon: "compass", title: "Workforce planning", body: "We map your needs by role, site and season." },
      { icon: "refresh", title: "Recruitment in waves", body: "Repeatable intakes instead of one-off searches." },
      { icon: "stamp", title: "Compliance and documents", body: "Attestation, permits and visas managed centrally." },
      { icon: "graduation", title: "Skills and language preparation", body: "Training before arrival through Rubisco Tech." },
      { icon: "chart", title: "Reporting", body: "Clear updates on progress, risks and next steps." },
      { icon: "support", title: "A named contact", body: "One person who knows your account." },
    ] },
    comparison: { title: "Managed services versus standard placement", columns: ["Standard placement", "Managed services"], highlight: 1, rows: [
      { label: "Planning horizon", cells: ["Role by role", "Whole workforce"] },
      { label: "Repeatable intakes", cells: [false, true] },
      { label: "Central reporting", cells: [false, true] },
      { label: "Named account contact", cells: [false, true] },
    ] },
    timeline: PROCESS_STEPS,
    employerCta: true,
  },

  "onsite-management": {
    seo: { title: "Onsite Management | Recruitly Group", description: "Onsite coordination for international teams: attendance, welfare, communication and issue resolution, agreed per client." },
    hero: { eyebrow: "Solutions", title: "Onsite management for international teams", lead: "A coordinator who keeps your international workers supported and your site running smoothly, where agreed with you.", primary: BOOK, secondary: BRIEF },
    features: { title: "What onsite coordination can include", lead: "Scope is agreed per client.", cols: 3, items: [
      { icon: "users", title: "Team coordination", body: "A point of contact between your supervisors and the workers." },
      { icon: "languages", title: "Language bridging", body: "Help with instructions, safety briefings and day-to-day communication." },
      { icon: "home", title: "Welfare and housing check-ins", body: "Regular check-ins on accommodation and wellbeing." },
      { icon: "list", title: "Attendance and records", body: "Simple records that help your payroll and compliance teams." },
      { icon: "alert", title: "Issue resolution", body: "Early action on concerns so small problems stay small." },
      { icon: "refresh", title: "Replacement planning", body: "A plan if a role needs to be refilled." },
    ] },
    flow: { title: "How an issue is handled", nodes: [
      { title: "Worker or supervisor raises it", icon: "chat" },
      { title: "Coordinator logs it", icon: "list" },
      { title: "Can it be fixed onsite?", kind: "decision", icon: "target", branch: { label: "No", text: "Escalated to the Recruitly account lead." } },
      { title: "Resolved and recorded", kind: "end", icon: "badge" },
    ] },
    employerCta: true,
  },

  "diversity-inclusion": {
    seo: { title: "Diversity and Inclusion | Recruitly Group", description: "Fair, skills-based recruitment with no placement fee charged to workers." },
    hero: { eyebrow: "Solutions", title: "Fair recruitment that opens doors", lead: "We assess candidates on skills and qualifications, and we never charge workers a placement fee.", primary: { label: "Browse openings", to: "/jobs" }, secondary: BRIEF },
    features: { title: "How we put fairness into practice", cols: 3, items: [
      { icon: "scale", title: "Skills first", body: "Shortlists are based on qualifications, experience and demonstrated ability." },
      { icon: "badge", title: "No fee for workers", body: "Cost is never a barrier to being considered." },
      { icon: "languages", title: "Language and training support", body: "Preparation helps candidates meet the standard, not just describe it." },
      { icon: "heart", title: "Respectful process", body: "Clear communication and dignity at every step." },
      { icon: "eye", title: "Transparent decisions", body: "Candidates hear why a role is or is not a fit." },
      { icon: "users", title: "Diverse talent pools", body: "We recruit across Bulgaria, Nepal, South Asia and the EU." },
    ] },
    related: { title: "Related pages", items: [{ label: "Equal opportunity policy", to: "/equal-opportunity" }, { label: "Jobs for refugees", to: "/employers/jobs-for-refugees" }] },
  },

  /* ───────────────────── WHY / HOW ───────────────────── */
  "advantage": {
    seo: { title: "The Recruitly Advantage | Recruitly Group", description: "Why EU employers choose Recruitly: legal, compliant sourcing, complete candidate files, video demonstrations and document attestation support." },
    hero: { eyebrow: "Why Recruitly", title: "The Recruitly advantage", lead: "A Bulgarian-registered agency that can legally supply skilled talent from Bulgaria, Nepal, South Asia and EU countries.", primary: BOOK, secondary: BRIEF, journey: { title: "What sets us apart", steps: ["Legal supply", "Complete files", "Video demos", "Verified documents", "Prepared workers"] } },
    stats: PLACEHOLDER_STATS,
    features: { title: "Six reasons employers choose us", cols: 3, items: [
      { icon: "shield", title: "Legal and compliant", body: "A registered agency in Sofia, Bulgaria." },
      { icon: "file", title: "Complete candidate files", body: "Everything you need to decide in one pack." },
      { icon: "video", title: "Video demonstrations", body: "Skills you can see before you commit." },
      { icon: "stamp", title: "Verified documents", body: "Attestation coordinated with Apostille Sewa." },
      { icon: "graduation", title: "Skill-certified candidates", body: "CTEVT-certified training with Rubisco Tech." },
      { icon: "globe", title: "Global mobility under one roof", body: "Recruitment, training and documents joined up." },
    ] },
    partners: { title: "Strength in Nepal", lead: "Two partners remove the biggest delays in international hiring: unproven skills and unverified papers.", items: [RUBISCO, APOSTILLE_SEWA] },
    employerCta: true,
  },

  "how-we-work": {
    seo: { title: "How We Work | Recruitly Group", description: "Our seven-step hiring process: brief, sourcing, screening, shortlist with video demos, interviews, documentation, arrival and onboarding." },
    hero: { eyebrow: "How we work", title: "A transparent process, step by step", lead: "From your first brief to your new colleague's first shift, you see what happens and what comes next.", primary: BOOK, secondary: BRIEF, journey: { title: "The Recruitly process", steps: SEVEN.slice(0, 6) } },
    flow: { title: "Process at a glance", nodes: [
      { title: "Brief", icon: "clipboard", body: "Role, numbers, dates, pay." },
      { title: "Source and screen", icon: "search", body: "Bulgaria, Nepal, South Asia, EU." },
      { title: "Shortlist", icon: "video", body: "Files and video demos." },
      { title: "Documents", icon: "stamp", kind: "partner", tag: "Apostille Sewa", body: "Attested and visa-ready." },
      { title: "Arrival", icon: "plane", kind: "end", body: "Travel and onboarding." },
    ] },
    timeline: PROCESS_STEPS,
    employerCta: true,
  },

  "faq-employers": {
    seo: { title: "Employer FAQ | Recruitly Group", description: "Answers for hiring managers about sourcing, compliance, documents, candidate files and how to start." },
    hero: { eyebrow: "For employers", title: "Employer FAQ", lead: "Quick answers about how we recruit, what you receive and how to begin.", primary: BOOK, secondary: BRIEF },
    faqs: { title: "Common questions", items: [
      { q: "How do I start?", a: "Book a short consultation. After that, you can submit hiring requests and browse candidate files in the Employer Dashboard, or write to info@recruitlygroup.com." },
      { q: "Where do you source candidates?", a: "Bulgaria, Nepal, South Asia and EU countries, in line with applicable immigration and labour rules." },
      { q: "What do I receive before I decide?", a: "Complete candidate files and video demonstrations of skills." },
      { q: "Who handles document attestation?", a: "Our partner Apostille Sewa coordinates ward and municipality, MOFA Nepal and embassy legalisation." },
      { q: "Can candidates be trained first?", a: "Yes. Rubisco Tech offers CTEVT-certified courses and we can discuss custom skills." },
      { q: "Is Recruitly Group registered?", a: "Yes. We are an officially registered recruitment agency in Sofia, Bulgaria." },
    ] },
    employerCta: true,
  },

  /* ───────────────────── TALENT TOOLS ───────────────────── */
  "candidate-search": {
    seo: { title: "Candidate Search | Recruitly Group", description: "Browse verified candidate files with video demonstrations in the Recruitly Employer Dashboard." },
    hero: { eyebrow: "For employers", title: "Search verified candidates", lead: "Partners browse complete candidate files and skill videos in the Employer Dashboard. New employers start with a short consultation.", primary: BOOK, secondary: BRIEF, journey: { title: "Search to shortlist", steps: ["Book a consultation", "Open dashboard", "Filter candidates", "Watch skill videos", "Request interviews"] } },
    features: { title: "What you can do in the dashboard", cols: 3, items: [
      { icon: "search", title: "Filter by role and country", body: "Find candidates by trade, experience and location." },
      { icon: "video", title: "Watch skill demonstrations", body: "Short videos show practical ability." },
      { icon: "file", title: "Open full files", body: "Qualifications, experience and attested documents." },
      { icon: "list", title: "Shortlist and compare", body: "Keep the best candidates together." },
      { icon: "chat", title: "Request interviews", body: "We arrange the schedule for you." },
      { icon: "lock", title: "Private by design", body: "Candidate data is shared only with registered employers." },
    ] },
    timeline: { title: "From search to interview", steps: [
      { title: "Book a consultation", body: "We review your roles and set up your employer account." },
      { title: "Sign in to the dashboard", body: "Open your account and the candidate files we prepare for you." },
      { title: "Filter and shortlist", body: "Narrow the pool and save the strongest files." },
      { title: "Request interviews", body: "Tell us which candidates you want to meet." },
    ] },
    employerCta: true,
  },

  "request-talent": {
    seo: { title: "Request Talent | Recruitly Group", description: "Share your hiring brief and Recruitly will reply with a sourcing plan and a shortlist." },
    hero: { eyebrow: "For employers", title: "Request talent", lead: "Start with a short call, then share your brief. We come back with a sourcing plan and a shortlist.", primary: BOOK, secondary: { label: "Email your brief", href: `mailto:${SITE.email}?subject=Hiring%20brief` }, journey: { title: "After you send a brief", steps: ["Brief received", "Plan and sourcing", "Screened shortlist", "Interviews", "Documents and arrival"] } },
    checklists: { title: "What to include in your brief", lead: "The more you share, the faster we shortlist.", groups: [
      { title: "The role", items: ["Job title and duties", "Number of workers", "Qualifications and licences", "Language level"] },
      { title: "The offer", items: ["Salary and working hours", "Contract length", "Accommodation and travel", "Start date"] },
      { title: "Your company", items: ["Country and city of work", "Industry", "Contact person", "Any hiring deadline"] },
    ] },
    timeline: PROCESS_STEPS,
    employerCta: true,
  },

  /* ───────────────────── SEGMENTS ───────────────────── */
  "small-business-support": {
    seo: { title: "Small Business Support | Recruitly Group", description: "International hiring without an HR department: Recruitly handles sourcing, screening, documents and onboarding for small employers." },
    hero: { eyebrow: "For employers", title: "International hiring without an HR department", lead: "Small teams should not need a legal specialist to hire a skilled worker. We handle the complicated parts.", primary: BRIEF, secondary: BRIEF, journey: { steps: ["One-page brief", "We source", "You choose", "We handle papers", "Worker arrives"] } },
    features: { title: "Built for small employers", cols: 3, items: [
      { icon: "target", title: "Start with one role", body: "Begin with the person you need now, and grow later." },
      { icon: "file", title: "Plain-language files", body: "Clear candidate summaries that are easy to compare." },
      { icon: "stamp", title: "Paperwork handled", body: "Attestation, permits and visa steps coordinated for you." },
      { icon: "video", title: "See skills first", body: "Short videos reduce the risk of a wrong hire." },
      { icon: "support", title: "A person to call", body: "Ask questions by phone or WhatsApp." },
      { icon: "handshake", title: "Onboarding help", body: "We support the first weeks after arrival." },
    ] },
    timeline: PROCESS_STEPS,
    employerCta: true,
  },

  "mvp": {
    seo: { title: "Master Vendor Program (MVP) | Recruitly Group", description: "Make Recruitly your primary staffing provider. We manage and coordinate every vendor in your workforce supply chain for lower cost, tighter compliance and one clear view of your data." },
    hero: {
      eyebrow: "How we work", title: "Master Vendor Program (MVP)",
      lead: "One strategic partner for your entire contingent workforce. Recruitly acts as your primary staffing provider and coordinates every other vendor under one process, one set of standards and one report.",
      primary: BOOK, secondary: { label: "See when MVP fits", to: "/employers/mvp#when-to-choose-mvp" },
      journey: { title: "How an MVP rolls out", steps: ["Audit current vendors", "Consolidate under Recruitly", "One process and one report", "Track KPIs and improve"] },
    },
    intro: {
      title: "A partner, not just another vendor",
      paragraphs: [
        "Most large employers buy staff from many agencies, each with its own prices, paperwork and quality. That is hard to control and expensive to run.",
        "With the Master Vendor Program, Recruitly becomes the single point of accountability. We manage the vendor network on your behalf, keep contracts and labour rules in order, and give you reliable data on cost, speed and quality.",
      ],
      aside: { title: "At a glance", items: ["Primary staffing provider for your sites", "Vendor management and consolidation", "Compliance with labour and contract rules", "Dedicated strategic and operational team", "KPI tracking and continuous improvement"] },
    },
    features: { title: "Why choose a Master Vendor Program", cols: 3, items: [
      { icon: "target", title: "Tailored to your needs", body: "We design the programme around your goals, sites and seasons, keeping cost low while the process stays simple." },
      { icon: "layers", title: "Built for high volumes", body: "One request channel and one placement process make large intakes faster and less complicated." },
      { icon: "users", title: "A dedicated expert team", body: "Strategic and operational specialists who know your business and improve your recruitment decisions." },
      { icon: "chart", title: "Continuous quality improvement", body: "We agree KPIs with you, track them every month and adjust the programme as your needs change." },
      { icon: "scale", title: "Compliance under control", body: "Labour, immigration and contractual requirements are checked across every vendor, not just ours." },
      { icon: "money", title: "Lower total cost", body: "Fewer vendors, shared standards and better data reduce recruitment spend over time." },
    ] },
    flow: { title: "How the programme works", lead: "Every request flows through one door and leaves with the same standard of checks.", nodes: [
      { title: "Your hiring request", icon: "clipboard", body: "Sites and managers send requests through one channel." },
      { title: "Recruitly as primary provider", icon: "handshake", kind: "partner", tag: "Recruitly", body: "We fill what we can and route the rest." },
      { title: "Vendor network", icon: "users", body: "Approved secondary vendors supply the remaining roles on shared terms." },
      { title: "Screening and compliance", icon: "shield", body: "Documents, qualifications and contracts checked to one standard." },
      { title: "Reporting and review", icon: "chart", kind: "end", body: "KPIs, cost and quality reported and improved." },
    ] },
    comparison: { title: "Many vendors versus one Master Vendor Program", columns: ["Separate vendors", "Master Vendor Program"], highlight: 1, rows: [
      { label: "Single point of accountability", cells: [false, true] },
      { label: "Consistent compliance checks", cells: ["Varies by vendor", "One standard"] },
      { label: "Consolidated reporting and data", cells: [false, true] },
      { label: "Vendor cost optimisation", cells: [false, true] },
      { label: "Speed on large volumes", cells: ["Depends on each vendor", "Coordinated centrally"] },
      { label: "Dedicated onsite account manager", cells: [false, true] },
    ] },
    checklists: { title: "When is the Master Vendor Program right for you?", lead: "MVP fits best when two or more of these describe your business.", groups: [
      { title: "Choose MVP when you…", items: [
        "Have large, recurring volumes of staffing needs",
        "Face complex labour and contractual compliance",
        "Want to reduce overall recruitment cost",
        "Need faster, more efficient hiring",
        "Want a dedicated account manager working at your site",
        "Use several staffing providers and want one system",
      ] },
    ] },
    timeline: { title: "Getting started", steps: [
      { title: "Discovery call", body: "We learn your sites, volumes, vendors and goals." },
      { title: "Vendor and spend review", body: "We map current suppliers, costs and compliance gaps." },
      { title: "Programme design", body: "We agree scope, service levels, KPIs and governance with you." },
      { title: "Rollout", body: "We onboard managers and vendors and open the single request channel." },
      { title: "Monthly review", body: "We report on KPIs and continually improve the programme." },
    ] },
    faqs: { items: [
      { q: "Do I have to stop using my current vendors?", a: "No. We bring them into the programme under shared standards, and replace only those that do not perform." },
      { q: "Who is MVP for?", a: "Employers with large or multi-site workforce needs, or several staffing providers they want to coordinate." },
      { q: "How is MVP different from managed services?", a: "Managed services run a workforce programme for you. MVP also manages the other vendors in your supply chain." },
    ] },
    employerCta: true,
    closing: { title: "Talk to us about a Master Vendor Program", body: "Book a consultation and we will review your vendors, volumes and goals.", primary: BOOK },
  },

  "jobs-for-refugees": {
    seo: { title: "Jobs for Refugees and Displaced Talent | Recruitly Group", description: "Skills-first recruitment that helps displaced people with the right to work find fair jobs, with credential checks and language support." },
    hero: { eyebrow: "Why Recruitly", title: "Skills-first jobs for refugees and displaced talent", lead: "Talent does not disappear when people are displaced. We help employers recognise skills and complete the checks properly.", primary: BRIEF, secondary: { label: "Browse openings", to: "/jobs" }, journey: { steps: ["Skills review", "Credential checks", "Language support", "Employer match", "Onboarding"] } },
    notice: { tone: "info", title: "Right to work comes first", body: "We place people only where national law allows them to work, and we help employers confirm status before an offer is made." },
    features: { title: "How we support inclusive hiring", cols: 3, items: [
      { icon: "usercheck", title: "Skills review", body: "Assess practical ability, not only paperwork." },
      { icon: "stamp", title: "Credential verification", body: "Document checks where papers are available." },
      { icon: "languages", title: "Language preparation", body: "Workplace language support before and after placement." },
      { icon: "scale", title: "Compliance guidance", body: "Clear advice on work authorisation requirements." },
      { icon: "heart", title: "Respectful process", body: "Fair treatment and clear communication." },
      { icon: "handshake", title: "Employer readiness", body: "Guidance for managers on supporting new colleagues." },
    ] },
    employerCta: true,
  },
};
