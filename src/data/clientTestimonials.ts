// "What our clients say" content.
//
// ⚠ Add REAL, approved client quotes to CLIENT_QUOTES. Entries flagged `placeholder: true` are layout samples:
// they render only in development (with a "Sample" badge) and are filtered out of production builds, so
// invented testimonials can never go live by accident. Remove the samples once real quotes are in.

export interface ClientQuote {
  id: string;
  quote: string;
  name: string;
  role: string;
  organisation: string;
  placeholder?: boolean;
}

export const CLIENT_QUOTES: ClientQuote[] = [
  { id: "sample-1", placeholder: true, quote: "Replace this sample with an approved client testimonial: two or three sentences on the outcome they got.", name: "Client name", role: "Job title", organisation: "Company" },
  { id: "sample-2", placeholder: true, quote: "A second sample quote, so you can see how the controls and counter behave with several testimonials.", name: "Client name", role: "Job title", organisation: "Company" },
  { id: "sample-3", placeholder: true, quote: "A third sample quote. Delete all samples when real testimonials are added.", name: "Client name", role: "Job title", organisation: "Company" },
];

// Embedded video showcase (carried over from the previous success-stories carousel).
export const CLIENT_VIDEO = {
  youtubeId: "DxfNkJy1hrw",
  name: "Komal Karki",
  destination: "Italy",
  quote: "Got a fully funded Italy study visa for University of Messina with €7,000 stipend. Dreams do come true!",
};
