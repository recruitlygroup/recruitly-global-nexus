// src/hooks/useUniversityData.ts
// Reads from Supabase with pagination to handle large datasets (91k+ programs)

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

async function fetchAll<T>(
  tableName: string,
  filters: { column: string; value: string | string[] }[],
  orderBy: string
): Promise<T[]> {
  const PAGE_SIZE = 1000;
  let all: T[] = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    let query = supabase
      .from(tableName)
      .select('*')
      .eq('status', 'OPEN')
      .order(orderBy)
      .range(from, from + PAGE_SIZE - 1);

    for (const f of filters) {
      if (Array.isArray(f.value)) {
        query = query.in(f.column, f.value);
      } else {
        query = query.eq(f.column, f.value);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    const rows = (data ?? []) as T[];
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
      const filters = countries && countries.length > 0
        ? [{ column: 'country', value: countries }]
        : [];

      const [uniData, progData] = await Promise.all([
        fetchAll<University>('universities', filters, 'university_name'),
        fetchAll<Program>('university_programs', filters, 'course_name'),
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
