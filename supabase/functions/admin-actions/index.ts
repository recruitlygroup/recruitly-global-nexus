// supabase/functions/admin-actions/index.ts — REPLACE existing file
// CHANGE: Added `get_consultation_requests` action that returns full lead data
// with admin_notes and lead_status columns.
// All other actions unchanged.

import { serve }        from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://deno.land/x/supabase_js@2.45.1/mod.ts";
import { Resend }       from "https://deno.land/x/resend@2.0.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin":  "https://www.recruitlygroup.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminActionRequest {
  action:
    | "approve"
    | "reject"
    | "get_pending_partners"
    | "get_wisescore_leads"
    | "get_visa_predictions"
    | "get_consultation_requests"
    | "get_dashboard_stats";
  user_role_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // ── Admin check ──────────────────────────────────────────────────────────
    const { data: isAdmin, error: adminCheckError } = await supabaseAdmin
      .rpc("is_admin", { _user_id: user.id });

    if (adminCheckError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: "Forbidden - Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: AdminActionRequest = await req.json();

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
          partners:      partners.count      ?? 0,
          wisescoreLeads: wisescoreLeads.count ?? 0,
          visaPredictions: visaPredictions.count ?? 0,
          consultations: consultations.count  ?? 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── WiseScore Leads ──────────────────────────────────────────────────────
    if (body.action === "get_wisescore_leads") {
      const { data, error } = await supabaseAdmin
        .from("wise_score_leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) return errResponse(error.message, corsHeaders);
      return new Response(
        JSON.stringify({ leads: data ?? [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Visa Predictions ─────────────────────────────────────────────────────
    if (body.action === "get_visa_predictions") {
      const { data, error } = await supabaseAdmin
        .from("visa_predictions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) return errResponse(error.message, corsHeaders);
      return new Response(
        JSON.stringify({ predictions: data ?? [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Consultation Requests (FIXED — now returns full data + admin fields) ──
    if (body.action === "get_consultation_requests") {
      const { data, error } = await supabaseAdmin
        .from("consultation_requests")
        .select("id, full_name, email, phone, service_type, country_of_interest, message, admin_notes, lead_status, created_at")
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) return errResponse(error.message, corsHeaders);
      return new Response(
        JSON.stringify({ consultations: data ?? [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Pending Partners ─────────────────────────────────────────────────────
    if (body.action === "get_pending_partners") {
      const { data: partners, error } = await supabaseAdmin
        .from("user_roles")
        .select("id, user_id, role, status, full_name, phone, is_verified, verification_stage, mou_link, mou_sent_at, mou_signed_at, company_logo_url, created_at")
        .eq("role", "partner")
        .order("created_at", { ascending: false });

      if (error) return errResponse(error.message, corsHeaders);

      // Hydrate with extra fields from user_roles + profiles
      const enriched = await Promise.all(
        (partners ?? []).map(async (p) => {
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("email, nationality")
            .eq("id", p.user_id)
            .maybeSingle();

          const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(p.user_id);

          return {
            ...p,
            email:       profile?.email ?? authUser?.user?.email ?? "",
            nationality: profile?.nationality ?? null,
          };
        })
      );

      return new Response(
        JSON.stringify({ partners: enriched }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Approve Partner ──────────────────────────────────────────────────────
    if (body.action === "approve" && body.user_role_id) {
      const { data: partnerRole, error: fetchError } = await supabaseAdmin
        .from("user_roles")
        .select("user_id, full_name")
        .eq("id", body.user_role_id)
        .single();

      if (fetchError || !partnerRole) return errResponse("Partner not found", corsHeaders, 404);

      const { error: updateError } = await supabaseAdmin
        .from("user_roles")
        .update({ status: "approved" })
        .eq("id", body.user_role_id);

      if (updateError) return errResponse(updateError.message, corsHeaders);

      // Send approval email
      if (resendApiKey) {
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(partnerRole.user_id);
        const partnerEmail = authUser?.user?.email;
        if (partnerEmail) {
          const resend = new Resend(resendApiKey);
          await resend.emails.send({
            from:    "Recruitly Group <noreply@recruitlygroup.com>",
            to:      [partnerEmail],
            subject: "Your Partner Application Has Been Approved",
            html:    `
              <p>Hello ${partnerRole.full_name ?? "Partner"},</p>
              <p>Your Recruitly Group partner application has been <strong>approved</strong>.</p>
              <p>You can now log in and access your partner dashboard.</p>
              <a href="https://app.recruitlygroup.com/partner-dashboard"
                 style="display:inline-block;background:#1a3a6b;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
                Open Dashboard
              </a>
              <p>Best regards,<br/>Recruitly Group Team</p>
            `,
          });
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: "Partner approved" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Reject Partner ───────────────────────────────────────────────────────
    if (body.action === "reject" && body.user_role_id) {
      const { error: updateError } = await supabaseAdmin
        .from("user_roles")
        .update({ status: "rejected" })
        .eq("id", body.user_role_id);

      if (updateError) return errResponse(updateError.message, corsHeaders);

      return new Response(
        JSON.stringify({ success: true, message: "Partner rejected" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error", detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function errResponse(
  message: string,
  corsHeaders: Record<string, string>,
  status = 500
) {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
