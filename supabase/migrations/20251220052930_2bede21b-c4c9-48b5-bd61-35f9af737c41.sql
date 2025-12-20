-- Create auth_logs table to track login attempts
CREATE TABLE public.auth_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  role_type TEXT NOT NULL CHECK (role_type IN ('student', 'partner')),
  login_method TEXT NOT NULL CHECK (login_method IN ('email', 'google', 'whatsapp')),
  success BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert auth logs (for tracking failed attempts too)
CREATE POLICY "Anyone can insert auth logs"
ON public.auth_logs
FOR INSERT
WITH CHECK (true);

-- Only service role can read auth logs
CREATE POLICY "Service role can read auth logs"
ON public.auth_logs
FOR SELECT
USING (auth.role() = 'service_role');

-- Create index for faster queries
CREATE INDEX idx_auth_logs_email ON public.auth_logs(email);
CREATE INDEX idx_auth_logs_created_at ON public.auth_logs(created_at DESC);