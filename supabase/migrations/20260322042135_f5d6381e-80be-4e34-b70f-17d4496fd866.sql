-- Add new columns to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS whatsapp text,
  ADD COLUMN IF NOT EXISTS nationality text;

-- Create wisescore_results table
CREATE TABLE public.wisescore_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  target_country text,
  study_level text,
  field text,
  specific_program text,
  nationality text,
  age_range text,
  highest_education text,
  current_status text,
  education_gap text,
  grading_system text,
  academic_score numeric,
  english_test text,
  english_score numeric,
  has_passport boolean,
  whatsapp text,
  email text,
  wise_score numeric,
  admission_score numeric,
  visa_score numeric,
  scholarship_score numeric,
  rejection_risk text,
  top_universities jsonb DEFAULT '[]'::jsonb,
  action_items jsonb DEFAULT '[]'::jsonb
);

-- Enable RLS
ALTER TABLE public.wisescore_results ENABLE ROW LEVEL SECURITY;

-- Students can read their own results
CREATE POLICY "Users can read own wisescore results"
  ON public.wisescore_results FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Students can insert their own results
CREATE POLICY "Users can insert own wisescore results"
  ON public.wisescore_results FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Service role full access
CREATE POLICY "Service role full access on wisescore_results"
  ON public.wisescore_results FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Admin can read all wisescore results
CREATE POLICY "Admins can read all wisescore results"
  ON public.wisescore_results FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name);
  RETURN NEW;
END;
$$;