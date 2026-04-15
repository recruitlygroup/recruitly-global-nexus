-- Fix 1: Remove the overly broad authenticated SELECT and add a restrictive one
-- wise_score_leads: authenticated users should NOT be able to read others' data
-- The existing policies are: anon denied, service_role can read, public can insert with validation
-- There's no authenticated SELECT policy granting broad access, but the service_role policy
-- uses role 'public' which includes authenticated. Let's tighten it.

-- Drop the service_role SELECT that uses 'public' role (too broad - includes authenticated)
DROP POLICY IF EXISTS "Service role can read wise score leads" ON public.wise_score_leads;

-- Re-create it restricted to service_role only
CREATE POLICY "Service role can read wise score leads"
ON public.wise_score_leads
FOR SELECT
TO service_role
USING (auth.role() = 'service_role'::text);

-- Fix 2: Tighten user_roles INSERT policy to set status='pending' for partner/recruiter roles
-- so self-assigned roles require admin approval before granting access
DROP POLICY IF EXISTS "Users can insert own non-admin role" ON public.user_roles;

CREATE POLICY "Users can insert own non-admin role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND role IN ('candidate'::user_role, 'partner'::user_role, 'student'::user_role)
  AND (
    role NOT IN ('partner'::user_role)
    OR status = 'pending'::partner_status
  )
);