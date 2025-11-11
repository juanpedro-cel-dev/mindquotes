import { useEffect } from "react";

const ADSENSE_SCRIPT_ID = "mindquotes-adsense-loader";

const cleanupAdsense = () => {
  if (typeof document === "undefined") {
    return;
  }
  const existing = document.getElementById(ADSENSE_SCRIPT_ID);
  if (existing) {
    existing.remove();
  }
  if (typeof window !== "undefined" && "adsbygoogle" in window) {
    delete (window as any).adsbygoogle;
  }
};

export function useAdsenseLoader(enabled: boolean, clientId?: string) {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!enabled || !clientId) {
      cleanupAdsense();
      return;
    }

    if (document.getElementById(ADSENSE_SCRIPT_ID)) {
      return;
    }

    const script = document.createElement("script");
    script.id = ADSENSE_SCRIPT_ID;
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);

    return () => {
      if (!enabled) {
        cleanupAdsense();
      }
    };
  }, [enabled, clientId]);
}
