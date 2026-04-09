// src/hooks/useUniversityData.ts
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

const PAGE_SIZE = 1000;

async function fetchAllUnis(countries?: string[]): Promise<University[]> {
  let all: University[] = [];
  let from = 0;
  let hasMore = true;
  while (hasMore) {
    let q = supabase.from('universities').select('*').eq('status', 'OPEN').order('university_name').range(from, from + PAGE_SIZE - 1);
    if (countries && countries.length > 0) q = q.in('country', countries);
    const { data, error } = await q;
    if (error) throw error;
    const rows = (data as University[]) ?? [];
    all = all.concat(rows);
    hasMore = rows.length === PAGE_SIZE;
    from += PAGE_SIZE;
  }
  return all;
}

async function fetchAllProgs(countries?: string[]): Promise<Program[]> {
  let all: Program[] = [];
  let from = 0;
  let hasMore = true;
  while (hasMore) {
    let q = supabase.from('university_programs').select('*').eq('status', 'OPEN').order('course_name').range(from, from + PAGE_SIZE - 1);
    if (countries && countries.length > 0) q = q.in('country', countries);
    const { data, error } = await q;
    if (error) throw error;
    const rows = (data as Program[]) ?? [];
    all = all.concat(rows);
    hasMore = rows.length === PAGE_SIZE;
    from += PAGE_SIZE;
  }
  return all;
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
      const [uniData, progData] = await Promise.all([
        fetchAllUnis(countries),
        fetchAllProgs(countries),
      ]);

      const uniMap = new Map<string, University[]>();
      for (const uni of uniData) {
        const list = uniMap.get(uni.country) ?? [];
        list.push(uni);
        uniMap.set(uni.country, list);
      }

      const progMap = new Map<string, Program[]>();
      for (const prog of progData) {
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
