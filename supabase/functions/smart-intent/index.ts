import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IntentRequest {
  query: string;
  contactInfo?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
  resumeUrl?: string;
}

interface IntentResponse {
  route: 'B2B_Employer' | 'B2C_Student' | 'Travel' | 'Apostille' | 'Unknown';
  confidence: number;
  keywords: string[];
  suggestedAction: string;
  serviceId: string;
}

// Keyword-based routing logic
const ROUTING_RULES = {
  B2B_Employer: {
    keywords: ['hire', 'hiring', 'manpower', 'workers', 'staff', 'staffing', 'recruit', 'recruiting', 'employees', 'workforce', 'need workers', 'construction workers', 'factory workers', 'labourers', 'laborers', 'contract', 'outsource', 'bulk hiring', 'team', 'employer'],
    serviceId: 'recruitment',
    action: 'Request a quote for your manpower needs'
  },
  B2C_Student: {
    keywords: ['study', 'studying', 'degree', 'job', 'apply', 'application', 'career', 'resume', 'cv', 'university', 'college', 'masters', 'bachelor', 'abroad', 'scholarship', 'admission', 'education', 'course', 'program', 'europe', 'usa', 'uk', 'canada', 'australia', 'germany', 'student', 'ielts', 'toefl', 'gre', 'gmat', 'work permit'],
    serviceId: 'education',
    action: 'Find matching opportunities for your profile'
  },
  Travel: {
    keywords: ['travel', 'tour', 'trip', 'vacation', 'holiday', 'flight', 'hotel', 'booking', 'visa', 'passport', 'destination', 'package', 'tourism', 'explore', 'adventure', 'honeymoon', 'family trip'],
    serviceId: 'travel',
    action: 'Explore travel packages and deals'
  },
  Apostille: {
    keywords: ['apostille', 'document', 'legalization', 'authentication', 'certificate', 'notary', 'attestation', 'embassy', 'consulate', 'verification', 'documents', 'birth certificate', 'marriage certificate', 'diploma', 'degree certificate'],
    serviceId: 'apostille',
    action: 'Get your documents authenticated quickly'
  }
};

function classifyIntent(query: string): IntentResponse {
  const lowerQuery = query.toLowerCase();
  const scores: Record<string, { score: number; matchedKeywords: string[] }> = {};
  
  // Calculate scores for each route
  for (const [route, config] of Object.entries(ROUTING_RULES)) {
    const matchedKeywords: string[] = [];
    let score = 0;
    
    for (const keyword of config.keywords) {
      if (lowerQuery.includes(keyword.toLowerCase())) {
        score += keyword.split(' ').length; // Multi-word matches score higher
        matchedKeywords.push(keyword);
      }
    }
    
    scores[route] = { score, matchedKeywords };
  }
  
  // Find the best match
  let bestRoute = 'Unknown';
  let bestScore = 0;
  let bestKeywords: string[] = [];
  
  for (const [route, { score, matchedKeywords }] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestRoute = route;
      bestKeywords = matchedKeywords;
    }
  }
  
  // Calculate confidence based on score
  const maxPossibleScore = 10; // Reasonable max
  const confidence = Math.min(bestScore / maxPossibleScore, 1);
  
  if (bestRoute === 'Unknown' || confidence < 0.1) {
    return {
      route: 'Unknown',
      confidence: 0,
      keywords: [],
      suggestedAction: 'Tell us more about what you need',
      serviceId: ''
    };
  }
  
  const routeConfig = ROUTING_RULES[bestRoute as keyof typeof ROUTING_RULES];
  
  return {
    route: bestRoute as IntentResponse['route'],
    confidence,
    keywords: bestKeywords,
    suggestedAction: routeConfig.action,
    serviceId: routeConfig.serviceId
  };
}

// In-memory rate limiter
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20;
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

// Basic email validation
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(clientIP)) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const startTime = Date.now();
    const { query, contactInfo, resumeUrl } = await req.json() as IntentRequest;
    
    if (!query || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: 'Query is required and must be at least 2 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Classify the intent
    const result = classifyIntent(query);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store the lead if we have any contact info or it's a valid intent
    if (contactInfo?.email || contactInfo?.fullName || result.route !== 'Unknown') {
      const { error: insertError } = await supabase
        .from('intent_leads')
        .insert({
          full_name: contactInfo?.fullName || null,
          email: contactInfo?.email || null,
          phone: contactInfo?.phone || null,
          intent_query: query,
          route: result.route,
          confidence_score: result.confidence,
          detected_keywords: result.keywords,
          resume_url: resumeUrl || null,
          metadata: {
            responseTimeMs: Date.now() - startTime,
            suggestedAction: result.suggestedAction
          }
        });

      if (insertError) {
        console.error('Error storing lead:', insertError);
      }
    }

    console.log(`Intent classified: ${result.route} with ${result.confidence * 100}% confidence in ${Date.now() - startTime}ms`);

    return new Response(
      JSON.stringify({
        ...result,
        responseTimeMs: Date.now() - startTime
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Smart intent error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
