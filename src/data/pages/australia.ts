// Australia B2B pages (employers + licensed recruitment agencies). Rendered by <ContentPage/>.
// Content rules: no statistics, registration numbers, licences or guarantees that are not in the repo.
// Anything legal/company-specific lives in AU_COMPANY (src/config/markets.ts) with [TODO]s.
// SEO titles/descriptions come from src/config/market-routes.json (also used by sitemap + prerender).
import type { PageSpec } from "@/components/blocks/spec";
import { SITE } from "@/config/site";
import { metaFor } from "@/config/markets";

const GET_STARTED = { label: "Start a hiring enquiry", to: "/australia/get-started" };
const BOOK = { label: "Book a 20-minute call", to: "/schedule-a-call" };
const seo = (path: string, schema?: object[]): PageSpec["seo"] => {
  const { title, description } = metaFor(path);
  return { title, description, schema };
};

const NOT_ADVICE: NonNullable<PageSpec["notice"]> = {
  tone: "info",
  title: "What we do and do not do",
  body: "Recruitly Group sources, pre-screens and presents candidates. We do not provide immigration advice or assistance. Sponsorship, nomination and visa applications are handled by the employer and their Registered Migration Agent or Australian legal practitioner. Visa rules and thresholds change, so always confirm current requirements with the Department of Home Affairs.",
};

const PROCESS: NonNullable<PageSpec["timeline"]> = {
  title: "From brief to handover: how a sourcing project runs",
  lead: "The same path every time, so you always know the next step and who owns it.",
  steps: [
    { title: "Role intake", body: "You tell us the trade or role, number of workers, location, pay range, start window and any licensing needs.", icon: "clipboard" },
    { title: "Sourcing", body: "We search our Nepal, Bulgaria and EU pools for people who match the brief on experience, not just job title.", icon: "search" },
    { title: "Pre-screening", body: "Interviews, CV and reference checks, English-level check and a review of qualifications and trade evidence.", icon: "usercheck" },
    { title: "Shortlist with video demonstrations", body: "You receive complete candidate files and short videos of practical skills before you commit to interviews.", icon: "video" },
    { title: "Your interviews and decision", body: "Your team (or your client) interviews the shortlist. We arrange schedules and interpreters where needed.", icon: "handshake" },
    { title: "Handover to your migration team", body: "Candidates move to your sponsor or your licensed migration partner for nomination and visa steps. We coordinate document readiness; we do not lodge applications.", icon: "file", tag: "Compliance stays with the licensed party" },
  ],
};

const SOURCING_RELATED = {
  title: "Explore our sourcing pools",
  items: [
    { label: "Skilled workers from Nepal", body: "Trade-experienced candidates, managed from our Kathmandu team.", to: "/australia/sourcing/nepal" },
    { label: "Skilled workers from Bulgaria", body: "EU-trained trades and technical staff, managed from Sofia.", to: "/australia/sourcing/bulgaria" },
    { label: "Skilled workers from the EU", body: "Wider European talent for hard-to-fill roles.", to: "/australia/sourcing/eu" },
    { label: "Visa pathways overview", body: "How sourcing fits with 482, 494 and 186 workflows.", to: "/australia/visa-pathways-overview" },
  ],
};

export const AUSTRALIA_PAGES: Record<string, PageSpec> = {
  /* ───────────────────────── Market hub ───────────────────────── */
  hub: {
    seo: seo("/australia", [{
      "@type": "Service", name: "Skilled workforce sourcing for Australian employers and agencies",
      serviceType: "International recruitment and candidate sourcing",
      provider: { "@type": "EmploymentAgency", name: SITE.name, url: SITE.url },
      areaServed: { "@type": "Country", name: "Australia" },
      audience: { "@type": "BusinessAudience", audienceType: "Australian employers and licensed recruitment agencies" },
    }]),
    hero: {
      eyebrow: "Australia · Employers and licensed agencies",
      title: "Hire skilled workers for Australia, sourced from Nepal, Bulgaria and the EU",
      lead: "We source, pre-screen and pipeline vetted skilled candidates for Australian employers and licensed recruitment agencies, so you can fill urgent shortages without running an offshore search yourself.",
      primary: GET_STARTED, secondary: BOOK,
      journey: { title: "Your sourcing pipeline", steps: ["Role intake", "Sourcing", "Pre-screening", "Shortlist + video", "Your interviews", "Handover to migration team"] },
    },
    notice: NOT_ADVICE,
    features: { title: "Built for B2B hiring, not job-board volume", cols: 3, items: [
      { icon: "usercheck", title: "Vetted, not just collected", body: "Every shortlisted candidate has been interviewed, checked and documented before you see the file." },
      { icon: "video", title: "Skills you can see", body: "Short practical-skills videos let you judge trade ability before interviews." },
      { icon: "globe", title: "Three sourcing pools", body: "Nepal, Bulgaria and the wider EU, with local teams in Kathmandu and Sofia." },
      { icon: "handshake", title: "Direct employers or agencies", body: "Hire for your own business, or use us as a white-label pipeline behind your agency brand." },
      { icon: "scale", title: "Compliance stays with the right party", body: "We coordinate with your sponsor or licensed migration partner. We never present ourselves as migration agents." },
      { icon: "clock", title: "Clear timelines", body: "A defined process from intake to handover, with updates at each stage." },
    ] },
    timeline: PROCESS,
    comparison: {
      title: "Which route is right for you?", columns: ["Direct employer", "Licensed agency"], highlight: 0,
      rows: [
        { label: "You hire for", cells: ["Your own business", "Your clients"] },
        { label: "Branding", cells: ["Recruitly Group", "White-label available"] },
        { label: "We deliver", cells: ["Shortlisted, screened candidates", "Pre-vetted CVs and candidate pipelines"] },
        { label: "Visa and compliance", cells: ["Your sponsor / migration agent", "Your licensed migration team"] },
      ],
    },
    related: { title: "Go deeper", items: [
      { label: "Skilled trades recruitment", body: "Electricians, welders, mechanics, carpenters, chefs and more.", to: "/specializations/skilled-trades-australia" },
      { label: "For direct employers", body: "Role intake, timelines and hiring steps.", to: "/australia/for-employers" },
      { label: "For recruitment agencies", body: "Offshore sourcing and pipelining partner model.", to: "/australia/for-recruitment-agencies" },
      { label: "Nepal · Bulgaria · EU sourcing", body: "Compare the three pools.", to: "/australia/sourcing" },
      { label: "Visa pathways overview", body: "482, 494 and 186 explained at a high level.", to: "/australia/visa-pathways-overview" },
      { label: "Hiring enquiry form", body: "Tell us the roles and timeframe.", to: "/australia/get-started" },
    ] },
    faqs: { title: "Questions from Australian employers and agencies", items: [
      { q: "Do you provide visa or migration advice?", a: "No. We are a recruitment and sourcing business. Sponsorship, nomination and visa applications are handled by the employer and their Registered Migration Agent or Australian legal practitioner, or by your agency's licensed migration team." },
      { q: "Which countries do you source from?", a: "Nepal, Bulgaria and the wider European Union. Each pool has its own page with candidate strengths and workflow." },
      { q: "Can you work behind our agency brand?", a: "Yes. Our agency partner model supports white-label candidate pipelining for licensed Australian recruitment and labour-hire agencies." },
      { q: "What trades and roles do you cover?", a: "Construction and building trades, electrical, welding and fabrication, automotive and diesel mechanics, hospitality and commercial kitchens, plus engineering and technical roles. See our skilled trades page." },
      { q: "How do I start?", a: "Send a hiring enquiry with your roles, volumes and timeframe. We reply with a sourcing plan and next steps." },
    ] },
    closing: { title: "Tell us what you need to fill", body: "Share the roles, numbers and timeframe. We will reply with a clear plan.", primary: GET_STARTED },
  },

  /* ───────────────────────── Skilled trades (canonical: /specializations/skilled-trades-australia) ───────────────────────── */
  trades: {
    seo: seo("/specializations/skilled-trades-australia", [{
      "@type": "Service", name: "Skilled trades recruitment for Australian employers and agencies",
      serviceType: "Skilled trades recruitment and candidate sourcing",
      provider: { "@type": "EmploymentAgency", name: SITE.name, url: SITE.url },
      areaServed: { "@type": "Country", name: "Australia" },
    }]),
    hero: {
      eyebrow: "Skilled trades · Australia",
      title: "Skilled trades recruitment for Australian employers and agencies",
      lead: "Electricians, welders, mechanics, carpenters, chefs and more: sourced from Nepal, Bulgaria and the EU, pre-screened to your brief and shown to you on video before you interview.",
      primary: GET_STARTED, secondary: BOOK,
      journey: { title: "Trade hiring pipeline", steps: ["Trade brief", "Sourcing", "Trade-skills screening", "Skills videos", "Your interviews", "Handover"] },
    },
    notice: NOT_ADVICE,
    features: { title: "Trades and sectors we recruit for", cols: 3, items: [
      { icon: "hardhat", title: "Construction and building", body: "Carpenters and joiners, bricklayers, concreters, formworkers, scaffolders and general building trades." },
      { icon: "zap", title: "Electrical", body: "Electricians and electrical support. Australian state or territory licensing applies to electrical work." },
      { icon: "factory", title: "Welding and fabrication", body: "Welders, fabricators, boilermakers and metal trades for workshops and sites." },
      { icon: "wrench", title: "Automotive and diesel", body: "Light and heavy vehicle mechanics, diesel fitters and machinery technicians." },
      { icon: "utensils", title: "Hospitality and commercial kitchens", body: "Chefs, cooks and kitchen staff for hotels, restaurants and catering." },
      { icon: "truck", title: "Industrial and machinery", body: "Plant and machinery operators and industrial production roles." },
    ] },
    checklists: { title: "How we check trade candidates", lead: "Trade ability is hard to judge from a CV, so we collect evidence you can review.", groups: [
      { title: "Evidence in every shortlist file", items: ["Verified work history and references", "Qualifications and certificates reviewed", "Practical-skills video demonstration", "Working-English check", "Document-readiness status"] },
      { title: "Things we flag early", items: ["Regulated trades that need Australian licensing (e.g. electrical, plumbing, gas)", "Occupations where a formal skills assessment may apply", "Site tickets and safety cards the employer will arrange", "Mismatches between job title and actual experience"] },
    ] },
    comparison: { title: "Candidate readiness by sourcing pool", lead: "A general guide. Every candidate is assessed individually.", columns: ["Nepal", "Bulgaria", "EU (wider)"], rows: [
      { label: "Typical trade focus", cells: ["Construction, welding, hospitality, industrial", "Technical, automotive, welding, engineering support", "Niche and higher-spec trades"] },
      { label: "Screening by", cells: ["Kathmandu team", "Sofia team", "Sofia team"] },
      { label: "Evidence provided", cells: ["Files + skills video", "Files + skills video", "Files + skills video"] },
    ] },
    timeline: PROCESS,
    related: { title: "Continue exploring", items: [
      { label: "For direct employers", body: "Role intake and hiring steps.", to: "/australia/for-employers" },
      { label: "For recruitment agencies", body: "Partner model and white-label pipeline.", to: "/australia/for-recruitment-agencies" },
      { label: "Nepal · Bulgaria · EU", body: "Compare sourcing pools.", to: "/australia/sourcing" },
      { label: "Visa pathways overview", body: "482, 494 and 186 at a glance.", to: "/australia/visa-pathways-overview" },
      { label: "Construction recruitment", to: "/industries/construction" },
      { label: "Australia hub", to: "/australia" },
    ] },
    faqs: { title: "Skilled trades recruitment: common questions", items: [
      { q: "Which trades do you recruit for Australia?", a: "Construction and building trades, electrical, welding and fabrication, automotive and diesel mechanics, hospitality and commercial kitchens, plus industrial and machinery roles. Send us your brief if your trade is not listed." },
      { q: "How do you assess trade skills from overseas?", a: "We review work history, qualifications and references, run an interview and English check, and collect a practical-skills video. Your team then interviews the shortlist." },
      { q: "Do tradespeople need Australian licences?", a: "Regulated trades such as electrical, plumbing and gasfitting require licensing in the relevant Australian state or territory. We flag this at intake so you can plan for it." },
      { q: "Do you handle the visa?", a: "No. Visa and sponsorship steps are handled by the employer and their Registered Migration Agent or Australian legal practitioner." },
    ] },
    closing: { title: "Tell us which trades you need", body: "Share the trades, numbers and start window. We will reply with a sourcing plan.", primary: GET_STARTED },
  },

  /* ───────────────────────── Direct employers ───────────────────────── */
  employers: {
    seo: seo("/australia/for-employers"),
    hero: {
      eyebrow: "For Australian employers",
      title: "Hire overseas skilled workers for your Australian business",
      lead: "If local recruitment has not filled the role, we source, pre-screen and shortlist skilled candidates from Nepal, Bulgaria and the EU, then hand over to your sponsor or migration agent.",
      primary: { label: "Start a hiring enquiry", to: "/australia/get-started?type=employer" }, secondary: BOOK,
    },
    notice: NOT_ADVICE,
    intro: { title: "A structured way to hire offshore", paragraphs: [
      "Many Australian businesses know the roles they cannot fill, but not where to find qualified people overseas or how to judge them from a distance. We run that search and screening for you.",
      "You stay in control of the decision. We present complete candidate files and practical-skills videos, arrange your interviews, and prepare candidates and documents for the next stage with your migration adviser.",
    ], aside: { title: "Good fit if you…", items: ["Have roles open that local hiring has not filled", "Want vetted candidates, not a pile of CVs", "Already have, or plan to get, sponsor approval", "Prefer one partner for sourcing and screening"] } },
    timeline: PROCESS,
    features: { title: "What you get with direct employer hiring", cols: 3, items: [
      { icon: "file", title: "Complete candidate files", body: "Experience, qualifications, references and document status in one place." },
      { icon: "video", title: "Practical skills videos", body: "See the work before you decide to interview." },
      { icon: "languages", title: "English check", body: "We assess working English so you know what to expect on site." },
      { icon: "badge", title: "Licensing awareness", body: "We flag regulated occupations (for example electrical and plumbing) that need Australian state or territory licensing." },
      { icon: "clock", title: "Timeline clarity", body: "We tell you what is realistic for your start window, including steps that sit with your migration adviser." },
      { icon: "support", title: "One point of contact", body: "A named coordinator from brief to handover." },
    ] },
    checklists: { title: "What to have ready for your intake", groups: [
      { title: "About the role", items: ["Title, duties and required experience", "Pay range and employment type", "Work location and start window", "Number of workers needed"] },
      { title: "About your business", items: ["Sponsorship status (approved, applying, not yet)", "Migration agent or lawyer details, if appointed", "Any licensing or ticket requirements", "Accommodation or relocation support you can offer"] },
    ] },
    related: SOURCING_RELATED,
    faqs: { items: [
      { q: "Do I need to be an approved sponsor first?", a: "Not to start sourcing. Sponsorship and nomination are handled by you and your migration adviser, and timing varies. We can begin the search while you confirm your sponsorship position." },
      { q: "Who talks to the candidates about visas?", a: "Your Registered Migration Agent or Australian legal practitioner. We make sure candidates understand the process and have their documents ready, but we do not give immigration advice." },
      { q: "How long does it take?", a: "It depends on the role, volume and the pool. We give you a realistic plan after intake. Visa and licensing steps are set by the relevant authorities and your adviser." },
      { q: "Can candidates be asked to pay us?", a: "[TODO: confirm and state the candidate-fee policy for Australia. Australian sponsorship rules restrict charging workers for sponsorship-related benefits; get this wording legally reviewed before publishing.]" },
    ] },
    closing: { title: "Ready to scope your hiring?", body: "Send your roles and timeframe and we will reply with a sourcing plan.", primary: { label: "Start a hiring enquiry", to: "/australia/get-started?type=employer" } },
  },

  /* ───────────────────────── Agencies ───────────────────────── */
  agencies: {
    seo: seo("/australia/for-recruitment-agencies"),
    hero: {
      eyebrow: "For licensed Australian agencies",
      title: "A reliable offshore sourcing partner for Australian recruitment agencies",
      lead: "Add vetted candidates from Nepal, Bulgaria and the EU to your pipeline without building an offshore team. White-label friendly, with compliance staying with your licensed team.",
      primary: { label: "Become a partner", to: "/australia/get-started?type=agency" }, secondary: BOOK,
    },
    notice: { tone: "info", title: "Licensing and compliance", body: "This model is for agencies that already hold the licences their state or territory requires (for example labour-hire licensing where applicable) and work with Registered Migration Agents. You remain responsible for your licences, your client contracts and visa-related advice. We supply candidates and document preparation only." },
    features: { title: "How the partner model works", cols: 3, items: [
      { icon: "layers", title: "Pre-vetted pipelines", body: "CVs that have been interviewed, reference-checked and reviewed against your client's brief." },
      { icon: "badge", title: "Trade and skills checks", body: "Qualification review and practical-skills videos for trade roles." },
      { icon: "handshake", title: "White-label option", body: "Present candidates under your brand. We stay in the background." },
      { icon: "file", title: "Document readiness", body: "Candidate files organised for your migration team to pick up without chasing." },
      { icon: "scale", title: "Your licensed team leads compliance", body: "We coordinate with your migration team and never position ourselves as migration agents." },
      { icon: "gauge", title: "Capacity on demand", body: "Scale sourcing up for a client project and back down afterwards." },
    ] },
    timeline: { title: "Working with us, step by step", steps: [
      { title: "Partner intake", body: "Your agency, licences, sectors and the roles you most often struggle to fill.", icon: "clipboard" },
      { title: "Client brief", body: "You send a live client brief. We confirm feasibility and the best pool.", icon: "target" },
      { title: "Sourcing and vetting", body: "Pipeline built and screened to the brief.", icon: "search" },
      { title: "Candidate pack", body: "Files and skills videos in a format you can forward to your client.", icon: "file" },
      { title: "Client interviews", body: "We schedule and support, under your brand if you prefer.", icon: "video" },
      { title: "Handover", body: "Candidates move to your licensed migration team for nomination and visa steps.", icon: "handshake" },
    ] },
    comparison: { title: "Doing it in-house vs partnering", columns: ["Own offshore search", "With Recruitly Group"], highlight: 1, rows: [
      { label: "Local teams in source countries", cells: [false, true] },
      { label: "Practical-skills videos", cells: [false, true] },
      { label: "White-label presentation", cells: [false, true] },
      { label: "Scale up/down per project", cells: [false, true] },
      { label: "Compliance with your licensed team", cells: [true, true] },
    ] },
    related: SOURCING_RELATED,
    faqs: { items: [
      { q: "Do you need to be licensed to partner with us?", a: "We work with agencies that already hold the licences required in their state or territory, and that have access to a Registered Migration Agent or Australian legal practitioner." },
      { q: "Will you contact our clients directly?", a: "Not without your agreement. In white-label mode we stay behind your brand." },
      { q: "Do you lodge visa applications?", a: "No. Nomination and visa applications are lodged by the sponsor's or candidate's licensed migration professional." },
      { q: "What do you charge?", a: "[TODO: describe the commercial model for agency partners once confirmed (fee basis, timing, replacement terms).]" },
    ] },
    closing: { title: "Add a sourcing partner to your agency", body: "Tell us your sectors and a live brief. We will confirm feasibility and next steps.", primary: { label: "Become a partner", to: "/australia/get-started?type=agency" } },
  },

  /* ───────────────────────── Sourcing overview ───────────────────────── */
  sourcing: {
    seo: seo("/australia/sourcing"),
    hero: {
      eyebrow: "Sourcing pools",
      title: "Source skilled workers from Nepal, Bulgaria and the EU",
      lead: "Three candidate pools, each with local recruiters, a screening process and document preparation, so Australian employers and agencies can match the pool to the role.",
      primary: GET_STARTED, secondary: BOOK,
    },
    comparison: { title: "The three pools at a glance", lead: "Skills and English vary by person in every pool, so we test and verify rather than assume.", columns: ["Nepal", "Bulgaria", "EU (wider)"], rows: [
      { label: "Typical strengths", cells: ["Trade experience, strong work ethic, many with overseas work history", "EU-trained trades and technical staff", "Specialised and hard-to-fill roles"] },
      { label: "Managed from", cells: ["Kathmandu team", "Sofia team", "Sofia team with partner network"] },
      { label: "Best for", cells: ["Volume trades and hospitality", "Technical trades, engineering, automotive", "Niche skills, higher-spec roles"] },
    ] },
    related: { title: "Pool pages", items: [
      { label: "Nepal", to: "/australia/sourcing/nepal" },
      { label: "Bulgaria", to: "/australia/sourcing/bulgaria" },
      { label: "European Union", to: "/australia/sourcing/eu" },
      { label: "Skilled trades recruitment", to: "/specializations/skilled-trades-australia" },
    ] },
    faqs: { items: [
      { q: "How do you choose which pool to search?", a: "We start from the role, the required experience and your timeline. Often we search more than one pool and present the strongest shortlist." },
      { q: "How do you check English?", a: "We assess working English during screening. Where a formal English test is needed for a visa pathway, that is arranged by the candidate with your migration adviser." },
    ] },
    closing: { title: "Not sure which pool fits?", body: "Share the role and we will recommend where to search.", primary: GET_STARTED },
  },

  /* ───────────────────────── Pools ───────────────────────── */
  nepal: {
    seo: seo("/australia/sourcing/nepal"),
    hero: { eyebrow: "Sourcing pool · Nepal", title: "Skilled workers from Nepal for Australian employers", lead: "Trade-experienced candidates, screened and prepared by our Kathmandu team, then presented to you with full files and skills videos.", primary: GET_STARTED, secondary: { label: "All pools", to: "/australia/sourcing" } },
    features: { title: "Why employers look at Nepal", cols: 3, items: [
      { icon: "hardhat", title: "Hands-on trade experience", body: "Many candidates have worked in construction, electrical, welding, hospitality and industrial roles, often including overseas." },
      { icon: "languages", title: "English-use in education", body: "English is widely used in Nepali education. We still assess each person's working English." },
      { icon: "users", title: "Local team on the ground", body: "Our Kathmandu team interviews and verifies in person." },
      { icon: "file", title: "Document preparation", body: "Qualifications, experience letters and identity documents organised early to reduce delays." },
      { icon: "award", title: "Skills-assessment readiness", body: "Where an occupation needs a formal skills assessment, we help candidates gather evidence. Assessment is lodged with the assessing authority." },
      { icon: "badge", title: "Licensing awareness", body: "Regulated trades need Australian state or territory licensing; we flag this at intake." },
    ] },
    timeline: PROCESS, related: SOURCING_RELATED,
    faqs: { items: [
      { q: "What roles suit Nepal sourcing?", a: "Construction and building trades, welding, electrical support, hospitality and commercial kitchens, and industrial roles, depending on the brief." },
      { q: "Can you share candidate videos?", a: "Yes. Practical-skills videos are part of the shortlist for trade roles." },
    ] },
    closing: { title: "Hire from Nepal", body: "Send the role and timeframe for a sourcing plan.", primary: GET_STARTED },
  },
  bulgaria: {
    seo: seo("/australia/sourcing/bulgaria"),
    hero: { eyebrow: "Sourcing pool · Bulgaria", title: "Skilled workers from Bulgaria for Australian employers", lead: "EU-trained tradespeople and technical staff, screened and prepared by our Sofia team.", primary: GET_STARTED, secondary: { label: "All pools", to: "/australia/sourcing" } },
    features: { title: "Why employers look at Bulgaria", cols: 3, items: [
      { icon: "factory", title: "Technical and industrial skills", body: "Candidates with training and experience in welding, machining, automotive, electrical and construction." },
      { icon: "award", title: "EU qualifications", body: "Formal vocational and technical qualifications we can review and document." },
      { icon: "languages", title: "English varies by person", body: "We test working English during screening and report it plainly." },
      { icon: "users", title: "Sofia-based team", body: "Our Sofia team interviews and verifies candidates directly." },
      { icon: "file", title: "Document preparation", body: "Qualifications and experience records prepared for your migration team." },
      { icon: "badge", title: "Licensing awareness", body: "We flag regulated occupations that need Australian licensing." },
    ] },
    timeline: PROCESS, related: SOURCING_RELATED,
    faqs: { items: [
      { q: "What roles suit Bulgaria sourcing?", a: "Technical trades, engineering support, automotive and diesel mechanics, welding and fabrication, and hospitality roles, depending on the brief." },
      { q: "Do you have a Bulgarian presence?", a: "Yes, our Sofia office. [TODO: confirm exact wording and registration details before adding a registration claim.]" },
    ] },
    closing: { title: "Hire from Bulgaria", body: "Send the role and timeframe for a sourcing plan.", primary: GET_STARTED },
  },
  eu: {
    seo: seo("/australia/sourcing/eu"),
    hero: { eyebrow: "Sourcing pool · European Union", title: "Skilled workers from the EU for Australian employers", lead: "Access EU-based candidates for specialised and hard-to-fill roles, with the same screening and handover process as our other pools.", primary: GET_STARTED, secondary: { label: "All pools", to: "/australia/sourcing" } },
    features: { title: "When the wider EU makes sense", cols: 3, items: [
      { icon: "compass", title: "Niche skills", body: "When a role needs a specific qualification or experience that is thin elsewhere." },
      { icon: "award", title: "Qualification review", body: "We review and document EU qualifications and experience." },
      { icon: "usercheck", title: "Same vetting standard", body: "Interview, reference checks, English check and skills evidence for every shortlisted candidate." },
      { icon: "file", title: "Document readiness", body: "Files prepared for your sponsor or migration team." },
      { icon: "handshake", title: "Partner network", body: "[TODO: confirm how EU candidates outside Bulgaria are sourced before describing partners.]" },
      { icon: "badge", title: "Licensing awareness", body: "We flag regulated occupations at intake." },
    ] },
    timeline: PROCESS, related: SOURCING_RELATED,
    faqs: { items: [
      { q: "Which EU countries do you cover?", a: "[TODO: confirm the countries actively covered.] Tell us your brief and we will confirm feasibility." },
    ] },
    closing: { title: "Hire from the EU", body: "Send the role and timeframe for a sourcing plan.", primary: GET_STARTED },
  },

  /* ───────────────────────── Visa pathways hub ───────────────────────── */
  visa: {
    seo: seo("/australia/visa-pathways-overview", [{
      "@type": "Article", headline: "Australian employer-sponsored visa pathways: an overview",
      author: { "@type": "Organization", name: SITE.name }, publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
    }]),
    hero: { eyebrow: "Visa pathways · General information", title: "Australian employer-sponsored visa pathways: 482, 494 and 186", lead: "A plain-English overview for employers and agencies. It explains how sourcing fits alongside sponsorship, not what any individual should do.", primary: GET_STARTED, secondary: BOOK },
    notice: { tone: "warning", title: "General information only, not immigration advice", body: "Recruitly Group is not a registered migration agent and does not provide immigration advice or assistance. Visa rules, occupation lists, income thresholds and fees change regularly. Confirm current requirements with the Department of Home Affairs (homeaffairs.gov.au) and a Registered Migration Agent or Australian legal practitioner before acting. [TODO: add last-reviewed date and the reviewing migration professional, if any.]" },
    features: { title: "The main employer-sponsored pathways", cols: 3, items: [
      { icon: "plane", title: "Skills in Demand visa (subclass 482)", body: "Temporary employer-sponsored visa that replaced the Temporary Skill Shortage visa in December 2024. It has Specialist Skills, Core Skills and Labour Agreement streams." },
      { icon: "pin", title: "Skilled Employer Sponsored Regional visa (subclass 494)", body: "Provisional regional employer-sponsored pathway for employers in designated regional areas." },
      { icon: "landmark", title: "Employer Nomination Scheme (subclass 186)", body: "Permanent employer-sponsored visa, with streams that include direct entry and transition from a temporary visa." },
    ] },
    timeline: { title: "Where sourcing fits in a sponsored hire", lead: "A simplified view. Your migration professional will set the actual steps for your case.", steps: [
      { title: "Role and occupation defined", body: "The employer decides the role and, with their adviser, whether it maps to an eligible occupation.", icon: "clipboard" },
      { title: "Sponsor position confirmed", body: "The employer confirms or obtains sponsor approval with their migration adviser.", icon: "building", tag: "Employer + adviser" },
      { title: "Candidate sourced and screened", body: "We source, pre-screen and shortlist candidates against the role.", icon: "search", tag: "Recruitly Group" },
      { title: "Skills and document preparation", body: "Where a skills assessment or licensing is needed, candidates gather evidence. Documents are organised for the adviser.", icon: "file", tag: "Candidate + adviser" },
      { title: "Nomination and visa lodgement", body: "Handled by the sponsor and the licensed migration professional.", icon: "scale", tag: "Licensed professional" },
    ] },
    related: { title: "Related pages", items: [
      { label: "For direct employers", to: "/australia/for-employers" },
      { label: "For recruitment agencies", to: "/australia/for-recruitment-agencies" },
      { label: "Sourcing pools", to: "/australia/sourcing" },
      { label: "Skilled trades recruitment", to: "/specializations/skilled-trades-australia" },
    ] },
    faqs: { items: [
      { q: "Do you lodge visa or nomination applications?", a: "No. Those are handled by the sponsoring employer and their Registered Migration Agent or Australian legal practitioner." },
      { q: "Can you tell me which visa a candidate qualifies for?", a: "No. That is immigration advice, which only a registered migration agent or Australian legal practitioner can give. We can introduce you to the process at a general level." },
      { q: "What are the current salary thresholds and fees?", a: "They are updated regularly and differ by stream, so we do not publish figures here. See the Department of Home Affairs website or ask your migration adviser." },
      { q: "Does a sourced candidate need a skills assessment?", a: "It depends on the occupation and pathway. Some require a formal assessment by an assessing authority. Your adviser will confirm." },
    ] },
    closing: { title: "Planning a sponsored hire?", body: "Tell us the roles and timeframe and we will plan the sourcing side to fit your adviser's workflow.", primary: GET_STARTED },
  },
};
