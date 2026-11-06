import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  MapPin, Clock, Users, Sparkles, Check, Bookmark, Heart,
  Tag, Info, Filter, ArrowRight
} from 'lucide-react';
import { EventItem, EVENT_CATEGORIES, getCategoryBadgeStyle } from '../../pages/Events';

interface EventsCalendarViewProps {
  events: EventItem[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onSelectEvent: (event: EventItem) => void;
  rsvps: string[];
  onToggleRsvp: (eventId: string, e?: React.MouseEvent) => void;
  savedEvents: string[];
  onToggleBookmark: (eventId: string, e?: React.MouseEvent) => void;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const MONTH_ABBRS: Record<string, number> = {
  JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
  JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11
};

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const EventsCalendarView: React.FC<EventsCalendarViewProps> = ({
  events,
  selectedCategory,
  onSelectCategory,
  onSelectEvent,
  rsvps,
  onToggleRsvp,
  savedEvents,
  onToggleBookmark,
}) => {
  // Parse event dates into year, month (0-11), day (1-31)
  const parsedEvents = useMemo(() => {
    return events.map(e => {
      let year = 2025;
      const yearMatch = e.date.match(/\b(202\d)\b/);
      if (yearMatch) {
        year = parseInt(yearMatch[1], 10);
      }
      const monthIdx = MONTH_ABBRS[e.mon.toUpperCase()] ?? 4;
      const dayNum = parseInt(e.day, 10) || 1;
      return {
        ...e,
        parsedYear: year,
        parsedMonth: monthIdx,
        parsedDay: dayNum,
      };
    });
  }, [events]);

  // Find initial month: if any events match selectedCategory, pick their earliest month, otherwise default to May 2025 (earliest event in data)
  const defaultYearMonth = useMemo(() => {
    const matching = selectedCategory === "All" 
      ? parsedEvents 
      : parsedEvents.filter(e => 
          e.category?.toLowerCase() === selectedCategory.toLowerCase() ||
          e.tags.some(t => t.toLowerCase() === selectedCategory.toLowerCase())
        );
    if (matching.length > 0) {
      // Sort by month
      const sorted = [...matching].sort((a, b) => {
        if (a.parsedYear !== b.parsedYear) return a.parsedYear - b.parsedYear;
        return a.parsedMonth - b.parsedMonth;
      });
      return { year: sorted[0].parsedYear, month: sorted[0].parsedMonth };
    }
    return { year: 2025, month: 4 }; // May 2025
  }, [parsedEvents, selectedCategory]);

  const [currentYear, setCurrentYear] = useState<number>(defaultYearMonth.year);
  const [currentMonth, setCurrentMonth] = useState<number>(defaultYearMonth.month);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Sync month when selected category changes if current month has no matching events
  React.useEffect(() => {
    const matching = selectedCategory === "All"
      ? parsedEvents
      : parsedEvents.filter(e => 
          e.category?.toLowerCase() === selectedCategory.toLowerCase() ||
          e.tags.some(t => t.toLowerCase() === selectedCategory.toLowerCase())
        );
    
    const hasInCurrent = matching.some(e => e.parsedYear === currentYear && e.parsedMonth === currentMonth);
    if (!hasInCurrent && matching.length > 0) {
      setCurrentYear(matching[0].parsedYear);
      setCurrentMonth(matching[0].parsedMonth);
      setSelectedDay(matching[0].parsedDay);
    }
  }, [selectedCategory, parsedEvents]);

  // Compute months that have events in the dataset to provide quick month tabs
  const monthsWithEvents = useMemo(() => {
    const monthMap = new Map<string, { year: number; month: number; label: string; count: number }>();
    parsedEvents.forEach(e => {
      const isCategoryMatch = selectedCategory === "All" ||
        e.category?.toLowerCase() === selectedCategory.toLowerCase() ||
        e.tags.some(t => t.toLowerCase() === selectedCategory.toLowerCase());
      
      if (isCategoryMatch) {
        const key = `${e.parsedYear}-${e.parsedMonth}`;
        if (!monthMap.has(key)) {
          monthMap.set(key, {
            year: e.parsedYear,
            month: e.parsedMonth,
            label: `${MONTH_NAMES[e.parsedMonth].slice(0, 3)} ${e.parsedYear}`,
            count: 1
          });
        } else {
          monthMap.get(key)!.count += 1;
        }
      }
    });

    return Array.from(monthMap.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
  }, [parsedEvents, selectedCategory]);

  // Calendar matrix calculation
  const calendarDays = useMemo(() => {
    // Days in current month
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    // First day of week (0 = Sunday)
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

    const days: Array<{
      dayNumber: number | null;
      isCurrentMonth: boolean;
      dateKey: string;
      events: typeof parsedEvents;
      highlightCount: number;
    }> = [];

    // Pre-padding empty days
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({
        dayNumber: null,
        isCurrentMonth: false,
        dateKey: `pad-${i}`,
        events: [],
        highlightCount: 0,
      });
    }

    // Current month days
    for (let day = 1; day <= totalDays; day++) {
      const dayEvents = parsedEvents.filter(
        e => e.parsedYear === currentYear && e.parsedMonth === currentMonth && e.parsedDay === day
      );

      const highlightCount = dayEvents.filter(e => {
        if (selectedCategory === "All") return true;
        return (
          e.category?.toLowerCase() === selectedCategory.toLowerCase() ||
          e.tags.some(t => t.toLowerCase() === selectedCategory.toLowerCase())
        );
      }).length;

      days.push({
        dayNumber: day,
        isCurrentMonth: true,
        dateKey: `${currentYear}-${currentMonth}-${day}`,
        events: dayEvents,
        highlightCount,
      });
    }

    return days;
  }, [currentYear, currentMonth, parsedEvents, selectedCategory]);

  // Gatherings occurring on the selected day
  const selectedDayEvents = useMemo(() => {
    if (selectedDay === null) return [];
    return parsedEvents.filter(
      e => e.parsedYear === currentYear && e.parsedMonth === currentMonth && e.parsedDay === selectedDay
    );
  }, [selectedDay, currentYear, currentMonth, parsedEvents]);

  // Gatherings matching the category in the current month
  const currentMonthCategoryEvents = useMemo(() => {
    return parsedEvents.filter(e => {
      const inMonth = e.parsedYear === currentYear && e.parsedMonth === currentMonth;
      if (!inMonth) return false;
      if (selectedCategory === "All") return true;
      return (
        e.category?.toLowerCase() === selectedCategory.toLowerCase() ||
        e.tags.some(t => t.toLowerCase() === selectedCategory.toLowerCase())
      );
    });
  }, [parsedEvents, currentYear, currentMonth, selectedCategory]);

  // Navigate month
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
    setSelectedDay(null);
  };

  const activeCategoryMeta = useMemo(() => {
    return EVENT_CATEGORIES.find(c => c.id.toLowerCase() === selectedCategory.toLowerCase()) || EVENT_CATEGORIES[0];
  }, [selectedCategory]);

  const CategoryIcon = activeCategoryMeta.icon;

  return (
    <div className="space-y-6">
      {/* Category Highlighting Banner */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
        selectedCategory !== "All"
          ? `${activeCategoryMeta.bgColor} border-amber-200/90 shadow-xs`
          : "bg-neutral-50/80 border-neutral-200"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${activeCategoryMeta.bgColor} ${activeCategoryMeta.color} border border-amber-200/60 shadow-xs`}>
            <CategoryIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Category Calendar Focus
              </span>
              {selectedCategory !== "All" && (
                <span className={`text-[11px] font-black px-2 py-0.5 rounded-md border ${getCategoryBadgeStyle(selectedCategory)}`}>
                  {activeCategoryMeta.label}
                </span>
              )}
            </div>
            <p className="text-sm font-bold text-neutral-900 mt-0.5">
              {selectedCategory === "All" 
                ? `Displaying all ${parsedEvents.length} gatherings on the calendar`
                : `Highlighting upcoming ${activeCategoryMeta.label} gatherings (${currentMonthCategoryEvents.length} in ${MONTH_NAMES[currentMonth]})`
              }
            </p>
          </div>
        </div>

        {/* Quick Month Jump Chips */}
        {monthsWithEvents.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-neutral-500 font-medium mr-1">Months with gatherings:</span>
            {monthsWithEvents.map(m => {
              const isActive = m.year === currentYear && m.month === currentMonth;
              return (
                <button
                  key={`${m.year}-${m.month}`}
                  onClick={() => {
                    setCurrentYear(m.year);
                    setCurrentMonth(m.month);
                    setSelectedDay(null);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all border ${
                    isActive
                      ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                      : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                  }`}
                >
                  {m.label} <span className={`text-[10px] ml-1 px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'}`}>{m.count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Calendar Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        {/* Calendar Navigation Bar */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl text-neutral-900">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h3>
              <p className="text-xs text-neutral-500">
                {currentMonthCategoryEvents.length} {currentMonthCategoryEvents.length === 1 ? 'gathering' : 'gatherings'} scheduled this month
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl border border-neutral-200 hover:bg-white text-neutral-600 hover:text-neutral-900 transition-colors shadow-xs"
              title="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                const now = new Date();
                // Default to May 2025 since events are curated around May-Aug 2025
                setCurrentYear(2025);
                setCurrentMonth(4);
                setSelectedDay(null);
              }}
              className="text-xs font-bold px-3 py-2 rounded-xl border border-neutral-200 hover:bg-white text-neutral-700 transition-colors shadow-xs"
            >
              May 2025
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl border border-neutral-200 hover:bg-white text-neutral-600 hover:text-neutral-900 transition-colors shadow-xs"
              title="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-neutral-100 bg-neutral-100/60 text-center text-xs font-bold text-neutral-600 uppercase tracking-wider py-2.5">
          {DAYS_OF_WEEK.map((day, idx) => (
            <div key={day} className={idx === 0 || idx === 6 ? "text-amber-800" : ""}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Day Cells Grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-neutral-100 bg-neutral-50">
          {calendarDays.map((cell) => {
            if (!cell.isCurrentMonth || cell.dayNumber === null) {
              return (
                <div 
                  key={cell.dateKey} 
                  className="min-h-[95px] sm:min-h-[110px] p-2 bg-neutral-50/50 opacity-40 select-none"
                />
              );
            }

            const dayNum = cell.dayNumber;
            const isSelected = selectedDay === dayNum;
            const hasEvents = cell.events.length > 0;
            const hasHighlightedEvents = cell.highlightCount > 0;

            return (
              <div
                key={cell.dateKey}
                onClick={() => {
                  setSelectedDay(isSelected ? null : dayNum);
                }}
                className={`min-h-[95px] sm:min-h-[115px] p-2 sm:p-2.5 transition-all flex flex-col justify-between cursor-pointer relative group ${
                  isSelected 
                    ? "bg-amber-50/80 ring-2 ring-inset ring-amber-500 z-10" 
                    : hasHighlightedEvents 
                      ? "bg-white hover:bg-amber-50/40" 
                      : hasEvents 
                        ? "bg-white hover:bg-neutral-50" 
                        : "bg-white/70 hover:bg-neutral-50"
                }`}
              >
                {/* Day Header Row */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center justify-center text-xs sm:text-sm font-bold w-6 h-6 rounded-full transition-colors ${
                    isSelected
                      ? "bg-amber-600 text-white font-black shadow-xs"
                      : hasHighlightedEvents
                        ? "bg-amber-100 text-amber-900 font-extrabold ring-1 ring-amber-300"
                        : "text-neutral-700 group-hover:text-neutral-900"
                  }`}>
                    {dayNum}
                  </span>

                  {cell.events.length > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      hasHighlightedEvents
                        ? "bg-amber-500 text-white shadow-xs"
                        : "bg-neutral-200 text-neutral-600"
                    }`}>
                      {cell.events.length}
                    </span>
                  )}
                </div>

                {/* Event previews in calendar cell */}
                <div className="space-y-1 my-1 flex-1 overflow-hidden">
                  {cell.events.slice(0, 2).map((ev) => {
                    const isCategoryMatch = selectedCategory === "All" ||
                      ev.category?.toLowerCase() === selectedCategory.toLowerCase() ||
                      ev.tags.some(t => t.toLowerCase() === selectedCategory.toLowerCase());

                    return (
                      <div
                        key={ev.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(ev);
                        }}
                        className={`text-[10px] px-1.5 py-1 rounded-md font-semibold truncate transition-transform hover:scale-[1.02] shadow-2xs flex items-center gap-1 ${
                          isCategoryMatch
                            ? `${getCategoryBadgeStyle(ev.category)} ring-1 ring-amber-300/80 font-bold`
                            : "bg-neutral-100 text-neutral-600 border border-neutral-200/80 opacity-70"
                        }`}
                        title={`${ev.title} (${ev.category}) - ${ev.date}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-current opacity-80" />
                        <span className="truncate">{ev.title}</span>
                      </div>
                    );
                  })}

                  {cell.events.length > 2 && (
                    <div className="text-[9px] font-bold text-neutral-500 pl-1">
                      +{cell.events.length - 2} more
                    </div>
                  )}
                </div>

                {/* Highlight glow pulse for selected category gatherings */}
                {hasHighlightedEvents && (
                  <div className="w-full flex items-center justify-end">
                    <span className="inline-block w-2 h-2 rounded-full bg-orange-500 ring-2 ring-orange-200 animate-pulse" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend Footer */}
        <div className="p-3.5 bg-neutral-50/80 border-t border-neutral-100 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold text-neutral-600 text-[11px] uppercase tracking-wider">Category Legend:</span>
            {EVENT_CATEGORIES.filter(c => c.id !== "All").map(c => {
              const isSelected = selectedCategory.toLowerCase() === c.id.toLowerCase();
              return (
                <button
                  key={c.id}
                  onClick={() => onSelectCategory(isSelected ? "All" : c.id)}
                  className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border transition-all ${
                    isSelected
                      ? "ring-2 ring-neutral-900 font-bold scale-105"
                      : "opacity-80 hover:opacity-100"
                  } ${getCategoryBadgeStyle(c.id)}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-neutral-500 font-medium flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-neutral-400" />
            <span>Click any day to inspect gatherings; click an event to view full details.</span>
          </div>
        </div>
      </div>

      {/* Selected Day Inspector Panel */}
      {selectedDay !== null && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-200/80">
            <div className="flex items-center gap-2">
              <div className="bg-amber-600 text-white font-black text-sm px-3 py-1 rounded-lg">
                {MONTH_NAMES[currentMonth].slice(0, 3)} {selectedDay}
              </div>
              <h4 className="font-bold text-neutral-900 text-base">
                Gatherings on {MONTH_NAMES[currentMonth]} {selectedDay}, {currentYear}
              </h4>
              <span className="text-xs text-neutral-500 font-medium">
                ({selectedDayEvents.length} {selectedDayEvents.length === 1 ? 'event' : 'events'})
              </span>
            </div>

            <button
              onClick={() => setSelectedDay(null)}
              className="text-xs text-neutral-500 hover:text-neutral-800 font-semibold underline"
            >
              Close Day View
            </button>
          </div>

          {selectedDayEvents.length === 0 ? (
            <p className="text-xs text-neutral-500 py-3 text-center">
              No gatherings scheduled on this date.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedDayEvents.map(event => {
                const isMatchingCategory = selectedCategory === "All" ||
                  event.category?.toLowerCase() === selectedCategory.toLowerCase() ||
                  event.tags.some(t => t.toLowerCase() === selectedCategory.toLowerCase());

                return (
                  <div
                    key={event.id}
                    onClick={() => onSelectEvent(event)}
                    className={`bg-white rounded-xl border p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
                      isMatchingCategory
                        ? "border-amber-300 ring-1 ring-amber-300/60"
                        : "border-neutral-200"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getCategoryBadgeStyle(event.category)}`}>
                          {event.category}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => onToggleBookmark(event.id, e)}
                            className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 text-[11px] font-semibold ${
                              savedEvents.includes(event.id)
                                ? 'bg-rose-50 text-rose-600 border-rose-200'
                                : 'text-neutral-400 hover:text-rose-600 border-neutral-200 hover:bg-rose-50/50'
                            }`}
                            title={savedEvents.includes(event.id) ? "Favorited in My Bookmarked Events" : "Favorite this event (Save to Profile)"}
                          >
                            <Heart className={`w-3.5 h-3.5 ${savedEvents.includes(event.id) ? 'fill-rose-500 text-rose-500' : 'text-neutral-400'}`} />
                            <span className="hidden sm:inline">{savedEvents.includes(event.id) ? "Favorited" : "Favorite"}</span>
                          </button>
                        </div>
                      </div>

                      <h5 className="font-bold text-neutral-900 text-sm hover:text-amber-700 transition-colors line-clamp-1 mb-1">
                        {event.title}
                      </h5>

                      <p className="text-xs text-neutral-500 flex items-center gap-1 mb-1">
                        <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span>{event.date}</span>
                      </p>

                      <p className="text-xs text-neutral-500 flex items-center gap-1 line-clamp-1 mb-2">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span>{event.loc}</span>
                      </p>

                      <p className="text-xs text-neutral-600 line-clamp-2 bg-neutral-50 p-2 rounded-lg border border-neutral-100">
                        {event.desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-neutral-100 text-xs">
                      <span className="text-neutral-500 flex items-center gap-1 text-[11px]">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        <strong>{event.attendees + (rsvps.includes(event.id) ? 1 : 0)}</strong> attending
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => onToggleRsvp(event.id, e)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                            rsvps.includes(event.id)
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100"
                          }`}
                        >
                          {rsvps.includes(event.id) ? "Attending ✓" : "RSVP"}
                        </button>
                        <button
                          onClick={() => onSelectEvent(event)}
                          className="px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 rounded-lg flex items-center gap-1 border border-neutral-200"
                        >
                          <span>Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Upcoming Category Gatherings Highlight Strip */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h4 className="font-bold text-neutral-900 text-sm">
              Upcoming {selectedCategory === "All" ? "Community" : activeCategoryMeta.label} Gatherings on the Calendar
            </h4>
          </div>
          <span className="text-xs text-neutral-400">
            Click any gathering to jump to its calendar date
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {parsedEvents
            .filter(e => {
              if (selectedCategory === "All") return true;
              return (
                e.category?.toLowerCase() === selectedCategory.toLowerCase() ||
                e.tags.some(t => t.toLowerCase() === selectedCategory.toLowerCase())
              );
            })
            .slice(0, 4)
            .map(e => (
              <div
                key={e.id}
                onClick={() => {
                  setCurrentYear(e.parsedYear);
                  setCurrentMonth(e.parsedMonth);
                  setSelectedDay(e.parsedDay);
                }}
                className="group cursor-pointer p-3 rounded-xl border border-neutral-200 hover:border-amber-300 hover:bg-amber-50/30 transition-all flex items-center gap-3 bg-white"
              >
                <div className="flex flex-col items-center justify-center bg-rose-50 text-rose-600 border border-rose-100 rounded-lg w-10 h-10 shrink-0">
                  <span className="text-[9px] font-bold uppercase leading-none">{e.mon}</span>
                  <span className="text-sm font-black leading-none mt-0.5">{e.day}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded border ${getCategoryBadgeStyle(e.category)} mb-0.5`}>
                    {e.category}
                  </span>
                  <h5 className="font-bold text-neutral-900 text-xs truncate group-hover:text-amber-700 transition-colors">
                    {e.title}
                  </h5>
                  <p className="text-[10px] text-neutral-500 truncate">{e.loc}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
