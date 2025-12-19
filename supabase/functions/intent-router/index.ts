import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input length limits
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { query, context }: IntentRequest = await req.json();

    if (!query || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Input length validation
    if (query.length > MAX_QUERY_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Query must be less than ${MAX_QUERY_LENGTH} characters` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (context?.country && context.country.length > MAX_COUNTRY_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Country must be less than ${MAX_COUNTRY_LENGTH} characters` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (context?.previousService && context.previousService.length > MAX_SERVICE_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Previous service must be less than ${MAX_SERVICE_LENGTH} characters` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Processing intent query (length:", query.length, ")");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Lovable AI Gateway for intent classification
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are the Intelligent Routing Agent (IRA) for Recruitly Global, a platform offering four services:

1. EDUCATION: Study abroad, university applications, visa for studies, scholarships, course selection, IELTS/TOEFL, academic counseling
2. RECRUITMENT: Job search, career opportunities, employment abroad, CV/resume, interviews, work permits, job placements, manpower
3. TRAVEL: Tours, travel packages, holiday trips, vacation planning, tourist visa, sightseeing, hotel bookings
4. APOSTILLE: Document legalization, certificate authentication, embassy attestation, notarization, document verification

Analyze the user's query and return a JSON object with:
- service: The most relevant service (education, recruitment, travel, apostille, or null if unclear)
- confidence: A score from 0.0 to 1.0 indicating how certain you are
- suggestedAction: A brief, helpful next step for the user
- keywords: Array of relevant keywords detected
- reasoning: Brief explanation of your classification

Be precise and consider the user's geographic context if provided.`
          },
          {
            role: "user",
            content: context 
              ? `User query: "${query}"\nUser country: ${context.country || 'Unknown'}\nPrevious service interest: ${context.previousService || 'None'}`
              : `User query: "${query}"`
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
        tools: [
          {
            type: "function",
            function: {
              name: "classify_intent",
              description: "Classify the user's intent and route to appropriate service",
              parameters: {
                type: "object",
                properties: {
                  service: {
                    type: "string",
                    enum: ["education", "recruitment", "travel", "apostille", null],
                    description: "The detected service type"
                  },
                  confidence: {
                    type: "number",
                    minimum: 0,
                    maximum: 1,
                    description: "Confidence score from 0.0 to 1.0"
                  },
                  suggestedAction: {
                    type: "string",
                    description: "Recommended next step for the user"
                  },
                  keywords: {
                    type: "array",
                    items: { type: "string" },
                    description: "Detected keywords from the query"
                  },
                  reasoning: {
                    type: "string",
                    description: "Brief explanation of the classification"
                  }
                },
                required: ["service", "confidence", "suggestedAction", "keywords", "reasoning"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "classify_intent" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Service is busy. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    console.log("AI Response received");

    let intentResult: IntentResponse;

    // Parse the tool call response
    if (aiData.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments) {
      intentResult = JSON.parse(aiData.choices[0].message.tool_calls[0].function.arguments);
    } else {
      // Fallback to keyword matching if AI doesn't return structured response
      console.log("Falling back to keyword matching");
      intentResult = fallbackClassify(query);
    }

    const responseTime = Date.now() - startTime;

    // Log the routing for analytics (using service role)
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase.from("intent_routing_logs").insert({
        user_query: query.substring(0, 500), // Ensure we don't store overly long queries
        detected_service: intentResult.service,
        confidence_score: intentResult.confidence,
        routing_metadata: {
          keywords: intentResult.keywords,
          reasoning: intentResult.reasoning,
          context: context
        },
        response_time_ms: responseTime
      });
    } catch (logError) {
      console.error("Failed to log routing:", logError);
      // Don't fail the request if logging fails
    }

    console.log(`Intent classified in ${responseTime}ms`);

    return new Response(
      JSON.stringify({
        ...intentResult,
        responseTimeMs: responseTime
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in intent-router:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Fallback keyword-based classification
function fallbackClassify(query: string): IntentResponse {
  const q = query.toLowerCase();
  
  const educationKeywords = ["study", "university", "master", "bachelor", "education", "college", "course", "scholarship", "ielts", "toefl", "student", "academic"];
  const recruitmentKeywords = ["job", "work", "career", "employ", "recruit", "resume", "cv", "salary", "hire", "position", "manpower"];
  const travelKeywords = ["tour", "travel", "trip", "vacation", "holiday", "visit", "tourist", "hotel", "flight", "destination"];
  const apostilleKeywords = ["document", "apostille", "certificate", "attest", "notary", "legalize", "embassy", "authentication"];

  const scores = [
    { service: "education" as const, score: educationKeywords.filter(k => q.includes(k)).length, keywords: educationKeywords.filter(k => q.includes(k)) },
    { service: "recruitment" as const, score: recruitmentKeywords.filter(k => q.includes(k)).length, keywords: recruitmentKeywords.filter(k => q.includes(k)) },
    { service: "travel" as const, score: travelKeywords.filter(k => q.includes(k)).length, keywords: travelKeywords.filter(k => q.includes(k)) },
    { service: "apostille" as const, score: apostilleKeywords.filter(k => q.includes(k)).length, keywords: apostilleKeywords.filter(k => q.includes(k)) }
  ];

  const best = scores.sort((a, b) => b.score - a.score)[0];

  if (best.score === 0) {
    return {
      service: null,
      confidence: 0.1,
      suggestedAction: "Please tell us more about what you're looking for.",
      keywords: [],
      reasoning: "No clear intent detected from the query."
    };
  }

  const confidence = Math.min(0.9, 0.3 + (best.score * 0.2));

  const actions: Record<string, string> = {
    education: "Start your free educational consultation today.",
    recruitment: "Connect with our recruitment specialists.",
    travel: "Explore our curated travel packages.",
    apostille: "Get your documents authenticated quickly."
  };

  return {
    service: best.service,
    confidence,
    suggestedAction: actions[best.service],
    keywords: best.keywords,
    reasoning: `Detected ${best.keywords.length} relevant keywords for ${best.service}.`
  };
}
