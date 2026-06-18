import { useState, useCallback } from 'react';

// NOTE: In production, the API Key should be securely stored in the backend (Supabase Edge Function)
// to prevent exposing it to the client. We use it directly here for testing purposes.
const BITESHIP_API_KEY = 'biteship_test.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoicnl6bGluayIsInVzZXJJZCI6IjZhMzM1YzNkNzExODMxMjJmMDUxNzgwOSIsImlhdCI6MTc4MTc1MTE2Nn0.-6qVSTnpyiyitMgldIVPqbTxL9M2AM2QqHaLtjY00Ew';
const API_URL = 'https://api.biteship.com/v1';

export function useBiteship() {
  const [areas, setAreas] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [isSearchingArea, setIsSearchingArea] = useState(false);
  const [isLoadingCouriers, setIsLoadingCouriers] = useState(false);

  // Search areas (Province, City, District) based on text input
  const searchArea = useCallback(async (input) => {
    if (!input || input.length < 3) {
      setAreas([]);
      return;
    }

    setIsSearchingArea(true);
    try {
      const response = await fetch(`${API_URL}/maps/areas?countries=ID&input=${encodeURIComponent(input)}`, {
        headers: {
          'Authorization': BITESHIP_API_KEY
        }
      });
      const data = await response.json();
      if (data.success) {
        const unique = [];
        const seen = new Set();
        for (const item of (data.areas || [])) {
          if (!seen.has(item.id)) {
            seen.add(item.id);
            unique.push(item);
          }
        }
        setAreas(unique);
      } else {
        console.error("Biteship Area Search Error:", data);
        setAreas([]);
      }
    } catch (error) {
      console.error("Failed to fetch areas:", error);
      setAreas([]);
    } finally {
      setIsSearchingArea(false);
    }
  }, []);

  // Fetch available shipping couriers
  const fetchCouriers = useCallback(async () => {
    setIsLoadingCouriers(true);
    try {
      const response = await fetch(`${API_URL}/couriers`, {
        headers: {
          'Authorization': BITESHIP_API_KEY
        }
      });
      const data = await response.json();
      if (data.success) {
        // Biteship returns multiple services per courier, we deduplicate by courier_code
        const unique = [];
        const seen = new Set();
        for (const item of (data.couriers || [])) {
          if (!seen.has(item.courier_code)) {
            seen.add(item.courier_code);
            unique.push(item);
          }
        }
        setCouriers(unique);
      } else {
        console.error("Biteship Couriers Error:", data);
      }
    } catch (error) {
      console.error("Failed to fetch couriers:", error);
    } finally {
      setIsLoadingCouriers(false);
    }
  }, []);

  return {
    areas,
    searchArea,
    isSearchingArea,
    couriers,
    fetchCouriers,
    isLoadingCouriers
  };
}
