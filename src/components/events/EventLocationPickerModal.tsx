import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMap,
  useMapsLibrary
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Search,
  X,
  Check,
  Compass,
  Building2,
  Navigation,
  Loader2,
  Layers,
  Sparkles
} from 'lucide-react';

export interface LocationSelection {
  address: string;
  name?: string;
  lat: number;
  lng: number;
}

interface EventLocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (selection: LocationSelection) => void;
  initialLocationText?: string;
}

// Popular Buddhist & Community Centers as quick presets
const POPULAR_LOCATIONS: { name: string; address: string; lat: number; lng: number }[] = [
  {
    name: 'Los Angeles Buddhist Vihara',
    address: '5015 Rosemont Ave, La Crescenta-Montrose, CA 91214, USA',
    lat: 34.2255,
    lng: -118.2392
  },
  {
    name: 'London Buddhist Vihara',
    address: 'The Avenue, Bedford Park, London W4 1UD, UK',
    lat: 51.4988,
    lng: -0.2575
  },
  {
    name: 'Mahamevnawa Buddhist Monastery Melbourne',
    address: '109 River Rd, Lilydale VIC 3140, Australia',
    lat: -37.7634,
    lng: 145.3458
  },
  {
    name: 'Gangaramaya Temple',
    address: '61 Sri Jinarathana Rd, Colombo 00200, Sri Lanka',
    lat: 6.9169,
    lng: 79.8567
  },
  {
    name: 'Toronto Maha Vihara Buddhist Meditation Centre',
    address: '4698 Kingston Rd, Scarborough, ON M1E 2P9, Canada',
    lat: 43.7749,
    lng: -79.1678
  },
  {
    name: 'Kelaniya Raja Maha Vihara',
    address: 'Biyagama Rd, Kelaniya 11600, Sri Lanka',
    lat: 6.9529,
    lng: 79.9197
  }
];

// Inner component inside APIProvider that has access to useMap & useMapsLibrary
function MapLocationPickerInner({
  onSelectLocation,
  onClose,
  initialLocationText
}: {
  onSelectLocation: (selection: LocationSelection) => void;
  onClose: () => void;
  initialLocationText?: string;
}) {
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const geocodingLib = useMapsLibrary('geocoding');

  // Default coordinates centered on Sri Lanka or Los Angeles
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number }>({
    lat: 34.0522,
    lng: -118.2437
  });
  const [selectedAddress, setSelectedAddress] = useState<string>(
    initialLocationText || 'Los Angeles Buddhist Vihara, California, USA'
  );
  const [selectedPlaceName, setSelectedPlaceName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');

  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Initialize session token when places library loads
  useEffect(() => {
    if (placesLib && !sessionTokenRef.current) {
      sessionTokenRef.current = new placesLib.AutocompleteSessionToken();
    }
  }, [placesLib]);

  // Fetch autocomplete suggestions as the user types
  useEffect(() => {
    if (!placesLib || !searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib;
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new AutocompleteSessionToken();
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const response = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: searchQuery,
          sessionToken: sessionTokenRef.current!
        });
        setSuggestions(response.suggestions || []);
      } catch (err) {
        console.error('Error fetching autocomplete suggestions:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [placesLib, searchQuery]);

  // Handle clicking a suggestion
  const handleSelectSuggestion = async (suggestion: google.maps.places.AutocompleteSuggestion) => {
    setShowSuggestions(false);
    if (!suggestion.placePrediction) return;

    try {
      setIsSearching(true);
      const place = suggestion.placePrediction.toPlace();
      await place.fetchFields({
        fields: ['displayName', 'formattedAddress', 'location']
      });

      if (place.location) {
        const lat = place.location.lat();
        const lng = place.location.lng();
        const target = { lat, lng };

        setMarkerPosition(target);
        const name = place.displayName || '';
        const address = place.formattedAddress || name || suggestion.placePrediction.text.toString();
        setSelectedPlaceName(name);
        setSelectedAddress(name ? `${name}, ${address}` : address);
        setSearchQuery(name || address);

        if (map) {
          map.panTo(target);
          map.setZoom(16);
        }
      }

      // Reset session token after fetch
      if (placesLib) {
        sessionTokenRef.current = new placesLib.AutocompleteSessionToken();
      }
    } catch (err) {
      console.error('Error retrieving place details:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Reverse geocoding on map click
  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      const target = { lat, lng };

      setMarkerPosition(target);
      setIsGeocoding(true);

      if (geocodingLib) {
        const geocoder = new geocodingLib.Geocoder();
        geocoder.geocode({ location: target }, (results, status) => {
          setIsGeocoding(false);
          if (status === 'OK' && results && results[0]) {
            const formatted = results[0].formatted_address;
            setSelectedAddress(formatted);
            setSelectedPlaceName('');
            setSearchQuery(formatted);
          } else {
            const fallback = `Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            setSelectedAddress(fallback);
            setSearchQuery(fallback);
          }
        });
      } else {
        setIsGeocoding(false);
        const fallback = `Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        setSelectedAddress(fallback);
      }
    },
    [geocodingLib]
  );

  // Quick preset click
  const handleSelectPreset = (preset: typeof POPULAR_LOCATIONS[0]) => {
    const target = { lat: preset.lat, lng: preset.lng };
    setMarkerPosition(target);
    setSelectedPlaceName(preset.name);
    setSelectedAddress(`${preset.name}, ${preset.address}`);
    setSearchQuery(preset.name);
    setShowSuggestions(false);

    if (map) {
      map.panTo(target);
      map.setZoom(15);
    }
  };

  // Current user GPS location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsGeocoding(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const target = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMarkerPosition(target);

        if (geocodingLib) {
          const geocoder = new geocodingLib.Geocoder();
          geocoder.geocode({ location: target }, (results, status) => {
            setIsGeocoding(false);
            if (status === 'OK' && results && results[0]) {
              const formatted = results[0].formatted_address;
              setSelectedAddress(formatted);
              setSelectedPlaceName('Current Device Location');
              setSearchQuery(formatted);
            } else {
              setSelectedAddress(`Current Location (${target.lat.toFixed(4)}, ${target.lng.toFixed(4)})`);
            }
          });
        } else {
          setIsGeocoding(false);
          setSelectedAddress(`Current Location (${target.lat.toFixed(4)}, ${target.lng.toFixed(4)})`);
        }

        if (map) {
          map.panTo(target);
          map.setZoom(16);
        }
      },
      (err) => {
        setIsGeocoding(false);
        console.warn('Geolocation error:', err);
      },
      { timeout: 10000 }
    );
  };

  const handleConfirm = () => {
    onSelectLocation({
      address: selectedAddress,
      name: selectedPlaceName || undefined,
      lat: markerPosition.lat,
      lng: markerPosition.lng
    });
    onClose();
  };

  return (
    <div className="flex flex-col h-[78vh] max-h-[780px] w-full bg-white rounded-2xl overflow-hidden">
      {/* Top Header Bar */}
      <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-xs">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-neutral-900 leading-tight">
              Select Event Location on Map
            </h3>
            <p className="text-xs text-neutral-500">
              Search a Buddhist Vihara, landmark, or click anywhere on the map to place the pin
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 rounded-lg transition-colors"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search Bar & Controls Bar */}
      <div className="p-3.5 border-b border-neutral-200 bg-white space-y-2.5 z-20">
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search venue, temple name, address, or city..."
                className="w-full pl-10 pr-10 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all outline-hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSuggestions([]);
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isGeocoding}
              title="Use current GPS location"
              className="px-3 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors border border-neutral-200"
            >
              {isGeocoding ? (
                <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
              ) : (
                <Navigation className="w-4 h-4 text-orange-600" />
              )}
              <span className="hidden sm:inline">My Location</span>
            </button>
          </div>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-neutral-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50 divide-y divide-neutral-100">
              {suggestions.map((sug, idx) => {
                const mainText = sug.placePrediction?.mainText?.toString() || sug.placePrediction?.text.toString();
                const secondaryText = sug.placePrediction?.secondaryText?.toString() || '';
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(sug)}
                    className="w-full px-4 py-2.5 text-left hover:bg-orange-50/70 flex items-start gap-3 transition-colors text-xs group"
                  >
                    <Building2 className="w-4 h-4 text-neutral-400 group-hover:text-orange-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-neutral-800 group-hover:text-orange-950 truncate">
                        {mainText}
                      </div>
                      {secondaryText && (
                        <div className="text-[11px] text-neutral-500 truncate mt-0.5">
                          {secondaryText}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Buddhist Center Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
          <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3 text-amber-500" /> Quick Pick:
          </span>
          {POPULAR_LOCATIONS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-orange-100 hover:text-orange-800 text-neutral-600 font-medium text-[11px] shrink-0 border border-neutral-200 transition-colors"
            >
              {preset.name.replace(' Buddhist Vihara', '').replace(' Buddhist Monastery', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Map Canvas */}
      <div className="flex-1 w-full relative bg-neutral-100">
        <Map
          defaultCenter={markerPosition}
          defaultZoom={13}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapTypeId={mapType}
          onClick={handleMapClick}
          className="w-full h-full"
        >
          <AdvancedMarker
            position={markerPosition}
            title={selectedPlaceName || selectedAddress}
          >
            <Pin background="#ea580c" glyphColor="#ffffff" borderColor="#c2410c" />
          </AdvancedMarker>
        </Map>

        {/* Floating Map Type Switcher */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm border border-neutral-200 rounded-xl shadow-md p-1 flex items-center gap-1 z-10 text-xs">
          <button
            type="button"
            onClick={() => setMapType('roadmap')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              mapType === 'roadmap' ? 'bg-orange-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Default
          </button>
          <button
            type="button"
            onClick={() => setMapType('satellite')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              mapType === 'satellite' ? 'bg-orange-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Satellite
          </button>
          <button
            type="button"
            onClick={() => setMapType('hybrid')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              mapType === 'hybrid' ? 'bg-orange-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Terrain
          </button>
        </div>

        {/* Click hint badge */}
        <div className="absolute top-3 left-3 bg-neutral-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl shadow-md text-[11px] font-medium flex items-center gap-1.5 pointer-events-none z-10">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>Click anywhere to relocate pin</span>
        </div>
      </div>

      {/* Selected Location Summary & Confirmation Footer */}
      <div className="p-4 bg-white border-t border-neutral-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 mt-0.5 border border-orange-100">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] uppercase font-bold tracking-wider text-orange-700 flex items-center gap-1.5">
              <span>Selected Venue Location</span>
              {isGeocoding && <Loader2 className="w-3 h-3 animate-spin text-orange-500" />}
            </div>
            <p className="text-sm font-bold text-neutral-900 truncate">
              {selectedPlaceName || selectedAddress}
            </p>
            <p className="text-xs text-neutral-500 truncate">
              {selectedAddress}
            </p>
            <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
              Lat: {markerPosition.lat.toFixed(5)} • Lng: {markerPosition.lng.toFixed(5)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/20 flex items-center gap-1.5 transition-all"
          >
            <Check className="w-4 h-4" />
            Use This Location
          </button>
        </div>
      </div>
    </div>
  );
}

// Exported Root Modal with APIProvider wrapper
export function EventLocationPickerModal({
  isOpen,
  onClose,
  onSelectLocation,
  initialLocationText
}: EventLocationPickerModalProps) {
  if (!isOpen) return null;

  // Use injected environment variable or the provided custom Google Maps API key
  const apiKey =
    (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
    'AIzaSyCzrcHG6eddAFGKrvqgC-1GPkeBaxcU9BM';

  return (
    <div className="fixed inset-0 bg-black/60 z-60 flex items-center justify-center p-3 sm:p-5 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
        <APIProvider apiKey={apiKey} libraries={['places', 'marker', 'geocoding', 'geometry']}>
          <MapLocationPickerInner
            onSelectLocation={onSelectLocation}
            onClose={onClose}
            initialLocationText={initialLocationText}
          />
        </APIProvider>
      </div>
    </div>
  );
}
