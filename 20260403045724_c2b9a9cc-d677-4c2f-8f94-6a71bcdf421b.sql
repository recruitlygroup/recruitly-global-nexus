-- Add UNIQUE constraint on user_roles.user_id to prevent role stacking
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);

-- Add SELECT policies for education_applications, apostille_requests, travel_inquiries
-- matching the pattern used on recruitment_applications (via consultation_requests email)
CREATE POLICY "Users can view own education applications"
ON public.education_applications
FOR SELECT
TO authenticated
USING (consultation_id IN (
  SELECT id FROM consultation_requests
  WHERE email = (auth.jwt() ->> 'email'::text)
));

CREATE POLICY "Users can view own apostille requests"
ON public.apostille_requests
FOR SELECT
TO authenticated
USING (consultation_id IN (
  SELECT id FROM consultation_requests
  WHERE email = (auth.jwt() ->> 'email'::text)
));

CREATE POLICY "Users can view own travel inquiries"
ON public.travel_inquiries
FOR SELECT
TO authenticated
USING (consultation_id IN (
  SELECT id FROM consultation_requests
  WHERE email = (auth.jwt() ->> 'email'::text)
));