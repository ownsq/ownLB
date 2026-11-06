import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface AdConfig {
  // Custom fallback ad
  imageUrl: string;
  title: string;
  description: string;
  linkText: string;
  linkUrl: string;
  isCustomAdActive: boolean;

  // Google AdSense Core
  googleAdsenseScript: string;
  googleAdClient: string;
  googleAdSlot: string;
  googleAdFormat: "auto" | "horizontal" | "vertical" | "rectangle";
  isGoogleAdActive: boolean;
  autoAdsEnabled: boolean;

  // Placement Specific Slots
  homeAdSlot: string;
  directoryAdSlot: string;
  classifiedsAdSlot: string;
  eventsAdSlot: string;

  // Placement Toggles
  placements: {
    home: boolean;
    directory: boolean;
    classifieds: boolean;
    events: boolean;
    headerBanner: boolean;
  };

  // Custom Head scripts (verification tags, Google Tag, etc.)
  customHeadScript: string;

  // Global Announcement Banner
  siteAnnouncement: {
    enabled: boolean;
    text: string;
    type: "info" | "warning" | "success" | "alert";
    linkText?: string;
    linkUrl?: string;
  };

  // Anti-sniping & Marketplace Global Settings
  auctionSettings: {
    antiSnipingSeconds: number; // e.g. 120 (2 minutes)
    defaultMinIncrement: number; // e.g. 5
    allowBuyNow: boolean;
    requirePhoneForBids: boolean;
    settlementContactHours: number; // 48
  };

  maintenanceMode: boolean;
}

interface AdContextType {
  adConfig: AdConfig;
  updateAdConfig: (config: Partial<AdConfig>) => void;
  parseAndApplyScript: (scriptCode: string) => { detectedClient: string | null; detectedSlots: string[] };
  resetToDefaults: () => void;
}

const DEFAULT_SCRIPT_TEMPLATE = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890" crossorigin="anonymous"></script>`;

export function isPlaceholderClient(client?: string): boolean {
  if (!client) return true;
  const clean = client.trim().toLowerCase();
  if (
    clean === "ca-pub-1234567890" ||
    clean.includes("1234567890") ||
    clean === "placeholder" ||
    !clean.startsWith("ca-pub-")
  ) {
    return true;
  }
  // Standard Google AdSense publisher ID is ca-pub- followed by 15-20 digits
  return !/^ca-pub-\d{15,20}$/i.test(clean);
}

const defaultAdConfig: AdConfig = {
  imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800",
  title: "Master React & Dhamma Studies",
  description: "Join verified community workshops, cultural programs, and educational courses.",
  linkText: "Learn More",
  linkUrl: "#",
  isCustomAdActive: true,

  googleAdsenseScript: DEFAULT_SCRIPT_TEMPLATE,
  googleAdClient: "ca-pub-1234567890",
  googleAdSlot: "0987654321",
  googleAdFormat: "auto",
  isGoogleAdActive: true,
  autoAdsEnabled: true,

  homeAdSlot: "0987654321",
  directoryAdSlot: "1122334455",
  classifiedsAdSlot: "5566778899",
  eventsAdSlot: "9988776655",

  placements: {
    home: true,
    directory: true,
    classifieds: true,
    events: true,
    headerBanner: false,
  },

  customHeadScript: `<meta name="google-adsense-account" content="ca-pub-1234567890">`,

  siteAnnouncement: {
    enabled: true,
    text: "Welcome to the official Sri Lankan Community Directory & Verified Classified Auctions. Direct mutual contact within 48 hours.",
    type: "info",
    linkText: "View Platform Rules",
    linkUrl: "/classifieds",
  },

  auctionSettings: {
    antiSnipingSeconds: 120,
    defaultMinIncrement: 5,
    allowBuyNow: true,
    requirePhoneForBids: true,
    settlementContactHours: 48,
  },

  maintenanceMode: false,
};

const STORAGE_KEY = "lanka_super_admin_ad_config_v3";

const AdContext = createContext<AdContextType | undefined>(undefined);

export function AdProvider({ children }: { children: ReactNode }) {
  const [adConfig, setAdConfig] = useState<AdConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultAdConfig,
          ...parsed,
          placements: {
            ...defaultAdConfig.placements,
            ...(parsed.placements || {}),
          },
          siteAnnouncement: {
            ...defaultAdConfig.siteAnnouncement,
            ...(parsed.siteAnnouncement || {}),
          },
          auctionSettings: {
            ...defaultAdConfig.auctionSettings,
            ...(parsed.auctionSettings || {}),
          },
        };
      }
    } catch (e) {
      console.error("Failed to load ad configuration from localStorage:", e);
    }
    return defaultAdConfig;
  });

  const updateAdConfig = (partial: Partial<AdConfig>) => {
    setAdConfig((prev) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.error("Failed to save ad config to localStorage:", err);
      }
      return next;
    });
  };

  const parseAndApplyScript = (scriptCode: string): { detectedClient: string | null; detectedSlots: string[] } => {
    const pubIdMatch = scriptCode.match(/ca-pub-\d{10,20}/i);
    const detectedClient = pubIdMatch ? pubIdMatch[0] : null;

    const slotMatches = Array.from(scriptCode.matchAll(/data-ad-slot=["']?(\d{8,15})["']?/gi)).map(m => m[1]);
    const detectedSlots = Array.from(new Set(slotMatches));

    const updates: Partial<AdConfig> = {
      googleAdsenseScript: scriptCode,
    };

    if (detectedClient) {
      updates.googleAdClient = detectedClient;
    }
    if (detectedSlots.length > 0) {
      updates.googleAdSlot = detectedSlots[0];
      if (detectedSlots.length > 1) updates.homeAdSlot = detectedSlots[0];
      if (detectedSlots.length > 2) updates.directoryAdSlot = detectedSlots[1];
    }

    updateAdConfig(updates);
    return { detectedClient, detectedSlots };
  };

  const resetToDefaults = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setAdConfig(defaultAdConfig);
  };

  // Dynamic Injection of Google AdSense Script and Custom Head Code
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SCRIPT_TAG_ID = "lanka-adsense-dynamic-script";
    const META_TAG_ID = "lanka-adsense-account-meta";
    const CUSTOM_HEAD_ID = "lanka-custom-head-tag";

    // 1. Manage Google AdSense script
    let existingScript = document.getElementById(SCRIPT_TAG_ID) as HTMLScriptElement | null;
    const effectiveClient = (adConfig.googleAdClient || "").trim();
    const isRealAccount = !isPlaceholderClient(effectiveClient);

    // Only inject Google's remote script if active AND it's a real non-placeholder account
    if (adConfig.isGoogleAdActive && isRealAccount) {
      // If user pasted a full script src, extract it or construct standard url
      let scriptSrc = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${effectiveClient}`;
      const srcMatch = adConfig.googleAdsenseScript?.match(/src=["']([^"']+)["']/i);
      if (srcMatch && srcMatch[1] && !srcMatch[1].includes("1234567890")) {
        scriptSrc = srcMatch[1];
      }

      if (!existingScript) {
        existingScript = document.createElement("script");
        existingScript.id = SCRIPT_TAG_ID;
        existingScript.async = true;
        existingScript.crossOrigin = "anonymous";
        document.head.appendChild(existingScript);
      }
      if (existingScript.src !== scriptSrc) {
        existingScript.src = scriptSrc;
      }

      // 2. Manage meta verification tag
      let existingMeta = document.getElementById(META_TAG_ID) as HTMLMetaElement | null;
      if (effectiveClient.startsWith("ca-pub-")) {
        if (!existingMeta) {
          existingMeta = document.createElement("meta");
          existingMeta.id = META_TAG_ID;
          existingMeta.name = "google-adsense-account";
          document.head.appendChild(existingMeta);
        }
        existingMeta.content = effectiveClient;
      }

      // 3. Inject auto-ads initialization if requested
      if (adConfig.autoAdsEnabled) {
        try {
          // @ts-expect-error window.adsbygoogle is injected by Google AdSense
          window.adsbygoogle = window.adsbygoogle || [];
        } catch {
          // sandbox environment
        }
      }
    } else {
      // Clean up script if deactivated or using dummy placeholder account
      if (existingScript) {
        existingScript.remove();
      }
      const existingMeta = document.getElementById(META_TAG_ID);
      if (existingMeta && !isRealAccount) {
        existingMeta.remove();
      }
    }

    // 4. Custom Head Script / Meta tag injection
    let existingCustomHead = document.getElementById(CUSTOM_HEAD_ID);
    if (adConfig.customHeadScript && adConfig.customHeadScript.trim()) {
      if (!existingCustomHead) {
        existingCustomHead = document.createElement("div");
        existingCustomHead.id = CUSTOM_HEAD_ID;
        existingCustomHead.style.display = "none";
        document.head.appendChild(existingCustomHead);
      }
      existingCustomHead.innerHTML = adConfig.customHeadScript;
    } else if (existingCustomHead) {
      existingCustomHead.remove();
    }
  }, [
    adConfig.isGoogleAdActive,
    adConfig.googleAdClient,
    adConfig.googleAdsenseScript,
    adConfig.autoAdsEnabled,
    adConfig.customHeadScript,
  ]);

  return (
    <AdContext.Provider value={{ adConfig, updateAdConfig, parseAndApplyScript, resetToDefaults }}>
      {children}
    </AdContext.Provider>
  );
}

export function useAd() {
  const context = useContext(AdContext);
  if (context === undefined) {
    throw new Error("useAd must be used within an AdProvider");
  }
  return context;
}
