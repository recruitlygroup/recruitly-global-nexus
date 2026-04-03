import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminActionRequest {
  action: "approve" | "reject" | "get_pending_partners" | "get_wisescore_leads" | "get_visa_predictions" | "get_consultation_requests" | "get_dashboard_stats";
  user_role_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

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

    const { data: isAdmin, error: adminCheckError } = await supabaseAdmin
      .rpc('is_admin', { _user_id: user.id });

    if (adminCheckError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: "Forbidden - Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: AdminActionRequest = await req.json();
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const userAgent = req.headers.get("user-agent") || null;

    // --- Dashboard Stats ---
    if (body.action === "get_dashboard_stats") {
      const [partners, wisescoreLeads, visaPredictions, consultations] = await Promise.all([
        supabaseAdmin.from("user_roles").select("status", { count: "exact" }).eq("role", "partner"),
        supabaseAdmin.from("wise_score_leads").select("id", { count: "exact" }),
        supabaseAdmin.from("visa_predictions").select("id", { count: "exact" }),
        supabaseAdmin.from("consultation_requests").select("id", { count: "exact" }),
      ]);

      return new Response(
        JSON.stringify({
          partners: partners.count || 0,
          wisescoreLeads: wisescoreLeads.count || 0,
          visaPredictions: visaPredictions.count || 0,
          consultations: consultations.count || 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- WiseScore Leads ---
    if (body.action === "get_wisescore_leads") {
      const { data, error } = await supabaseAdmin
        .from("wise_score_leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch WiseScore leads" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ leads: data || [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Visa Predictions ---
    if (body.action === "get_visa_predictions") {
      const { data, error } = await supabaseAdmin
        .from("visa_predictions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch visa predictions" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ predictions: data || [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Consultation Requests ---
    if (body.action === "get_consultation_requests") {
      const { data, error } = await supabaseAdmin
        .from("consultation_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch consultation requests" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ consultations: data || [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Get Partners ---
    if (body.action === "get_pending_partners") {
      const { data: partners, error: fetchError } = await supabaseAdmin
        .from("user_roles")
        .select("*")
        .eq("role", "partner")
        .order("created_at", { ascending: false });

      if (fetchError) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch partners" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const partnersWithEmails = await Promise.all(
        (partners || []).map(async (partner) => {
          const { data: userData } = await supabaseAdmin.auth.admin.getUserById(partner.user_id);
          return { ...partner, email: userData?.user?.email || "Unknown" };
        })
      );

      return new Response(
        JSON.stringify({ partners: partnersWithEmails }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Approve / Reject ---
    if (body.action === "approve" || body.action === "reject") {
      if (!body.user_role_id) {
        return new Response(
          JSON.stringify({ error: "user_role_id is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const newStatus = body.action === "approve" ? "approved" : "rejected";

      const { data: partnerData, error: partnerError } = await supabaseAdmin
        .from("user_roles")
        .select("*")
        .eq("id", body.user_role_id)
        .single();

      if (partnerError || !partnerData) {
        return new Response(
          JSON.stringify({ error: "Partner not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: partnerUser } = await supabaseAdmin.auth.admin.getUserById(partnerData.user_id);
      const partnerEmail = partnerUser?.user?.email;

      const { error: updateError } = await supabaseAdmin
        .from("user_roles")
        .update({ status: newStatus })
        .eq("id", body.user_role_id);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: "Failed to update partner status" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await supabaseAdmin.from("auth_logs").insert({
        email: partnerEmail,
        role_type: "admin",
        login_method: `partner_${body.action}`,
        success: true,
        ip_address: clientIP,
        user_agent: userAgent,
        error_message: `Admin ${user.email} ${body.action}d partner ${partnerEmail}`,
      });

      if (resendApiKey && partnerEmail) {
        try {
          const resend = new Resend(resendApiKey);
          const emailSubject = body.action === "approve"
            ? "🎉 Your Recruitly Partner Account is Now Active!"
            : "Update on Your Recruitly Partner Application";
          const emailHtml = body.action === "approve"
            ? `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:linear-gradient(135deg,#0a192f,#1a365d);padding:40px;text-align:center"><h1 style="color:#fbbf24;margin:0">Congratulations! 🎉</h1></div><div style="padding:30px;background:#f8fafc"><p>Your <strong>Recruitly Partner account</strong> has been approved.</p><div style="text-align:center;margin:30px 0"><a href="https://recruitlygroup.com/partner-dashboard" style="background:#fbbf24;color:#0a192f;padding:12px 30px;text-decoration:none;border-radius:8px;font-weight:bold">Access Dashboard</a></div></div></div>`
            : `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#0a192f;padding:40px;text-align:center"><h1 style="color:white;margin:0">Recruitly Group</h1></div><div style="padding:30px;background:#f8fafc"><p>Thank you for your interest. After review, we are unable to approve your application at this time.</p><p>You are welcome to reapply in the future.</p></div></div>`;
          await resend.emails.send({
            from: "Recruitly Group <onboarding@resend.dev>",
            to: [partnerEmail],
            subject: emailSubject,
            html: emailHtml,
          });
        } catch (emailError) {
          console.error("Failed to send email:", emailError);
        }
      }

      return new Response(
        JSON.stringify({ success: true, status: newStatus }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in admin-actions:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
