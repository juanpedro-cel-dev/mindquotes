import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type Phase = "focus" | "break";

type PresetId = "25-5" | "50-10" | "custom";

type PomodoroConfig = {
  focusMinutes: number;
  breakMinutes: number;
};

const PRESETS: Record<Exclude<PresetId, "custom">, PomodoroConfig> = {
  "25-5": { focusMinutes: 25, breakMinutes: 5 },
  "50-10": { focusMinutes: 50, breakMinutes: 10 },
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

type PomodoroZenProps = {
  lang: "es" | "en";
  reduceMotion?: boolean;
};

export default function PomodoroZen({ lang, reduceMotion = false }: PomodoroZenProps) {
  const [preset, setPreset] = useState<PresetId>("25-5");
  const [config, setConfig] = useState<PomodoroConfig>(PRESETS["25-5"]);
  const [customFocus, setCustomFocus] = useState(30);
  const [customBreak, setCustomBreak] = useState(5);
  const [phase, setPhase] = useState<Phase>("focus");
  const [isRunning, setIsRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(config.focusMinutes * 60);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  const texts = useMemo(
    () =>
      lang === "es"
        ? {
            title: "Pomodoro zen",
            subtitle:
              "Alterna bloques de enfoque profundo con pequeñas pausas conscientes.",
            focusLabel: "Enfoque",
            breakLabel: "Descanso",
            presetsLabel: "Duración",
            customLabel: "Personalizado",
            minutesSuffix: "min",
            start: "Iniciar",
            pause: "Pausar",
            resume: "Reanudar",
            reset: "Reiniciar",
            finishedFocus: "Sesión completada. Respira y estira un poco 🌿",
            finishedBreak: "Descanso terminado. Elige cómo quieres continuar.",
            darkOn: "Modo oscuro",
            darkOff: "Modo claro",
          }
        : {
            title: "Zen Pomodoro",
            subtitle: "Alternate deep focus blocks with gentle mindful breaks.",
            focusLabel: "Focus",
            breakLabel: "Break",
            presetsLabel: "Duration",
            customLabel: "Custom",
            minutesSuffix: "min",
            start: "Start",
            pause: "Pause",
            resume: "Resume",
            reset: "Reset",
            finishedFocus: "Session done. Take a breath and stretch 🌿",
            finishedBreak: "Break finished. Choose how you’d like to continue.",
            darkOn: "Dark mode",
            darkOff: "Light mode",
          },
    [lang]
  );

  const totalSeconds =
    phase === "focus" ? config.focusMinutes * 60 : config.breakMinutes * 60;
  const safeTotalSeconds = totalSeconds || 1;
  const progress = 1 - remainingSeconds / safeTotalSeconds;

  useEffect(() => {
    if (preset !== "custom") {
      const presetConfig = PRESETS[preset as Exclude<PresetId, "custom">];
      setConfig(presetConfig);
      setPhase("focus");
      setIsRunning(false);
      setRemainingSeconds(presetConfig.focusMinutes * 60);
      setLastMessage(null);
    } else {
      const focusMinutes = clamp(customFocus, 5, 120);
      const breakMinutes = clamp(customBreak, 3, 60);
      const nextConfig = { focusMinutes, breakMinutes };
      setConfig(nextConfig);
      setPhase("focus");
      setIsRunning(false);
      setRemainingSeconds(nextConfig.focusMinutes * 60);
      setLastMessage(null);
    }
  }, [preset, customBreak, customFocus]);

  useEffect(() => {
    if (!isRunning) return;
    const tick = () => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          return 0;
        }
        return current - 1;
      });
    };
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (remainingSeconds > 0 || !isRunning) return;
    setIsRunning(false);
    if (phase === "focus") {
      setLastMessage(texts.finishedFocus);
      setPhase("break");
      setRemainingSeconds(config.breakMinutes * 60 || 60 * 5);
    } else {
      setLastMessage(texts.finishedBreak);
      setPhase("focus");
      setRemainingSeconds(config.focusMinutes * 60);
    }
  }, [config.breakMinutes, config.focusMinutes, isRunning, phase, remainingSeconds, texts]);

  const formattedTime = useMemo(() => {
    const total = Math.max(0, remainingSeconds);
    const minutes = Math.floor(total / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (total % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [remainingSeconds]);

  const handleStartPause = () => {
    if (remainingSeconds <= 0) {
      setPhase("focus");
      setRemainingSeconds(config.focusMinutes * 60);
    }
    setIsRunning((current) => !current);
    setLastMessage(null);
  };

  const handleReset = () => {
    setIsRunning(false);
    setPhase("focus");
    setRemainingSeconds(config.focusMinutes * 60);
    setLastMessage(null);
  };

  const containerClass = [
    "rounded-3xl border border-white/70 px-6 py-7 shadow-[0_18px_60px_rgba(20,73,63,0.18)] backdrop-blur-2xl mx-auto max-w-xl",
    darkMode ? "bg-slate-900/90 text-slate-50" : "bg-white/80 text-teal-950",
  ].join(" ");

  const circleClass = [
    "relative mx-auto mt-6 h-48 w-48 rounded-full border-4",
    darkMode
      ? "border-slate-600 bg-slate-900"
      : "border-teal-200 bg-teal-50/80",
  ].join(" ");

  const phaseLabel =
    phase === "focus" ? texts.focusLabel : texts.breakLabel;

  const presetButtonBase =
    "inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:translate-y-[1px]";

  return (
    <motion.section
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.4, ease: "easeOut" }}
      className="mt-12 sm:mt-16"
    >
      <div className={containerClass}>
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold sm:text-3xl">
              {texts.title}
            </h1>
            <p className="mt-1 text-sm opacity-80 sm:text-base">
              {texts.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDarkMode((current) => !current)}
            className="inline-flex items-center justify-center self-start rounded-full border border-teal-300/70 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-teal-900 shadow-sm transition-all duration-200 hover:bg-white/95 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-95"
          >
            {darkMode ? texts.darkOff : texts.darkOn}
          </button>
        </header>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-80">
              {texts.presetsLabel}
            </span>
            <div className="flex flex-wrap gap-2">
              {(["25-5", "50-10"] as const).map((id) => {
                const active = preset === id;
                const label =
                  id === "25-5"
                    ? `25 / 5 ${texts.minutesSuffix}`
                    : `50 / 10 ${texts.minutesSuffix}`;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPreset(id)}
                    className={`${presetButtonBase} ${
                      active
                        ? "border-teal-500/80 bg-teal-500/15 text-teal-50 bg-gradient-to-r from-teal-500/70 to-emerald-500/80"
                        : "border-teal-200/70 bg-white/70 text-teal-800 hover:bg-white/90"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setPreset("custom")}
                className={`${presetButtonBase} ${
                  preset === "custom"
                    ? "border-teal-500/80 bg-teal-500/15 text-teal-900"
                    : "border-teal-200/70 bg-white/70 text-teal-800 hover:bg-white/90"
                }`}
              >
                {texts.customLabel}
              </button>
            </div>
          </div>

          {preset === "custom" && (
            <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
              <label className="flex items-center gap-2">
                <span className="uppercase tracking-[0.16em] opacity-80">
                  {texts.focusLabel}
                </span>
                <input
                  type="number"
                  min={5}
                  max={120}
                  value={customFocus}
                  onChange={(event) =>
                    setCustomFocus(Number(event.currentTarget.value || 0))
                  }
                  className="w-16 rounded-xl border border-teal-200/70 bg-white/80 px-2 py-1 text-xs text-teal-950 shadow-inner shadow-teal-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                />
                <span>{texts.minutesSuffix}</span>
              </label>
              <label className="flex items-center gap-2">
                <span className="uppercase tracking-[0.16em] opacity-80">
                  {texts.breakLabel}
                </span>
                <input
                  type="number"
                  min={3}
                  max={60}
                  value={customBreak}
                  onChange={(event) =>
                    setCustomBreak(Number(event.currentTarget.value || 0))
                  }
                  className="w-16 rounded-xl border border-teal-200/70 bg-white/80 px-2 py-1 text-xs text-teal-950 shadow-inner shadow-teal-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                />
                <span>{texts.minutesSuffix}</span>
              </label>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col items-center gap-6">
          <div className={circleClass}>
            <div
              className="absolute inset-2 rounded-full"
              style={{
                background: `conic-gradient(${
                  darkMode ? "#4ade80" : "#0f766e"
                } ${progress * 360}deg, ${
                  darkMode ? "rgba(15,23,42,0.6)" : "rgba(209,250,229,0.8)"
                } ${progress * 360}deg)`,
              }}
            />
            <div className="absolute inset-6 rounded-full flex flex-col items-center justify-center bg-white/80 text-center text-sm sm:text-base">
              <p className="uppercase tracking-[0.26em] text-teal-700/75">
                {phaseLabel}
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums">
                {formattedTime}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleStartPause}
              className="inline-flex items-center justify-center rounded-full bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-900/15 transition-all duration-200 hover:bg-teal-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-95"
            >
              {isRunning
                ? texts.pause
                : remainingSeconds === config.focusMinutes * 60
                ? texts.start
                : texts.resume}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-full border border-teal-300/70 bg-white/85 px-5 py-2 text-sm font-semibold text-teal-800 shadow-sm transition-all duration-200 hover:bg-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-95"
            >
              {texts.reset}
            </button>
          </div>

          {lastMessage && (
            <div className="mt-2 rounded-2xl border border-teal-200/70 bg-teal-50/90 px-4 py-3 text-xs sm:text-sm text-teal-900 shadow-inner shadow-teal-900/10 text-center max-w-md">
              {lastMessage}
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}

