import React, { useState } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin
} from '@vis.gl/react-google-maps';
import {
  GOOGLE_MAPS_API_KEY,
  MAP_ATTRIBUTION_IDS,
  getCoordinatesForLocation
} from '../../utils/googleMapsConfig';
import { Monk, MonkBanaProgram } from '../../data/monksData';
import {
  Calendar,
  Clock,
  MapPin,
  Check,
  X,
  Navigation,
  Globe,
  Sparkles,
  Heart,
  User,
  ShieldCheck
} from 'lucide-react';

interface MonkProgramsModalProps {
  isOpen: boolean;
  onClose: () => void;
  monk: Monk | null;
  onInvite?: (monk: Monk) => void;
}

export function MonkProgramsModal({
  isOpen,
  onClose,
  monk,
  onInvite
}: MonkProgramsModalProps) {
  const [selectedProgram, setSelectedProgram] = useState<MonkBanaProgram | null>(null);
  const [rsvps, setRsvps] = useState<string[]>([]);
  const [toast, setToast] = useState('');

  React.useEffect(() => {
    if (monk && monk.banaPrograms && monk.banaPrograms.length > 0) {
      setSelectedProgram(monk.banaPrograms[0]);
    } else {
      setSelectedProgram(null);
    }
  }, [monk]);

  if (!isOpen || !monk) return null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const toggleRsvp = (programId: string) => {
    if (rsvps.includes(programId)) {
      setRsvps(rsvps.filter((id) => id !== programId));
      showToast('RSVP cancelled.');
    } else {
      setRsvps([...rsvps, programId]);
      showToast('Sadhu! Your RSVP for this Dhamma program has been confirmed.');
    }
  };

  const activeProgramCoords = selectedProgram
    ? getCoordinatesForLocation(selectedProgram.location)
    : getCoordinatesForLocation(monk.loc);

  const programsList: MonkBanaProgram[] =
    monk.banaPrograms && monk.banaPrograms.length > 0
      ? monk.banaPrograms
      : [
          {
            id: 'prog-def-1',
            title: `Weekly Dhamma Sermon & Mindfulness Meditation`,
            date: 'Every Sunday',
            time: '9:00 AM - 11:00 AM',
            location: `${monk.temple}, ${monk.loc}`,
            type: 'Bana & Meditation',
            description: `Guided breath meditation, chanting of Karaniya Metta Sutta, and discourse on practical Dhamma for stress relief.`
          },
          {
            id: 'prog-def-2',
            title: `Poya Full Moon Day Retreat & Atasil Program`,
            date: 'Upcoming Full Moon Poya',
            time: '6:30 AM - 5:30 PM',
            location: `${monk.temple}, ${monk.loc}`,
            type: 'Full Day Retreat',
            description: `Observance of Eight Precepts (Atasil), Buddha Pooja, Dhamma discussions, and walking meditation sessions.`
          }
        ];

  const currentProgram = selectedProgram || programsList[0];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-neutral-200 space-y-4">
        {/* Toast */}
        {toast && (
          <div className="fixed top-5 right-5 bg-neutral-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl z-60 animate-bounce">
            {toast}
          </div>
        )}

        {/* Top Header */}
        <div className="flex justify-between items-start pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <img
              src={monk.img}
              alt={monk.name}
              className="w-12 h-12 rounded-xl object-cover border border-neutral-200 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-neutral-900 leading-tight">
                  {monk.name}
                </h3>
                {monk.verified && (
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                )}
              </div>
              <p className="text-xs text-neutral-500">
                {monk.temple} • {monk.loc}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtitle & Invite Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-orange-50/70 p-3.5 rounded-xl border border-orange-200/80">
          <div>
            <h4 className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              Scheduled Programs & Sermons Schedule
            </h4>
            <p className="text-[11px] text-orange-800 mt-0.5">
              Select any program below to view location on the map, agenda, and RSVP.
            </p>
          </div>
          {onInvite && (
            <button
              onClick={() => {
                onClose();
                onInvite(monk);
              }}
              className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors shadow-xs"
            >
              Request Custom Sermon
            </button>
          )}
        </div>

        {/* Two Column Layout: Programs List + Program Details with Map */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Programs List */}
          <div className="md:col-span-5 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {programsList.map((prog) => {
              const isSelected = currentProgram.id === prog.id;
              const isRsvp = rsvps.includes(prog.id);
              return (
                <div
                  key={prog.id}
                  onClick={() => setSelectedProgram(prog)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-orange-50/90 border-orange-400 shadow-xs'
                      : 'bg-white border-neutral-200 hover:border-orange-200 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded">
                      {prog.type}
                    </span>
                    {isRsvp && (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Attending
                      </span>
                    )}
                  </div>
                  <h5 className="font-bold text-xs text-neutral-900 line-clamp-2">
                    {prog.title}
                  </h5>
                  <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-orange-600 shrink-0" />
                    <span>{prog.date}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Program Details & Live Map */}
          <div className="md:col-span-7 bg-neutral-50 rounded-xl border border-neutral-200 p-4 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-white px-2 py-0.5 rounded border border-orange-200">
                {currentProgram.type}
              </span>
              <h4 className="font-bold text-sm text-neutral-900 mt-1.5">
                {currentProgram.title}
              </h4>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                {currentProgram.description}
              </p>

              <div className="grid grid-cols-2 gap-2 mt-3 text-xs bg-white p-2.5 rounded-lg border border-neutral-200/80">
                <div className="flex items-center gap-1.5 text-neutral-700">
                  <Calendar className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span className="truncate">{currentProgram.date}</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-700">
                  <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="truncate">{currentProgram.time}</span>
                </div>
                <div className="col-span-2 flex items-center justify-between text-neutral-700 pt-1 border-t border-neutral-100">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="truncate font-semibold">{currentProgram.location}</span>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${activeProgramCoords.lat},${activeProgramCoords.lng}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-bold text-orange-600 hover:underline flex items-center gap-0.5 shrink-0"
                  >
                    <Navigation className="w-2.5 h-2.5" /> Directions
                  </a>
                </div>
              </div>
            </div>

            {/* Interactive Location Map */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-neutral-500 flex items-center justify-between">
                <span>Temple / Program Venue on Google Maps</span>
                <span className="font-mono">
                  {activeProgramCoords.lat.toFixed(4)}, {activeProgramCoords.lng.toFixed(4)}
                </span>
              </div>
              <div className="h-36 w-full rounded-lg overflow-hidden border border-neutral-200 relative">
                <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['marker', 'geometry']}>
                  <Map
                    defaultCenter={activeProgramCoords}
                    defaultZoom={13}
                    mapId="DEMO_MAP_ID"
                    internalUsageAttributionIds={MAP_ATTRIBUTION_IDS}
                    gestureHandling="greedy"
                    disableDefaultUI={false}
                    className="w-full h-full"
                  >
                    <AdvancedMarker position={activeProgramCoords} title={currentProgram.title}>
                      <Pin background="#ea580c" glyphColor="#ffffff" borderColor="#9a3412" />
                    </AdvancedMarker>
                  </Map>
                </APIProvider>
              </div>
            </div>

            {/* RSVP Button */}
            <div className="pt-2 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => toggleRsvp(currentProgram.id)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                  rsvps.includes(currentProgram.id)
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                }`}
              >
                {rsvps.includes(currentProgram.id) ? (
                  <>
                    <Check className="w-4 h-4" /> RSVP Confirmed (Attending)
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" /> RSVP to Attend Program
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
