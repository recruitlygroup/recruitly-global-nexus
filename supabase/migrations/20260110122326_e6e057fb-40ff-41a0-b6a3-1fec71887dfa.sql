-- Fix overly permissive RLS policies by adding basic validation constraints

-- 1. auth_logs: Replace USING (true) with service_role check for INSERT
-- This table should only be written to by the edge function using service_role
DROP POLICY IF EXISTS "Only service role can insert auth logs" ON public.auth_logs;
CREATE POLICY "Only service role can insert auth logs" 
ON public.auth_logs 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- 2. consultation_requests: Add basic validation for public submissions
-- Users can submit consultations but must provide valid email and name
DROP POLICY IF EXISTS "Anyone can submit consultation requests" ON public.consultation_requests;
CREATE POLICY "Authenticated or anonymous users can submit consultation requests" 
ON public.consultation_requests 
FOR INSERT 
WITH CHECK (
  -- Ensure required fields are not empty
  full_name IS NOT NULL AND 
  full_name <> '' AND 
  email IS NOT NULL AND 
  email <> '' AND
  -- Basic email format validation
  email ~ '^[^@]+@[^@]+\.[^@]+$'
);

-- 3. intent_routing_logs: Restrict to service role only (internal logging)
DROP POLICY IF EXISTS "Service functions can insert routing logs" ON public.intent_routing_logs;
CREATE POLICY "Service role can insert routing logs" 
ON public.intent_routing_logs 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- 4. wise_score_leads: Add validation for public form submissions
DROP POLICY IF EXISTS "Anyone can submit wise score leads" ON public.wise_score_leads;
CREATE POLICY "Users can submit wise score leads with validation" 
ON public.wise_score_leads 
FOR INSERT 
WITH CHECK (
  -- Ensure required fields are provided
  full_name IS NOT NULL AND 
  full_name <> '' AND 
  email IS NOT NULL AND 
  email <> '' AND
  -- Basic email format validation
  email ~ '^[^@]+@[^@]+\.[^@]+$'
);

-- 5. intent_leads: Add validation for public form submissions
DROP POLICY IF EXISTS "Anyone can submit intent leads" ON public.intent_leads;
CREATE POLICY "Users can submit intent leads with validation" 
ON public.intent_leads 
FOR INSERT 
WITH CHECK (
  -- Ensure intent_query is provided (required field)
  intent_query IS NOT NULL AND 
  intent_query <> '' AND
  -- Ensure route is provided (required field)
  route IS NOT NULL AND 
  route <> ''
);

-- 6. user_roles: Fix service role full access policy - restrict to actual service role
DROP POLICY IF EXISTS "Service role full access" ON public.user_roles;
CREATE POLICY "Service role full access" 
ON public.user_roles 
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');