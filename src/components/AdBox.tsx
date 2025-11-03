import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

/**
 * Bloque AdSense responsive, no intrusivo.
 * Coloca este componente en zonas de descanso visual (debajo de la tarjeta, sidebar, etc.)
 */
export default function AdBox() {
  const ref = useRef<HTMLModElement | null>(null);

  useEffect(() => {
    // Evita errores si aún no cargó el script o en dev
    if (!window || !(window as any).adsbygoogle || !ref.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // Silenciar en desarrollo
      // console.debug("AdSense not ready:", e);
    }
  }, []);

  return (
    <div className="w-full mt-6 flex justify-center">
      {/* Reserva altura para evitar salto de layout */}
      <div className="w-full max-w-xl min-h-[120px] flex items-center justify-center">
        <ins
          ref={ref as any}
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"  // ← tu ID
          data-ad-slot="1234567890"                  // ← tu slot (luego lo cambiamos)
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
