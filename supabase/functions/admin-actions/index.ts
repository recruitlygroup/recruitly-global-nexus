import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "recruitlygroup@gmail.com";

interface AdminActionRequest {
  action: "approve" | "reject" | "get_pending_partners";
  user_role_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    // Get authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's JWT to verify identity
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      console.error("Failed to get user:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // STRICT ADMIN CHECK - only recruitlygroup@gmail.com
    if (user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      console.error(`Access denied for: ${user.email}`);
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Admin action requested by: ${user.email}`);

    // Create service role client for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const body: AdminActionRequest = await req.json();
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const userAgent = req.headers.get("user-agent") || null;

    if (body.action === "get_pending_partners") {
      // Get all partners (pending, approved, rejected)
      const { data: partners, error: fetchError } = await supabaseAdmin
        .from("user_roles")
        .select("*")
        .eq("role", "partner")
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Error fetching partners:", fetchError);
        return new Response(
          JSON.stringify({ error: "Failed to fetch partners" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get emails from auth.users for each partner
      const partnersWithEmails = await Promise.all(
        (partners || []).map(async (partner) => {
          const { data: userData } = await supabaseAdmin.auth.admin.getUserById(partner.user_id);
          return {
            ...partner,
            email: userData?.user?.email || "Unknown",
          };
        })
      );

      return new Response(
        JSON.stringify({ partners: partnersWithEmails }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.action === "approve" || body.action === "reject") {
      if (!body.user_role_id) {
        return new Response(
          JSON.stringify({ error: "user_role_id is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const newStatus = body.action === "approve" ? "approved" : "rejected";

      // Get partner info before update
      const { data: partnerData, error: partnerError } = await supabaseAdmin
        .from("user_roles")
        .select("*")
        .eq("id", body.user_role_id)
        .single();

      if (partnerError || !partnerData) {
        console.error("Partner not found:", partnerError);
        return new Response(
          JSON.stringify({ error: "Partner not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get partner email from auth
      const { data: partnerUser } = await supabaseAdmin.auth.admin.getUserById(partnerData.user_id);
      const partnerEmail = partnerUser?.user?.email;

      // Update status
      const { error: updateError } = await supabaseAdmin
        .from("user_roles")
        .update({ status: newStatus })
        .eq("id", body.user_role_id);

      if (updateError) {
        console.error("Error updating partner status:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update partner status" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Log the action to auth_logs
      await supabaseAdmin.from("auth_logs").insert({
        email: partnerEmail,
        role_type: "admin",
        login_method: `partner_${body.action}`,
        success: true,
        ip_address: clientIP,
        user_agent: userAgent,
        error_message: `Admin ${user.email} ${body.action}d partner ${partnerEmail}`,
      });

      // Send email notification via Resend
      if (resendApiKey && partnerEmail) {
        try {
          const resend = new Resend(resendApiKey);
          
          const emailSubject = body.action === "approve" 
            ? "🎉 Your Recruitly Partner Account is Now Active!"
            : "Update on Your Recruitly Partner Application";

          const emailHtml = body.action === "approve"
            ? `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #0a192f 0%, #1a365d 100%); padding: 40px; text-align: center;">
                  <h1 style="color: #fbbf24; margin: 0;">Congratulations! 🎉</h1>
                </div>
                <div style="padding: 30px; background: #f8fafc;">
                  <p style="font-size: 16px; color: #334155;">Dear Partner,</p>
                  <p style="font-size: 16px; color: #334155;">
                    Great news! Your <strong>Recruitly Partner account</strong> has been approved and is now active.
                  </p>
                  <p style="font-size: 16px; color: #334155;">
                    You can now access your Partner Dashboard to:
                  </p>
                  <ul style="color: #334155;">
                    <li>Track your referred students</li>
                    <li>View real-time analytics</li>
                    <li>Monitor your commissions</li>
                  </ul>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://recruitlygroup.com/partner-dashboard" 
                       style="background: #fbbf24; color: #0a192f; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                      Access Dashboard
                    </a>
                  </div>
                  <p style="font-size: 14px; color: #64748b;">
                    Need help? <a href="https://wa.me/9779743208282" style="color: #fbbf24;">Message us on WhatsApp</a>
                  </p>
                </div>
              </div>
            `
            : `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #0a192f; padding: 40px; text-align: center;">
                  <h1 style="color: white; margin: 0;">Recruitly Group</h1>
                </div>
                <div style="padding: 30px; background: #f8fafc;">
                  <p style="font-size: 16px; color: #334155;">Dear Applicant,</p>
                  <p style="font-size: 16px; color: #334155;">
                    Thank you for your interest in becoming a Recruitly Partner. After careful review, 
                    we regret to inform you that we are unable to approve your application at this time.
                  </p>
                  <p style="font-size: 16px; color: #334155;">
                    This decision may be due to:
                  </p>
                  <ul style="color: #334155;">
                    <li>Incomplete profile information</li>
                    <li>Verification requirements not met</li>
                    <li>Current partner capacity in your region</li>
                  </ul>
                  <p style="font-size: 16px; color: #334155;">
                    You are welcome to reapply in the future. If you have questions, please contact us.
                  </p>
                  <p style="font-size: 14px; color: #64748b;">
                    Questions? <a href="https://wa.me/9779743208282" style="color: #fbbf24;">Message us on WhatsApp</a>
                  </p>
                </div>
              </div>
            `;

          await resend.emails.send({
            from: "Recruitly Group <onboarding@resend.dev>",
            to: [partnerEmail],
            subject: emailSubject,
            html: emailHtml,
          });

          console.log(`Email sent to ${partnerEmail} for ${body.action}`);
        } catch (emailError) {
          console.error("Failed to send email:", emailError);
          // Don't fail the request if email fails
        }
      }

      console.log(`Partner ${body.user_role_id} ${body.action}d successfully`);

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
