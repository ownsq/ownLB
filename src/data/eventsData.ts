export interface EventItem {
  id: string;
  isPast: boolean;
  mon: string;
  day: string;
  title: string;
  loc: string;
  coordinates?: { lat: number; lng: number };
  date: string;
  type: string;
  category: "Meditation" | "Talk" | "Learning" | "Music" | "Business" | "Education" | "Workshop" | string;
  attendees: number;
  interested?: number;
  img: string;
  tags: string[];
  desc: string;
  organizer: string;
  organizerEmail?: string;
  coOrganizers?: string[];
  visibility?: "public" | "private";
  isOnline?: boolean;
  onlineMeetingUrl?: string;
  isRecurring?: boolean;
  recurrenceRule?: "Weekly" | "Bi-weekly" | "Monthly" | "Annual Poya" | "None" | string;
  capacity?: number;
  allowGuests?: boolean;
  maxGuestsPerAttendee?: number;
  isCancelled?: boolean;
  cancellationReason?: string;
  announcements?: Array<{ id: string; date: string; message: string; author: string }>;
}

export interface EventRsvpRecord {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  guests: number;
  status: "confirmed" | "waitlist" | "cancelled";
  createdAt: string;
  checkedIn: boolean;
  checkedInAt?: string;
  ticketCode: string;
}

// Initial Events empty array (connected to live Firebase database)
export const INITIAL_EVENTS: EventItem[] = [];
