import React, { useEffect, useRef, useState } from "react";
import { ExternalLink, Info, CheckCircle2, ShieldCheck } from "lucide-react";
import { useAd, isPlaceholderClient } from "../../contexts/AdContext";

interface GoogleAdSenseProps {
  client?: string;
  slot?: string;
  format?: string;
  placement?: "home" | "directory" | "classifieds" | "events" | "headerBanner";
  className?: string;
  style?: React.CSSProperties;
}

export function GoogleAdSense({
  client,
  slot,
  format,
  placement,
  className = "",
  style
}: GoogleAdSenseProps) {
  const { adConfig } = useAd();
  const [, setAdLoaded] = useState(false);
  const insRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);

  // Check if placement is disabled in Super Admin Control Panel
  if (placement && adConfig.placements && !adConfig.placements[placement]) {
    return null;
  }

  // If both Google Ads and Custom Ads are disabled, don't render anything
  if (!adConfig.isGoogleAdActive && !adConfig.isCustomAdActive) {
    return null;
  }

  // Determine slot per placement if available
  let resolvedSlot = slot;
  if (!resolvedSlot) {
    if (placement === "home" && adConfig.homeAdSlot) resolvedSlot = adConfig.homeAdSlot;
    else if (placement === "directory" && adConfig.directoryAdSlot) resolvedSlot = adConfig.directoryAdSlot;
    else if (placement === "classifieds" && adConfig.classifiedsAdSlot) resolvedSlot = adConfig.classifiedsAdSlot;
    else if (placement === "events" && adConfig.eventsAdSlot) resolvedSlot = adConfig.eventsAdSlot;
    else resolvedSlot = adConfig.googleAdSlot || "0987654321";
  }

  const effectiveClient = (client || adConfig.googleAdClient || "ca-pub-1234567890").trim();
  const effectiveSlot = resolvedSlot;
  const effectiveFormat = format || adConfig.googleAdFormat || "auto";
  const isReal = !isPlaceholderClient(effectiveClient);

  useEffect(() => {
    // Only attempt AdSense push if Google Ads are active AND it's a real publisher ID
    if (!adConfig.isGoogleAdActive || !isReal) return;
    if (typeof window === "undefined") return;

    const insElement = insRef.current;
    if (!insElement) return;

    let resizeObserver: ResizeObserver | null = null;
    let animId: number | null = null;

    const executePush = () => {
      if (pushedRef.current) return;
      if (!insRef.current) return;

      // Check if already processed by Google AdSense
      const status = insRef.current.getAttribute("data-adsbygoogle-status");
      if (status === "done") {
        pushedRef.current = true;
        return;
      }

      // Check width to prevent "No slot size for availableWidth=0" TagError
      const availableWidth = insRef.current.offsetWidth;
      if (availableWidth <= 0) {
        return; // wait until measured
      }

      try {
        // @ts-expect-error window.adsbygoogle is injected by Google AdSense
        window.adsbygoogle = window.adsbygoogle || [];
        // @ts-expect-error window.adsbygoogle push
        window.adsbygoogle.push({});
        pushedRef.current = true;
        setAdLoaded(true);
      } catch (err) {
        console.warn("Google AdSense push caught safely:", err);
      }
    };

    if (insElement.offsetWidth > 0) {
      executePush();
    } else {
      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            if (entry.contentRect.width > 0 && !pushedRef.current) {
              executePush();
              if (resizeObserver) resizeObserver.disconnect();
              break;
            }
          }
        });
        resizeObserver.observe(insElement);
      } else {
        animId = requestAnimationFrame(() => {
          executePush();
        });
      }
    }

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      if (animId) cancelAnimationFrame(animId);
    };
  }, [effectiveClient, effectiveSlot, effectiveFormat, adConfig.isGoogleAdActive, isReal]);

  return (
    <div className={`bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-2xs ${className}`}>
      {/* Header Label / AdChoices styling */}
      <div className="px-3 py-1.5 bg-neutral-50/80 border-b border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
        <div className="flex items-center gap-1.5">
          <span className="font-bold uppercase tracking-wider text-[10px] text-neutral-500 bg-neutral-200/80 px-1.5 py-0.5 rounded">
            Ad
          </span>
          <span className="font-medium text-neutral-600">Google AdSense</span>
          {isReal && adConfig.isGoogleAdActive ? (
            <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded font-mono">
              <CheckCircle2 className="w-2.5 h-2.5" />
              Live Script
            </span>
          ) : (
            <span className="inline-flex items-center gap-0.5 text-[9px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium">
              <ShieldCheck className="w-2.5 h-2.5" />
              Ad Unit Configured
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 hover:text-neutral-600 transition-colors cursor-pointer" title="AdChoices by Google">
          <Info className="w-3 h-3 text-neutral-400" />
          <span className="text-[10px]">AdChoices</span>
        </div>
      </div>

      {/* Ad Body */}
      <div className="p-3 bg-white min-w-[260px]">
        {/* Real AdSense tag - rendered only for real publisher accounts with layout width */}
        {isReal && adConfig.isGoogleAdActive && (
          <ins
            ref={insRef}
            className="adsbygoogle"
            style={{ display: "block", minHeight: "100px", minWidth: "250px", width: "100%", ...style }}
            data-ad-client={effectiveClient}
            data-ad-slot={effectiveSlot}
            data-ad-format={effectiveFormat}
            data-full-width-responsive="true"
          />
        )}

        {/* Fallback Display / High Fidelity Sandbox Ad Preview (shown when placeholder ID or custom ad active) */}
        {(!isReal || adConfig.isCustomAdActive) && (
          <div className="p-3.5 bg-gradient-to-br from-neutral-50 to-amber-50/30 rounded-xl border border-dashed border-neutral-200 flex flex-col justify-between gap-3 text-left">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                  Sponsored Partner
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {effectiveClient}
                </span>
                {placement && (
                  <span className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold">
                    • {placement}
                  </span>
                )}
              </div>
              <h4 className="font-bold text-sm text-neutral-900 leading-snug">
                {adConfig.title || "Connect with Global Sri Lankan Businesses"}
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed line-clamp-2">
                {adConfig.description || "Find verified community services, travel agencies, catering, and cultural goods worldwide."}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-100/80">
              <span className="text-[11px] text-neutral-400 truncate max-w-[140px]">
                {adConfig.linkUrl && adConfig.linkUrl !== "#" ? adConfig.linkUrl : "google.com/adsense"}
              </span>
              <a
                href={adConfig.linkUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors"
              >
                <span>{adConfig.linkText || "Visit Site"}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
