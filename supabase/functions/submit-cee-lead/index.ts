// supabase/functions/submit-cee-lead/index.ts
// Server-side lead capture for the CEE predictor: validates, stores in intent_leads (service role), and ALERTS the team
// immediately by email (Resend) and, if configured, a webhook (Telegram/Slack/Zapier/WhatsApp gateway).
//
// Secrets (Supabase → Edge Functions → Secrets):
//   RESEND_API_KEY          already used by other functions
//   ADMIN_EMAIL             where alerts go (comma-separated allowed); defaults to admin@recruitlygroup.com
//   LEAD_ALERT_WEBHOOK_URL  optional. Receives POST JSON { text, lead }. Works with a Zapier/Make hook, Slack incoming webhook
//                           (uses "text"), or a small relay to Telegram/WhatsApp.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://deno.land/x/supabase_js@2.45.1/mod.ts";

const ALLOWED_ORIGINS = new Set([
  "https://www.recruitlygroup.com", "https://app.recruitlygroup.com", "https://recruitlygroup.com",
  "http://localhost:5173", "http://localhost:8080",
]);
const cors = (req: Request) => ({
  "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(req.headers.get("origin") ?? "") ? req.headers.get("origin")! : "https://www.recruitlygroup.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
});
const json = (req: Request, status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors(req), "Content-Type": "application/json" } });

const NEPAL_MOBILE = /^9[78]\d{8}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PROGRAMS = new Set(["MBBS", "BDS", "BSc Nursing"]);
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const num = (v: unknown) => (typeof v === "number" && isFinite(v) ? v : null);
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors(req) });
  if (req.method !== "POST") return json(req, 405, { error: "Method not allowed" });

  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return json(req, 400, { error: "Invalid JSON" }); }

  const fullName = str(b.fullName, 120), phone = str(b.phone, 10), email = str(b.email, 255);
  const program = str(b.program, 20), category = str(b.category, 40), budget = str(b.budget, 60);
  const guardianPhone = str(b.guardianPhone, 10), district = str(b.district, 80), rollNo = str(b.rollNo, 12);
  const seatBooking = b.seatBookingRequested === true;
  const leadId = str(b.leadId, 64) || crypto.randomUUID();

  if (fullName.length < 2) return json(req, 400, { error: "Name required" });
  if (!NEPAL_MOBILE.test(phone)) return json(req, 400, { error: "Invalid phone" });
  if (!EMAIL_RE.test(email)) return json(req, 400, { error: "Invalid email" });
  if (!PROGRAMS.has(program)) return json(req, 400, { error: "Invalid program" });
  if (guardianPhone && !NEPAL_MOBILE.test(guardianPhone)) return json(req, 400, { error: "Invalid guardian phone" });
  if (!seatBooking && b.consent !== true) return json(req, 400, { error: "Consent required" });

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Light abuse guard: max 5 new leads per phone number per 10 minutes.
  if (!seatBooking) {
    const since = new Date(Date.now() - 10 * 60_000).toISOString();
    const { count } = await db.from("intent_leads").select("id", { count: "exact", head: true })
      .eq("phone", phone).gte("created_at", since).filter("metadata->>source", "eq", "cee-predictor-india");
    if ((count ?? 0) >= 5) return json(req, 429, { error: "Too many submissions. Please try later." });
  }

  const rank = num(b.rank), score = num(b.score);
  const tier = str(b.overallTier, 12) || null;
  let rowId: string | null = null;

  if (seatBooking) {
    // Flag the existing lead instead of creating a duplicate row.
    const { data: existing } = await db.from("intent_leads").select("id, metadata")
      .filter("metadata->>lead_id", "eq", leadId).filter("metadata->>seat_booking_requested", "eq", "false").limit(1);
    if (existing?.[0]) {
      rowId = existing[0].id;
      const meta = { ...(existing[0].metadata as Record<string, unknown>), seat_booking_requested: true, seat_booking_at: new Date().toISOString() };
      await db.from("intent_leads").update({ metadata: meta, updated_at: new Date().toISOString() }).eq("id", rowId);
    }
  }
  if (!rowId) {
    const metadata = {
      source: "cee-predictor-india", lead_id: leadId, seat_booking_requested: seatBooking,
      roll_no: rollNo || null, cee_rank: rank, cee_score: score, program, category, budget,
      district: district || null, guardian_whatsapp: guardianPhone || null, nepal_probability_tier: tier,
      consent_to_contact: b.consent === true, consent_at: new Date().toISOString(),
    };
    const { data, error } = await db.from("intent_leads").insert({
      full_name: fullName, email, phone, route: "B2C_Student", confidence_score: 1,
      intent_query: `CEE predictor: ${program} | rank ${rank ?? "n/a"} | score ${score ?? "n/a"} | ${category} | ${budget}${seatBooking ? " | SEAT BOOKING REQUESTED" : ""}`,
      detected_keywords: ["cee", "nepal", program.toLowerCase()], metadata,
    }).select("id").single();
    if (error) { console.error("submit-cee-lead insert failed:", error.message); return json(req, 500, { error: "Could not save lead" }); }
    rowId = data.id;
  }

  // ── Alerts (never fail the request) ───────────────────────────────────────
  const hot = seatBooking;
  const headline = hot ? "🔥 HOT: wants to BOOK A SEAT" : "New CEE predictor lead";
  const lines = [
    `Name: ${fullName}`, `WhatsApp/Phone: ${phone}  (https://wa.me/977${phone})`, `Email: ${email}`,
    `Program: ${program} | Rank: ${rank ?? "n/a"} | Score: ${score ?? "n/a"} | Nepal chance: ${tier ?? "n/a"}`,
    `Quota: ${category} | Budget: ${budget}`, district ? `District: ${district}` : "", guardianPhone ? `Parent/guardian: ${guardianPhone}` : "",
  ].filter(Boolean);
  const text = `${headline}\n${lines.join("\n")}`;

  const tasks: Promise<unknown>[] = [];
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (resendKey) {
    const to = (Deno.env.get("ADMIN_EMAIL") ?? "admin@recruitlygroup.com").split(",").map((s) => s.trim()).filter(Boolean);
    tasks.push(fetch("https://api.resend.com/emails", {
      method: "POST", headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Recruitly Group <noreply@recruitlygroup.com>", to,
        subject: `${hot ? "🔥 SEAT BOOKING · " : "New lead · "}${fullName} · ${program} rank ${rank ?? "n/a"}`,
        html: `<h2>${esc(headline)}</h2><p>${lines.map((l) => esc(l)).join("<br>")}</p><p><a href="https://wa.me/977${phone}">Open WhatsApp chat</a></p>`,
      }),
    }).catch((e) => console.error("resend alert failed:", e)));
  }
  const hook = Deno.env.get("LEAD_ALERT_WEBHOOK_URL");
  if (hook) {
    tasks.push(fetch(hook, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, lead: { id: rowId, fullName, phone, email, program, rank, score, tier, category, budget, district, guardianPhone, seatBookingRequested: hot } }),
    }).catch((e) => console.error("webhook alert failed:", e)));
  }
  await Promise.allSettled(tasks);

  return json(req, 200, { ok: true, id: leadId });
});
