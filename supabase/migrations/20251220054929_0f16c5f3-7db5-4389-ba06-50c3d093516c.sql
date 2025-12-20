-- Drop the insecure public insert policy
DROP POLICY IF EXISTS "Anyone can insert auth logs" ON public.auth_logs;

-- Create secure policy that only allows service role to insert
CREATE POLICY "Only service role can insert auth logs"
ON public.auth_logs
FOR INSERT
TO service_role
WITH CHECK (true);

-- Add rate limiting trigger for additional protection
CREATE OR REPLACE FUNCTION public.check_auth_log_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Check logs from same IP in last 5 minutes
  SELECT COUNT(*) INTO recent_count
  FROM public.auth_logs
  WHERE ip_address = NEW.ip_address
    AND created_at > NOW() - INTERVAL '5 minutes';
  
  IF recent_count > 50 THEN
    RAISE EXCEPTION 'Rate limit exceeded for auth logging';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for rate limiting (drop if exists first)
DROP TRIGGER IF EXISTS auth_log_rate_limit ON public.auth_logs;

CREATE TRIGGER auth_log_rate_limit
  BEFORE INSERT ON public.auth_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.check_auth_log_rate_limit();