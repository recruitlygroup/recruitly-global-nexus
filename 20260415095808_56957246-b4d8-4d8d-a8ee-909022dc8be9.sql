-- Add a restrictive SELECT policy so only admins can read employer_hiring_requests
CREATE POLICY "Only admins can read hiring requests"
ON public.employer_hiring_requests
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));
