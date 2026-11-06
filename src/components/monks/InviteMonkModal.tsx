import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, MapPin, User, Mail, Phone, CheckCircle2, Sparkles, Building2, Globe } from "lucide-react";
import { Monk } from "../../data/monksData";
import { subscribeMonks } from "../../lib/firestoreService";

interface InviteMonkModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonk?: Monk | null;
  monks?: Monk[];
  onSuccess?: (details: any) => void;
}

export function InviteMonkModal({ isOpen, onClose, selectedMonk, monks, onSuccess }: InviteMonkModalProps) {
  const [dbMonks, setDbMonks] = useState<Monk[]>(monks || []);
  const [monkId, setMonkId] = useState<string | number>(selectedMonk ? selectedMonk.id : "");
  const [customMonkName, setCustomMonkName] = useState("");
  const [eventType, setEventType] = useState("Bana Program (Dhamma Sermon)");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("18:30");
  const [format, setFormat] = useState<"in_person" | "online">("in_person");
  const [venue, setVenue] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [organizerEmail, setOrganizerEmail] = useState("");
  const [organizerPhone, setOrganizerPhone] = useState("");
  const [attendees, setAttendees] = useState("25 - 50");
  const [requestedTopic, setRequestedTopic] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (monks && monks.length > 0) {
      setDbMonks(monks);
      return;
    }
    const unsub = subscribeMonks((items) => {
      setDbMonks(items);
      if (!selectedMonk && items.length > 0 && !monkId) {
        setMonkId(items[0].id);
      }
    });
    return () => unsub();
  }, [monks, selectedMonk]);

  useEffect(() => {
    if (selectedMonk) {
      setMonkId(selectedMonk.id);
    } else if (dbMonks.length > 0 && !monkId) {
      setMonkId(dbMonks[0].id);
    }
  }, [selectedMonk, dbMonks]);

  if (!isOpen) return null;

  const activeMonk = selectedMonk || dbMonks.find(m => String(m.id) === String(monkId)) || dbMonks[0] || null;
  const monkDisplayName = activeMonk ? activeMonk.name : (customMonkName.trim() || "Respected Venerable Thero");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (onSuccess) {
      onSuccess({
        monkName: monkDisplayName,
        eventType,
        date,
        time,
        format,
        venue: venue || (activeMonk ? activeMonk.temple : ""),
        organizerName
      });
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-neutral-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl backdrop-blur-sm flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Invite Monk for Program</h3>
              <p className="text-xs text-orange-100 mt-0.5">
                Organize a bana program, meditation retreat, or Dhamma school session
              </p>
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-neutral-900">Invitation Request Dispatched!</h4>
            <p className="text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
              Your request for <span className="font-semibold text-neutral-900">{monkDisplayName}</span> has been logged and sent to the temple coordination office.
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-left text-xs text-orange-950 space-y-1.5 max-w-md mx-auto">
              <div className="font-bold flex items-center justify-between">
                <span>Reference: LB-INV-{Math.floor(100000 + Math.random() * 900000)}</span>
                <span className="bg-orange-200 text-orange-800 px-2 py-0.5 rounded text-[10px]">Pending Confirmation</span>
              </div>
              <p>• Event: {eventType}</p>
              <p>• Date & Time: {date || "To be mutually agreed"} at {time}</p>
              <p>• Format: {format === "in_person" ? "In-Person (" + (venue || (activeMonk ? activeMonk.temple : "Designated Venue")) + ")" : "Online Video / Zoom"}</p>
              <p>• Organizer: {organizerName || "Devotee"} ({organizerPhone || organizerEmail || "Contact on file"})</p>
            </div>
            <p className="text-xs text-neutral-400">
              The temple coordinator typically responds within 24 to 48 hours. May you receive meritorious blessings (Pin Sidhdha Wewa).
            </p>
            <button
              onClick={handleReset}
              className="mt-4 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm transition-all"
            >
              Done & Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Selected Monk Preview */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                Select Respected Venerable Monk
              </label>
              {dbMonks.length > 0 ? (
                <select
                  value={monkId}
                  onChange={(e) => setMonkId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {dbMonks.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {m.temple} ({m.loc || m.city || "Sri Lanka"})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Enter Venerable Monk's Name (e.g. Ven. Kiribathgoda Gnanananda Thero)"
                  value={customMonkName}
                  onChange={(e) => setCustomMonkName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
                  Event / Program Type
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option>Bana Program (Dhamma Sermon)</option>
                  <option>Mindfulness & Meditation Workshop</option>
                  <option>Dhamma School Guest Lecture</option>
                  <option>Seth Pirith Chanting & Blessing</option>
                  <option>Bodhi Pooja Ceremony</option>
                  <option>Memorial Alms-Giving (Mataka Bana)</option>
                  <option>House Warming / Business Blessing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
                  Program Format
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormat("in_person")}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      format === "in_person"
                        ? "bg-orange-50 border-orange-500 text-orange-700"
                        : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" /> In-Person
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat("online")}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      format === "online"
                        ? "bg-orange-50 border-orange-500 text-orange-700"
                        : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" /> Online (Zoom)
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
                  Proposed Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
                  Proposed Time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {format === "in_person" ? (
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
                  Venue / Temple Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 123 Buddhist Vihara Way, Los Angeles or Home Address"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
                  Platform or Online Meeting Link
                </label>
                <input
                  type="text"
                  placeholder="e.g. Zoom / Google Meet link (can be supplied later)"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
                  Organizer Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your Full Name"
                  value={organizerName}
                  onChange={(e) => setOrganizerName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
                  Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={organizerPhone}
                  onChange={(e) => setOrganizerPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
                  Expected Devotees
                </label>
                <select
                  value={attendees}
                  onChange={(e) => setAttendees(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option>10 - 25</option>
                  <option>25 - 50</option>
                  <option>50 - 100</option>
                  <option>100 - 300</option>
                  <option>300+</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
                Requested Sutta or Dhamma Topic (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Mangala Sutta, Karaniya Metta Sutta, Mindfulness for Anxiety"
                value={requestedTopic}
                onChange={(e) => setRequestedTopic(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
                Special Dana or Transport Notes
              </label>
              <textarea
                rows={2}
                placeholder="Details regarding Gilanpasa dana, Katina robes, or vehicle pickup arrangements..."
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-xl text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold shadow-md transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Send Official Invitation
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
