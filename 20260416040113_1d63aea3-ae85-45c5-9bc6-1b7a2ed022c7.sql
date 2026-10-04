-- Drop the overly permissive INSERT policy that lacks role restrictions
DROP POLICY IF EXISTS "Allow individual insert during signup" ON public.user_roles;