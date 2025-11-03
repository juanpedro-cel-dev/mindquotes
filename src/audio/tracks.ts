import type { QuoteCategory } from "../i18n/copy";

export type MoodTrack = {
  src: string;
  title: string;
  author: string;
  mood: QuoteCategory;
  duration?: number;
};

export const tracksByMood: Record<QuoteCategory, MoodTrack> = {
  inspiration: {
    src: "/audio/inspiration-morning-light.mp3",
    title: "Morning Light",
    author: "Keys of Moon",
    mood: "inspiration",
    duration: 180,
  },
  motivation: {
    src: "/audio/motivation-zen-garden.mp3",
    title: "Zen Garden",
    author: "SergePavkinMusic",
    mood: "motivation",
    duration: 210,
  },
  heartbreak: {
    src: "/audio/heartbreak-deep-relaxation.mp3",
    title: "Deep Relaxation",
    author: "Lesfm",
    mood: "heartbreak",
    duration: 240,
  },
};
