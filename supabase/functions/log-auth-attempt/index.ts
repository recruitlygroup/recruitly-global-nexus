import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting - simple in-memory store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS_PER_WINDOW = 20;

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

// Validation schemas
const MAX_EMAIL_LENGTH = 255;
const VALID_ROLE_TYPES = ["student", "partner"];
const VALID_LOGIN_METHODS = ["email", "google", "whatsapp"];

interface AuthLogRequest {
  email?: string;
  role_type: string;
  login_method: string;
  success: boolean;
  error_message?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = getClientIP(req);
    const userAgent = req.headers.get("user-agent") || null;
    
    // Rate limiting check
    if (isRateLimited(clientIP)) {
      console.warn(`Rate limit exceeded for auth logging from IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Too many requests" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: AuthLogRequest = await req.json();

    console.log("Logging auth attempt from IP:", clientIP);

    // Validate required fields
    if (!body.role_type || !body.login_method || typeof body.success !== "boolean") {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate role_type
    if (!VALID_ROLE_TYPES.includes(body.role_type)) {
      return new Response(
        JSON.stringify({ error: "Invalid role type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate login_method
    if (!VALID_LOGIN_METHODS.includes(body.login_method)) {
      return new Response(
        JSON.stringify({ error: "Invalid login method" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format if provided
    let sanitizedEmail: string | null = null;
    if (body.email) {
      if (body.email.length > MAX_EMAIL_LENGTH) {
        return new Response(
          JSON.stringify({ error: "Email too long" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return new Response(
          JSON.stringify({ error: "Invalid email format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      sanitizedEmail = body.email.trim().toLowerCase();
    }

    // Sanitize error message (truncate if too long)
    const sanitizedErrorMessage = body.error_message 
      ? body.error_message.substring(0, 500) 
      : null;

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert auth log with server-determined values
    const { error: insertError } = await supabase
      .from("auth_logs")
      .insert({
        email: sanitizedEmail,
        role_type: body.role_type,
        login_method: body.login_method,
        success: body.success,
        error_message: sanitizedErrorMessage,
        ip_address: clientIP,
        user_agent: userAgent,
      });

    if (insertError) {
      console.error("Error inserting auth log:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to log auth attempt" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Auth attempt logged successfully");

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in log-auth-attempt:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
