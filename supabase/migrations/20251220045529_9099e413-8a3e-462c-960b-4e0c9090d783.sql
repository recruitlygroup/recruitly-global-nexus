-- Fix all service-role RLS policies to include explicit auth.role() verification
-- This provides defense-in-depth security

-- 1. consultation_requests
DROP POLICY IF EXISTS "Service role can read all consultations" ON public.consultation_requests;
CREATE POLICY "Service role can read all consultations"
  ON public.consultation_requests
  FOR SELECT
  TO service_role
  USING (auth.role() = 'service_role');

-- 2. universal_profiles
DROP POLICY IF EXISTS "Only service role can read profiles" ON public.universal_profiles;
CREATE POLICY "Only service role can read profiles"
  ON public.universal_profiles
  FOR SELECT
  TO service_role
  USING (auth.role() = 'service_role');

-- 3. education_applications
DROP POLICY IF EXISTS "Service role can manage education applications" ON public.education_applications;
CREATE POLICY "Service role can manage education applications"
  ON public.education_applications
  FOR ALL
  TO service_role
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 4. recruitment_applications
DROP POLICY IF EXISTS "Service role can manage recruitment applications" ON public.recruitment_applications;
CREATE POLICY "Service role can manage recruitment applications"
  ON public.recruitment_applications
  FOR ALL
  TO service_role
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 5. travel_inquiries
DROP POLICY IF EXISTS "Service role can manage travel inquiries" ON public.travel_inquiries;
CREATE POLICY "Service role can manage travel inquiries"
  ON public.travel_inquiries
  FOR ALL
  TO service_role
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 6. apostille_requests
DROP POLICY IF EXISTS "Service role can manage apostille requests" ON public.apostille_requests;
CREATE POLICY "Service role can manage apostille requests"
  ON public.apostille_requests
  FOR ALL
  TO service_role
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 7. intent_routing_logs
DROP POLICY IF EXISTS "Service role can read routing logs" ON public.intent_routing_logs;
CREATE POLICY "Service role can read routing logs"
  ON public.intent_routing_logs
  FOR SELECT
  TO service_role
  USING (auth.role() = 'service_role');

-- 8. wise_score_leads
DROP POLICY IF EXISTS "Service role can read wise score leads" ON public.wise_score_leads;
CREATE POLICY "Service role can read wise score leads"
  ON public.wise_score_leads
  FOR SELECT
  TO service_role
  USING (auth.role() = 'service_role');