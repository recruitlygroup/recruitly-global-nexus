// supabase/functions/intent-router/index.ts
// FIXED: Removed Lovable API dependency entirely.
// Now uses keyword-based classification (fast, free, no external dep).
// If OPENROUTER_API_KEY is set, upgrades to AI classification automatically.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://deno.land/x/supabase_js@2.45.1/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_QUERY_LENGTH = 500;
const MAX_COUNTRY_LENGTH = 100;
const MAX_SERVICE_LENGTH = 50;

interface IntentRequest {
  query: string;
  context?: {
    country?: string;
    previousService?: string;
  };
}

interface IntentResponse {
  service: "education" | "recruitment" | "travel" | "apostille" | null;
  confidence: number;
  suggestedAction: string;
  keywords: string[];
  reasoning: string;
}

// In-memory rate limiter
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 5 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

// ── Keyword-based fallback (no external API needed) ──────────────────────────

function fallbackClassify(query: string): IntentResponse {
  const q = query.toLowerCase();

  const categories = [
    {
      service: "education" as const,
      keywords: ["study", "university", "master", "bachelor", "mba", "education",
        "college", "course", "scholarship", "ielts", "toefl", "student",
        "academic", "admission", "enroll", "degree", "diploma", "abroad"],
    },
    {
      service: "recruitment" as const,
      keywords: ["job", "work", "career", "employ", "recruit", "resume", "cv",
        "salary", "hire", "position", "manpower", "vacancy", "interview",
        "placement", "worker", "staff", "skilled", "unskilled", "labour"],
    },
    {
      service: "travel" as const,
      keywords: ["tour", "travel", "trip", "vacation", "holiday", "visit",
        "tourist", "hotel", "flight", "destination", "package", "booking",
        "sightseeing", "itinerary", "leisure"],
    },
    {
      service: "apostille" as const,
      keywords: ["document", "apostille", "certificate", "attest", "notary",
        "legalize", "embassy", "authentication", "verification", "stamp",
        "seal", "legalisation", "transcription", "power of attorney"],
    },
  ];

  const scored = categories.map(cat => {
    const matched = cat.keywords.filter(k => q.includes(k));
    return { service: cat.service, score: matched.length, matched };
  }).sort((a, b) => b.score - a.score);

  const best = scored[0];

  if (best.score === 0) {
    return {
      service: null,
      confidence: 0.1,
      suggestedAction: "Please tell us more about what you're looking for, and our team will guide you.",
      keywords: [],
      reasoning: "No clear intent detected from the query.",
    };
  }

  const confidence = Math.min(0.92, 0.4 + best.score * 0.18);
  const actions: Record<string, string> = {
    education:   "Start your free educational consultation today.",
    recruitment: "Connect with our recruitment specialists.",
    travel:      "Explore our curated travel packages.",
    apostille:   "Get your documents authenticated quickly.",
  };

  return {
    service: best.service,
    confidence,
    suggestedAction: actions[best.service],
    keywords: best.matched,
    reasoning: `Detected ${best.matched.length} relevant keyword(s): ${best.matched.join(", ")}.`,
  };
}

// ── Optional AI classification via OpenRouter ─────────────────────────────────

async function aiClassify(
  query: string,
  context: IntentRequest["context"],
  apiKey: string,
): Promise<IntentResponse | null> {
  try {
    const systemPrompt = `You are the Intelligent Routing Agent (IRA) for Recruitly Group, offering four services:
1. EDUCATION: Study abroad, university applications, scholarships, IELTS/TOEFL, academic counseling
2. RECRUITMENT: Job search, employment abroad, CV/resume, work permits, manpower
3. TRAVEL: Tours, travel packages, tourist visa, vacation planning
4. APOSTILLE: Document legalization, certificate authentication, embassy attestation

Return ONLY valid JSON (no markdown) with fields:
- service: "education" | "recruitment" | "travel" | "apostille" | null
- confidence: number 0.0–1.0
- suggestedAction: string
- keywords: string[]
- reasoning: string`;

    const userContent = context
      ? `User query: "${query}"\nCountry: ${context.country || "Unknown"}\nPrev service: ${context.previousService || "None"}`
      : `User query: "${query}"`;

    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://www.recruitlygroup.com",
        "X-Title": "Recruitly Group IRA",
      },
      body: JSON.stringify({
        model: "google/gemini-flash-1.5",
        temperature: 0.2,
        max_tokens: 300,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user",   content: userContent },
        ],
      }),
    });

    if (!resp.ok) return null;
    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    // Strip markdown fences if present
    const clean = text.replace(/```json\n?|```/g, "").trim();
    return JSON.parse(clean) as IntentResponse;
  } catch {
    return null;
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(clientIP)) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again later." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const startTime = Date.now();

  try {
    const { query, context }: IntentRequest = await req.json();

    if (!query?.trim()) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (query.length > MAX_QUERY_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Query must be less than ${MAX_QUERY_LENGTH} characters` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (context?.country && context.country.length > MAX_COUNTRY_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Country must be less than ${MAX_COUNTRY_LENGTH} characters` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (context?.previousService && context.previousService.length > MAX_SERVICE_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Previous service must be less than ${MAX_SERVICE_LENGTH} characters` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Try AI if key is present, otherwise use keyword fallback
    const OPENROUTER_KEY = Deno.env.get("OPENROUTER_API_KEY");
    let intentResult: IntentResponse;

    if (OPENROUTER_KEY) {
      const aiResult = await aiClassify(query, context, OPENROUTER_KEY);
      intentResult = aiResult ?? fallbackClassify(query);
    } else {
      // Keyword-only mode — no external dependencies, always works
      intentResult = fallbackClassify(query);
    }

    const responseTime = Date.now() - startTime;

    // Log to DB (non-blocking, best-effort)
    try {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      await supabase.from("intent_routing_logs").insert({
        user_query:       query.substring(0, 500),
        detected_service: intentResult.service,
        confidence_score: intentResult.confidence,
        routing_metadata: { keywords: intentResult.keywords, reasoning: intentResult.reasoning, context },
        response_time_ms: responseTime,
      });
    } catch { /* non-blocking */ }

    return new Response(
      JSON.stringify({ ...intentResult, responseTimeMs: responseTime }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );

  } catch (err) {
    console.error("Error in intent-router:", err);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
