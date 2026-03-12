import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';

const JOBS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTMLddsMeR6koKbI6CYQxnU2flHIyJEVvOLnOXQaVmO_Ah6sx-dVEVzdAP3GJVmpg/pub?gid=1916102392&single=true&output=csv';
const TERMS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTMLddsMeR6koKbI6CYQxnU2flHIyJEVvOLnOXQaVmO_Ah6sx-dVEVzdAP3GJVmpg/pub?gid=625579320&single=true&output=csv';

export interface Job {
  ID: string;
  Country: string;
  Country_Code: string;
  Category: string;
  Job_Title: string;
  Vacancies: string;
  Gender: string;
  Salary_Min: string;
  Salary_Max: string;
  Salary_Currency: string;
  Salary_Display: string;
  Nationality: string;
  Status: string;
  Demand_Level: string;
  Last_Updated: string;
}

export interface Terms {
  Country: string;
  Contract_Period: string;
  Probation: string;
  Working_Hours: string;
  Working_Days: string;
  Accommodation: string;
  Transportation: string;
  Food: string;
  Annual_Leave: string;
  Joining_Ticket: string;
  Return_Ticket: string;
  Overtime: string;
  Special_Notes: string;
}

async function fetchCSV<T>(url: string): Promise<T[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  const text = await res.text();
  const result = Papa.parse<T>(text, { header: true, skipEmptyLines: true });
  return result.data;
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
      const [jobsData, termsData] = await Promise.all([
        fetchCSV<Job>(JOBS_CSV_URL),
        fetchCSV<Terms>(TERMS_CSV_URL),
      ]);
      setJobs(jobsData.filter(j => j.ID && j.Job_Title));
      setTerms(termsData.filter(t => t.Country));
    } catch (e: any) {
      setError(e.message || 'Failed to load job data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { jobs, terms, loading, error, refetch: fetchData };
}
