import React, { useState, useEffect } from 'react';
import { EventItem } from '../../data/eventsData';
import { EVENT_CATEGORIES } from '../../pages/Events';
import { 
  X, MapPin, Calendar, Clock, Users, Globe, Video, 
  Repeat, Lock, Shield, Check, Sparkles, Image as ImageIcon
} from 'lucide-react';
import { LocationSelection } from './EventLocationPickerModal';

interface EventCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: EventItem | null;
  onSaveEvent: (event: EventItem) => void;
  onOpenMapPicker: () => void;
  selectedLocation?: LocationSelection | null;
}

const PRESET_EVENT_IMAGES = [
  "https://images.unsplash.com/photo-1533050487297-09b450131914?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1544837332-9c1251917f18?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1519408469771-25860931e5f1?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1591522271810-9195b4cb8ecb?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=600"
];

export function EventCreateEditModal({
  isOpen,
  onClose,
  eventToEdit,
  onSaveEvent,
  onOpenMapPicker,
  selectedLocation
}: EventCreateEditModalProps) {
  const isEditing = !!eventToEdit;

  const [formData, setFormData] = useState({
    title: "",
    category: "Meditation",
    mon: "JUN",
    day: "20",
    date: "Jun 20, 2025 • 6:00 PM - 8:00 PM",
    loc: "Buddhist Vihara, Los Angeles, USA",
    coordinates: undefined as { lat: number; lng: number } | undefined,
    type: "Public Event",
    visibility: "public" as "public" | "private",
    isOnline: false,
    onlineMeetingUrl: "",
    isRecurring: false,
    recurrenceRule: "Weekly" as "Weekly" | "Bi-weekly" | "Monthly" | "Annual Poya",
    capacity: 100,
    allowGuests: true,
    maxGuestsPerAttendee: 2,
    img: PRESET_EVENT_IMAGES[0],
    desc: "",
    organizer: "Sri Lankan Community Fellowship",
    organizerEmail: "damika1316@gmail.com"
  });

  // Populate form if editing
  useEffect(() => {
    if (eventToEdit) {
      setFormData({
        title: eventToEdit.title,
        category: eventToEdit.category || "Meditation",
        mon: eventToEdit.mon,
        day: eventToEdit.day,
        date: eventToEdit.date,
        loc: eventToEdit.loc,
        coordinates: eventToEdit.coordinates,
        type: eventToEdit.type || "Public Event",
        visibility: eventToEdit.visibility || "public",
        isOnline: eventToEdit.isOnline || false,
        onlineMeetingUrl: eventToEdit.onlineMeetingUrl || "",
        isRecurring: eventToEdit.isRecurring || false,
        recurrenceRule: (eventToEdit.recurrenceRule as any) || "Weekly",
        capacity: eventToEdit.capacity || 0,
        allowGuests: eventToEdit.allowGuests ?? true,
        maxGuestsPerAttendee: eventToEdit.maxGuestsPerAttendee || 2,
        img: eventToEdit.img || PRESET_EVENT_IMAGES[0],
        desc: eventToEdit.desc || "",
        organizer: eventToEdit.organizer || "Community Organizer",
        organizerEmail: eventToEdit.organizerEmail || "damika1316@gmail.com"
      });
    }
  }, [eventToEdit]);

  // Update location if picked from map
  useEffect(() => {
    if (selectedLocation) {
      setFormData(prev => ({
        ...prev,
        loc: selectedLocation.address,
        coordinates: { lat: selectedLocation.lat, lng: selectedLocation.lng }
      }));
    }
  }, [selectedLocation]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const eventPayload: EventItem = {
      id: eventToEdit ? eventToEdit.id : `e-${Date.now()}`,
      isPast: eventToEdit ? eventToEdit.isPast : false,
      mon: formData.mon,
      day: formData.day,
      title: formData.title.trim(),
      loc: formData.isOnline ? (formData.onlineMeetingUrl || "Online Video Conference") : formData.loc,
      coordinates: formData.isOnline ? undefined : formData.coordinates,
      date: formData.date,
      type: formData.isOnline ? "Online Event" : formData.type,
      category: formData.category,
      attendees: eventToEdit ? eventToEdit.attendees : 1,
      interested: eventToEdit ? eventToEdit.interested : 0,
      img: formData.img,
      tags: [formData.category, formData.type, formData.isOnline ? "Online" : "In-Person"],
      desc: formData.desc.trim(),
      organizer: formData.organizer,
      organizerEmail: formData.organizerEmail,
      visibility: formData.visibility,
      isOnline: formData.isOnline,
      onlineMeetingUrl: formData.onlineMeetingUrl,
      isRecurring: formData.isRecurring,
      recurrenceRule: formData.isRecurring ? formData.recurrenceRule : undefined,
      capacity: Number(formData.capacity) || 0,
      allowGuests: formData.allowGuests,
      maxGuestsPerAttendee: Number(formData.maxGuestsPerAttendee) || 2,
      isCancelled: eventToEdit ? eventToEdit.isCancelled : false
    };

    onSaveEvent(eventPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 md:p-6 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-neutral-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
              {isEditing ? "Edit Gathering" : "Publish Gathering"}
            </span>
            <h3 className="text-lg font-bold text-neutral-900 mt-1">
              {isEditing ? "Update Event Details" : "Organize Community Event"}
            </h3>
            <p className="text-xs text-neutral-500">
              Set up in-person or online gatherings, recurring schedules, attendee limits, and location
            </p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 p-2 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Event Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Annual Vesak Poya Sil & Meditation Retreat"
              className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Visibility & Online Switch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Privacy & Visibility</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, visibility: "public" })}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border ${
                    formData.visibility === "public"
                      ? 'bg-orange-600 text-white border-orange-600'
                      : 'bg-white text-neutral-700 border-neutral-200'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Public</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, visibility: "private" })}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border ${
                    formData.visibility === "private"
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-white text-neutral-700 border-neutral-200'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Private (Invite)</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Format Type</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isOnline: false })}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border ${
                    !formData.isOnline
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-white text-neutral-700 border-neutral-200'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>In-Person</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isOnline: true })}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border ${
                    formData.isOnline
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-neutral-700 border-neutral-200'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Online Virtual</span>
                </button>
              </div>
            </div>
          </div>

          {/* Online Zoom / Meet Link if Online */}
          {formData.isOnline ? (
            <div>
              <label className="block text-xs font-bold text-indigo-700 mb-1">
                Virtual Meeting Link (Zoom, Google Meet, YouTube Live) *
              </label>
              <input
                type="url"
                required
                value={formData.onlineMeetingUrl}
                onChange={(e) => setFormData({ ...formData, onlineMeetingUrl: e.target.value })}
                placeholder="https://zoom.us/j/123456789 or Google Meet URL"
                className="w-full px-3 py-2 bg-indigo-50/50 border border-indigo-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-neutral-700">Venue Address & Location *</label>
                <button
                  type="button"
                  onClick={onOpenMapPicker}
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 px-2.5 py-0.5 rounded-lg border border-orange-200 hover:bg-orange-50 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-orange-600" />
                  <span>Pick on Google Map</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={formData.loc}
                onChange={(e) => setFormData({ ...formData, loc: e.target.value })}
                placeholder="e.g. 5042 S Robertson Blvd, Los Angeles, CA 90035, USA"
                className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}

          {/* Date, Time, Month & Day */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Month</label>
              <select
                value={formData.mon}
                onChange={(e) => setFormData({ ...formData, mon: e.target.value })}
                className="w-full px-2.5 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs"
              >
                {["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"].map(m => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Day</label>
              <input
                type="text"
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                placeholder="25"
                className="w-full px-2.5 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-neutral-700 mb-1">Full Date & Timing Display</label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                placeholder="Jun 20, 2025 • 6:00 PM - 8:30 PM"
                className="w-full px-2.5 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Category & Recurrence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Gathering Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs"
              >
                {EVENT_CATEGORIES.filter(c => c.id !== "All").map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-neutral-700">Recurring Gathering?</label>
                <input
                  type="checkbox"
                  id="recurringCheck"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
              </div>
              {formData.isRecurring ? (
                <select
                  value={formData.recurrenceRule}
                  onChange={(e) => setFormData({ ...formData, recurrenceRule: e.target.value as any })}
                  className="w-full px-3 py-2 bg-orange-50/70 border border-orange-300 rounded-xl text-xs font-semibold text-orange-900"
                >
                  <option value="Weekly">Every Week (Weekly)</option>
                  <option value="Bi-weekly">Every Two Weeks (Bi-weekly)</option>
                  <option value="Monthly">Every Month (Monthly)</option>
                  <option value="Annual Poya">Annual Poya Day Festival</option>
                </select>
              ) : (
                <div className="text-xs text-neutral-400 py-2 italic">One-time gathering</div>
              )}
            </div>
          </div>

          {/* Capacity Limits & Guest Policy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Attendee Limit / Capacity</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  className="w-24 px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs font-bold"
                />
                <span className="text-[11px] text-neutral-500">
                  {formData.capacity > 0 ? "spaces maximum (triggers Waiting List when filled)" : "0 = Unlimited capacity"}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-neutral-700">Allow Extra Guests</label>
                <input
                  type="checkbox"
                  checked={formData.allowGuests}
                  onChange={(e) => setFormData({ ...formData, allowGuests: e.target.checked })}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
              </div>
              {formData.allowGuests && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-600">Max per attendee:</span>
                  <select
                    value={formData.maxGuestsPerAttendee}
                    onChange={(e) => setFormData({ ...formData, maxGuestsPerAttendee: parseInt(e.target.value) || 2 })}
                    className="px-2 py-1 bg-white border border-neutral-300 rounded-lg text-xs font-bold"
                  >
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>+{n} guests</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Image Picker */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Cover Image</label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-2 no-scrollbar">
              {PRESET_EVENT_IMAGES.map((imgUrl, i) => (
                <img
                  key={i}
                  src={imgUrl}
                  alt=""
                  onClick={() => setFormData({ ...formData, img: imgUrl })}
                  className={`w-14 h-10 object-cover rounded-lg cursor-pointer border-2 transition-all shrink-0 ${
                    formData.img === imgUrl ? 'border-orange-600 ring-2 ring-orange-200 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
            <input
              type="text"
              value={formData.img}
              onChange={(e) => setFormData({ ...formData, img: e.target.value })}
              placeholder="Or paste custom image URL..."
              className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Description & Program Schedule</label>
            <textarea
              rows={4}
              value={formData.desc}
              onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
              placeholder="Outline Dana offerings, Dhamma discussion topic, parking instructions, or alms preparation guidelines..."
              className="w-full p-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Organiser details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Organiser Name</label>
              <input
                type="text"
                value={formData.organizer}
                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Organiser Contact Email</label>
              <input
                type="email"
                value={formData.organizerEmail}
                onChange={(e) => setFormData({ ...formData, organizerEmail: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isEditing ? "Save Changes" : "Publish Gathering"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
