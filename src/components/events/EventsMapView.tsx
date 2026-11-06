import React, { useState, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow
} from '@vis.gl/react-google-maps';
import {
  GOOGLE_MAPS_API_KEY,
  MAP_ATTRIBUTION_IDS,
  getCoordinatesForLocation,
  GLOBAL_MAP_CENTER
} from '../../utils/googleMapsConfig';
import { EventItem } from '../../data/eventsData';
import { 
  MapPin, Calendar, Clock, Users, Navigation, 
  ExternalLink, Sparkles, Filter, ChevronRight, Check
} from 'lucide-react';

interface EventsMapViewProps {
  events: EventItem[];
  onSelectEvent: (event: EventItem) => void;
  rsvps: string[];
  onToggleRsvp: (eventId: string) => void;
}

export function EventsMapView({
  events,
  onSelectEvent,
  rsvps,
  onToggleRsvp
}: EventsMapViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  // Geocode events that don't have explicit coordinates using known location lookup
  const geocodedEvents = useMemo(() => {
    return events
      .filter(e => !e.isOnline) // Only in-person events show on physical map
      .map(e => {
        const coords = e.coordinates || getCoordinatesForLocation(e.loc);
        return {
          ...e,
          resolvedCoords: coords
        };
      });
  }, [events]);

  const filtered = useMemo(() => {
    if (filterType === "all") return geocodedEvents;
    if (filterType === "rsvpd") return geocodedEvents.filter(e => rsvps.includes(e.id));
    return geocodedEvents.filter(e => e.category?.toLowerCase() === filterType.toLowerCase());
  }, [geocodedEvents, filterType, rsvps]);

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
      {/* Map Filter & Info Header */}
      <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-neutral-50/70">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="p-1.5 bg-rose-100 text-rose-700 rounded-lg">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-neutral-900">Interactive Gathering Map & Directions</h3>
            <p className="text-[11px] text-neutral-500">
              Locate gatherings worldwide, view venue capacity, and get turn-by-turn driving or transit directions.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {[
            { id: "all", label: "All Gatherings" },
            { id: "rsvpd", label: "My Attending" },
            { id: "meditation", label: "Meditation" },
            { id: "talk", label: "Talks" },
            { id: "workshop", label: "Workshops" }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filterType === f.id
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative w-full h-[540px] md:h-[620px]">
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
          <Map
            defaultCenter={{ lat: 30.0, lng: 0.0 }}
            defaultZoom={2}
            gestureHandling="greedy"
            disableDefaultUI={false}
            mapId="DEMO_MAP_ID"
            className="w-full h-full"
          >
            {filtered.map(item => {
              const isSelected = selectedEvent?.id === item.id;
              const isRsvpd = rsvps.includes(item.id);

              return (
                <AdvancedMarker
                  key={item.id}
                  position={item.resolvedCoords}
                  onClick={() => setSelectedEvent(item)}
                  title={item.title}
                >
                  <Pin
                    background={isRsvpd ? '#059669' : isSelected ? '#ea580c' : '#e11d48'}
                    borderColor="#ffffff"
                    glyphColor="#ffffff"
                    scale={isSelected ? 1.3 : 1.0}
                  />
                </AdvancedMarker>
              );
            })}

            {selectedEvent && (
              <InfoWindow
                position={
                  selectedEvent.coordinates || getCoordinatesForLocation(selectedEvent.loc)
                }
                onCloseClick={() => setSelectedEvent(null)}
              >
                <div className="max-w-xs p-1 text-neutral-900">
                  <div className="relative h-24 rounded-lg overflow-hidden mb-2">
                    <img
                      src={selectedEvent.img}
                      alt={selectedEvent.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1.5 left-1.5 bg-black/70 text-white text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                      {selectedEvent.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-neutral-900 leading-snug">
                    {selectedEvent.title}
                  </h4>
                  <p className="text-[10px] text-neutral-500 mt-1 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                    {selectedEvent.loc}
                  </p>
                  <p className="text-[10px] text-neutral-600 mt-0.5 font-medium">
                    {selectedEvent.date}
                  </p>

                  <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-neutral-100">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                        selectedEvent.coordinates
                          ? `${selectedEvent.coordinates.lat},${selectedEvent.coordinates.lng}`
                          : selectedEvent.loc
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-1 px-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-[10px] rounded-md flex items-center justify-center gap-1 transition-colors"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Directions</span>
                    </a>
                    <button
                      onClick={() => onSelectEvent(selectedEvent)}
                      className="py-1 px-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-[10px] rounded-md transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>

        {/* Floating Quick Drawer on Desktop / Mobile Bottom Card */}
        {selectedEvent && (
          <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-96 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-neutral-200 z-10 animate-in slide-in-from-bottom-4">
            <div className="flex gap-3">
              <img
                src={selectedEvent.img}
                alt=""
                className="w-16 h-16 rounded-xl object-cover shrink-0 border border-neutral-100 shadow-2xs"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                    {selectedEvent.category}
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    {selectedEvent.mon} {selectedEvent.day}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-neutral-900 truncate mt-1">
                  {selectedEvent.title}
                </h4>
                <p className="text-[10px] text-neutral-500 truncate flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                  {selectedEvent.loc}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-neutral-100 text-xs">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  selectedEvent.coordinates
                    ? `${selectedEvent.coordinates.lat},${selectedEvent.coordinates.lng}`
                    : selectedEvent.loc
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1.5 px-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <Navigation className="w-3.5 h-3.5 text-orange-400" />
                <span>Get Directions</span>
              </a>

              <button
                onClick={() => onToggleRsvp(selectedEvent.id)}
                className={`py-1.5 px-3 rounded-lg font-bold transition-colors ${
                  rsvps.includes(selectedEvent.id)
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                }`}
              >
                {rsvps.includes(selectedEvent.id) ? "Attending ✓" : "RSVP"}
              </button>

              <button
                onClick={() => onSelectEvent(selectedEvent)}
                className="p-1.5 text-neutral-500 hover:text-neutral-900 border border-neutral-200 rounded-lg hover:bg-neutral-50"
                title="View Full Details"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
