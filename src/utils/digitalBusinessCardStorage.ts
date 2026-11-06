// Storage and utility for Personal and Professional Digital Business Cards
// Provides vCard generation, QR code rendering, and persistence

export interface DigitalCard {
  id: string;
  userId: string;
  type: "personal" | "professional";
  name: string;
  title: string;
  company?: string;
  bio?: string;
  phone: string;
  email: string;
  whatsapp?: string;
  website?: string;
  location: string;
  avatar: string;
  logo?: string;
  themeColor: string;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
    youtube?: string;
    github?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const DIGITAL_CARDS_KEY = "lanka_digital_business_cards_v1";

const DEFAULT_CARDS: DigitalCard[] = [
  {
    id: "card-saminda-prof",
    userId: "damika1316@gmail.com",
    type: "professional",
    name: "Saminda Fernando",
    title: "Senior Solutions Architect & Tech Consultant",
    company: "Lanka Global Innovations Inc.",
    bio: "Helping diaspora enterprises scale with modern cloud platforms and digital transformation. Practicing Theravada Buddhist.",
    phone: "+1 (310) 555-0198",
    email: "saminda.fernando@lankaglobal.com",
    whatsapp: "+13105550198",
    website: "https://lankaglobal.com",
    location: "Los Angeles, CA, USA",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=300",
    themeColor: "orange",
    socialLinks: {
      linkedin: "https://linkedin.com/in/saminda-fernando",
      twitter: "https://twitter.com/saminda_f",
      github: "https://github.com/saminda-f"
    },
    isActive: true,
    createdAt: "Jan 15, 2025",
    updatedAt: "May 20, 2025"
  },
  {
    id: "card-saminda-pers",
    userId: "damika1316@gmail.com",
    type: "personal",
    name: "Saminda Fernando",
    title: "Dhamma Volunteer & Community Seva Coordinator",
    company: "LA Sri Lanka Buddhist Vihara",
    bio: "Coordinating youth Sunday school programs, Vesak lantern workshops, and Sangha almsgiving.",
    phone: "+1 (310) 555-0198",
    email: "damika1316@gmail.com",
    whatsapp: "+13105550198",
    website: "https://lankabuddhist.com",
    location: "Los Angeles, California",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=300",
    themeColor: "amber",
    socialLinks: {
      facebook: "https://facebook.com/saminda.community",
      instagram: "https://instagram.com/saminda.dhamma"
    },
    isActive: true,
    createdAt: "Feb 10, 2025",
    updatedAt: "May 18, 2025"
  }
];

export function getAllDigitalCards(): DigitalCard[] {
  try {
    const raw = localStorage.getItem(DIGITAL_CARDS_KEY);
    if (!raw) {
      localStorage.setItem(DIGITAL_CARDS_KEY, JSON.stringify(DEFAULT_CARDS));
      return DEFAULT_CARDS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CARDS;
  }
}

export function getUserCards(userEmail: string = "damika1316@gmail.com"): DigitalCard[] {
  const all = getAllDigitalCards();
  const searchKey = userEmail.toLowerCase().trim();
  return all.filter(c => c.userId.toLowerCase() === searchKey);
}

export function getDigitalCardById(cardId: string): DigitalCard | undefined {
  const all = getAllDigitalCards();
  return all.find(c => c.id === cardId);
}

export function saveDigitalCard(card: DigitalCard): void {
  try {
    const all = getAllDigitalCards();
    const existingIndex = all.findIndex(c => c.id === card.id);
    let updated: DigitalCard[];
    if (existingIndex >= 0) {
      updated = [...all];
      updated[existingIndex] = { ...card, updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) };
    } else {
      updated = [card, ...all];
    }
    localStorage.setItem(DIGITAL_CARDS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('lanka_digital_cards_updated', { detail: { card } }));
  } catch (err) {
    console.error("Error saving digital card:", err);
  }
}

export function toggleCardActiveStatus(cardId: string): boolean {
  try {
    const all = getAllDigitalCards();
    const target = all.find(c => c.id === cardId);
    if (!target) return false;
    target.isActive = !target.isActive;
    target.updatedAt = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    localStorage.setItem(DIGITAL_CARDS_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('lanka_digital_cards_updated', { detail: { cardId, isActive: target.isActive } }));
    return target.isActive;
  } catch {
    return false;
  }
}

export function deleteDigitalCard(cardId: string): boolean {
  try {
    const all = getAllDigitalCards();
    const filtered = all.filter(c => c.id !== cardId);
    localStorage.setItem(DIGITAL_CARDS_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('lanka_digital_cards_updated', { detail: { deletedId: cardId } }));
    return true;
  } catch {
    return false;
  }
}

// Generate standard vCard (.vcf) formatted string for downloading to iOS and Android contacts
export function generateVCardString(card: DigitalCard): string {
  const nameParts = card.name.trim().split(" ");
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : card.name;

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${lastName};${firstName};;;`,
    `FN:${card.name}`,
    card.company ? `ORG:${card.company};` : "",
    card.title ? `TITLE:${card.title}` : "",
    card.phone ? `TEL;TYPE=CELL,VOICE:${card.phone}` : "",
    card.email ? `EMAIL;TYPE=PREF,INTERNET:${card.email}` : "",
    card.website ? `URL:${card.website}` : "",
    card.location ? `ADR;TYPE=WORK:;;${card.location};;;;` : "",
    card.bio ? `NOTE:${card.bio.replace(/\n/g, '\\n')}` : "",
    card.socialLinks?.linkedin ? `X-SOCIALPROFILE;type=linkedin:${card.socialLinks.linkedin}` : "",
    card.socialLinks?.twitter ? `X-SOCIALPROFILE;type=twitter:${card.socialLinks.twitter}` : "",
    "END:VCARD"
  ].filter(Boolean);

  return lines.join("\r\n");
}

export function downloadVCard(card: DigitalCard): void {
  const vcfContent = generateVCardString(card);
  const blob = new Blob([vcfContent], { type: "text/vcard;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${card.name.replace(/[^a-zA-Z0-9]/g, "_")}_${card.type}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Aliases for unified imports
export const getStoredCards = getAllDigitalCards;
export const toggleCardActive = toggleCardActiveStatus;
