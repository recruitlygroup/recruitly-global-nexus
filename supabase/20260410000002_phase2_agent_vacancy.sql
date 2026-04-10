-- ============================================================
-- Phase 2: Agent verification fields + vacancy deduction trigger
-- ============================================================

-- 1. Add agent verification fields to user_roles
ALTER TABLE public.user_roles
  ADD COLUMN IF NOT EXISTS gender          text,
  ADD COLUMN IF NOT EXISTS age             integer,
  ADD COLUMN IF NOT EXISTS company_name    text,
  ADD COLUMN IF NOT EXISTS passport_number text,
  ADD COLUMN IF NOT EXISTS contact_number  text,
  ADD COLUMN IF NOT EXISTS pcc_link        text,
  ADD COLUMN IF NOT EXISTS pcc_file_url    text,
  ADD COLUMN IF NOT EXISTS is_verified     boolean NOT NULL DEFAULT false;

-- 2. Add remaining_vacancies to job_listings (if not already present)
ALTER TABLE public.job_listings
  ADD COLUMN IF NOT EXISTS total_vacancies     integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS remaining_vacancies integer NOT NULL DEFAULT 0;

-- Sync remaining_vacancies with existing vacancies column (one-time backfill)
UPDATE public.job_listings
SET
  total_vacancies     = COALESCE(vacancies, 0),
  remaining_vacancies = COALESCE(vacancies, 0)
WHERE total_vacancies = 0;

-- 3. Add job_listing_id to job_applications so we can decrement the right job
ALTER TABLE public.job_applications
  ADD COLUMN IF NOT EXISTS job_listing_id uuid REFERENCES public.job_listings(id) ON DELETE SET NULL;

-- 4. Trigger: decrement remaining_vacancies when candidate assigned to a job
CREATE OR REPLACE FUNCTION public.handle_candidate_job_assigned()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- On INSERT with a job_listing_id
  IF TG_OP = 'INSERT' AND NEW.job_listing_id IS NOT NULL THEN
    UPDATE public.job_listings
    SET remaining_vacancies = GREATEST(remaining_vacancies - 1, 0)
    WHERE id = NEW.job_listing_id;

  -- On UPDATE where job_listing_id changes
  ELSIF TG_OP = 'UPDATE' THEN
    -- Restore old job's count if candidate moved away
    IF OLD.job_listing_id IS NOT NULL AND OLD.job_listing_id IS DISTINCT FROM NEW.job_listing_id THEN
      UPDATE public.job_listings
      SET remaining_vacancies = LEAST(remaining_vacancies + 1, total_vacancies)
      WHERE id = OLD.job_listing_id;
    END IF;
    -- Decrement new job if assigned
    IF NEW.job_listing_id IS NOT NULL AND NEW.job_listing_id IS DISTINCT FROM OLD.job_listing_id THEN
      UPDATE public.job_listings
      SET remaining_vacancies = GREATEST(remaining_vacancies - 1, 0)
      WHERE id = NEW.job_listing_id;
    END IF;

  -- On DELETE, restore the count
  ELSIF TG_OP = 'DELETE' AND OLD.job_listing_id IS NOT NULL THEN
    UPDATE public.job_listings
    SET remaining_vacancies = LEAST(remaining_vacancies + 1, total_vacancies)
    WHERE id = OLD.job_listing_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS on_candidate_job_assigned ON public.job_applications;
CREATE TRIGGER on_candidate_job_assigned
  AFTER INSERT OR UPDATE OF job_listing_id OR DELETE
  ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_candidate_job_assigned();

-- 5. Job seeker terms acceptance column in profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS agent_terms_accepted     boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS agent_terms_accepted_at  timestamptz,
  ADD COLUMN IF NOT EXISTS preferred_agent_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS preferred_location       text;
