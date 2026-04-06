// src/hooks/useUniversityData.ts
// REPLACED: No longer fetches from Google Sheets CSV via PapaParse + CORS proxy.
// Now reads directly from Supabase for instant, reliable load times.

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface University {
  id: string;
  country: string;
  university_name: string;
  type: string | null;
  admission_fee: string | null;
  english_cert: string | null;
  admission_date: string | null;
  deadline: string | null;
  status: 'OPEN' | 'CLOSED';
  link: string | null;
  cgpa_requirement: string | null;
  fee_numeric: number | null;
}

export interface Program {
  id: string;
  university_name: string;
  country: string;
  course_name: string;
  level: string | null;
  department: string | null;
  tuition_fee: string | null;
  status: 'OPEN' | 'CLOSED';
  link: string | null;
  admission_requirement: string | null;
}

export function useUniversityData(countries?: string[]) {
  const [universities, setUniversities] = useState<Map<string, University[]>>(new Map());
  const [programs, setPrograms] = useState<Map<string, Program[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let uniQuery = supabase
        .from('universities')
        .select('*')
        .eq('status', 'OPEN')
        .order('university_name');

      let progQuery = supabase
        .from('university_programs')
        .select('*')
        .eq('status', 'OPEN')
        .order('course_name');

      if (countries && countries.length > 0) {
        uniQuery = uniQuery.in('country', countries);
        progQuery = progQuery.in('country', countries);
      }

      const [{ data: uniData, error: uniErr }, { data: progData, error: progErr }] =
        await Promise.all([uniQuery, progQuery]);

      if (uniErr) throw uniErr;
      if (progErr) throw progErr;

      // Group by country into Maps (compatible with existing page components)
      const uniMap = new Map<string, University[]>();
      for (const uni of (uniData as University[]) ?? []) {
        const list = uniMap.get(uni.country) ?? [];
        list.push(uni);
        uniMap.set(uni.country, list);
      }

      const progMap = new Map<string, Program[]>();
      for (const prog of (progData as Program[]) ?? []) {
        const list = progMap.get(prog.country) ?? [];
        list.push(prog);
        progMap.set(prog.country, list);
      }

      setUniversities(uniMap);
      setPrograms(progMap);
    } catch (e: any) {
      setError(e.message || 'Failed to load university data');
    } finally {
      setLoading(false);
    }
  }, [countries?.join(',')]);

  useEffect(() => {
    load();
  }, [load]);

  return { universities, programs, loading, error, refresh: load };
}
