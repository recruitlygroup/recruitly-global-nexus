// src/hooks/useJobBoard.ts
// REPLACED: No longer fetches from Google Sheets CSV.
// Now reads directly from Supabase for instant load times.

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Job {
  id: string;
  country: string;
  country_code: string;
  category: string;
  job_title: string;
  vacancies: number | null;
  gender: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  salary_display: string;
  nationality: string;
  status: 'OPEN' | 'CLOSED';
  demand_level: 'HIGH' | 'NORMAL' | 'LOW';
  last_updated: string | null;
  created_at: string;
}

export interface Terms {
  id: string;
  country: string;
  contract_period: string | null;
  probation: string | null;
  working_hours: string | null;
  working_days: string | null;
  accommodation: string | null;
  transportation: string | null;
  food: string | null;
  annual_leave: string | null;
  joining_ticket: string | null;
  return_ticket: string | null;
  overtime: string | null;
  special_notes: string | null;
}

export function useJobBoard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [terms, setTerms] = useState<Terms[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ data: jobsData, error: jobsErr }, { data: termsData, error: termsErr }] =
        await Promise.all([
          supabase
            .from('job_listings')
            .select('*')
            .order('demand_level', { ascending: false })
            .order('last_updated', { ascending: false }),
          supabase.from('job_terms').select('*').order('country'),
        ]);

      if (jobsErr) throw jobsErr;
      if (termsErr) throw termsErr;

      setJobs((jobsData as Job[]) ?? []);
      setTerms((termsData as Terms[]) ?? []);
    } catch (e: any) {
      setError(e.message || 'Failed to load job data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { jobs, terms, loading, error, refetch: fetchData };
}
