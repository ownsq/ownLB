// Google Maps Platform configuration and shared utilities
// internalUsageAttributionIds: ["gmp_mcp_codeassist_v1_aistudio"]

export const GOOGLE_MAPS_API_KEY =
  (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
  'AIzaSyCzrcHG6eddAFGKrvqgC-1GPkeBaxcU9BM';

export const MAP_ATTRIBUTION_IDS = ['gmp_mcp_codeassist_v1_aistudio'];

export const DEFAULT_MAP_CENTER = {
  lat: 7.2906,
  lng: 80.6337 // Sri Lanka center
};

export const GLOBAL_MAP_CENTER = {
  lat: 20.0,
  lng: 10.0
};

// Known coordinates for cities and countries in the Buddhist network
export const KNOWN_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'kandy, sri lanka': { lat: 7.2906, lng: 80.6337 },
  'colombo, sri lanka': { lat: 6.9271, lng: 79.8612 },
  'negombo, sri lanka': { lat: 7.2008, lng: 79.8736 },
  'anuradhapura, sri lanka': { lat: 8.3114, lng: 80.4037 },
  'mihintale, sri lanka': { lat: 8.3506, lng: 80.5057 },
  'kelaniya, sri lanka': { lat: 6.9529, lng: 79.9197 },
  'galle, sri lanka': { lat: 6.0535, lng: 80.221 },
  'melbourne, australia': { lat: -37.8136, lng: 144.9631 },
  'sydney, australia': { lat: -33.8688, lng: 151.2093 },
  'los angeles, usa': { lat: 34.0522, lng: -118.2437 },
  'los angeles, california, usa': { lat: 34.0522, lng: -118.2437 },
  'new york, usa': { lat: 40.7128, lng: -74.006 },
  'toronto, canada': { lat: 43.6532, lng: -79.3832 },
  'london, uk': { lat: 51.5074, lng: -0.1278 },
  'london, united kingdom': { lat: 51.5074, lng: -0.1278 },
  'singapore': { lat: 1.3521, lng: 103.8198 },
  'kuala lumpur, malaysia': { lat: 3.139, lng: 101.6869 },
  'tokyo, japan': { lat: 35.6762, lng: 139.6503 },
  'new delhi, india': { lat: 28.6139, lng: 77.209 },
  'bodh gaya, india': { lat: 24.6961, lng: 84.9869 },
  'dubai, uae': { lat: 25.2048, lng: 55.2708 }
};

export function getCoordinatesForLocation(locStr: string): { lat: number; lng: number } {
  if (!locStr) return DEFAULT_MAP_CENTER;
  const normalized = locStr.toLowerCase().trim();

  // Exact or partial match
  for (const [key, coords] of Object.entries(KNOWN_COORDINATES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return coords;
    }
  }

  // Country level fallbacks
  if (normalized.includes('sri lanka')) return { lat: 7.8731, lng: 80.7718 };
  if (normalized.includes('australia')) return { lat: -37.8136, lng: 144.9631 };
  if (normalized.includes('usa') || normalized.includes('united states')) return { lat: 34.0522, lng: -118.2437 };
  if (normalized.includes('uk') || normalized.includes('united kingdom')) return { lat: 51.5074, lng: -0.1278 };
  if (normalized.includes('canada')) return { lat: 43.6532, lng: -79.3832 };
  if (normalized.includes('japan')) return { lat: 35.6762, lng: 139.6503 };
  if (normalized.includes('singapore')) return { lat: 1.3521, lng: 103.8198 };
  if (normalized.includes('malaysia')) return { lat: 3.139, lng: 101.6869 };
  if (normalized.includes('india')) return { lat: 24.6961, lng: 84.9869 };

  return DEFAULT_MAP_CENTER;
}
