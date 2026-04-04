import { useState, useEffect } from 'react';

interface GeolocationData {
  country: string;
  countryCode: string;
  city: string;
  loading: boolean;
  error: string | null;
}

const CACHE_KEY = 'rg_geo_v1';

export const useGeolocation = () => {
  const [geoData, setGeoData] = useState<GeolocationData>({
    country: '', countryCode: '', city: '', loading: true, error: null,
  });

  useEffect(() => {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        setGeoData({ ...JSON.parse(cached), loading: false, error: null });
        return;
      } catch { /* fall through */ }
    }
    const fetchGeo = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        const result = { country: data.country_name || 'Unknown', countryCode: data.country_code || '', city: data.city || 'Unknown' };
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(result));
        setGeoData({ ...result, loading: false, error: null });
      } catch (e) {
        setGeoData({ country: 'Global', countryCode: '', city: 'Unknown', loading: false, error: 'Failed to detect location' });
      }
    };
    fetchGeo();
  }, []);

  return geoData;
};
