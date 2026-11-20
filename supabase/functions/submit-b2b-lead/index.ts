// submit-b2b-lead — validated, rate-limited intake for employer / agency hiring enquiries.
// Mirrors submit-consultation (honeypot + in-memory rate limit); writes with the service role.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://deno.land/x/supabase_js@2.45.1/mod.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const MARKETS = ["australia"];
const CONTACT_TYPES = ["direct_employer", "licensed_agency"];
const POOLS = ["nepal", "bulgaria", "eu"];
const SPONSOR = ["approved", "applying", "not_yet", "not_sure"];

const hits = new Map<string, { count: number; reset: number }>();
const WINDOW = 60 * 60 * 1000, MAX = 5;
const limited = (ip: string) => {
  const now = Date.now(), r = hits.get(ip);
  if (!r || now > r.reset) { hits.set(ip, { count: 1, reset: now + WINDOW }); return false; }
  if (r.count >= MAX) return true;
  r.count++; return false;
};

// Trim, then keep max+1 chars so over-length input is detected by the length checks below (not silently cut).
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max + 1) : "");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    if (limited(ip)) return json({ error: "Too many requests. Please try again later." }, 429);

    const b = await req.json();

    // Honeypot: pretend success, store nothing.
    if (typeof b.honeypot === "string" && b.honeypot.trim()) return json({ success: true });

    const lead = {
      market: str(b.market, 20) || "australia",
      contact_type: str(b.contactType, 30),
      company_name: str(b.companyName, 200),
      abn: str(b.abn, 20) || null,
      contact_name: str(b.contactName, 100),
      email: str(b.email, 255),
      phone: str(b.phone, 30) || null,
      trade: str(b.trade, 100),
      workers_needed: str(b.workersNeeded, 20),
      timeframe: str(b.timeframe, 50),
      pools: Array.isArray(b.pools) ? b.pools.filter((p: unknown) => typeof p === "string" && POOLS.includes(p)) : [],
      sponsor_status: str(b.sponsorStatus, 20) || null,
      message: str(b.message, 2000) || null,
      source_page: str(b.sourcePage, 200) || null,
    };

    const bad = (m: string) => json({ error: m }, 400);
    if (!MARKETS.includes(lead.market)) return bad("Unsupported market");
    if (!CONTACT_TYPES.includes(lead.contact_type)) return bad("Please choose employer or agency");
    if (lead.company_name.length < 2 || lead.company_name.length > 200) return bad("Company name is required (max 200 characters)");
    if (lead.contact_name.length < 2 || lead.contact_name.length > 100) return bad("Contact name is required (max 100 characters)");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email) || lead.email.length > 255) return bad("Invalid email format");
    if (!lead.trade || lead.trade.length > 100) return bad("Please select a trade or role");
    if (!lead.workers_needed || lead.workers_needed.length > 20) return bad("Please select number of workers");
    if (!lead.timeframe || lead.timeframe.length > 50) return bad("Please select a timeframe");
    if (lead.pools.length === 0) return bad("Select at least one sourcing pool");
    if (lead.abn && lead.abn.length > 20) return bad("ABN is too long");
    if (lead.phone && lead.phone.length > 30) return bad("Phone is too long");
    if (lead.message && lead.message.length > 2000) return bad("Message is too long");
    if (lead.sponsor_status && !SPONSOR.includes(lead.sponsor_status)) return bad("Invalid sponsorship status");

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { error } = await supabase.from("b2b_leads").insert(lead);
    if (error) { console.error("b2b_leads insert failed:", error.message); return json({ error: "Could not save your enquiry. Please email us instead." }, 500); }

    // [TODO: add a notification here (email / Slack webhook) so new leads reach the team immediately.]
    return json({ success: true });
  } catch (e) {
    console.error("submit-b2b-lead error:", e);
    return json({ error: "Invalid request" }, 400);
  }
});
