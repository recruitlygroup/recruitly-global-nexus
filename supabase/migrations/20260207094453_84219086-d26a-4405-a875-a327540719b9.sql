-- Fix: Update auth_logs role_type check constraint to include 'candidate'
-- Drop the existing constraint that only allows 'student' and 'partner'
ALTER TABLE public.auth_logs DROP CONSTRAINT IF EXISTS auth_logs_role_type_check;

-- Add updated constraint that includes 'candidate'
ALTER TABLE public.auth_logs ADD CONSTRAINT auth_logs_role_type_check 
CHECK (role_type = ANY (ARRAY['student'::text, 'partner'::text, 'candidate'::text]));