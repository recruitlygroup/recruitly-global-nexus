-- Deny anonymous SELECT access to universal_profiles (contains PII: email, full_name, phone, country)
CREATE POLICY "Deny anonymous access to profiles"
ON public.universal_profiles
FOR SELECT
TO anon
USING (false);

-- Deny anonymous SELECT access to wise_score_leads (contains highly sensitive student data)
CREATE POLICY "Deny anonymous access to wise score leads"
ON public.wise_score_leads
FOR SELECT
TO anon
USING (false);