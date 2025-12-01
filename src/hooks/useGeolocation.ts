import { useState, useEffect } from 'react';

interface GeolocationData {
  country: string;
  countryCode: string;
  city: string;
  loading: boolean;
  error: string | null;
}

export const useGeolocation = () => {
  const [geoData, setGeoData] = useState<GeolocationData>({
    country: '',
    countryCode: '',
    city: '',
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchGeolocation = async () => {
      try {
        // Using ipapi.co free API (no key required, 1000 requests/day)
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error('Failed to fetch location');
        
        const data = await response.json();
        setGeoData({
          country: data.country_name || 'Unknown',
          countryCode: data.country_code || '',
          city: data.city || 'Unknown',
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Geolocation error:', error);
        setGeoData({
          country: 'Global',
          countryCode: '',
          city: 'Unknown',
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to detect location',
        });
      }
    };

    fetchGeolocation();
  }, []);

  return geoData;
};
