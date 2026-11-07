import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { doc, setDoc, deleteDoc, getDocs, collection } from "firebase/firestore";

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Super Admin' | 'Moderator' | 'Verified Seller' | 'Member';
  isPhoneVerified: boolean;
  isBanned: boolean;
  banReason?: string;
  bannedAt?: number;
  bannedDuration?: 'Permanent' | '7 Days' | '30 Days' | 'Indefinite';
  joinedDate: string;
  avatar?: string;
  location?: string;
  notes?: string;
}

const STORAGE_KEY = "lanka_super_admin_users";

export const DEFAULT_MANAGED_USERS: ManagedUser[] = [
  {
    id: "usr-1",
    name: "Damika Senanayake",
    email: "damika1316@gmail.com",
    phone: "+1 (310) 555-0192",
    role: "Super Admin",
    isPhoneVerified: true,
    isBanned: false,
    joinedDate: "Jan 2024",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200",
    location: "Los Angeles, CA, USA",
    notes: "Platform Primary Administrator"
  },
  {
    id: "usr-2",
    name: "Kasun Jayasuriya",
    email: "kasun.j@example.com",
    phone: "+1 (818) 555-8832",
    role: "Verified Seller",
    isPhoneVerified: true,
    isBanned: false,
    joinedDate: "Feb 2024",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    location: "Melbourne, Australia",
    notes: "Verified antique furniture & tea merchant"
  },
  {
    id: "usr-3",
    name: "Dilini Weerakkody",
    email: "dilini.w@example.com",
    phone: "+61 412 345 678",
    role: "Member",
    isPhoneVerified: true,
    isBanned: false,
    joinedDate: "Mar 2024",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
    location: "Sydney, Australia"
  },
  {
    id: "usr-4",
    name: "Shantha Bandara",
    email: "shantha.antique@example.lk",
    phone: "+94 77 123 4567",
    role: "Moderator",
    isPhoneVerified: true,
    isBanned: false,
    joinedDate: "Apr 2024",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    location: "Kandy, Sri Lanka",
    notes: "Community moderator & event organizer"
  },
  {
    id: "usr-5",
    name: "Spammy Account Demo",
    email: "suspicious.bot@mailinator.com",
    phone: "+1 (212) 555-0000",
    role: "Member",
    isPhoneVerified: false,
    isBanned: true,
    banReason: "Suspected automated shill bidding & misleading contact details",
    bannedAt: Date.now() - 5 * 86400 * 1000,
    bannedDuration: "Indefinite",
    joinedDate: "May 2024",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
    location: "Unknown",
    notes: "Flagged by anti-fraud heuristic filter"
  }
];

export function getManagedUsers(): ManagedUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MANAGED_USERS));
      return DEFAULT_MANAGED_USERS;
    }
    const parsed: ManagedUser[] = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.error("Failed to load managed users from localStorage:", err);
    return DEFAULT_MANAGED_USERS;
  }
}

export function saveManagedUsers(users: ManagedUser[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    window.dispatchEvent(new CustomEvent("lanka_users_updated", { detail: users }));
  } catch (err) {
    console.error("Failed to save managed users to localStorage:", err);
  }
}

// Background sync to Firestore
async function syncUserToFirestore(user: ManagedUser) {
  try {
    // Sanitized document to match security rules
    const sanitizedDoc = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      isPhoneVerified: Boolean(user.isPhoneVerified),
      isBanned: Boolean(user.isBanned),
      banReason: user.banReason || "",
      bannedAt: user.bannedAt || 0,
      bannedDuration: user.bannedDuration || "",
      joinedDate: user.joinedDate || "",
      avatar: user.avatar || "",
      location: user.location || "",
      notes: user.notes || ""
    };
    await setDoc(doc(db, "users", user.id), sanitizedDoc, { merge: true });
  } catch (err) {
    console.warn("Could not sync user to Firestore (likely client offline or rules check):", err);
  }
}

async function removeUserFromFirestore(userId: string) {
  try {
    await deleteDoc(doc(db, "users", userId));
  } catch (err) {
    console.warn("Could not delete user from Firestore:", err);
  }
}

export function addManagedUser(userData: Omit<ManagedUser, "id" | "joinedDate">): ManagedUser {
  const users = getManagedUsers();
  
  const dateObj = new Date();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const joinedDate = `${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

  const newUser: ManagedUser = {
    ...userData,
    id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    joinedDate,
    avatar: userData.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
  };

  const updated = [newUser, ...users];
  saveManagedUsers(updated);
  syncUserToFirestore(newUser);
  return newUser;
}

export function removeManagedUser(userId: string): boolean {
  const users = getManagedUsers();
  const next = users.filter(u => u.id !== userId);
  if (next.length !== users.length) {
    saveManagedUsers(next);
    removeUserFromFirestore(userId);
    return true;
  }
  return false;
}

export function banManagedUser(
  userId: string, 
  reason: string, 
  duration: 'Permanent' | '7 Days' | '30 Days' | 'Indefinite' = 'Indefinite'
): boolean {
  const users = getManagedUsers();
  let modified = false;
  let targetUser: ManagedUser | null = null;
  const updated = users.map(u => {
    if (u.id === userId) {
      modified = true;
      targetUser = {
        ...u,
        isBanned: true,
        banReason: reason || "Account suspended by Super Admin for violating community & auction guidelines.",
        bannedAt: Date.now(),
        bannedDuration: duration
      };
      return targetUser;
    }
    return u;
  });

  if (modified) {
    saveManagedUsers(updated);
    if (targetUser) {
      syncUserToFirestore(targetUser);
    }
  }
  return modified;
}

export function unbanManagedUser(userId: string): boolean {
  const users = getManagedUsers();
  let modified = false;
  let targetUser: ManagedUser | null = null;
  const updated = users.map(u => {
    if (u.id === userId) {
      modified = true;
      targetUser = {
        ...u,
        isBanned: false,
        banReason: undefined,
        bannedAt: undefined,
        bannedDuration: undefined
      };
      return targetUser;
    }
    return u;
  });

  if (modified) {
    saveManagedUsers(updated);
    if (targetUser) {
      syncUserToFirestore(targetUser);
    }
  }
  return modified;
}

export function updateUserRole(userId: string, newRole: ManagedUser['role']): boolean {
  const users = getManagedUsers();
  let modified = false;
  let targetUser: ManagedUser | null = null;
  const updated = users.map(u => {
    if (u.id === userId) {
      modified = true;
      targetUser = { ...u, role: newRole };
      return targetUser;
    }
    return u;
  });

  if (modified) {
    saveManagedUsers(updated);
    if (targetUser) {
      syncUserToFirestore(targetUser);
    }
  }
  return modified;
}

export function toggleUserPhoneVerification(userId: string): boolean {
  const users = getManagedUsers();
  let modified = false;
  let targetUser: ManagedUser | null = null;
  const updated = users.map(u => {
    if (u.id === userId) {
      modified = true;
      targetUser = { ...u, isPhoneVerified: !u.isPhoneVerified };
      return targetUser;
    }
    return u;
  });

  if (modified) {
    saveManagedUsers(updated);
    if (targetUser) {
      syncUserToFirestore(targetUser);
    }
  }
  return modified;
}

export function isUserBanned(identifier: string): { banned: boolean; reason?: string } {
  if (!identifier) return { banned: false };
  const users = getManagedUsers();
  const match = users.find(u => 
    u.id === identifier || 
    u.email.toLowerCase() === identifier.toLowerCase() ||
    u.name.toLowerCase() === identifier.toLowerCase() ||
    (u.phone && u.phone === identifier)
  );

  if (match && match.isBanned) {
    return { banned: true, reason: match.banReason || "Account suspended" };
  }
  return { banned: false };
}

export function resetUsersToDefault(): void {
  saveManagedUsers(DEFAULT_MANAGED_USERS);
}
