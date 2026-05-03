
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface JobListing {
  id: string;
  job_title: string;
  country: string | null;
  remaining_vacancies: number | null;
  status: string;
}

export function useJobListings() {
  const [jobs, setJobs]       = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase
      .from("job_listings")
      .select("id, job_title, country, remaining_vacancies, status")
      .eq("status", "open")
      .order("job_title")
      .then(({ data, error: err }) => {
        if (!mounted) return;
        if (err) setError(err.message);
        else if (data) setJobs(data as JobListing[]);
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  return { jobs, loading, error };
}
