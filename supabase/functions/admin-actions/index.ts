// supabase/functions/admin-actions/index.ts
// FIXED:
//   1. Dynamic CORS origin — allows both www and app subdomain (was hardcoded to www only)
//   2. Body is parsed BEFORE admin check (was parsed after, causing "body already consumed" error)
//   3. get_pending_partners hydration uses Promise.all per partner (not sequential) — same behaviour,
//      but comment clarifies the timeout risk; consider paginating if you have 100+ partners.
//   4. All other actions unchanged.

import { serve }        from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://deno.land/x/supabase_js@2.45.1/mod.ts";
import { Resend }       from "https://deno.land/x/resend@2.0.0/mod.ts";

// ── Dynamic CORS: allow any of our known origins ─────────────────────────────
const ALLOWED_ORIGINS = new Set([
  "https://www.recruitlygroup.com",
  "https://app.recruitlygroup.com",
  "https://recruitlygroup.com",
  "http://localhost:5173",
  "http://localhost:8080",
]);

function buildCors(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin":  ALLOWED_ORIGINS.has(origin) ? origin : "https://www.recruitlygroup.com",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

interface AdminActionRequest {
  action:
    | "approve"
    | "reject"
    | "get_pending_partners"
    | "get_wisescore_leads"
    | "get_visa_predictions"
    | "get_consultation_requests"
    | "get_dashboard_stats"
    | "delete_broadcast";
  user_role_id?: string;
  broadcast_id?: string;
}

serve(async (req) => {
  const cors = buildCors(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  try {
    const supabaseUrl        = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey    = Deno.env.get("SUPABASE_ANON_KEY")!;
    const resendApiKey       = Deno.env.get("RESEND_API_KEY");

    // ── Auth verification ────────────────────────────────────────────────────
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    // Parse body FIRST (before we use the readable stream for auth)
    // This avoids "body already consumed" errors when auth client reads headers only.
    let body: AdminActionRequest;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // ── Admin check ──────────────────────────────────────────────────────────
    const { data: isAdmin, error: adminCheckError } = await supabaseAdmin
      .rpc("is_admin", { _user_id: user.id });

    if (adminCheckError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: "Forbidden - Admin access required" }),
        { status: 403, headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    // ── Dashboard Stats ──────────────────────────────────────────────────────
    if (body.action === "get_dashboard_stats") {
      const [partners, wisescoreLeads, visaPredictions, consultations] = await Promise.all([
        supabaseAdmin.from("user_roles").select("status", { count: "exact" }).eq("role", "partner"),
        supabaseAdmin.from("wise_score_leads").select("id", { count: "exact" }),
        supabaseAdmin.from("visa_predictions").select("id", { count: "exact" }),
        supabaseAdmin.from("consultation_requests").select("id", { count: "exact" }),
      ]);

      return new Response(
        JSON.stringify({
          partners:        partners.count        ?? 0,
          wisescoreLeads:  wisescoreLeads.count  ?? 0,
          visaPredictions: visaPredictions.count ?? 0,
          consultations:   consultations.count   ?? 0,
        }),
        { headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    // ── WiseScore Leads ──────────────────────────────────────────────────────
    if (body.action === "get_wisescore_leads") {
      const { data, error } = await supabaseAdmin
        .from("wise_score_leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) return errResponse(error.message, cors);
      return new Response(
        JSON.stringify({ leads: data ?? [] }),
        { headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    // ── Visa Predictions ─────────────────────────────────────────────────────
    if (body.action === "get_visa_predictions") {
      const { data, error } = await supabaseAdmin
        .from("visa_predictions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) return errResponse(error.message, cors);
      return new Response(
        JSON.stringify({ predictions: data ?? [] }),
        { headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    // ── Consultation Requests ────────────────────────────────────────────────
    if (body.action === "get_consultation_requests") {
      const { data, error } = await supabaseAdmin
        .from("consultation_requests")
        .select("id, full_name, email, phone, service_type, country_of_interest, message, admin_notes, lead_status, created_at")
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) return errResponse(error.message, cors);
      return new Response(
        JSON.stringify({ consultations: data ?? [] }),
        { headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    // ── Delete Broadcast Message ─────────────────────────────────────────────
    if (body.action === "delete_broadcast" && body.broadcast_id) {
      const { error } = await supabaseAdmin
        .from("broadcast_messages")
        .delete()
        .eq("id", body.broadcast_id);

      if (error) return errResponse(error.message, cors);
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    // ── Pending Partners ─────────────────────────────────────────────────────
    if (body.action === "get_pending_partners") {
      const { data: partners, error } = await supabaseAdmin
        .from("user_roles")
        .select("id, user_id, role, status, full_name, phone, is_verified, verification_stage, mou_link, mou_sent_at, mou_signed_at, company_logo_url, created_at")
        .eq("role", "partner")
        .order("created_at", { ascending: false });

      if (error) return errResponse(error.message, cors);

      // Enrich with email — batched concurrently (OK for typical partner counts < 100)
      const enriched = await Promise.all(
        (partners ?? []).map(async (p) => {
          const [{ data: profile }, { data: authUser }] = await Promise.all([
            supabaseAdmin.from("profiles").select("email, nationality").eq("id", p.user_id).maybeSingle(),
            supabaseAdmin.auth.admin.getUserById(p.user_id),
          ]);
          return {
            ...p,
            email:       profile?.email ?? authUser?.user?.email ?? "",
            nationality: (profile as any)?.nationality ?? null,
          };
        })
      );

      return new Response(
        JSON.stringify({ partners: enriched }),
        { headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    // ── Approve Partner ──────────────────────────────────────────────────────
    if (body.action === "approve" && body.user_role_id) {
      const { data: partnerRole, error: fetchError } = await supabaseAdmin
        .from("user_roles")
        .select("user_id, full_name")
        .eq("id", body.user_role_id)
        .single();

      if (fetchError || !partnerRole) return errResponse("Partner not found", cors, 404);

      const { error: updateError } = await supabaseAdmin
        .from("user_roles")
        .update({ status: "approved" })
        .eq("id", body.user_role_id);

      if (updateError) return errResponse(updateError.message, cors);

      // Send approval email (non-blocking)
      if (resendApiKey) {
        try {
          const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(partnerRole.user_id);
          const partnerEmail = authUser?.user?.email;
          if (partnerEmail) {
            const resend = new Resend(resendApiKey);
            await resend.emails.send({
              from:    "Recruitly Group <noreply@recruitlygroup.com>",
              to:      [partnerEmail],
              subject: "Your Partner Application Has Been Approved",
              html: `
                <p>Hello ${partnerRole.full_name ?? "Partner"},</p>
                <p>Your Recruitly Group partner application has been <strong>approved</strong>.</p>
                <p>You can now log in and access your partner dashboard.</p>
                <a href="https://www.recruitlygroup.com/partner-dashboard"
                   style="display:inline-block;background:#1a3a6b;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
                  Open Dashboard
                </a>
                <p>Best regards,<br/>Recruitly Group Team</p>
              `,
            });
          }
        } catch (emailErr) {
          console.error("Failed to send approval email:", emailErr);
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: "Partner approved" }),
        { headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    // ── Reject Partner ───────────────────────────────────────────────────────
    if (body.action === "reject" && body.user_role_id) {
      const { error: updateError } = await supabaseAdmin
        .from("user_roles")
        .update({ status: "rejected" })
        .eq("id", body.user_role_id);

      if (updateError) return errResponse(updateError.message, cors);

      return new Response(
        JSON.stringify({ success: true, message: "Partner rejected" }),
        { headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ error: `Unknown action: ${body.action}` }),
      { status: 400, headers: { ...cors, "Content-Type": "application/json" } },
    );

  } catch (err) {
    console.error("admin-actions unhandled error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error", detail: String(err) }),
      { status: 500, headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" } },
    );
  }
});

function errResponse(message: string, cors: Record<string, string>, status = 500) {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { ...cors, "Content-Type": "application/json" } },
  );
}
