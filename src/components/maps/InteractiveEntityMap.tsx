import React, { useState, useCallback, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap
} from '@vis.gl/react-google-maps';
import {
  GOOGLE_MAPS_API_KEY,
  MAP_ATTRIBUTION_IDS,
  GLOBAL_MAP_CENTER
} from '../../utils/googleMapsConfig';
import {
  MapPin,
  Navigation,
  ExternalLink,
  Star,
  X,
  Layers,
  Compass,
  Building2,
  Phone,
  Maximize2
} from 'lucide-react';

export interface MapMarkerItem {
  id: string | number;
  name: string;
  subtitle?: string;
  address?: string;
  lat: number;
  lng: number;
  rating?: number;
  reviews?: number;
  image?: string;
  category?: string;
  phone?: string;
  link?: string;
  badge?: string;
  badgeColor?: string;
}

interface InteractiveEntityMapProps {
  items: MapMarkerItem[];
  title?: string;
  description?: string;
  defaultZoom?: number;
  center?: { lat: number; lng: number };
  pinColor?: string;
  height?: string;
  showSidebar?: boolean;
  onItemClick?: (item: MapMarkerItem) => void;
}

// Controller component inside the Map context to handle camera movements
function MapCameraController({
  selectedItem
}: {
  selectedItem: MapMarkerItem | null;
}) {
  const map = useMap();

  React.useEffect(() => {
    if (map && selectedItem) {
      map.panTo({ lat: selectedItem.lat, lng: selectedItem.lng });
      map.setZoom(15);
    }
  }, [map, selectedItem]);

  return null;
}

export function InteractiveEntityMap({
  items,
  title,
  description,
  defaultZoom = 3,
  center = GLOBAL_MAP_CENTER,
  pinColor = '#ea580c',
  height = '600px',
  showSidebar = true,
  onItemClick
}: InteractiveEntityMapProps) {
  const [selectedItem, setSelectedItem] = useState<MapMarkerItem | null>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState('');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ['All', ...Array.from(set)];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch =
        !searchFilter ||
        item.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (item.address && item.address.toLowerCase().includes(searchFilter.toLowerCase())) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(searchFilter.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [items, activeCategory, searchFilter]);

  const handleMarkerClick = useCallback(
    (item: MapMarkerItem) => {
      setSelectedItem(item);
      if (onItemClick) onItemClick(item);
    },
    [onItemClick]
  );

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm flex flex-col">
      {/* Header bar */}
      {(title || description) && (
        <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-neutral-50/70">
          <div>
            {title && (
              <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-600" />
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-neutral-600">
              Showing {filteredItems.length} locations
            </span>
          </div>
        </div>
      )}

      {/* Main Map + Sidebar Area */}
      <div className="flex flex-col lg:flex-row w-full relative" style={{ height }}>
        {/* Optional Sidebar */}
        {showSidebar && (
          <div className="w-full lg:w-80 h-48 lg:h-full border-b lg:border-b-0 lg:border-r border-neutral-200 flex flex-col bg-white shrink-0 z-10">
            <div className="p-3 border-b border-neutral-100 space-y-2">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search map locations..."
                className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:bg-white focus:border-orange-500 outline-hidden"
              />
              {categories.length > 2 && (
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold whitespace-nowrap transition-colors ${
                        activeCategory === cat
                          ? 'bg-orange-600 text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
              {filteredItems.length === 0 ? (
                <div className="p-6 text-center text-neutral-400 text-xs">
                  No locations matching your filter.
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = selectedItem?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`p-3 cursor-pointer transition-colors flex gap-2.5 items-start ${
                        isSelected
                          ? 'bg-orange-50/80 border-l-4 border-orange-600'
                          : 'hover:bg-neutral-50'
                      }`}
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover shrink-0 border border-neutral-200"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-bold text-xs text-neutral-900 truncate">
                            {item.name}
                          </h4>
                          {item.rating && (
                            <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5 shrink-0">
                              <Star className="w-3 h-3 fill-amber-500" />
                              {item.rating}
                            </span>
                          )}
                        </div>
                        {item.subtitle && (
                          <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                            {item.subtitle}
                          </p>
                        )}
                        {item.address && (
                          <p className="text-[10px] text-neutral-400 truncate flex items-center gap-1 mt-0.5">
                            <MapPin className="w-2.5 h-2.5 shrink-0 text-orange-500" />
                            {item.address}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Map View */}
        <div className="flex-1 h-full relative">
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['marker', 'places', 'geometry']}>
            <Map
              defaultCenter={center}
              defaultZoom={defaultZoom}
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={MAP_ATTRIBUTION_IDS}
              gestureHandling="greedy"
              disableDefaultUI={false}
              mapTypeId={mapType}
              className="w-full h-full"
            >
              <MapCameraController selectedItem={selectedItem} />

              {filteredItems.map((item) => (
                <AdvancedMarker
                  key={item.id}
                  position={{ lat: item.lat, lng: item.lng }}
                  title={item.name}
                  onClick={() => handleMarkerClick(item)}
                >
                  <Pin
                    background={selectedItem?.id === item.id ? '#c2410c' : pinColor}
                    glyphColor="#ffffff"
                    borderColor="#7c2d12"
                    scale={selectedItem?.id === item.id ? 1.25 : 1.0}
                  />
                </AdvancedMarker>
              ))}

              {selectedItem && (
                <InfoWindow
                  position={{ lat: selectedItem.lat, lng: selectedItem.lng }}
                  onCloseClick={() => setSelectedItem(null)}
                >
                  <div className="p-2 max-w-xs space-y-2 text-neutral-800">
                    {selectedItem.image && (
                      <div className="w-full h-24 rounded-lg overflow-hidden bg-neutral-100">
                        <img
                          src={selectedItem.image}
                          alt={selectedItem.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900 leading-tight">
                        {selectedItem.name}
                      </h4>
                      {selectedItem.subtitle && (
                        <p className="text-xs text-neutral-600 mt-0.5">
                          {selectedItem.subtitle}
                        </p>
                      )}
                      {selectedItem.address && (
                        <p className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-orange-600 shrink-0" />
                          {selectedItem.address}
                        </p>
                      )}
                      {selectedItem.rating && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-amber-600 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span>{selectedItem.rating}</span>
                          {selectedItem.reviews && (
                            <span className="text-[10px] text-neutral-400 font-normal">
                              ({selectedItem.reviews} reviews)
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                      {selectedItem.link && (
                        <a
                          href={selectedItem.link}
                          className="flex-1 py-1 px-2.5 bg-orange-600 text-white rounded-md text-[11px] font-bold text-center hover:bg-orange-700 transition-colors"
                        >
                          View Profile
                        </a>
                      )}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${selectedItem.lat},${selectedItem.lng}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1 px-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors"
                        title="Open in Google Maps"
                      >
                        <Navigation className="w-3 h-3 text-orange-600" />
                        <span>Directions</span>
                      </a>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Map>

            {/* Floating Map Type Switcher */}
            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm border border-neutral-200 rounded-xl shadow-md p-1 flex items-center gap-1 z-10 text-xs">
              <button
                type="button"
                onClick={() => setMapType('roadmap')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  mapType === 'roadmap'
                    ? 'bg-orange-600 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Map
              </button>
              <button
                type="button"
                onClick={() => setMapType('satellite')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  mapType === 'satellite'
                    ? 'bg-orange-600 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Satellite
              </button>
              <button
                type="button"
                onClick={() => setMapType('hybrid')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  mapType === 'hybrid'
                    ? 'bg-orange-600 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Terrain
              </button>
            </div>
          </APIProvider>
        </div>
      </div>
    </div>
  );
}
