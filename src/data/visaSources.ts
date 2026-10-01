// Official government immigration pages. ONLY add a URL here once it has been checked;
// countries without an entry show the generic "verify with the official source" notice.
export const VISA_SOURCES: Record<string, { label: string; url: string }> = {
  "United Kingdom": { label: "GOV.UK — Student visa", url: "https://www.gov.uk/student-visa" },
  USA:              { label: "U.S. Department of State — Student visas", url: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html" },
  Australia:        { label: "Home Affairs — Student visa (subclass 500)", url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500" },
  Ireland:          { label: "Irish Immigration Service", url: "https://www.irishimmigration.ie" },
  Canada:           { label: "IRCC — Study in Canada", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada.html" },
};
export const SCHENGEN_PORTAL = { label: "EU Immigration Portal", url: "https://immigration-portal.ec.europa.eu" };
