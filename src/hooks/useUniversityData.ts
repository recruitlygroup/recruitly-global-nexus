import { useQuery } from "@tanstack/react-query";
import Papa from "papaparse";

const UNIVERSITIES_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQvN2H1WaXQSAs8Nfoqvi9kjIRfgKKf2DIdmUTyWp0xfpRp9CjiXXsqvFSchU4rKg/pub?output=csv";
const DEMOGRAPHIC_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSBAeLRiNwZApX0hr6BQpucXzPTNl_55qP6Z7rTLgnhHZ60iXwqSeOVjK80X3P8eg/pub?output=csv";

export interface University {
  id: string;
  name: string;
  country: string;
  type: string;
  admissionFee: string;
  feeNumeric: number;
  englishCertificate: string;
  admissionDate: string;
  deadline: string;
  daysLeft: string;
  status: string;
  link: string;
  cgpaRequirement: string;
}

async function fetchCSV(url: string): Promise<string> {
  const corsUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
  const res = await fetch(corsUrl);
  if (!res.ok) throw new Error(`Failed to fetch CSV: ${res.status}`);
  return res.text();
}

function parseUniversities(csvText: string): University[] {
  const universities: University[] = [];
  const lines = csvText.split("\n");

  let currentCountry = "";
  let isDataRow = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect country header lines like "🇮🇹 ITALY — UNIVERSITIES 2026"
    const countryMatch = trimmed.match(/^[🇦-🇿]{2}\s+(\w+)\s+—\s+UNIVERSITIES/u) ||
                         trimmed.match(/^.{1,4}\s+(\w+)\s+—\s+UNIVERSITIES/);
    if (countryMatch) {
      currentCountry = countryMatch[1].charAt(0) + countryMatch[1].slice(1).toLowerCase();
      isDataRow = false;
      continue;
    }

    // Detect header row
    if (trimmed.startsWith("ID,University Name")) {
      isDataRow = true;
      continue;
    }

    if (!isDataRow || !currentCountry) continue;

    const parsed = Papa.parse(trimmed, { header: false });
    const row = parsed.data[0] as string[];
    if (!row || row.length < 10 || !row[0] || isNaN(Number(row[0]))) continue;

    universities.push({
      id: `${currentCountry.toLowerCase()}-${row[0]}`,
      name: row[1]?.trim() || "",
      country: currentCountry,
      type: row[2]?.trim() || "",
      admissionFee: row[3]?.trim() || "",
      feeNumeric: parseFloat(row[11]) || 0,
      englishCertificate: row[4]?.trim() || "",
      admissionDate: row[5]?.trim() || "",
      deadline: row[6]?.trim() || "",
      daysLeft: row[7]?.trim() || "",
      status: row[8]?.trim() || "",
      link: row[9]?.trim() || "",
      cgpaRequirement: row[10]?.trim() || "",
    });
  }

  return universities;
}

export function useUniversityData() {
  return useQuery({
    queryKey: ["universities"],
    queryFn: async () => {
      const csvText = await fetchCSV(UNIVERSITIES_CSV_URL);
      return parseUniversities(csvText);
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useDemographicData() {
  return useQuery({
    queryKey: ["demographic-model"],
    queryFn: async () => {
      const csvText = await fetchCSV(DEMOGRAPHIC_CSV_URL);
      return csvText;
    },
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });
}
