-- Fix consultation_requests: Allow users to read their own consultation requests by email
CREATE POLICY "Users can view their own consultation requests by email"
ON public.consultation_requests
FOR SELECT
USING (email = (auth.jwt() ->> 'email'));

-- Fix recruitment_applications: Allow users to view their own applications via linked consultation
CREATE POLICY "Users can view their own recruitment applications"
ON public.recruitment_applications
FOR SELECT
USING (
  consultation_id IN (
    SELECT id FROM public.consultation_requests 
    WHERE email = (auth.jwt() ->> 'email')
  )
);