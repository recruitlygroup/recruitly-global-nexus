-- Remove the insecure policy that allows anyone to upload
DROP POLICY IF EXISTS "Anyone can upload resumes" ON storage.objects;

-- Create a restrictive policy that only allows service role to upload
-- This forces all uploads to go through the rate-limited Edge Function
CREATE POLICY "Only service role can upload resumes" 
ON storage.objects 
FOR INSERT 
TO service_role
WITH CHECK (bucket_id = 'resumes');

-- Ensure only service role can read resumes (already in place, but confirm)
DROP POLICY IF EXISTS "Service role can read resumes" ON storage.objects;
CREATE POLICY "Service role can read resumes" 
ON storage.objects 
FOR SELECT 
TO service_role
USING (bucket_id = 'resumes');