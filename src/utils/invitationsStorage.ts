// Storage and coordination for ceremony & event invitations to Buddhist Monks and Famous Public Figures

export interface EventInvitation {
  id: string;
  targetType: "monk" | "famous_person";
  targetId: string | number;
  targetName: string;
  targetAvatar: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  eventTitle: string;
  eventType: string; // e.g. "Sanghika Dana", "Bana Deshana", "Pirith Chanting", "Cultural Keynote", "Youth Panel"
  date: string;
  time: string;
  location: string;
  isOnline: boolean;
  expectedAudience: string;
  transportProvided?: boolean;
  transportDetails?: string;
  danaOrHonorariumNotes?: string;
  participationArrangements: string;
  specialNotes?: string;
  status: "pending" | "accepted" | "declined" | "changes_suggested";
  suggestedChanges?: string;
  createdAt: string;
  respondedAt?: string;
}

const INVITATIONS_STORAGE_KEY = "lanka_ceremony_event_invitations_v1";

const DEFAULT_INVITATIONS: EventInvitation[] = [];

export function getAllInvitations(): EventInvitation[] {
  try {
    const raw = localStorage.getItem(INVITATIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(INVITATIONS_STORAGE_KEY, JSON.stringify(DEFAULT_INVITATIONS));
      return DEFAULT_INVITATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_INVITATIONS;
  }
}

export function getUserInvitations(userEmail: string = "damika1316@gmail.com"): EventInvitation[] {
  const all = getAllInvitations();
  const searchKey = userEmail.toLowerCase().trim();
  return all.filter(inv => inv.senderId.toLowerCase() === searchKey || inv.senderEmail.toLowerCase() === searchKey);
}

export function createInvitation(invitation: Omit<EventInvitation, "id" | "createdAt" | "status">): EventInvitation {
  const all = getAllInvitations();
  const newInv: EventInvitation = {
    ...invitation,
    id: `inv-${Date.now()}`,
    status: "pending",
    createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };
  const updated = [newInv, ...all];
  try {
    localStorage.setItem(INVITATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('lanka_invitations_updated', { detail: { invitation: newInv } }));
  } catch (err) {
    console.error("Error creating invitation:", err);
  }
  return newInv;
}

export function updateInvitationStatus(
  invitationId: string, 
  status: "accepted" | "declined" | "changes_suggested",
  suggestedChanges?: string
): void {
  try {
    const all = getAllInvitations();
    const target = all.find(i => i.id === invitationId);
    if (target) {
      target.status = status;
      if (suggestedChanges) target.suggestedChanges = suggestedChanges;
      target.respondedAt = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      localStorage.setItem(INVITATIONS_STORAGE_KEY, JSON.stringify(all));
      window.dispatchEvent(new CustomEvent('lanka_invitations_updated', { detail: { invitationId, status } }));
    }
  } catch (err) {
    console.error("Error updating invitation status:", err);
  }
}

export function deleteInvitation(invitationId: string): void {
  try {
    const all = getAllInvitations();
    const updated = all.filter(i => i.id !== invitationId);
    localStorage.setItem(INVITATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('lanka_invitations_updated', { detail: { invitationId, deleted: true } }));
  } catch (err) {
    console.error("Error deleting invitation:", err);
  }
}

export const getStoredInvitations = getAllInvitations;
