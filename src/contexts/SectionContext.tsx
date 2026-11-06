import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home, Sparkles, CheckCircle2 } from "lucide-react";

export type SectionKey =
  | "directory"
  | "classifieds"
  | "events"
  | "temples"
  | "restaurants"
  | "monks"
  | "famous"
  | "learn"
  | "videos"
  | "communityBoard"
  | "travelBuddies"
  | "matrimonial"
  | "digitalCards";

export interface SectionMetadata {
  key: SectionKey;
  name: string;
  path: string;
  category: "Core Features" | "Buddhist Directory" | "Social & Community";
  description: string;
  isSubFeature?: boolean;
}

export const SECTION_METADATA_LIST: SectionMetadata[] = [
  {
    key: "directory",
    name: "People & Member Directory",
    path: "/directory",
    category: "Core Features",
    description: "Browse verified member profiles, professions, interests, and private member messaging."
  },
  {
    key: "classifieds",
    name: "Classifieds & Timed Auctions",
    path: "/classifieds",
    category: "Core Features",
    description: "Post advertisements, set asking prices, timed bidding auctions, anti-sniping soft close, and mutual contact."
  },
  {
    key: "events",
    name: "Community Events & RSVPs",
    path: "/events",
    category: "Core Features",
    description: "Interactive map, calendar views, RSVP lists, waitlists, attendee check-in QR codes, and organizer tools."
  },
  {
    key: "temples",
    name: "Buddhist Temples Directory",
    path: "/temples",
    category: "Buddhist Directory",
    description: "Monasteries, resident monk information, daily puja schedules, almsgiving bookings, and directions."
  },
  {
    key: "monks",
    name: "Buddhist Monks Directory",
    path: "/monks",
    category: "Buddhist Directory",
    description: "Venerable monks profiles, monastery affiliations, languages spoken, and invitations for Dhamma ceremonies."
  },
  {
    key: "learn",
    name: "Learn Buddhism & Training Courses",
    path: "/learn",
    category: "Buddhist Directory",
    description: "Structured Theravada courses, interactive study player, meditation timer with chimes, and verified certificates."
  },
  {
    key: "videos",
    name: "Dhamma Video Sermons & Media",
    path: "/videos",
    category: "Buddhist Directory",
    description: "Curated YouTube sermons, Dhamma discussions, and cultural talks from leading Buddhist scholars."
  },
  {
    key: "restaurants",
    name: "Restaurants & Sri Lankan Food",
    path: "/restaurants",
    category: "Social & Community",
    description: "Authentic restaurants, grocery shops, catering services, menus, opening hours, and community reviews."
  },
  {
    key: "famous",
    name: "Famous People & Public Figures",
    path: "/famous",
    category: "Social & Community",
    description: "Prominent personalities, verified representatives, official links, and proposal of speaking engagements."
  },
  {
    key: "communityBoard",
    name: "Community Discussion Board",
    path: "/directory?tab=board",
    category: "Social & Community",
    description: "Public Q&A forum, information sharing, community questions, and topic discussions.",
    isSubFeature: true
  },
  {
    key: "travelBuddies",
    name: "Travel Buddies & Companion Finder",
    path: "/directory?tab=travel",
    category: "Social & Community",
    description: "Publish travel plans, destinations, budgets, and request to coordinate trips privately.",
    isSubFeature: true
  },
  {
    key: "matrimonial",
    name: "Matrimonial Proposals (18+)",
    path: "/directory?tab=matrimonial",
    category: "Social & Community",
    description: "Private matrimonial advertisements with photo permissions and family consent controls.",
    isSubFeature: true
  },
  {
    key: "digitalCards",
    name: "Digital Business Cards & QR",
    path: "/profile",
    category: "Core Features",
    description: "Shareable mobile business cards with downloadable QR codes for offline and contact sharing.",
    isSubFeature: true
  }
];

export interface SectionConfig {
  directory: boolean;
  classifieds: boolean;
  events: boolean;
  temples: boolean;
  restaurants: boolean;
  monks: boolean;
  famous: boolean;
  learn: boolean;
  videos: boolean;
  communityBoard: boolean;
  travelBuddies: boolean;
  matrimonial: boolean;
  digitalCards: boolean;
  disabledSectionNotice: string;
}

const DEFAULT_SECTION_CONFIG: SectionConfig = {
  directory: true,
  classifieds: true,
  events: true,
  temples: true,
  restaurants: true,
  monks: true,
  famous: true,
  learn: true,
  videos: true,
  communityBoard: true,
  travelBuddies: true,
  matrimonial: true,
  digitalCards: true,
  disabledSectionNotice: "This section is temporarily paused by the community administration for routine updates or maintenance."
};

const STORAGE_KEY = "lanka_site_sections_config_v1";

interface SectionContextType {
  sectionConfig: SectionConfig;
  updateSectionConfig: (updates: Partial<SectionConfig>) => void;
  toggleSection: (key: SectionKey) => boolean;
  setSectionEnabled: (key: SectionKey, enabled: boolean) => void;
  isSectionEnabled: (key: SectionKey) => boolean;
  enableAllSections: () => void;
  disableNonCoreSections: () => void;
  resetSectionsToDefault: () => void;
  setDisabledNotice: (notice: string) => void;
  enabledCount: number;
  disabledCount: number;
}

const SectionContext = createContext<SectionContextType | undefined>(undefined);

export function SectionProvider({ children }: { children: ReactNode }) {
  const [sectionConfig, setSectionConfig] = useState<SectionConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return {
          ...DEFAULT_SECTION_CONFIG,
          ...JSON.parse(stored)
        };
      }
    } catch (e) {
      console.error("Failed to load section config from localStorage:", e);
    }
    return DEFAULT_SECTION_CONFIG;
  });

  const saveConfig = (newConfig: SectionConfig) => {
    setSectionConfig(newConfig);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      window.dispatchEvent(new CustomEvent("lanka_sections_updated", { detail: newConfig }));
    } catch (e) {
      console.error("Failed to save section config to localStorage:", e);
    }
  };

  const updateSectionConfig = (updates: Partial<SectionConfig>) => {
    setSectionConfig((prev) => {
      const next = { ...prev, ...updates };
      saveConfig(next);
      return next;
    });
  };

  const toggleSection = (key: SectionKey): boolean => {
    const nextVal = !sectionConfig[key];
    updateSectionConfig({ [key]: nextVal });
    return nextVal;
  };

  const setSectionEnabled = (key: SectionKey, enabled: boolean) => {
    updateSectionConfig({ [key]: enabled });
  };

  const isSectionEnabled = (key: SectionKey): boolean => {
    return Boolean(sectionConfig[key]);
  };

  const setDisabledNotice = (notice: string) => {
    updateSectionConfig({ disabledSectionNotice: notice });
  };

  const enableAllSections = () => {
    const allEnabled: SectionConfig = {
      ...sectionConfig,
      directory: true,
      classifieds: true,
      events: true,
      temples: true,
      restaurants: true,
      monks: true,
      famous: true,
      learn: true,
      videos: true,
      communityBoard: true,
      travelBuddies: true,
      matrimonial: true,
      digitalCards: true
    };
    saveConfig(allEnabled);
  };

  const disableNonCoreSections = () => {
    const minimalPreset: SectionConfig = {
      ...sectionConfig,
      directory: true,
      classifieds: false,
      events: false,
      temples: true,
      restaurants: false,
      monks: true,
      famous: false,
      learn: true,
      videos: false,
      communityBoard: true,
      travelBuddies: false,
      matrimonial: false,
      digitalCards: true
    };
    saveConfig(minimalPreset);
  };

  const resetSectionsToDefault = () => {
    saveConfig(DEFAULT_SECTION_CONFIG);
  };

  const enabledCount = SECTION_METADATA_LIST.filter(s => Boolean(sectionConfig[s.key])).length;
  const disabledCount = SECTION_METADATA_LIST.filter(s => !sectionConfig[s.key]).length;

  return (
    <SectionContext.Provider
      value={{
        sectionConfig,
        updateSectionConfig,
        toggleSection,
        setSectionEnabled,
        isSectionEnabled,
        enableAllSections,
        disableNonCoreSections,
        resetSectionsToDefault,
        setDisabledNotice,
        enabledCount,
        disabledCount
      }}
    >
      {children}
    </SectionContext.Provider>
  );
}

export function useSectionConfig() {
  const context = useContext(SectionContext);
  if (!context) {
    throw new Error("useSectionConfig must be used within a SectionProvider");
  }
  return context;
}

// Section Guard Component: renders children if enabled, or polite disabled notice if disabled
interface SectionGuardProps {
  section?: SectionKey;
  sectionKey?: SectionKey;
  title?: string;
  children: ReactNode;
}

export function SectionGuard({ section, sectionKey, title, children }: SectionGuardProps) {
  const { isSectionEnabled, sectionConfig } = useSectionConfig();
  const targetKey = section || sectionKey;

  if (targetKey && !isSectionEnabled(targetKey)) {
    const meta = SECTION_METADATA_LIST.find(s => s.key === targetKey);
    const displayTitle = title || meta?.name || targetKey;

    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 max-w-lg w-full text-center shadow-xs space-y-4">
          <div className="w-14 h-14 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Section Paused by Admin
            </span>
            <h2 className="text-xl font-bold text-neutral-900">
              {displayTitle} is Temporarily Unavailable
            </h2>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {sectionConfig.disabledSectionNotice || "The community administrator has temporarily disabled this section for routine curation or updates. Please check back shortly."}
            </p>
          </div>

          <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to Home</span>
            </Link>

            <Link
              to="/directory"
              className="px-4 py-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-xl text-xs font-medium transition-colors"
            >
              <span>Explore Directory</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
