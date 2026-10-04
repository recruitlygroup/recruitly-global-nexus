-- Create intent_leads table to store user intents, contact info, and routing
CREATE TABLE public.intent_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  intent_query TEXT NOT NULL,
  route TEXT NOT NULL CHECK (route IN ('B2B_Employer', 'B2C_Student', 'Travel', 'Apostille', 'Unknown')),
  confidence_score NUMERIC,
  detected_keywords TEXT[],
  resume_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.intent_leads ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can submit intent leads" 
ON public.intent_leads 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Service role can read all intent leads" 
ON public.intent_leads 
FOR SELECT 
USING (auth.role() = 'service_role'::text);

CREATE POLICY "Service role can update intent leads" 
ON public.intent_leads 
FOR UPDATE 
USING (auth.role() = 'service_role'::text);

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes', 
  'resumes', 
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Storage policies for resume uploads
CREATE POLICY "Anyone can upload resumes" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Service role can read resumes" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'resumes' AND auth.role() = 'service_role'::text);

-- Create updated_at trigger
CREATE TRIGGER update_intent_leads_updated_at
BEFORE UPDATE ON public.intent_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();