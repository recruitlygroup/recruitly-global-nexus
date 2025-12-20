import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WiseScoreSubmission {
  // Basic Info
  fullName: string;
  email: string;
  phone?: string;
  nationality?: string;
  
  // Academic Info
  currentEducation?: string;
  gradingScheme?: string;
  academicGrade?: string;
  academicDivision?: string;
  
  // Research & Tests
  hasResearchPapers?: boolean;
  hasStandardizedTests?: boolean;
  testType?: string;
  testScore?: string;
  
  // English Proficiency
  englishTest?: string;
  englishScore?: string;
  hasVisaRisk?: boolean;
  
  // Destination & Goals
  destinationCountry?: string;
  preferredIntake?: string;
  programLevel?: string;
  
  // Calculated Results
  wiseScore: number;
  scoreTier: string;
  advice?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const submission: WiseScoreSubmission = await req.json();

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store in database
    const { data: leadData, error: dbError } = await supabase
      .from("wise_score_leads")
      .insert({
        full_name: submission.fullName,
        email: submission.email,
        phone: submission.phone,
        nationality: submission.nationality,
        current_education: submission.currentEducation,
        grading_scheme: submission.gradingScheme,
        academic_grade: submission.academicGrade,
        academic_division: submission.academicDivision,
        has_research_papers: submission.hasResearchPapers,
        has_standardized_tests: submission.hasStandardizedTests,
        test_type: submission.testType,
        test_score: submission.testScore,
        english_test: submission.englishTest,
        english_score: submission.englishScore,
        has_visa_risk: submission.hasVisaRisk,
        destination_country: submission.destinationCountry,
        preferred_intake: submission.preferredIntake,
        program_level: submission.programLevel,
        wise_score: submission.wiseScore,
        score_tier: submission.scoreTier,
        advice: submission.advice,
        raw_form_data: submission,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to store lead data");
    }

    // Send email notification to office
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .score-badge { display: inline-block; background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-size: 18px; font-weight: bold; }
            .section { margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px; }
            .section-title { font-weight: bold; color: #667eea; margin-bottom: 10px; border-bottom: 2px solid #667eea; padding-bottom: 5px; }
            .field { margin-bottom: 8px; }
            .label { font-weight: bold; color: #666; }
            .value { color: #333; }
            .risk-warning { background: #fef3cd; border: 1px solid #ffc107; padding: 10px; border-radius: 4px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🎓 New WiseScore Lead</h1>
              <p style="margin: 10px 0 0;">WiseAdmit - Recruitly Global</p>
            </div>
            <div class="content">
              <div style="text-align: center; margin-bottom: 20px;">
                <span class="score-badge">WiseScore: ${submission.wiseScore}/100</span>
                <p style="margin-top: 10px; font-weight: bold;">${submission.scoreTier}</p>
              </div>
              
              <div class="section">
                <div class="section-title">📋 Contact Information</div>
                <div class="field"><span class="label">Name:</span> <span class="value">${submission.fullName}</span></div>
                <div class="field"><span class="label">Email:</span> <span class="value">${submission.email}</span></div>
                <div class="field"><span class="label">Phone:</span> <span class="value">${submission.phone || 'Not provided'}</span></div>
                <div class="field"><span class="label">Nationality:</span> <span class="value">${submission.nationality || 'Not provided'}</span></div>
              </div>

              <div class="section">
                <div class="section-title">🎓 Academic Profile</div>
                <div class="field"><span class="label">Current Education:</span> <span class="value">${submission.currentEducation || 'N/A'}</span></div>
                <div class="field"><span class="label">Grading Scheme:</span> <span class="value">${submission.gradingScheme || 'N/A'}</span></div>
                <div class="field"><span class="label">Grade/Score:</span> <span class="value">${submission.academicGrade || 'N/A'}</span></div>
                <div class="field"><span class="label">Division:</span> <span class="value">${submission.academicDivision || 'N/A'}</span></div>
              </div>

              <div class="section">
                <div class="section-title">📚 Research & Tests</div>
                <div class="field"><span class="label">Research Papers:</span> <span class="value">${submission.hasResearchPapers ? 'Yes' : 'No'}</span></div>
                <div class="field"><span class="label">Standardized Tests:</span> <span class="value">${submission.hasStandardizedTests ? 'Yes' : 'No'}</span></div>
                ${submission.testType ? `<div class="field"><span class="label">Test Type:</span> <span class="value">${submission.testType}</span></div>` : ''}
                ${submission.testScore ? `<div class="field"><span class="label">Test Score:</span> <span class="value">${submission.testScore}</span></div>` : ''}
              </div>

              <div class="section">
                <div class="section-title">🌍 English Proficiency</div>
                <div class="field"><span class="label">English Test:</span> <span class="value">${submission.englishTest || 'None'}</span></div>
                ${submission.englishScore ? `<div class="field"><span class="label">Score:</span> <span class="value">${submission.englishScore}</span></div>` : ''}
                ${submission.hasVisaRisk ? '<div class="risk-warning">⚠️ VISA RISK: No English test detected for South Asian applicant</div>' : ''}
              </div>

              <div class="section">
                <div class="section-title">🎯 Goals</div>
                <div class="field"><span class="label">Destination:</span> <span class="value">${submission.destinationCountry || 'Not specified'}</span></div>
                <div class="field"><span class="label">Program Level:</span> <span class="value">${submission.programLevel || 'N/A'}</span></div>
                <div class="field"><span class="label">Preferred Intake:</span> <span class="value">${submission.preferredIntake || 'N/A'}</span></div>
              </div>

              <div class="section">
                <div class="section-title">💡 AI Recommendation</div>
                <p>${submission.advice || 'Standard processing recommended.'}</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "WiseAdmit <onboarding@resend.dev>",
      to: ["office@recruitlygroup.com"],
      subject: `🎓 New WiseScore Lead: ${submission.fullName} (Score: ${submission.wiseScore})`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        leadId: leadData?.id,
        message: "WiseScore submitted successfully" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in submit-wisescore function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
