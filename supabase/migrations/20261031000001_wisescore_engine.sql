-- WiseScore engine: admin-editable acceptance data.
-- Additive only (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS). Safe to re-run. No existing column is changed or dropped.

-- ───────────────────────────────────────────────────────────── universities
ALTER TABLE public.universities
  ADD COLUMN IF NOT EXISTS image_url          text,                    -- card photo (optional; falls back to auto-lookup)
  ADD COLUMN IF NOT EXISTS wisescore_enabled  boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS wisescore_rank     integer,                 -- 1 = shown first in that country's Top 5 (NULL = unranked)
  ADD COLUMN IF NOT EXISTS base_acceptance    integer NOT NULL DEFAULT 60
    CHECK (base_acceptance BETWEEN 1 AND 99),                          -- baseline acceptance % for an average profile
  ADD COLUMN IF NOT EXISTS apply_email        text;                    -- optional per-university documents inbox

-- ───────────────────────────────────────────────────────── university_programs
ALTER TABLE public.university_programs
  ADD COLUMN IF NOT EXISTS external_link    text,                      -- official / partner page
  ADD COLUMN IF NOT EXISTS internal_link    text,                      -- on-site page, e.g. /programs/xyz
  ADD COLUMN IF NOT EXISTS base_acceptance  integer
    CHECK (base_acceptance IS NULL OR base_acceptance BETWEEN 1 AND 99); -- NULL = inherit from the university

-- Ranked lookup used by the Top-5 query
CREATE INDEX IF NOT EXISTS idx_universities_ws_rank
  ON public.universities (country, wisescore_rank NULLS LAST, base_acceptance DESC)
  WHERE wisescore_enabled;

-- ───────────────────────────────────────────────────────── demographic groups
-- A "demographic" = a group of nationalities that share the same scoring penalty / acceptance adjustment.
CREATE TABLE IF NOT EXISTS public.wisescore_demographics (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label                  text NOT NULL,
  nationalities          text[] NOT NULL DEFAULT '{}',    -- values match the nationality list in the form
  no_english_penalty     integer NOT NULL DEFAULT 0,      -- points removed from the 0-100 WiseScore when no English test (visa-risk rule)
  acceptance_adjust      integer NOT NULL DEFAULT 0,      -- percentage points added to every university's baseline
  is_default             boolean NOT NULL DEFAULT false,  -- exactly one row should be the fallback for unlisted nationalities
  is_active              boolean NOT NULL DEFAULT true,
  sort_order             integer NOT NULL DEFAULT 0,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_wisescore_demographics_default
  ON public.wisescore_demographics (is_default) WHERE is_default;

-- ─────────────────────────────────── per-university / per-program overrides
-- "For students in <demographic>, the baseline chance at <university> [for <program>] is <pct>%".
CREATE TABLE IF NOT EXISTS public.wisescore_acceptance_overrides (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id   uuid NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  program_id      uuid REFERENCES public.university_programs(id) ON DELETE CASCADE,  -- NULL = whole university
  demographic_id  uuid NOT NULL REFERENCES public.wisescore_demographics(id) ON DELETE CASCADE,
  acceptance_pct  integer NOT NULL CHECK (acceptance_pct BETWEEN 1 AND 99),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_ws_override_uni
  ON public.wisescore_acceptance_overrides (university_id, demographic_id) WHERE program_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_ws_override_prog
  ON public.wisescore_acceptance_overrides (program_id, demographic_id) WHERE program_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ws_override_uni ON public.wisescore_acceptance_overrides (university_id);

-- ─────────────────────────────────────────────────────────────────── RLS
ALTER TABLE public.wisescore_demographics        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wisescore_acceptance_overrides ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "ws demographics public read" ON public.wisescore_demographics
    FOR SELECT TO anon, authenticated USING (is_active);
  CREATE POLICY "ws demographics admin all" ON public.wisescore_demographics
    FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
  CREATE POLICY "ws overrides public read" ON public.wisescore_acceptance_overrides
    FOR SELECT TO anon, authenticated USING (true);
  CREATE POLICY "ws overrides admin all" ON public.wisescore_acceptance_overrides
    FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ───────────────────────────── seed: the demographic rule the old form hard-coded
-- Old WiseScoreFormV2: SOUTH_ASIAN_NATIONALITIES + "no English test" => -15 on the score. Extracted here, now editable.
INSERT INTO public.wisescore_demographics (label, nationalities, no_english_penalty, acceptance_adjust, is_default, sort_order)
SELECT 'South Asian',
       ARRAY['Indian','Pakistani','Bangladeshi','Nepalese','Sri Lankan','Afghan','Maldivian','Bhutanese'],
       15, 0, false, 1
WHERE NOT EXISTS (SELECT 1 FROM public.wisescore_demographics WHERE label = 'South Asian');

INSERT INTO public.wisescore_demographics (label, nationalities, no_english_penalty, acceptance_adjust, is_default, sort_order)
SELECT 'All other nationalities', '{}', 0, 0, true, 99
WHERE NOT EXISTS (SELECT 1 FROM public.wisescore_demographics WHERE is_default);
