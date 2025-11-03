import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { MusicCopy, QuoteCategory } from "../i18n/copy";
import { tracksByMood, type MoodTrack } from "../audio/tracks";

type StoredMusicPrefs = {
  volume: number;
  wasPlaying: boolean;
};

type ActiveSource = {
  stop: () => void;
};

type ErrorKey = "noContext" | "init";

const STORAGE_KEY = "mq_music_settings";
const DEFAULT_VOLUME = 0.5;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

type MusicPlayerProps = {
  copy: MusicCopy;
  trackMood: QuoteCategory | null;
  autoPlayMood: QuoteCategory | null;
  onAutoPlayConsumed?: () => void;
  onDisableTrack: () => void;
};

export default function MusicPlayer({
  copy,
  trackMood,
  autoPlayMood,
  onAutoPlayConsumed,
  onDisableTrack,
}: MusicPlayerProps) {
  const contextRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const sourcesRef = useRef<ActiveSource[]>([]);
  const bufferCacheRef = useRef<Map<string, AudioBuffer>>(new Map());
  const activeTrackMoodRef = useRef<QuoteCategory | null>(null);

  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rememberedPlay, setRememberedPlay] = useState(false);
  const [errorKey, setErrorKey] = useState<ErrorKey | null>(null);
  const [trackLoadingMood, setTrackLoadingMood] =
    useState<QuoteCategory | null>(null);
  const [activeTrackMood, setActiveTrackMood] =
    useState<QuoteCategory | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  const trackInfo: MoodTrack | null = trackMood
    ? tracksByMood[trackMood]
    : null;

  // Carga preferencias previas
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as StoredMusicPrefs;
      if (typeof parsed.volume === "number") {
        setVolume(clamp(parsed.volume, 0, 1));
      }
      if (parsed.wasPlaying) {
        setRememberedPlay(true);
      }
    } catch {
      // Ignorar errores de parseo
    }
  }, []);

  // Persiste cambios
  useEffect(() => {
    if (typeof window === "undefined") return;
    const data: StoredMusicPrefs = {
      volume,
      wasPlaying: isPlaying,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [isPlaying, volume]);

  const updateActiveTrack = useCallback((mood: QuoteCategory | null) => {
    setActiveTrackMood(mood);
    activeTrackMoodRef.current = mood;
  }, []);

  const ensureContext = useCallback(async () => {
    setErrorKey(null);
    try {
      if (!contextRef.current) {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        if (!Ctx) {
          setErrorKey("noContext");
          return null;
        }
        contextRef.current = new Ctx();
      }
      if (contextRef.current.state === "suspended") {
        await contextRef.current.resume();
      }
      if (!gainRef.current) {
        const gain = contextRef.current.createGain();
        gain.gain.value = volume;
        gain.connect(contextRef.current.destination);
        gainRef.current = gain;
      }
      return contextRef.current;
    } catch {
      setErrorKey("init");
      return null;
    }
  }, [volume]);

  const fadeStopSources = useCallback(
    (immediate = false) => {
      const ctx = contextRef.current;
      sourcesRef.current.forEach((node) => {
        try {
          node.stop();
        } catch {
          // evitar romper la UX si alguna fuente ya terminó
        }
      });
      sourcesRef.current = [];
      updateActiveTrack(null);
      setIsPlaying(false);
      if (immediate && ctx) {
        void ctx.suspend();
      }
    },
    [updateActiveTrack]
  );

  const buildAmbientScene = useCallback(
    (ctx: AudioContext, master: GainNode) => {
      const active: ActiveSource[] = [];
      const now = ctx.currentTime;

      const addPad = (frequency: number, detune: number, pan: number) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = frequency;
        osc.detune.value = detune;

        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.08 + Math.random() * 0.04;

        const modGain = ctx.createGain();
        modGain.gain.value = 6 + Math.random() * 4;

        lfo.connect(modGain);
        modGain.connect(osc.detune);

        const envelope = ctx.createGain();
        envelope.gain.setValueAtTime(0, now);

        const panner = ctx.createStereoPanner();
        panner.pan.value = pan;

        osc.connect(envelope).connect(panner).connect(master);
        lfo.start();
        osc.start();

        envelope.gain.linearRampToValueAtTime(
          0.55 + Math.random() * 0.15,
          now + 2.5
        );

        active.push({
          stop: () => {
            const stopAt = ctx.currentTime;
            envelope.gain.cancelScheduledValues(stopAt);
            envelope.gain.setTargetAtTime(0, stopAt, 1.2);
            setTimeout(() => {
              try {
                osc.stop();
                lfo.stop();
              } catch {
                /* noop */
              }
              osc.disconnect();
              lfo.disconnect();
              modGain.disconnect();
              envelope.disconnect();
              panner.disconnect();
            }, 1600);
          },
        });
      };

      [196, 262, 311].forEach((freq, index) => {
        const detune = (index - 1) * 4 + Math.random() * 2;
        const pan = index === 1 ? 0 : index === 0 ? -0.25 : 0.25;
        addPad(freq, detune, pan);
      });

      const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < output.length; i += 1) {
        output[i] = (Math.random() * 2 - 1) * 0.4;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "lowpass";
      noiseFilter.frequency.value = 900;
      noiseFilter.Q.value = 0.5;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0, now);
      noiseGain.gain.setTargetAtTime(0.08, now + 0.5, 2.8);

      noiseSource
        .connect(noiseFilter)
        .connect(noiseGain)
        .connect(master);
      noiseSource.start();

      active.push({
        stop: () => {
          const stopAt = ctx.currentTime;
          noiseGain.gain.cancelScheduledValues(stopAt);
          noiseGain.gain.setTargetAtTime(0, stopAt, 1.6);
          setTimeout(() => {
            try {
              noiseSource.stop();
            } catch {
              /* noop */
            }
            noiseSource.disconnect();
            noiseFilter.disconnect();
            noiseGain.disconnect();
          }, 1800);
        },
      });

      sourcesRef.current = active;
    },
    []
  );

  const startAmbient = useCallback(async () => {
    const ctx = await ensureContext();
    if (!ctx || !gainRef.current) return false;
    const master = gainRef.current;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(volume, ctx.currentTime, 0.6);
    fadeStopSources();
    buildAmbientScene(ctx, master);
    updateActiveTrack(null);
    setIsPlaying(true);
    setRememberedPlay(true);
    return true;
  }, [
    buildAmbientScene,
    ensureContext,
    fadeStopSources,
    updateActiveTrack,
    volume,
  ]);

  const loadTrackBuffer = useCallback(
    async (track: MoodTrack): Promise<AudioBuffer | null> => {
      if (bufferCacheRef.current.has(track.src)) {
        return bufferCacheRef.current.get(track.src)!;
      }
      setTrackLoadingMood(track.mood);
      setTrackError(null);
      try {
        const ctx = await ensureContext();
        if (!ctx) return null;
        const response = await fetch(track.src);
        if (!response.ok) throw new Error("track fetch failed");
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        bufferCacheRef.current.set(track.src, audioBuffer);
        return audioBuffer;
      } catch {
        setTrackError(copy.errorInit);
        return null;
      } finally {
        setTrackLoadingMood((current) =>
          current === track.mood ? null : current
        );
      }
    },
    [copy.errorInit, ensureContext]
  );

  const playTrackBuffer = useCallback(
    async (buffer: AudioBuffer, mood: QuoteCategory) => {
      const ctx = await ensureContext();
      if (!ctx || !gainRef.current) return false;
      fadeStopSources();
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(gainRef.current);
      const startTime = ctx.currentTime + 0.08;
      source.start(startTime);
      const stop = () => {
        const now = ctx.currentTime;
        try {
          gainRef.current?.gain.setTargetAtTime(0, now, 0.5);
          source.stop(now + 0.6);
        } catch {
          /* noop */
        }
        source.disconnect();
      };
      sourcesRef.current = [{ stop }];
      updateActiveTrack(mood);
      setIsPlaying(true);
      setRememberedPlay(true);
      const now = ctx.currentTime;
      gainRef.current.gain.cancelScheduledValues(now);
      gainRef.current.gain.setTargetAtTime(volume, now, 0.6);
      return true;
    },
    [ensureContext, fadeStopSources, updateActiveTrack, volume]
  );

  const handleTogglePlayback = useCallback(async () => {
    if (isPlaying) {
      fadeStopSources();
      return;
    }

    if (trackInfo) {
      const buffer = await loadTrackBuffer(trackInfo);
      if (buffer) {
        const started = await playTrackBuffer(buffer, trackInfo.mood);
        if (started) return;
      }
    }

    await startAmbient();
  }, [
    fadeStopSources,
    isPlaying,
    loadTrackBuffer,
    playTrackBuffer,
    startAmbient,
    trackInfo,
  ]);

  const handleVolumeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = clamp(Number(event.currentTarget.value) / 100, 0, 1);
      setVolume(next);
      const ctx = contextRef.current;
      const gain = gainRef.current;
      if (ctx && gain) {
        gain.gain.cancelScheduledValues(ctx.currentTime);
        gain.gain.setTargetAtTime(next, ctx.currentTime, 0.4);
      }
    },
    []
  );

  useEffect(() => {
    return () => {
      fadeStopSources(true);
      if (contextRef.current) {
        void contextRef.current.close();
      }
    };
  }, [fadeStopSources]);

  useEffect(() => {
    setTrackError(null);
  }, [trackMood]);

  useEffect(() => {
    if (!trackMood && activeTrackMoodRef.current) {
      fadeStopSources();
    }
  }, [trackMood, fadeStopSources]);

  useEffect(() => {
    if (!autoPlayMood || autoPlayMood !== trackMood) {
      return;
    }
    if (isPlaying && activeTrackMoodRef.current === trackMood) {
      onAutoPlayConsumed?.();
      return;
    }

    let cancelled = false;
    const run = async () => {
      if (!trackInfo) return;
      const buffer = await loadTrackBuffer(trackInfo);
      if (cancelled || !buffer) return;
      await playTrackBuffer(buffer, trackInfo.mood);
    };

    run().finally(() => {
      if (!cancelled) {
        onAutoPlayConsumed?.();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    autoPlayMood,
    trackMood,
    isPlaying,
    trackInfo,
    loadTrackBuffer,
    playTrackBuffer,
    onAutoPlayConsumed,
  ]);

  const handleSwitchToSynth = useCallback(async () => {
    const resumeAfter = isPlaying && activeTrackMoodRef.current === trackMood;
    fadeStopSources();
    onDisableTrack();
    if (resumeAfter) {
      await startAmbient();
    }
  }, [
    fadeStopSources,
    isPlaying,
    onDisableTrack,
    startAmbient,
    trackMood,
  ]);

  const volumeLabel = useMemo(() => Math.round(volume * 100), [volume]);

  const formatTrackLabel = useCallback(
    (template: string, track: MoodTrack) =>
      template
        .replace("{title}", track.title)
        .replace("{author}", track.author),
    []
  );

  const description = useMemo(() => {
    if (trackInfo) {
      if (trackLoadingMood === trackInfo.mood) {
        return copy.trackLoading;
      }
      if (trackError) {
        return trackError;
      }
      if (activeTrackMood === trackInfo.mood) {
        return isPlaying
          ? formatTrackLabel(copy.trackActive, trackInfo)
          : formatTrackLabel(copy.trackPaused, trackInfo);
      }
    }
    if (isPlaying) {
      return copy.descPlaying;
    }
    if (rememberedPlay) {
      return copy.descResume;
    }
    return copy.descIdle;
  }, [
    activeTrackMood,
    copy.trackActive,
    copy.trackLoading,
    copy.trackPaused,
    copy.descIdle,
    copy.descPlaying,
    copy.descResume,
    formatTrackLabel,
    isPlaying,
    rememberedPlay,
    trackError,
    trackInfo,
    trackLoadingMood,
  ]);

  const buttonLabel = isPlaying ? copy.pause : copy.play;
  const errorMessage =
    errorKey === "noContext"
      ? copy.errorNoContext
      : errorKey === "init"
      ? copy.errorInit
      : null;

  return (
    <section className="mt-8 rounded-3xl border border-white/70 bg-white/55 backdrop-blur-xl px-6 py-5 shadow-[0_12px_40px_rgba(20,73,63,0.12)] transition">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700/70">
            {copy.title}
          </p>
          <p className="mt-1 text-sm text-teal-800/85" aria-live="polite">
            {description}
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleTogglePlayback}
            className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold shadow-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-95 ${
              isPlaying
                ? "bg-emerald-500/90 text-white hover:bg-emerald-500"
                : "bg-white/90 text-teal-800 border border-teal-200/70 hover:bg-white"
            }`}
            aria-pressed={isPlaying}
          >
            {buttonLabel}
          </button>

          <label className="flex items-center gap-3 text-sm text-teal-800/80">
            <span className="sr-only">{copy.volumeSrLabel}</span>
            <span className="min-w-[4.5rem] text-xs uppercase tracking-[0.18em] text-teal-700/70">
              {copy.volume}
            </span>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(volume * 100)}
              onChange={handleVolumeChange}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={volumeLabel}
              aria-label={copy.volumeAria}
              className="h-2 w-full appearance-none rounded-full bg-gradient-to-r from-teal-200/80 via-teal-300/70 to-teal-500/70 accent-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            />
            <span className="tabular-nums text-xs text-teal-700/80">
              {volumeLabel}%
            </span>
          </label>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {trackInfo && (
          <button
            type="button"
            onClick={handleSwitchToSynth}
            className="inline-flex items-center justify-center rounded-full border border-teal-200/70 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700 shadow-sm transition-all duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-95"
          >
            {copy.trackSwitchOff}
          </button>
        )}
      </div>

      {errorMessage && (
        <p className="mt-3 rounded-2xl border border-red-200/60 bg-red-50/70 px-4 py-2 text-xs text-red-600/80">
          {errorMessage}
        </p>
      )}
    </section>
  );
}
