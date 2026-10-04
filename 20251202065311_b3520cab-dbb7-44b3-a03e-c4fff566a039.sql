-- Fix RLS policies for tables that are missing them

-- Education Applications - Service-level only (admin access via service_role)
CREATE POLICY "Service role can manage education applications"
  ON public.education_applications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Recruitment Applications
CREATE POLICY "Service role can manage recruitment applications"
  ON public.recruitment_applications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Travel Inquiries
CREATE POLICY "Service role can manage travel inquiries"
  ON public.travel_inquiries
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Apostille Requests
CREATE POLICY "Service role can manage apostille requests"
  ON public.apostille_requests
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Intent Routing Logs - Read access for analytics
CREATE POLICY "Service role can read routing logs"
  ON public.intent_routing_logs
  FOR SELECT
  TO service_role
  USING (true);

-- Fix the function search path issue
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;