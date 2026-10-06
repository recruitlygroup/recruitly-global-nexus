// Legal pages — plain-language DRAFTS based on how the site actually works (Supabase backend, consent-gated
// analytics, WhatsApp and form applications). They MUST be reviewed by your lawyer before launch (see PHASES.md).
// Flip SHOW_DRAFT_BADGE to false once approved.
export const SHOW_DRAFT_BADGE = true;
export const LEGAL_UPDATED = "5 October 2026";

export interface LegalDoc { title: string; summary: string; sections: { heading: string; body: string[] }[] }

const CONTROLLER = "Recruitly Group, Strandscha St 44, 1303 Sofia Center, Sofia, Bulgaria (info@recruitlygroup.com)";

export const LEGAL: Record<string, LegalDoc> = {
  terms: {
    title: "Terms of use",
    summary: "The rules for using recruitlygroup.com and our application tools.",
    sections: [
      { heading: "Who we are", body: [`This website is operated by ${CONTROLLER}, an officially registered recruitment agency in Sofia, Bulgaria.`] },
      { heading: "Using the site", body: ["You may browse the site and apply for roles for lawful, personal purposes. You must give accurate information in applications and must not misuse, scrape or attack the site."] },
      { heading: "Job listings", body: ["Listings describe real vacancies at the time of publication, but openings can close or change. A listing is not an offer of employment. Employment is agreed in a written contract with the employer."] },
      { heading: "Fees", body: ["Recruitly Group does not charge workers a placement fee. Third-party costs, such as government document fees, medical tests or visa fees, are paid to the issuing office or provider. Ask for an official receipt."] },
      { heading: "Partners and external sites", body: ["Some services are delivered with partners such as Apostille Sewa and Rubisco Tech. External sites have their own terms and privacy notices."] },
      { heading: "Accuracy and liability", body: ["We take care to keep information accurate, but immigration, labour and embassy rules change. Check requirements with your recruiter. To the extent the law allows, we are not liable for indirect losses arising from use of the site."] },
      { heading: "Changes and contact", body: ["We may update these terms. The date at the top shows the latest version. Questions: info@recruitlygroup.com."] },
    ],
  },
  privacy: {
    title: "Privacy policy",
    summary: "How we collect, use and protect personal data on recruitlygroup.com.",
    sections: [
      { heading: "Who is responsible", body: [`The data controller is ${CONTROLLER}.`] },
      { heading: "What we collect", body: ["Contact details you give us (name, email, phone, WhatsApp), application details and CVs, enquiries from employers, and basic technical data such as device and browser type.", "With your consent we also collect analytics about how the site is used."] },
      { heading: "Why we use it", body: ["To respond to enquiries, match candidates with employers, prepare documents and visas, run the Employer Dashboard, keep the site secure, and improve our services. Our legal bases are contract, legitimate interests, legal obligation and, for analytics, consent."] },
      { heading: "Who we share it with", body: ["Employers you are matched with, partners involved in your file (for example Apostille Sewa for document attestation), and service providers who host or support the site. We do not sell personal data."] },
      { heading: "International transfers", body: ["Our work spans Bulgaria, Nepal and other countries, so data may be processed outside the EU/EEA. Where required, we use appropriate safeguards."] },
      { heading: "Your rights", body: ["You can ask to access, correct, delete or restrict your data, object to processing, request portability, or withdraw consent. Contact info@recruitlygroup.com. You can also complain to the Bulgarian Commission for Personal Data Protection or your local authority."] },
      { heading: "Retention and security", body: ["We keep data only as long as needed for the purposes above or to meet legal duties. We use access controls and secure hosting to protect it."] },
    ],
  },
  cookies: {
    title: "Cookie policy",
    summary: "The cookies we use and how you control them.",
    sections: [
      { heading: "What cookies are", body: ["Cookies are small files stored on your device. They help a site work and, with consent, help us understand how it is used."] },
      { heading: "Types we use", body: ["Essential: needed for security, sign-in and remembering your choices. Always on.", "Analytics: help us measure visits and improve pages. These stay off until you choose Accept all in the cookie banner."] },
      { heading: "Your choices", body: ["Analytics storage is denied by default. Accept all in the banner to allow it. Clear your browser data to reset your choice, and adjust cookie settings in your browser at any time."] },
      { heading: "Contact", body: ["Questions about cookies: info@recruitlygroup.com."] },
    ],
  },
  "candidate-privacy": {
    title: "Candidate privacy notice",
    summary: "What we do with your CV, documents and application details.",
    sections: [
      { heading: "What we collect", body: ["Identity and contact details, CV, qualifications, work history, language level, photographs, passport details, police clearance and other documents needed for placement, and any skills videos you share."] },
      { heading: "How we use it", body: ["To assess your suitability, contact you, present your profile to employers, prepare attestation and visa applications, and support your relocation."] },
      { heading: "Who sees your file", body: ["Recruitly Group staff, employers considering you, and partners that process your documents or training, such as Apostille Sewa and Rubisco Tech. Employers see your file only through our process."] },
      { heading: "Sensitive data", body: ["Some documents contain sensitive information, such as health or criminal-record data. We request them only where an employer or authority requires them and limit who can see them."] },
      { heading: "Your rights", body: ["You may ask to see, correct, or delete your data, or withdraw consent. Email info@recruitlygroup.com. Withdrawing may end your application."] },
      { heading: "No fee, no pressure", body: ["We do not charge workers a placement fee. If someone claims to represent us and asks for payment, read our security and scams page."] },
    ],
  },
  "equal-opportunity": {
    title: "Equal opportunity policy",
    summary: "Our commitment to fair, skills-based recruitment.",
    sections: [
      { heading: "Our commitment", body: ["Recruitly Group provides equal opportunity to every candidate. We assess people on skills, qualifications and suitability for the role."] },
      { heading: "What this means", body: ["We do not discriminate on grounds such as sex, gender identity, age, disability, ethnic origin, nationality, religion or belief, or sexual orientation, except where the law allows or requires a genuine occupational requirement or work-authorisation check."] },
      { heading: "Our clients", body: ["We ask employers to provide fair job descriptions and decline briefs that ask us to discriminate unlawfully."] },
      { heading: "Raising a concern", body: ["If you believe you have been treated unfairly, email info@recruitlygroup.com. We will review it and respond."] },
    ],
  },
};
