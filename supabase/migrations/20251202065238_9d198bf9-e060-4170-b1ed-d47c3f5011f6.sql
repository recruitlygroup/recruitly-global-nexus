-- ============================================
-- RECRUITLY GLOBAL: FOUNDATIONAL DATABASE ARCHITECTURE
-- ============================================

-- 1. Service Types Enum
CREATE TYPE public.service_type AS ENUM (
  'education', 
  'recruitment', 
  'travel', 
  'apostille'
);

-- 2. Application Status Enum
CREATE TYPE public.application_status AS ENUM (
  'pending',
  'in_review',
  'approved',
  'rejected',
  'completed'
);

-- 3. Universal Profiles Table (Cross-Service User Data)
CREATE TABLE public.universal_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  country_code TEXT,
  preferred_services service_type[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX idx_universal_profiles_email ON public.universal_profiles(email);

-- 4. Consultation Requests Table (All Services)
CREATE TABLE public.consultation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.universal_profiles(id),
  service_type service_type NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  country_of_interest TEXT,
  intent_confidence DECIMAL(3,2),
  ai_routing_metadata JSONB DEFAULT '{}',
  status application_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_consultation_requests_service ON public.consultation_requests(service_type);
CREATE INDEX idx_consultation_requests_status ON public.consultation_requests(status);
CREATE INDEX idx_consultation_requests_email ON public.consultation_requests(email);

-- 5. Education Applications Table
CREATE TABLE public.education_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID REFERENCES public.consultation_requests(id),
  preferred_country TEXT,
  preferred_course TEXT,
  education_level TEXT,
  target_intake TEXT,
  ielts_score DECIMAL(2,1),
  documents_uploaded TEXT[],
  university_matches JSONB DEFAULT '[]',
  status application_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Recruitment Applications Table
CREATE TABLE public.recruitment_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID REFERENCES public.consultation_requests(id),
  job_title TEXT,
  experience_years INTEGER,
  skills TEXT[],
  preferred_locations TEXT[],
  salary_expectation TEXT,
  cv_url TEXT,
  parsed_cv_data JSONB DEFAULT '{}',
  job_matches JSONB DEFAULT '[]',
  status application_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Travel Inquiries Table
CREATE TABLE public.travel_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID REFERENCES public.consultation_requests(id),
  destination TEXT,
  travel_dates_start DATE,
  travel_dates_end DATE,
  travelers_count INTEGER DEFAULT 1,
  trip_type TEXT,
  budget_range TEXT,
  special_requirements TEXT,
  itinerary_suggestions JSONB DEFAULT '[]',
  status application_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Apostille Requests Table
CREATE TABLE public.apostille_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID REFERENCES public.consultation_requests(id),
  document_types TEXT[],
  destination_country TEXT,
  urgency_level TEXT DEFAULT 'standard',
  document_urls TEXT[],
  estimated_completion DATE,
  tracking_number TEXT,
  status application_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Intent Routing Logs Table (For AI Analytics)
CREATE TABLE public.intent_routing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_query TEXT NOT NULL,
  detected_service service_type,
  confidence_score DECIMAL(3,2),
  routing_metadata JSONB DEFAULT '{}',
  response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for analytics
CREATE INDEX idx_intent_routing_logs_service ON public.intent_routing_logs(detected_service);
CREATE INDEX idx_intent_routing_logs_created ON public.intent_routing_logs(created_at);

-- 10. Enable RLS on all tables
ALTER TABLE public.universal_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruitment_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apostille_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intent_routing_logs ENABLE ROW LEVEL SECURITY;

-- 11. RLS Policies - Public Insert for consultation forms (no auth required for lead capture)
CREATE POLICY "Anyone can submit consultation requests"
  ON public.consultation_requests
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can create profiles"
  ON public.universal_profiles
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service functions can insert routing logs"
  ON public.intent_routing_logs
  FOR INSERT
  WITH CHECK (true);

-- Read policies - service_role only for admin access
CREATE POLICY "Service role can read all consultations"
  ON public.consultation_requests
  FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can read all profiles"
  ON public.universal_profiles
  FOR SELECT
  TO service_role
  USING (true);

-- 12. Auto-update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_universal_profiles_updated_at
  BEFORE UPDATE ON public.universal_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consultation_requests_updated_at
  BEFORE UPDATE ON public.consultation_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_education_applications_updated_at
  BEFORE UPDATE ON public.education_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recruitment_applications_updated_at
  BEFORE UPDATE ON public.recruitment_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_travel_inquiries_updated_at
  BEFORE UPDATE ON public.travel_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_apostille_requests_updated_at
  BEFORE UPDATE ON public.apostille_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();