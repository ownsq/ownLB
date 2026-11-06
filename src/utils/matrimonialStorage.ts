// Storage and utility for 18+ Matrimonial section
// Excluded from public search-engine indexing by default, supports family management consent

export interface PartnerPreferences {
  ageRange: string;
  minHeight?: string;
  education: string;
  location: string;
  values: string;
}

export interface MatrimonialProfile {
  id: string;
  userId: string;
  title: string;
  fullName: string;
  age: number;
  dob: string;
  gender: "female" | "male";
  religion: string;
  casteOrCommunity?: string;
  horoscopeStatus: "Horoscope Available" | "Non-Horoscope" | "Will Share on Request";
  education: string;
  degree?: string;
  profession: string;
  employerOrBusiness?: string;
  height: string;
  locationCity: string;
  locationCountry: string;
  citizenship: string;
  bio: string;
  partnerPreferences: PartnerPreferences;
  photoUrl: string;
  photoPrivacy: "public" | "request_only" | "blurred";
  contactPrivacy: "request_only" | "open";
  contactEmail: string;
  contactPhone: string;
  managedBy: "self" | "parents" | "sibling" | "guardian";
  managerName?: string;
  managerContact?: string;
  consentConfirmed: boolean;
  status: "active" | "paused" | "removed";
  createdAt: string;
  updatedAt: string;
  viewsCount: number;
}

export interface MatrimonialInterest {
  id: string;
  profileId: string;
  profileTitle: string;
  senderId: string;
  senderName: string;
  senderAge: number;
  senderProfession: string;
  senderLocation: string;
  senderEmail: string;
  senderPhone?: string;
  senderPhoto?: string;
  message: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

const MATRIMONIAL_PROFILES_KEY = "lanka_matrimonial_profiles_v1";
const MATRIMONIAL_INTERESTS_KEY = "lanka_matrimonial_interests_v1";

const DEFAULT_MATRIMONIAL_PROFILES: MatrimonialProfile[] = [
  {
    id: "mat-1",
    userId: "usr-mat-1",
    title: "Qualified Sinhala Buddhist Software Engineer (31, Melbourne)",
    fullName: "Tharindu Perera",
    age: 31,
    dob: "1994-03-15",
    gender: "male",
    religion: "Sinhala Buddhist",
    horoscopeStatus: "Horoscope Available",
    education: "B.Sc. (Hons) Software Engineering, Monash University",
    profession: "Senior Cloud Solutions Architect",
    employerOrBusiness: "Global Tech Enterprise, Australia",
    height: "5' 10\"",
    locationCity: "Melbourne",
    locationCountry: "Australia",
    citizenship: "Australian Citizen / Dual Citizen",
    bio: "Teetotaler, non-smoker, deeply grounded in Theravada Buddhist values. Active in community temple Dana and weekend hiking. Seeking a kind, educated partner who values family harmony, cultural roots, and mutual professional growth.",
    partnerPreferences: {
      ageRange: "26 - 30",
      education: "University Graduate / Professional",
      location: "Australia or willing to relocate",
      values: "Buddhist ethical grounding, compassionate, family-oriented"
    },
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    photoPrivacy: "public",
    contactPrivacy: "request_only",
    contactEmail: "perera.family.mat@gmail.com",
    contactPhone: "+61 455 501 234",
    managedBy: "parents",
    managerName: "Mr. & Mrs. Perera (Parents)",
    managerContact: "+61 455 501 234",
    consentConfirmed: true,
    status: "active",
    createdAt: "Apr 10, 2025",
    updatedAt: "May 15, 2025",
    viewsCount: 248
  },
  {
    id: "mat-2",
    userId: "usr-mat-2",
    title: "Doctor / Medical Registrar (29, Los Angeles, USA)",
    fullName: "Dinithi Jayawardene",
    age: 29,
    dob: "1996-08-22",
    gender: "female",
    religion: "Sinhala Buddhist",
    horoscopeStatus: "Will Share on Request",
    education: "M.D. (Internal Medicine), UCLA Medical Center",
    profession: "Medical Resident / Physician",
    employerOrBusiness: "Southern California Health System",
    height: "5' 5\"",
    locationCity: "Los Angeles, CA",
    locationCountry: "USA",
    citizenship: "US Permanent Resident / Green Card",
    bio: "Values mindful living, quiet retreats, reading, and classical Sri Lankan arts. Looking for an educated, well-mannered gentleman with genuine Buddhist moral character and good conversational connection.",
    partnerPreferences: {
      ageRange: "29 - 34",
      education: "Medical Doctor, Engineer, or Master's Professional",
      location: "North America preferred",
      values: "Kindness, intellectual curiosity, cultural connection"
    },
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
    photoPrivacy: "request_only",
    contactPrivacy: "request_only",
    contactEmail: "jayawardene.dinithi.mat@yahoo.com",
    contactPhone: "+1 (818) 555-0149",
    managedBy: "self",
    consentConfirmed: true,
    status: "active",
    createdAt: "May 02, 2025",
    updatedAt: "May 22, 2025",
    viewsCount: 312
  },
  {
    id: "mat-3",
    userId: "damika1316@gmail.com",
    title: "Accountant & Finance Specialist (32, Toronto, Canada)",
    fullName: "Kavindu Silva",
    age: 32,
    dob: "1993-11-04",
    gender: "male",
    religion: "Sinhala Buddhist",
    horoscopeStatus: "Horoscope Available",
    education: "CPA, B.Comm Accounting, University of Toronto",
    profession: "Senior Financial Analyst",
    employerOrBusiness: "Canadian Banking Corporation",
    height: "5' 9\"",
    locationCity: "Toronto, ON",
    locationCountry: "Canada",
    citizenship: "Canadian Citizen",
    bio: "Warm, respectful, and family-oriented devotee. Enjoys travel, community volunteer work, and cooking. Looking for an open-hearted companion for a peaceful and supportive marriage.",
    partnerPreferences: {
      ageRange: "27 - 32",
      education: "Degree holder / Employed professional",
      location: "Canada or USA",
      values: "Buddhist principles, mutual respect, positivity"
    },
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
    photoPrivacy: "public",
    contactPrivacy: "request_only",
    contactEmail: "silva.toronto.mat@gmail.com",
    contactPhone: "+1 (416) 555-0182",
    managedBy: "sibling",
    managerName: "Chathura Silva (Elder Brother)",
    managerContact: "+1 (416) 555-0182",
    consentConfirmed: true,
    status: "active",
    createdAt: "Apr 28, 2025",
    updatedAt: "May 19, 2025",
    viewsCount: 195
  }
];

const DEFAULT_INTERESTS: MatrimonialInterest[] = [
  {
    id: "int-1",
    profileId: "mat-3",
    profileTitle: "Accountant & Finance Specialist (32, Toronto, Canada)",
    senderId: "usr-mat-2",
    senderName: "Dr. Dinithi Jayawardene",
    senderAge: 29,
    senderProfession: "Medical Resident / Physician",
    senderLocation: "Los Angeles, CA, USA",
    senderEmail: "jayawardene.dinithi.mat@yahoo.com",
    senderPhone: "+1 (818) 555-0149",
    senderPhoto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    message: "Ayubowan! I read your profile with great interest and appreciate your Theravada values and balanced outlook. I would be happy to exchange introductory details through family if you feel there is compatibility.",
    status: "pending",
    createdAt: "May 22, 2025, 4:15 PM"
  }
];

export function getMatrimonialProfiles(): MatrimonialProfile[] {
  try {
    const raw = localStorage.getItem(MATRIMONIAL_PROFILES_KEY);
    if (!raw) {
      localStorage.setItem(MATRIMONIAL_PROFILES_KEY, JSON.stringify(DEFAULT_MATRIMONIAL_PROFILES));
      return DEFAULT_MATRIMONIAL_PROFILES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_MATRIMONIAL_PROFILES;
  }
}

export function saveMatrimonialProfile(profile: MatrimonialProfile): void {
  try {
    const all = getMatrimonialProfiles();
    const existingIndex = all.findIndex(p => p.id === profile.id);
    let updated: MatrimonialProfile[];
    if (existingIndex >= 0) {
      updated = [...all];
      updated[existingIndex] = { ...profile, updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) };
    } else {
      updated = [profile, ...all];
    }
    localStorage.setItem(MATRIMONIAL_PROFILES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('lanka_matrimonial_updated', { detail: { profile } }));
  } catch (err) {
    console.error("Error saving matrimonial profile:", err);
  }
}

export function toggleMatrimonialStatus(profileId: string, status: "active" | "paused" | "removed"): void {
  try {
    const all = getMatrimonialProfiles();
    const target = all.find(p => p.id === profileId);
    if (target) {
      target.status = status;
      target.updatedAt = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      localStorage.setItem(MATRIMONIAL_PROFILES_KEY, JSON.stringify(all));
      window.dispatchEvent(new CustomEvent('lanka_matrimonial_updated', { detail: { profileId, status } }));
    }
  } catch (err) {
    console.error("Error toggling matrimonial status:", err);
  }
}

export function getAllMatrimonialInterests(): MatrimonialInterest[] {
  try {
    const raw = localStorage.getItem(MATRIMONIAL_INTERESTS_KEY);
    if (!raw) {
      localStorage.setItem(MATRIMONIAL_INTERESTS_KEY, JSON.stringify(DEFAULT_INTERESTS));
      return DEFAULT_INTERESTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_INTERESTS;
  }
}

export function sendMatrimonialInterest(interest: Omit<MatrimonialInterest, "id" | "createdAt" | "status">): MatrimonialInterest {
  const all = getAllMatrimonialInterests();
  const newInterest: MatrimonialInterest = {
    ...interest,
    id: `int-${Date.now()}`,
    status: "pending",
    createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  };
  const updated = [newInterest, ...all];
  try {
    localStorage.setItem(MATRIMONIAL_INTERESTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('lanka_matrimonial_interest_sent', { detail: { interest: newInterest } }));
  } catch (err) {
    console.error("Error sending interest:", err);
  }
  return newInterest;
}

export function updateInterestStatus(interestId: string, status: "accepted" | "declined"): void {
  try {
    const all = getAllMatrimonialInterests();
    const target = all.find(i => i.id === interestId);
    if (target) {
      target.status = status;
      localStorage.setItem(MATRIMONIAL_INTERESTS_KEY, JSON.stringify(all));
      window.dispatchEvent(new CustomEvent('lanka_matrimonial_interest_updated', { detail: { interestId, status } }));
    }
  } catch (err) {
    console.error("Error updating interest status:", err);
  }
}

// Aliases for unified imports
export const getStoredMatrimonialProfiles = getMatrimonialProfiles;
export const getStoredInterests = getAllMatrimonialInterests;
