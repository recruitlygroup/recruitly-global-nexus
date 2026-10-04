-- Fix RLS policies for universal_profiles table to address security vulnerability

-- First, drop the permissive anonymous INSERT policy
DROP POLICY IF EXISTS "Anon users can create profiles for lead capture" ON public.universal_profiles;

-- Drop existing INSERT policy for authenticated users (we'll recreate it with proper checks)
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON public.universal_profiles;

-- Create a secure INSERT policy for authenticated users only
CREATE POLICY "Authenticated users can insert own profile"
ON public.universal_profiles
FOR INSERT
TO authenticated
WITH CHECK (email = (auth.jwt() ->> 'email'::text));

-- Drop existing SELECT policies to recreate with explicit restrictions
DROP POLICY IF EXISTS "Authenticated users can read own profile" ON public.universal_profiles;
DROP POLICY IF EXISTS "Only service role can read profiles" ON public.universal_profiles;

-- Create explicit SELECT policy for authenticated users (owner-only access)
CREATE POLICY "Users can only read their own profile"
ON public.universal_profiles
FOR SELECT
TO authenticated
USING (email = (auth.jwt() ->> 'email'::text));

-- Create SELECT policy for service role
CREATE POLICY "Service role can read all profiles"
ON public.universal_profiles
FOR SELECT
TO service_role
USING (true);

-- Ensure RLS is enabled (redundant but explicit)
ALTER TABLE public.universal_profiles ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners as well
ALTER TABLE public.universal_profiles FORCE ROW LEVEL SECURITY;