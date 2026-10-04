
-- 1. Fix employer_hiring_requests INSERT policy: add email/role validation
DROP POLICY IF EXISTS "Anyone can submit hiring request" ON public.employer_hiring_requests;
CREATE POLICY "Anyone can submit hiring request" ON public.employer_hiring_requests
  FOR INSERT TO public
  WITH CHECK (
    email IS NOT NULL
    AND email <> ''
    AND email ~ '^[^@]+@[^@]+\.[^@]+$'
    AND role IS NOT NULL
    AND role <> ''
  );

-- 2. Fix consultation_requests SELECT policy: restrict to authenticated role
DROP POLICY IF EXISTS "Users can view their own consultation requests by email" ON public.consultation_requests;
CREATE POLICY "Authenticated users can view own consultation requests" ON public.consultation_requests
  FOR SELECT TO authenticated
  USING (email = (auth.jwt() ->> 'email'::text));

-- 3. Fix recruitment_applications SELECT policy: restrict to authenticated role
DROP POLICY IF EXISTS "Users can view their own recruitment applications" ON public.recruitment_applications;
CREATE POLICY "Authenticated users can view own recruitment applications" ON public.recruitment_applications
  FOR SELECT TO authenticated
  USING (consultation_id IN (
    SELECT id FROM consultation_requests
    WHERE email = (auth.jwt() ->> 'email'::text)
  ));
