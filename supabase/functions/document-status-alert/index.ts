// supabase/functions/document-status-alert/index.ts
// Deploy: supabase functions deploy document-status-alert
// Called after any pcc_status or slc_status change on candidates table.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { candidate_id, field, new_value, actor_role, actor_user_id, candidate_name, recruiter_id } =
      await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const docLabel = field === "pcc_status" ? "PCC" : "SLC";

    // ── AGENT dispatched → alert ADMIN ─────────────────────────────────────
    if (new_value === "Dispatched to Admin" && actor_role === "recruiter") {
      // Timestamp the dispatch
      const tsField = field === "pcc_status" ? "pcc_dispatched_at" : "slc_dispatched_at";
      await supabase.from("candidates").update({ [tsField]: new Date().toISOString() })
        .eq("id", candidate_id);

      // Find all admins
      const { data: admins } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      const notifPromises = (admins ?? []).map((a: { user_id: string }) =>
        supabase.from("notifications").insert({
          user_id: a.user_id,
          type: `${field}_dispatched`,
          title: `${docLabel} Dispatched by Agent`,
          body: `${docLabel} for ${candidate_name} has been dispatched to admin.`,
          link: `/admin-recruitly-secure?tab=candidates`,
          metadata: { candidate_id, recruiter_id },
        })
      );
      await Promise.all(notifPromises);

      // Email admin via Resend
      const RESEND_KEY = Deno.env.get("RESEND_API_KEY");
      const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") ?? "admin@recruitlygroup.com";
      if (RESEND_KEY) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "Recruitly Group <noreply@recruitlygroup.com>",
            to: [ADMIN_EMAIL],
            subject: `📄 ${docLabel} Dispatched — ${candidate_name}`,
            html: `<p>An agent has dispatched the <strong>${docLabel}</strong> for candidate <strong>${candidate_name}</strong>.</p>
                   <p>Please log in to the admin dashboard to confirm receipt.</p>
                   <a href="https://app.recruitlygroup.com/admin-recruitly-secure">Open Dashboard</a>`,
          }),
        });
      }
    }

    // ── ADMIN received → alert RECRUITER ───────────────────────────────────
    if (new_value === "Received" && actor_role === "admin") {
      const tsField = field === "pcc_status" ? "pcc_received_at" : "slc_received_at";
      await supabase.from("candidates").update({ [tsField]: new Date().toISOString() })
        .eq("id", candidate_id);

      if (recruiter_id) {
        // Get recruiter auth user_id from user_roles
        const { data: recruiter } = await supabase
          .from("user_roles")
          .select("user_id, full_name, phone")
          .eq("user_id", recruiter_id)
          .maybeSingle();

        const recruiterUserId = recruiter?.user_id ?? recruiter_id;

        await supabase.from("notifications").insert({
          user_id: recruiterUserId,
          type: `${field}_received`,
          title: `✅ ${docLabel} Received by Admin`,
          body: `Your dispatched ${docLabel} for ${candidate_name} has been received by admin.`,
          link: `/recruiter-dashboard`,
          metadata: { candidate_id },
        });

        // Email recruiter
        const RESEND_KEY = Deno.env.get("RESEND_API_KEY");
        if (RESEND_KEY) {
          const { data: authUser } = await supabase.auth.admin.getUserById(recruiterUserId);
          const recruiterEmail = authUser?.user?.email;
          if (recruiterEmail) {
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                from: "Recruitly Group <noreply@recruitlygroup.com>",
                to: [recruiterEmail],
                subject: `✅ ${docLabel} Received — ${candidate_name}`,
                html: `<p>Good news! Admin has confirmed receipt of the <strong>${docLabel}</strong> for <strong>${candidate_name}</strong>.</p>
                       <p>Log in to your dashboard to check the updated status.</p>
                       <a href="https://app.recruitlygroup.com/recruiter-dashboard">Open Dashboard</a>`,
              }),
            });
          }
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
