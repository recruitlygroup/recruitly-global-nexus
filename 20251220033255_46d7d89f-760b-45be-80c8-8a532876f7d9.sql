-- Create leads table for WiseScore assessments
CREATE TABLE public.wise_score_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Basic Info
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  nationality TEXT,
  
  -- Academic Info
  current_education TEXT,
  grading_scheme TEXT,
  academic_grade TEXT,
  academic_division TEXT,
  
  -- Research & Tests
  has_research_papers BOOLEAN DEFAULT false,
  has_standardized_tests BOOLEAN DEFAULT false,
  test_type TEXT,
  test_score TEXT,
  
  -- English Proficiency
  english_test TEXT,
  english_score TEXT,
  has_visa_risk BOOLEAN DEFAULT false,
  
  -- Destination & Goals
  destination_country TEXT,
  preferred_intake TEXT,
  program_level TEXT,
  
  -- Calculated Results
  wise_score INTEGER,
  score_tier TEXT,
  advice TEXT,
  
  -- Metadata
  utm_source TEXT,
  utm_campaign TEXT,
  raw_form_data JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.wise_score_leads ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert leads (public form)
CREATE POLICY "Anyone can submit wise score leads"
ON public.wise_score_leads
FOR INSERT
WITH CHECK (true);

-- Policy: Only service role can read leads
CREATE POLICY "Service role can read wise score leads"
ON public.wise_score_leads
FOR SELECT
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_wise_score_leads_updated_at
BEFORE UPDATE ON public.wise_score_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();