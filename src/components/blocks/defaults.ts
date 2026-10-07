import type { PageSpec } from "./spec";
/** Closing bar used when a page does not define its own. */
export const DEFAULT_CLOSING: NonNullable<PageSpec["closing"]> = { title: "Talk to the Recruitly team", body: "Tell us what you need and we will reply with a clear plan and next steps.", primary: { label: "Contact us", to: "/contact" } };
