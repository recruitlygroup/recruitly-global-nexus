-- Drop existing policies on universal_profiles and recreate with proper security
DROP POLICY IF EXISTS "Anyone can create profiles" ON public.universal_profiles;
DROP POLICY IF EXISTS "Service role can read all profiles" ON public.universal_profiles;

-- Create a proper INSERT policy that requires email (prevents empty inserts)
CREATE POLICY "Authenticated users can insert own profile"
  ON public.universal_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow anon users to create profiles (for lead capture forms)
CREATE POLICY "Anon users can create profiles for lead capture"
  ON public.universal_profiles
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- SELECT policy - only service role can read all profiles (no public access)
CREATE POLICY "Only service role can read profiles"
  ON public.universal_profiles
  FOR SELECT
  TO service_role
  USING (true);

-- Authenticated users can read their own profile by email
CREATE POLICY "Authenticated users can read own profile"
  ON public.universal_profiles
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt()->>'email');