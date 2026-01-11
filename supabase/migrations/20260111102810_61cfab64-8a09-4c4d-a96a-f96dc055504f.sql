-- Fix overly permissive service role RLS policies for tables with sensitive PII

-- 1. universal_profiles: Remove "USING (true)" policy and replace with proper service_role check
-- Current policy: "Service role can read all profiles" with USING (true) - this is dangerous
DROP POLICY IF EXISTS "Service role can read all profiles" ON public.universal_profiles;

-- Replace with proper service role authentication check
CREATE POLICY "Service role can read all profiles" 
ON public.universal_profiles 
FOR SELECT 
USING (auth.role() = 'service_role');

-- 2. wise_score_leads: The current policy already checks for service_role, but let's verify and ensure it's properly restricted
-- Recreate the service role read policy with proper authentication
DROP POLICY IF EXISTS "Service role can read wise score leads" ON public.wise_score_leads;

CREATE POLICY "Service role can read wise score leads" 
ON public.wise_score_leads 
FOR SELECT 
USING (auth.role() = 'service_role');