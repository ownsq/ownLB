import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin, 
  useMap 
} from '@vis.gl/react-google-maps';
import { 
  Building2, 
  Utensils, 
  User, 
  Calendar, 
  MapPin, 
  Navigation, 
  Maximize2, 
  Compass, 
  Star,
  Sparkles,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  GOOGLE_MAPS_API_KEY, 
  MAP_ATTRIBUTION_IDS, 
  DEFAULT_MAP_CENTER,
  getCoordinatesForLocation 
} from '../../utils/googleMapsConfig';
import { 
  subscribeTemples, 
  subscribeRestaurants, 
  subscribeMonks, 
  subscribeEvents 
} from '../../lib/firestoreService';
import { Temple } from '../../data/templesData';
import { Monk } from '../../data/monksData';
import { EventItem } from '../../data/eventsData';

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
  const [temples, setTemples] = useState<Temple[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [monks, setMonks] = useState<Monk[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState<'all' | 'temple' | 'restaurant' | 'monk'>('all');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string>('Live Firestore Map');
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('all');

  // Real-time Firestore subscriptions
  useEffect(() => {
    let loadedCount = 0;
    const checkDone = () => {
      loadedCount += 1;
      if (loadedCount >= 4) setLoading(false);
    };

    const unsubT = subscribeTemples((list) => { setTemples(list); checkDone(); });
    const unsubR = subscribeRestaurants((list) => { setRestaurants(list); checkDone(); });
    const unsubM = subscribeMonks((list) => { setMonks(list); checkDone(); });
    const unsubE = subscribeEvents((list) => { setEvents(list); checkDone(); });

    return () => {
      unsubT();
      unsubR();
      unsubM();
      unsubE();
    };
  }, []);

  // Map Firestore documents to NearbyPlace pins
  const allNearbyPlaces: NearbyPlace[] = useMemo(() => {
    const places: NearbyPlace[] = [];

    // Temples from Firestore
    temples.forEach((t: any) => {
      const coords = (t.lat && t.lng) 
        ? { lat: Number(t.lat), lng: Number(t.lng) } 
        : getCoordinatesForLocation(t.address || t.loc || t.city || t.name);
      places.push({
        id: `temple-${t.id}`,
        name: t.name,
        category: 'temple',
        categoryLabel: 'Temple',
        lat: coords.lat,
        lng: coords.lng,
        address: t.address || t.loc || t.city || 'Buddhist Vihara',
        city: (t.city || t.country || 'Sri Lanka').toLowerCase(),
        distance: 'Temple',
        rating: t.rating || 4.9,
        link: `/temples/${t.id}`,
        description: t.description || 'Theravada Buddhist Temple & Community Center',
        phone: t.phone,
        badge: t.tags?.[0] || 'Open'
      });
    });

    // Restaurants from Firestore
    restaurants.forEach((r: any) => {
      const coords = (r.lat && r.lng) 
        ? { lat: Number(r.lat), lng: Number(r.lng) } 
        : getCoordinatesForLocation(r.address || r.city || r.name);
      places.push({
        id: `rest-${r.id}`,
        name: r.name,
        category: 'restaurant',
        categoryLabel: 'Restaurant',
        lat: coords.lat,
        lng: coords.lng,
        address: r.address || r.city || 'Sri Lankan Cuisine',
        city: (r.city || r.country || 'Sri Lanka').toLowerCase(),
        distance: 'Food',
        rating: r.rating || 4.8,
        link: '/restaurants',
        description: r.description || r.type || 'Authentic Sri Lankan Dining',
        phone: r.phone,
        badge: r.status || 'Dine-in'
      });
    });

    // Monks from Firestore
    monks.forEach((m: any) => {
      const coords = (m.lat && m.lng) 
        ? { lat: Number(m.lat), lng: Number(m.lng) } 
        : getCoordinatesForLocation(m.loc || m.city || m.temple || m.name);
      places.push({
        id: `monk-${m.id}`,
        name: m.name,
        category: 'monk',
        categoryLabel: 'Monk Residence',
        lat: coords.lat,
        lng: coords.lng,
        address: m.temple ? `${m.temple}, ${m.loc || m.city || ''}` : (m.loc || 'Residence'),
        city: (m.city || m.loc || 'Sri Lanka').toLowerCase(),
        distance: 'Monastic',
        rating: m.rating || 5.0,
        link: `/monks/${m.id}`,
        description: m.bio || 'Venerable Buddhist Monk',
        phone: m.phone || m.mobile,
        badge: m.availableForPrograms ? 'Available for Bana' : undefined
      });
    });

    // Events from Firestore
    events.forEach((e: any) => {
      const coords = (e.lat && e.lng) 
        ? { lat: Number(e.lat), lng: Number(e.lng) } 
        : getCoordinatesForLocation(e.location || e.city || e.title);
      places.push({
        id: `event-${e.id}`,
        name: e.title,
        category: 'event',
        categoryLabel: 'Community Event',
        lat: coords.lat,
        lng: coords.lng,
        address: e.location || e.city || 'Community Venue',
        city: (e.city || e.location || 'Sri Lanka').toLowerCase(),
        distance: 'Upcoming',
        rating: 4.9,
        link: '/events',
        description: e.description || 'Community gathering',
        badge: e.date || 'Upcoming'
      });
    });

    return places;
  }, [temples, restaurants, monks, events]);

  // Unique cities from live Firestore places
  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    allNearbyPlaces.forEach(p => {
      if (p.city && p.city.trim()) set.add(p.city.trim());
    });
    return Array.from(set);
  }, [allNearbyPlaces]);

  // Filtered places
  const filteredPlaces = useMemo(() => {
    return allNearbyPlaces.filter(place => {
      const matchesCategory = activeCategory === 'all' || place.category === activeCategory;
      const matchesCity = selectedCityFilter === 'all' || place.city.includes(selectedCityFilter.toLowerCase());
      return matchesCategory && matchesCity;
    });
  }, [allNearbyPlaces, activeCategory, selectedCityFilter]);

  // Compute selected place
  const selectedPlace = useMemo(() => {
    if (selectedPlaceId) {
      const found = filteredPlaces.find(p => p.id === selectedPlaceId);
      if (found) return found;
    }
    return filteredPlaces[0] || null;
  }, [filteredPlaces, selectedPlaceId]);

  // Compute map center based on GPS, selected place, or default
  const mapCenter = useMemo(() => {
    if (userCoords) return userCoords;
    if (selectedPlace) return { lat: selectedPlace.lat, lng: selectedPlace.lng };
    if (filteredPlaces.length > 0) return { lat: filteredPlaces[0].lat, lng: filteredPlaces[0].lng };
    return DEFAULT_MAP_CENTER;
  }, [userCoords, selectedPlace, filteredPlaces]);

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
        setLocationStatus('Centering on live GPS location');
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        setIsLocating(false);
        setUserCoords(null);
        setLocationStatus('GPS unavailable. Using default map center.');
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
          {/* Dynamic city filter */}
          {uniqueCities.length > 0 && (
            <select
              value={selectedCityFilter}
              onChange={(e) => {
                setUserCoords(null);
                setSelectedCityFilter(e.target.value);
              }}
              className="px-2 py-1 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg text-[11px] font-semibold text-neutral-700 outline-none cursor-pointer capitalize"
            >
              <option value="all">All Cities ({allNearbyPlaces.length})</option>
              {uniqueCities.map(city => (
                <option key={city} value={city} className="capitalize">
                  {city}
                </option>
              ))}
            </select>
          )}

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
            defaultZoom={11}
            gestureHandling="greedy"
            disableDefaultUI={false}
            internalUsageAttributionIds={MAP_ATTRIBUTION_IDS}
            className="w-full h-full"
          >
            <MapCameraRecenter center={mapCenter} zoom={userCoords ? 13 : 11} />

            {/* User GPS location marker */}
            {userCoords && (
              <AdvancedMarker position={userCoords}>
                <div className="relative flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-blue-500/30 animate-ping absolute"></div>
                  <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md relative z-10"></div>
                </div>
              </AdvancedMarker>
            )}

            {/* Firestore Nearby Place Pins */}
            {filteredPlaces.map(place => {
              const pin = getPinConfig(place.category);
              const isSelected = selectedPlace?.id === place.id;
              return (
                <AdvancedMarker
                  key={place.id}
                  position={{ lat: place.lat, lng: place.lng }}
                  onClick={() => setSelectedPlaceId(place.id)}
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

        {/* Floating Live Database Count Badge */}
        <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md shadow-md border border-neutral-200 text-[10px] font-bold text-neutral-800 flex items-center gap-1.5 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{filteredPlaces.length} places in database</span>
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

      {/* Selected Place Card or Empty State */}
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
        <div className="p-4 bg-neutral-50 text-center">
          <p className="text-xs text-neutral-600 font-medium mb-1">
            {allNearbyPlaces.length === 0 ? "No places registered yet in database" : "No places matching your filter"}
          </p>
          <p className="text-[11px] text-neutral-400 mb-2">
            {allNearbyPlaces.length === 0
              ? "All mock data removed. Register temples, restaurants, or monks to see them on the map."
              : "Try switching to All categories or resetting the city filter."}
          </p>
          {allNearbyPlaces.length === 0 && (
            <div className="flex justify-center gap-2 mt-2">
              <Link to="/temples" className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-[10px] font-bold hover:bg-amber-700">
                + Temple
              </Link>
              <Link to="/restaurants" className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700">
                + Food
              </Link>
              <Link to="/monks" className="px-2.5 py-1 bg-orange-600 text-white rounded-lg text-[10px] font-bold hover:bg-orange-700">
                + Monk
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
