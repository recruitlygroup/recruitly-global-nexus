import { useState, useEffect, useRef, useCallback } from "react";
import Papa from "papaparse";
import { COUNTRY_STORE, type CountryConfig } from "@/data/countryStore";

export interface University {
  id: number;
  country: string;
  name: string;
  type: string;
  admissionFee: string;
  englishCert: string;
  admissionDate: string;
  deadline: string;
  daysLeft: string;
  status: string;
  link: string;
  cgpaRequirement: string;
}

export interface Program {
  id: number;
  country: string;
  university: string;
  courseName: string;
  level: string;
  department: string;
  tuitionFee: string;
  status: string;
  link: string;
  admissionRequirement?: string;
}

const cache = new Map<string, unknown[]>();

function normalizeStatus(raw: string | undefined): "open" | "closed" {
  if (!raw) return "closed";
  const v = raw.toString().trim().toLowerCase();
  if (v === "open" || v === "✅" || v === "yes") return "open";
  return "closed";
}

function getField(row: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null) return row[k].toString().trim();
    const lower = k.toLowerCase();
    for (const rk of Object.keys(row)) {
      if (rk.toLowerCase() === lower || rk.replace(/_/g, " ").toLowerCase() === lower)
        return row[rk]?.toString().trim() || "";
    }
  }
  return "";
}

async function fetchCSV<T>(url: string, parser: (row: Record<string, string>) => T | null): Promise<T[]> {
  if (cache.has(url)) return cache.get(url) as T[];
  
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
  
  try {
    const results = await new Promise<T[]>((resolve, reject) => {
      Papa.parse(proxyUrl, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (r) => {
          const items: T[] = [];
          for (const row of r.data as Record<string, string>[]) {
            const parsed = parser(row);
            if (parsed) items.push(parsed);
          }
          resolve(items);
        },
        error: (err: Error) => reject(err),
      });
    });
    cache.set(url, results);
    return results;
  } catch {
    // Fallback: try without proxy
    return new Promise<T[]>((resolve) => {
      Papa.parse(url, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (r) => {
          const items: T[] = [];
          for (const row of r.data as Record<string, string>[]) {
            const parsed = parser(row);
            if (parsed) items.push(parsed);
          }
          cache.set(url, items);
          resolve(items);
        },
        error: () => resolve([]),
      });
    });
  }
}

function parseUni(country: string) {
  return (row: Record<string, string>): University | null => {
    const id = parseInt(getField(row, "ID"));
    if (isNaN(id)) return null;
    const status = normalizeStatus(getField(row, "Status"));
    if (status !== "open") return null;
    return {
      id,
      country,
      name: getField(row, "University Name", "University_Name"),
      type: getField(row, "Type"),
      admissionFee: getField(row, "Admission Fee", "Admission_Fee"),
      englishCert: getField(row, "English Certificate", "English_Certificate"),
      admissionDate: getField(row, "Admission Date", "Admission_Date"),
      deadline: getField(row, "Deadline"),
      daysLeft: getField(row, "Days Left", "Days_Left"),
      status: "open",
      link: getField(row, "Link"),
      cgpaRequirement: getField(row, "CGPA Requirement", "CGPA_Requirement"),
    };
  };
}

function parseProg(country: string) {
  return (row: Record<string, string>): Program | null => {
    const id = parseInt(getField(row, "ID"));
    if (isNaN(id)) return null;
    const status = normalizeStatus(getField(row, "Status"));
    if (status !== "open") return null;
    return {
      id,
      country,
      university: getField(row, "University"),
      courseName: getField(row, "Course Name", "Course_Name"),
      level: getField(row, "Level"),
      department: getField(row, "Department"),
      tuitionFee: getField(row, "Tuition Fee", "Tuition_Fee"),
      status: "open",
      link: getField(row, "Link to the Program", "Link_to_the_Program", "Link"),
      admissionRequirement: getField(row, "Admission Requirement", "Admission_Requirement"),
    };
  };
}

export function useUniversityData(countries?: string[]) {
  const [universities, setUniversities] = useState<Map<string, University[]>>(new Map());
  const [programs, setPrograms] = useState<Map<string, Program[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const countriesToFetch = countries || Object.keys(COUNTRY_STORE);
    const uniMap = new Map<string, University[]>();
    const progMap = new Map<string, Program[]>();

    try {
      const results = await Promise.allSettled(
        countriesToFetch.map(async (country) => {
          const config: CountryConfig | undefined = COUNTRY_STORE[country];
          if (!config) return;

          const [unis, progs] = await Promise.all([
            config.unis ? fetchCSV(config.unis, parseUni(country)) : Promise.resolve([]),
            config.programs ? fetchCSV(config.programs, parseProg(country)) : Promise.resolve([]),
          ]);

          if (unis.length > 0) uniMap.set(country, unis);
          if (progs.length > 0) progMap.set(country, progs);
        })
      );

      const failed = results.filter(r => r.status === "rejected").length;
      if (failed === countriesToFetch.length) {
        setError("Failed to load university data. Please try again.");
      }

      setUniversities(uniMap);
      setPrograms(progMap);
    } catch {
      setError("Failed to load university data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [countries]);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      load();
    }
  }, [load]);

  const refresh = useCallback(() => {
    cache.clear();
    fetchedRef.current = false;
    load();
  }, [load]);

  return { universities, programs, loading, error, refresh };
}
