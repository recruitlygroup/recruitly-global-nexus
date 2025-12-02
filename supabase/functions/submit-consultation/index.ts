import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConsultationRequest {
  serviceType: "education" | "recruitment" | "travel" | "apostille";
  fullName: string;
  email: string;
  phone?: string;
  message?: string;
  countryOfInterest?: string;
  intentConfidence?: number;
  aiRoutingMetadata?: Record<string, unknown>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: ConsultationRequest = await req.json();

    console.log("Received consultation request:", JSON.stringify(body));

    // Validate required fields
    if (!body.serviceType || !body.fullName || !body.email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: serviceType, fullName, email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate service type
    const validServices = ["education", "recruitment", "travel", "apostille"];
    if (!validServices.includes(body.serviceType)) {
      return new Response(
        JSON.stringify({ error: "Invalid service type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if profile exists, create if not
    let profileId: string | null = null;

    const { data: existingProfile } = await supabase
      .from("universal_profiles")
      .select("id")
      .eq("email", body.email)
      .maybeSingle();

    if (existingProfile) {
      profileId = existingProfile.id;
      console.log("Found existing profile:", profileId);
    } else {
      // Create new profile
      const { data: newProfile, error: profileError } = await supabase
        .from("universal_profiles")
        .insert({
          email: body.email,
          full_name: body.fullName,
          phone: body.phone || null,
          preferred_services: [body.serviceType]
        })
        .select("id")
        .single();

      if (profileError) {
        console.error("Error creating profile:", profileError);
        throw new Error("Failed to create user profile");
      }

      profileId = newProfile.id;
      console.log("Created new profile:", profileId);
    }

    // Insert consultation request
    const { data: consultation, error: consultationError } = await supabase
      .from("consultation_requests")
      .insert({
        profile_id: profileId,
        service_type: body.serviceType,
        full_name: body.fullName,
        email: body.email,
        phone: body.phone || null,
        message: body.message || null,
        country_of_interest: body.countryOfInterest || null,
        intent_confidence: body.intentConfidence || null,
        ai_routing_metadata: body.aiRoutingMetadata || {},
        status: "pending"
      })
      .select()
      .single();

    if (consultationError) {
      console.error("Error creating consultation:", consultationError);
      throw new Error("Failed to submit consultation request");
    }

    console.log("Consultation created successfully:", consultation.id);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        consultationId: consultation.id,
        message: `Your ${body.serviceType} consultation request has been submitted. We'll contact you within 24 hours.`,
        profileId: profileId
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in submit-consultation:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
