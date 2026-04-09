
-- 1. Add user_id to consultation_requests
ALTER TABLE public.consultation_requests
  ADD COLUMN IF NOT EXISTS user_id uuid;

-- 2. Add user_id to universal_profiles  
ALTER TABLE public.universal_profiles
  ADD COLUMN IF NOT EXISTS user_id uuid;

-- 3. Backfill user_id from profiles where email matches
UPDATE public.consultation_requests cr
SET user_id = p.id
FROM public.profiles p
WHERE cr.email = p.email AND cr.user_id IS NULL;

UPDATE public.universal_profiles up
SET user_id = p.id
FROM public.profiles p
WHERE up.email = p.email AND up.user_id IS NULL;

-- 4. Update consultation_requests SELECT policy for authenticated users
DROP POLICY IF EXISTS "Authenticated users can view own consultation requests" ON public.consultation_requests;
CREATE POLICY "Authenticated users can view own consultation requests"
  ON public.consultation_requests FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR (user_id IS NULL AND email = (auth.jwt() ->> 'email'))
  );

-- 5. Update consultation_requests INSERT to capture user_id when authenticated
DROP POLICY IF EXISTS "Authenticated or anonymous users can submit consultation reques" ON public.consultation_requests;
CREATE POLICY "Anyone can submit consultation request"
  ON public.consultation_requests FOR INSERT TO public
  WITH CHECK (
    full_name IS NOT NULL AND full_name <> ''
    AND email IS NOT NULL AND email <> ''
    AND email ~ '^[^@]+@[^@]+\.[^@]+$'
  );

-- 6. Update universal_profiles policies
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON public.universal_profiles;
CREATE POLICY "Authenticated users can insert own profile"
  ON public.universal_profiles FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR (user_id IS NULL AND email = (auth.jwt() ->> 'email'))
  );

DROP POLICY IF EXISTS "Users can only read their own profile" ON public.universal_profiles;
CREATE POLICY "Users can only read their own profile"
  ON public.universal_profiles FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR (user_id IS NULL AND email = (auth.jwt() ->> 'email'))
  );

-- 7. Update downstream tables to join via user_id with email fallback
DROP POLICY IF EXISTS "Users can view own education applications" ON public.education_applications;
CREATE POLICY "Users can view own education applications"
  ON public.education_applications FOR SELECT TO authenticated
  USING (
    consultation_id IN (
      SELECT id FROM public.consultation_requests
      WHERE user_id = auth.uid()
         OR (user_id IS NULL AND email = (auth.jwt() ->> 'email'))
    )
  );

DROP POLICY IF EXISTS "Users can view own apostille requests" ON public.apostille_requests;
CREATE POLICY "Users can view own apostille requests"
  ON public.apostille_requests FOR SELECT TO authenticated
  USING (
    consultation_id IN (
      SELECT id FROM public.consultation_requests
      WHERE user_id = auth.uid()
         OR (user_id IS NULL AND email = (auth.jwt() ->> 'email'))
    )
  );

DROP POLICY IF EXISTS "Authenticated users can view own recruitment applications" ON public.recruitment_applications;
CREATE POLICY "Authenticated users can view own recruitment applications"
  ON public.recruitment_applications FOR SELECT TO authenticated
  USING (
    consultation_id IN (
      SELECT id FROM public.consultation_requests
      WHERE user_id = auth.uid()
         OR (user_id IS NULL AND email = (auth.jwt() ->> 'email'))
    )
  );

DROP POLICY IF EXISTS "Users can view own travel inquiries" ON public.travel_inquiries;
CREATE POLICY "Users can view own travel inquiries"
  ON public.travel_inquiries FOR SELECT TO authenticated
  USING (
    consultation_id IN (
      SELECT id FROM public.consultation_requests
      WHERE user_id = auth.uid()
         OR (user_id IS NULL AND email = (auth.jwt() ->> 'email'))
    )
  );

-- 8. Fix mutable search_path on handle_job_applications_updated_at
CREATE OR REPLACE FUNCTION public.handle_job_applications_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
