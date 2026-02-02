-- Fix: Restrict role insertion to only non-admin roles
-- This prevents privilege escalation where users could set role='admin' during signup

-- Drop the existing policy that allows any role to be set
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;

-- Create a new policy that explicitly restricts which roles can be self-assigned
-- Admin role can ONLY be assigned via service_role or by existing admins
CREATE POLICY "Users can insert own non-admin role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  role IN ('candidate', 'partner', 'student')  -- Explicitly exclude 'admin'
);