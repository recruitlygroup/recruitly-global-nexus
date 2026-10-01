-- Scale universities/programs to 20k+ rows: slugs, official-source URLs, data status, indexes.
-- Additive only (IF NOT EXISTS). Run BEFORE supabase/seed/*.sql.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE public.universities
  ADD COLUMN IF NOT EXISTS slug            text,
  ADD COLUMN IF NOT EXISTS city            text,
  ADD COLUMN IF NOT EXISTS website_url     text,   -- official university site
  ADD COLUMN IF NOT EXISTS admissions_url  text,   -- official admissions page
  ADD COLUMN IF NOT EXISTS source_url      text,   -- where the data was verified
  ADD COLUMN IF NOT EXISTS verified_at     timestamptz,
  ADD COLUMN IF NOT EXISTS data_status     text NOT NULL DEFAULT 'unknown';

ALTER TABLE public.university_programs
  ADD COLUMN IF NOT EXISTS slug            text,
  ADD COLUMN IF NOT EXISTS university_id   uuid REFERENCES public.universities(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS program_url     text,   -- official program page
  ADD COLUMN IF NOT EXISTS source_url      text,
  ADD COLUMN IF NOT EXISTS verified_at     timestamptz,
  ADD COLUMN IF NOT EXISTS data_status     text NOT NULL DEFAULT 'unknown';

-- verified = checked against official source; partial = imported, not yet verified; unknown = official source required
DO $$ BEGIN
  ALTER TABLE public.universities ADD CONSTRAINT universities_data_status_chk CHECK (data_status IN ('verified','partial','unknown'));
  ALTER TABLE public.university_programs ADD CONSTRAINT programs_data_status_chk CHECK (data_status IN ('verified','partial','unknown'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_universities_slug ON public.universities (slug);
CREATE UNIQUE INDEX IF NOT EXISTS uq_programs_slug     ON public.university_programs (slug);

-- list/browse: country + alphabetical keyset/offset paging
CREATE INDEX IF NOT EXISTS idx_universities_country_name ON public.universities (country, university_name);
CREATE INDEX IF NOT EXISTS idx_programs_country_course   ON public.university_programs (country, course_name);
CREATE INDEX IF NOT EXISTS idx_programs_university_id    ON public.university_programs (university_id);
CREATE INDEX IF NOT EXISTS idx_programs_country_level    ON public.university_programs (country, level);
CREATE INDEX IF NOT EXISTS idx_programs_department       ON public.university_programs (department);
-- search: ILIKE '%text%'
CREATE INDEX IF NOT EXISTS idx_universities_name_trgm ON public.universities USING gin (university_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_programs_course_trgm   ON public.university_programs USING gin (course_name gin_trgm_ops);

-- Lightweight gamification: one small table, owner-only access.
CREATE TABLE IF NOT EXISTS public.student_shortlist (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  kind       text NOT NULL CHECK (kind IN ('university','program')),
  item_id    uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, kind, item_id)
);
CREATE INDEX IF NOT EXISTS idx_shortlist_user ON public.student_shortlist (user_id, kind);
ALTER TABLE public.student_shortlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own shortlist select" ON public.student_shortlist FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own shortlist insert" ON public.student_shortlist FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own shortlist delete" ON public.student_shortlist FOR DELETE TO authenticated USING (user_id = auth.uid());
