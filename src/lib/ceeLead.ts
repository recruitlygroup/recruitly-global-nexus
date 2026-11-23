// Lead capture + WhatsApp hand-off for the CEE predictor.
// Writes to the existing Supabase `intent_leads` table (route B2C_Student, metadata.source = "cee-predictor-india").
// Optional env: VITE_LEAD_WEBHOOK_URL (Google Apps Script / Zapier mirror), VITE_WHATSAPP_NUMBER (e.g. 97798XXXXXXXX, digits only).
import { supabase } from "@/integrations/supabase/client";

export const NEPAL_MOBILE = /^9[78]\d{8}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface CeeLead {
  fullName: string; phone: string; email: string;
  rollNo?: string; rank?: number; score?: number;
  program: string; category: string; budget: string;
  district?: string; guardianPhone?: string;
  overallTier?: string;
  consent?: boolean;
}

const SOURCE = "cee-predictor-india";

async function mirror(payload: Record<string, unknown>) {
  const url = import.meta.env.VITE_LEAD_WEBHOOK_URL as string | undefined;
  if (!url) return;
  try {
    await fetch(url, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(payload) });
  } catch { /* mirror is best-effort; Supabase is the source of truth */ }
}

export async function submitCeeLead(lead: CeeLead, seatBookingRequested = false, leadId?: string) {
  const id = leadId ?? crypto.randomUUID();
  // 1) Preferred path: edge function stores the lead AND alerts the team (email + optional webhook).
  try {
    const { data, error } = await supabase.functions.invoke("submit-cee-lead", {
      body: { ...lead, seatBookingRequested, leadId: id },
    });
    if (!error && data?.ok) { void mirror({ lead_id: id, ...lead, seat_booking_requested: seatBookingRequested, source: SOURCE }); return id; }
  } catch { /* fall through to the direct insert below */ }

  // 2) Fallback (function not deployed / unreachable): insert directly so the lead is never lost. No alert in this path.
  const metadata = {
    source: SOURCE, lead_id: id, seat_booking_requested: seatBookingRequested,
    roll_no: lead.rollNo ?? null, cee_rank: lead.rank ?? null, cee_score: lead.score ?? null,
    program: lead.program, category: lead.category, budget: lead.budget,
    district: lead.district ?? null, guardian_whatsapp: lead.guardianPhone ?? null,
    nepal_probability_tier: lead.overallTier ?? null,
    consent_to_contact: lead.consent ?? false, consent_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("intent_leads").insert([{
    full_name: lead.fullName, email: lead.email, phone: lead.phone,
    intent_query: `CEE predictor: ${lead.program} | rank ${lead.rank ?? "n/a"} | score ${lead.score ?? "n/a"} | ${lead.category} | ${lead.budget}${seatBookingRequested ? " | SEAT BOOKING REQUESTED" : ""}`,
    route: "B2C_Student", confidence_score: 1, detected_keywords: ["cee", "nepal", lead.program.toLowerCase()],
    metadata,
  }]);
  void mirror({ ...metadata, full_name: lead.fullName, email: lead.email, phone: lead.phone });
  if (error) throw error;
  return id;
}

export function whatsappUrl(lead: CeeLead, pref: string) {
  const num = ((import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) ?? "9779743208282").replace(/\D/g, "");
  const text = [
    "Hi Recruitly Group, I'd like to book my seat for NPR 0.",
    `Name: ${lead.fullName}`,
    `CEE Rank: ${lead.rank ?? "n/a"}${lead.score != null ? ` (Score ${lead.score})` : ""}`,
    `Preferred course: ${lead.program}`,
    `Preference: ${pref}`,
  ].join("\n");
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}
