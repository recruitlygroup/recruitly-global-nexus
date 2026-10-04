-- Delete duplicate job listings, keeping only the one with the latest created_at per (job_title, country)
DELETE FROM public.job_listings
WHERE id NOT IN (
  SELECT DISTINCT ON (job_title, country) id
  FROM public.job_listings
  ORDER BY job_title, country, created_at DESC
);

-- Clear existing universities and programs to prepare for fresh import
TRUNCATE public.university_programs;
TRUNCATE public.universities;