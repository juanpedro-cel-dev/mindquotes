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

  useEffect(() => {
    // Evita errores si aún no cargó el script o estamos en desarrollo
    if (typeof window === "undefined") return;
    if (!window.adsbygoogle || !ref.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Silenciar en desarrollo
    }
  }, []);

  return (
    <div className="w-full mt-8 flex justify-center">
      {/* Reserva altura para evitar salto de layout */}
      <div className="w-full max-w-xl min-h-[120px] flex items-center justify-center rounded-3xl border border-white/60 bg-white/40 backdrop-blur-sm shadow-[0_10px_30px_rgba(26,87,76,0.08)]">
        <ins
          ref={ref as any}
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // <-- tu ID
          data-ad-slot="1234567890" // <-- tu slot (luego lo cambiamos)
          data-ad-format="auto"
          data-full-width-responsive="true"
          aria-label={ariaLabel}
        />
      </div>
    </div>
  );
}
