import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input length limits
const MAX_LENGTHS = {
  fullName: 100,
  email: 255,
  phone: 20,
  message: 2000,
  countryOfInterest: 100,
};

// Simple in-memory rate limiter (resets on function cold start)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 5;

function getClientIP(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
         req.headers.get("x-real-ip") || 
         "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  
  record.count++;
  return false;
}

interface ConsultationRequest {
  serviceType: "education" | "recruitment" | "travel" | "apostille";
  fullName: string;
  email: string;
  phone?: string;
  message?: string;
  countryOfInterest?: string;
  intentConfidence?: number;
  aiRoutingMetadata?: Record<string, unknown>;
  honeypot?: string; // Honeypot field for bot detection
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check
    const clientIP = getClientIP(req);
    if (isRateLimited(clientIP)) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: ConsultationRequest = await req.json();

    console.log("Received consultation request from IP:", clientIP);

    // Honeypot check - if filled, it's likely a bot
    if (body.honeypot && body.honeypot.trim().length > 0) {
      console.warn("Honeypot triggered, likely bot submission");
      // Return success to not reveal detection, but don't process
      return new Response(
        JSON.stringify({ success: true, consultationId: "processed", message: "Thank you for your submission." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate required fields
    if (!body.serviceType || !body.fullName || !body.email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: serviceType, fullName, email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Input length validation
    if (body.fullName.length > MAX_LENGTHS.fullName) {
      return new Response(
        JSON.stringify({ error: `Full name must be less than ${MAX_LENGTHS.fullName} characters` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.email.length > MAX_LENGTHS.email) {
      return new Response(
        JSON.stringify({ error: `Email must be less than ${MAX_LENGTHS.email} characters` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.phone && body.phone.length > MAX_LENGTHS.phone) {
      return new Response(
        JSON.stringify({ error: `Phone must be less than ${MAX_LENGTHS.phone} characters` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.message && body.message.length > MAX_LENGTHS.message) {
      return new Response(
        JSON.stringify({ error: `Message must be less than ${MAX_LENGTHS.message} characters` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.countryOfInterest && body.countryOfInterest.length > MAX_LENGTHS.countryOfInterest) {
      return new Response(
        JSON.stringify({ error: `Country must be less than ${MAX_LENGTHS.countryOfInterest} characters` }),
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

    // Extract authenticated user_id if available
    let authUserId: string | null = null;
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      try {
        const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
          global: { headers: { Authorization: authHeader } },
        });
        const { data: { user } } = await anonClient.auth.getUser();
        if (user) authUserId = user.id;
      } catch { /* unauthenticated request, continue */ }
    }

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
        return new Response(
          JSON.stringify({ error: "An unexpected error occurred. Please try again." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      profileId = newProfile.id;
      console.log("Created new profile:", profileId);
    }

    // Insert consultation request
    const { data: consultation, error: consultationError } = await supabase
      .from("consultation_requests")
      .insert({
        profile_id: profileId,
        user_id: authUserId,
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
      return new Response(
        JSON.stringify({ error: "An unexpected error occurred. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
      JSON.stringify({ error: "An unexpected error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
