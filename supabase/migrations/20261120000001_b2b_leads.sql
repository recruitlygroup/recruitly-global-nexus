-- B2B hiring / agency-partnership leads (Australia first; `market` column keeps it multi-market).
-- Writes happen ONLY through the `submit-b2b-lead` edge function (service role) so spam controls
-- (honeypot, rate limit, validation) cannot be bypassed from the browser. No anon policies on purpose.
CREATE TABLE IF NOT EXISTS public.b2b_leads (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  market        text NOT NULL DEFAULT 'australia' CHECK (market IN ('australia')),
  contact_type  text NOT NULL CHECK (contact_type IN ('direct_employer','licensed_agency')),
  company_name  text NOT NULL CHECK (char_length(company_name) BETWEEN 2 AND 200),
  abn           text CHECK (abn IS NULL OR char_length(abn) <= 20),
  contact_name  text NOT NULL CHECK (char_length(contact_name) BETWEEN 2 AND 100),
  email         text NOT NULL CHECK (char_length(email) <= 255 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone         text CHECK (phone IS NULL OR char_length(phone) <= 30),
  trade         text NOT NULL CHECK (char_length(trade) <= 100),
  workers_needed text NOT NULL CHECK (char_length(workers_needed) <= 20),
  timeframe     text NOT NULL CHECK (char_length(timeframe) <= 50),
  pools         text[] NOT NULL DEFAULT '{}' CHECK (pools <@ ARRAY['nepal','bulgaria','eu']),
  sponsor_status text CHECK (sponsor_status IS NULL OR sponsor_status IN ('approved','applying','not_yet','not_sure')),
  message       text CHECK (message IS NULL OR char_length(message) <= 2000),
  source_page   text CHECK (source_page IS NULL OR char_length(source_page) <= 200),
  status        text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','qualified','closed'))
);

ALTER TABLE public.b2b_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read b2b leads" ON public.b2b_leads
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update b2b leads" ON public.b2b_leads
  FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS b2b_leads_created_idx ON public.b2b_leads (created_at DESC);
