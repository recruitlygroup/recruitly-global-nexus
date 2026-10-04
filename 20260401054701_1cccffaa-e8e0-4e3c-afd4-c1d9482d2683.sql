
CREATE TABLE public.visa_predictions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  target_country text,
  sponsor_type text,
  sponsor_profession text,
  income_source text,
  monthly_income text,
  tax_documents text,
  total_funds text,
  funds_history text,
  sudden_deposit text,
  accommodation text,
  visa_refusals text,
  refusal_country text,
  reapplied_successfully text,
  valid_visas text[],
  studied_abroad text,
  studied_abroad_country text,
  family_in_destination text,
  program_available_home text,
  career_plan text,
  offer_letter text,
  sop_status text,
  property_ownership text,
  employment text,
  family_home text[],
  financial_liabilities text,
  passport_status text,
  police_clearance text,
  medical_test text,
  transcripts text,
  visa_success_probability numeric,
  risk_flags jsonb DEFAULT '[]'::jsonb,
  action_items jsonb DEFAULT '[]'::jsonb,
  travel_history_boost numeric DEFAULT 0
);

ALTER TABLE public.visa_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own visa predictions"
  ON public.visa_predictions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read own visa predictions"
  ON public.visa_predictions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own visa predictions"
  ON public.visa_predictions FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read all visa predictions"
  ON public.visa_predictions FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Service role full access on visa_predictions"
  ON public.visa_predictions FOR ALL TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
