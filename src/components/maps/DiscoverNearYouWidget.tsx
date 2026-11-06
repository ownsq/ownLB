import React, { useState, useEffect, useCallback } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin, 
  InfoWindow,
  useMap 
} from '@vis.gl/react-google-maps';
import { 
  Building2, 
  Utensils, 
  User, 
  Calendar, 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Maximize2, 
  Compass, 
  Star,
  Sparkles,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  GOOGLE_MAPS_API_KEY, 
  MAP_ATTRIBUTION_IDS, 
  KNOWN_COORDINATES 
} from '../../utils/googleMapsConfig';

export interface NearbyPlace {
  id: string;
  name: string;
  category: 'temple' | 'restaurant' | 'monk' | 'event';
  categoryLabel: string;
  lat: number;
  lng: number;
  address: string;
  city: string;
  distance: string;
  rating?: number;
  link: string;
  description: string;
  phone?: string;
  badge?: string;
}

const NEARBY_PLACES: NearbyPlace[] = [
  // Los Angeles area
  {
    id: 'la-t1',
    name: 'Sri Lanka Buddhist Vihara',
    category: 'temple',
    categoryLabel: 'Temple',
    lat: 34.0535,
    lng: -118.2450,
    address: '3456 Temple St, Los Angeles, CA',
    city: 'los angeles',
    distance: '0.8 miles away',
    rating: 4.9,
    link: '/temples/buddhist-vihara-la',
    description: 'Historic Theravada temple with daily chanting, meditation hall, and Dhamma school.',
    phone: '+1 (213) 555-0192',
    badge: 'Open Daily'
  },
  {
    id: 'la-r1',
    name: 'The Lankan Crabs & Seafood',
    category: 'restaurant',
    categoryLabel: 'Restaurant',
    lat: 34.0620,
    lng: -118.2910,
    address: '820 S Western Ave, Los Angeles, CA',
    city: 'los angeles',
    distance: '1.4 miles away',
    rating: 4.8,
    link: '/restaurants',
    description: 'Authentic Sri Lankan curries, hot hoppers, seafood lamprais, and short eats.',
    phone: '+1 (213) 555-8821',
    badge: 'Dine-in & Takeout'
  },
  {
    id: 'la-m1',
    name: 'Ven. Dr. Bodhipala Thero',
    category: 'monk',
    categoryLabel: 'Monk Residence',
    lat: 34.0580,
    lng: -118.2610,
    address: 'West Adams Blvd, Los Angeles, CA',
    city: 'los angeles',
    distance: '1.1 miles away',
    rating: 5.0,
    link: '/monks/3',
    description: 'Senior Theravada monk. Available for Bana invitations, house blessings, and Pirith.',
    phone: '+1 (213) 555-3341',
    badge: 'Available for Bana'
  },
  {
    id: 'la-e1',
    name: 'Vesak Lantern Workshop & Gathering',
    category: 'event',
    categoryLabel: 'Community Event',
    lat: 34.0480,
    lng: -118.2400,
    address: 'Downtown Cultural Plaza, Los Angeles, CA',
    city: 'los angeles',
    distance: '1.6 miles away',
    rating: 4.9,
    link: '/events',
    description: 'Community gathering for Vesak preparation, lantern building, and Buddha Vandana.',
    badge: 'May 25 • 10:00 AM'
  },
  {
    id: 'la-r2',
    name: 'Ceylon Spices Express',
    category: 'restaurant',
    categoryLabel: 'Food & Bakery',
    lat: 34.0390,
    lng: -118.2720,
    address: 'Washington Blvd, Los Angeles, CA',
    city: 'los angeles',
    distance: '2.1 miles away',
    rating: 4.7,
    link: '/restaurants',
    description: 'Fresh vegetable roti, fish patties, milk tea, and imported Ceylon spices.',
    badge: 'Open Now'
  },

  // London area
  {
    id: 'ldn-t1',
    name: 'London Buddhist Vihara',
    category: 'temple',
    categoryLabel: 'Temple',
    lat: 51.5074,
    lng: -0.1278,
    address: 'The Avenue, Chiswick, London, UK',
    city: 'london',
    distance: '0.6 miles away',
    rating: 4.9,
    link: '/temples',
    description: 'Oldest Buddhist center in the Western world, founded by Anagarika Dharmapala.',
    badge: 'Historic Center'
  },
  {
    id: 'ldn-r1',
    name: 'Kothu Kothu Sri Lankan Street Food',
    category: 'restaurant',
    categoryLabel: 'Restaurant',
    lat: 51.5120,
    lng: -0.1380,
    address: 'Soho, London, UK',
    city: 'london',
    distance: '1.2 miles away',
    rating: 4.8,
    link: '/restaurants',
    description: 'Famous London market spot for sizzling hot kottu roti and spicy curry.',
    badge: 'Popular'
  },

  // Melbourne area
  {
    id: 'mel-t1',
    name: 'Melbourne Dhamma Center & Vihara',
    category: 'temple',
    categoryLabel: 'Temple',
    lat: -37.8136,
    lng: 144.9631,
    address: 'Springvale, Melbourne, Victoria, Australia',
    city: 'melbourne',
    distance: '1.0 miles away',
    rating: 4.9,
    link: '/temples',
    description: 'Peaceful monastery setting with regular meditation programs and Sunday school.',
    badge: 'Meditation'
  },
  {
    id: 'mel-r1',
    name: 'Ceylonese Curry Pot Melbourne',
    category: 'restaurant',
    categoryLabel: 'Restaurant',
    lat: -37.8200,
    lng: 144.9750,
    address: 'Southbank, Melbourne, Australia',
    city: 'melbourne',
    distance: '1.5 miles away',
    rating: 4.7,
    link: '/restaurants',
    description: 'Traditional clay pot curries, pol sambol, and hoppers.',
    badge: 'Authentic'
  },

  // Colombo area
  {
    id: 'cmb-t1',
    name: 'Kelaniya Raja Maha Vihara',
    category: 'temple',
    categoryLabel: 'Temple',
    lat: 6.9529,
    lng: 79.9197,
    address: 'Kelaniya, Colombo, Sri Lanka',
    city: 'colombo',
    distance: '2.5 miles away',
    rating: 5.0,
    link: '/temples',
    description: 'Sacred temple sanctified by the third visit of the Buddha.',
    badge: 'Sacred Site'
  },
  {
    id: 'cmb-r1',
    name: 'Raja Bojun Traditional Buffet',
    category: 'restaurant',
    categoryLabel: 'Restaurant',
    lat: 6.9271,
    lng: 79.8612,
    address: 'Kollupitiya, Colombo, Sri Lanka',
    city: 'colombo',
    distance: '0.9 miles away',
    rating: 4.8,
    link: '/restaurants',
    description: 'Grand buffet of authentic Sri Lankan heirloom vegetables, fish, and hoppers.',
    badge: 'Top Rated'
  }
];

function MapCameraRecenter({ center, zoom }: { center: { lat: number; lng: number }; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.panTo(center);
      map.setZoom(zoom);
    }
  }, [map, center, zoom]);
  return null;
}

export function DiscoverNearYouWidget() {
  const [selectedCity, setSelectedCity] = useState<'los angeles' | 'london' | 'melbourne' | 'colombo'>('los angeles');
  const [activeCategory, setActiveCategory] = useState<'all' | 'temple' | 'restaurant' | 'monk'>('all');
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace | null>(NEARBY_PLACES[0]);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string>('Los Angeles, CA');

  // Compute map center based on selected city or user GPS
  const mapCenter = userCoords || (
    selectedCity === 'london' ? { lat: 51.5074, lng: -0.1278 } :
    selectedCity === 'melbourne' ? { lat: -37.8136, lng: 144.9631 } :
    selectedCity === 'colombo' ? { lat: 6.9271, lng: 79.8612 } :
    { lat: 34.0522, lng: -118.2437 } // default LA
  );

  const filteredPlaces = NEARBY_PLACES.filter(place => {
    const matchesCity = userCoords ? true : place.city === selectedCity;
    const matchesCategory = activeCategory === 'all' || place.category === activeCategory;
    return matchesCity && matchesCategory;
  });

  const handleGetCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation not supported in browser');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Locating your position...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserCoords(coords);
        setIsLocating(false);
        setLocationStatus('Centering on your live GPS location');
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        setIsLocating(false);
        setUserCoords(null);
        setLocationStatus('Location access denied. Using Los Angeles hub.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, []);

  const getPinConfig = (category: NearbyPlace['category']) => {
    switch (category) {
      case 'temple':
        return { bg: '#d97706', glyph: '#ffffff', border: '#b45309' }; // Amber
      case 'restaurant':
        return { bg: '#059669', glyph: '#ffffff', border: '#047857' }; // Emerald
      case 'monk':
        return { bg: '#ea580c', glyph: '#ffffff', border: '#c2410c' }; // Orange
      case 'event':
      default:
        return { bg: '#e11d48', glyph: '#ffffff', border: '#be123c' }; // Rose
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs flex flex-col">
      {/* Header with Location Controls */}
      <div className="p-3.5 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-neutral-900 leading-tight">Discover Near You</h3>
            <p className="text-[10px] text-neutral-500 truncate max-w-[200px]">
              {locationStatus}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {/* City switcher dropdown */}
          <select
            value={selectedCity}
            onChange={(e) => {
              setUserCoords(null);
              setSelectedCity(e.target.value as any);
              const found = NEARBY_PLACES.find(p => p.city === e.target.value);
              if (found) setSelectedPlace(found);
              setLocationStatus(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1));
            }}
            className="px-2 py-1 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg text-[11px] font-semibold text-neutral-700 outline-none cursor-pointer"
          >
            <option value="los angeles">Los Angeles, USA</option>
            <option value="london">London, UK</option>
            <option value="melbourne">Melbourne, AUS</option>
            <option value="colombo">Colombo, SL</option>
          </select>

          {/* GPS button */}
          <button
            onClick={handleGetCurrentLocation}
            disabled={isLocating}
            title="Use current device GPS"
            className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
              userCoords 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border-neutral-200'
            }`}
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-amber-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 px-3 py-1.5 bg-neutral-50/70 border-b border-neutral-100 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'All', icon: Sparkles },
          { id: 'temple', label: 'Temples', icon: Building2 },
          { id: 'restaurant', label: 'Food', icon: Utensils },
          { id: 'monk', label: 'Monks', icon: User },
        ].map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition-colors whitespace-nowrap ${
                isActive 
                  ? 'bg-amber-600 text-white shadow-2xs' 
                  : 'text-neutral-600 hover:bg-neutral-200/60'
              }`}
            >
              <Icon className="w-3 h-3" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Interactive Google Map Area */}
      <div className="relative h-64 w-full bg-neutral-100">
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
          <Map
            mapId="DEMO_MAP_ID"
            defaultCenter={mapCenter}
            defaultZoom={13}
            gestureHandling="greedy"
            disableDefaultUI={false}
            internalUsageAttributionIds={MAP_ATTRIBUTION_IDS}
            className="w-full h-full"
          >
            <MapCameraRecenter center={mapCenter} zoom={13} />

            {/* User GPS location marker */}
            {userCoords && (
              <AdvancedMarker position={userCoords}>
                <div className="relative flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-blue-500/30 animate-ping absolute"></div>
                  <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md relative z-10"></div>
                </div>
              </AdvancedMarker>
            )}

            {/* Nearby Place Pins */}
            {filteredPlaces.map(place => {
              const pin = getPinConfig(place.category);
              const isSelected = selectedPlace?.id === place.id;
              return (
                <AdvancedMarker
                  key={place.id}
                  position={{ lat: place.lat, lng: place.lng }}
                  onClick={() => setSelectedPlace(place)}
                  title={place.name}
                >
                  <Pin
                    background={isSelected ? '#171717' : pin.bg}
                    glyphColor={pin.glyph}
                    borderColor={isSelected ? '#000000' : pin.border}
                    scale={isSelected ? 1.2 : 1.0}
                  />
                </AdvancedMarker>
              );
            })}
          </Map>
        </APIProvider>

        {/* Floating Quick Count Badge */}
        <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md shadow-md border border-neutral-200 text-[10px] font-bold text-neutral-800 flex items-center gap-1.5 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{filteredPlaces.length} places nearby</span>
        </div>

        {/* Expand / View World Map Link */}
        <Link
          to="/directory?view=map"
          title="Open Fullscreen World Map"
          className="absolute top-2 right-2 bg-white/95 backdrop-blur-xs p-1.5 rounded-md shadow-md border border-neutral-200 text-neutral-700 hover:text-amber-700 hover:bg-white transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Selected Place Card Below Map */}
      {selectedPlace ? (
        <div className="p-3.5 bg-white border-t border-neutral-100 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                  {selectedPlace.categoryLabel}
                </span>
                {selectedPlace.rating && (
                  <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-500" /> {selectedPlace.rating}
                  </span>
                )}
                {selectedPlace.badge && (
                  <span className="text-[9px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {selectedPlace.badge}
                  </span>
                )}
              </div>
              <h4 className="font-bold text-xs text-neutral-900 truncate">
                {selectedPlace.name}
              </h4>
              <p className="text-[11px] text-neutral-500 flex items-center gap-1 truncate mt-0.5">
                <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                <span>{selectedPlace.address}</span>
                <span className="text-neutral-300">•</span>
                <span className="font-medium text-neutral-700 shrink-0">{selectedPlace.distance}</span>
              </p>
            </div>

            <Link
              to={selectedPlace.link}
              className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shrink-0 shadow-2xs"
            >
              View
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex items-center justify-between pt-1.5 border-t border-neutral-100 text-[10px]">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-700 hover:underline font-semibold flex items-center gap-1"
            >
              <Navigation className="w-3 h-3 text-orange-600" />
              Get Directions
            </a>
            {selectedPlace.phone && (
              <span className="text-neutral-500 font-medium">
                {selectedPlace.phone}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="p-3 bg-neutral-50 text-center text-xs text-neutral-500">
          Click any pin on the map to view directions and details.
        </div>
      )}
    </div>
  );
}
