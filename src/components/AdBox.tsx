import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

type AdBoxProps = {
  ariaLabel: string;
};

/**
 * Bloque AdSense responsive, no intrusivo.
 * Coloca este componente en zonas de descanso visual (debajo de la tarjeta, sidebar, etc.)
 */
export default function AdBox({ ariaLabel }: AdBoxProps) {
  const ref = useRef<HTMLModElement | null>(null);
  const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;
  const slotId = import.meta.env.VITE_ADSENSE_SLOT_ID;
  const isConfigured = Boolean(clientId && slotId);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.adsbygoogle || !ref.current || !isConfigured) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Silenciar en desarrollo
    }
  }, [isConfigured]);

  if (!isConfigured) {
    return (
      <div className="w-full mt-8 flex justify-center">
        <div className="w-full max-w-xl min-h-[120px] flex items-center justify-center rounded-3xl border border-dashed border-white/60 bg-white/30 backdrop-blur-sm text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-600/60">
          {ariaLabel}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mt-8 flex justify-center">
      {/* Reserva altura para evitar salto de layout */}
      <div className="w-full max-w-xl min-h-[120px] flex items-center justify-center rounded-3xl border border-white/60 bg-white/40 backdrop-blur-sm shadow-[0_10px_30px_rgba(26,87,76,0.08)]">
        <ins
          ref={ref as any}
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={clientId}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
          aria-label={ariaLabel}
        />
      </div>
    </div>
  );
}
