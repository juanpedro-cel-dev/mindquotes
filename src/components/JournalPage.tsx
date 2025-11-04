import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { motion } from "framer-motion";
import type { JournalPageCopy, Lang } from "../i18n/copy";

const MAX_CONTENT_LENGTH = 800;

type JournalEntry = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

type JournalPageProps = {
  copy: JournalPageCopy;
  storageKey: string | null;
  reduceMotion?: boolean;
  lang: Lang;
  userName?: string;
};

export default function JournalPage({
  copy,
  storageKey,
  reduceMotion = false,
  lang,
  userName,
}: JournalPageProps) {
  const [titleDraft, setTitleDraft] = useState("");
  const [contentDraft, setContentDraft] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  const isReady = Boolean(storageKey);

  useEffect(() => {
    if (!storageKey) {
      setEntries([]);
      return;
    }
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        setEntries([]);
        return;
      }
      const parsed = JSON.parse(raw) as JournalEntry[];
      if (!Array.isArray(parsed)) {
        setEntries([]);
        return;
      }
      const normalized = parsed
        .filter((entry) => typeof entry?.id === "string" && typeof entry?.content === "string")
        .map((entry) => ({
          id: entry.id,
          title: typeof entry.title === "string" ? entry.title : "",
          content: entry.content,
          createdAt:
            typeof entry.createdAt === "string" ? entry.createdAt : new Date().toISOString(),
        }));
      normalized.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      setEntries(normalized);
    } catch (
      error: unknown
    ) {
      console.warn("[JournalPage] failed to parse journal entries", error);
      setEntries([]);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    window.localStorage.setItem(storageKey, JSON.stringify(entries));
  }, [entries, storageKey]);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!storageKey) return;
      const cleanContent = contentDraft.trim();
      if (!cleanContent) return;

      const entry: JournalEntry = {
        id: crypto.randomUUID(),
        title: titleDraft.trim(),
        content: cleanContent,
        createdAt: new Date().toISOString(),
      };

      setEntries((prev) => [entry, ...prev]);
      setTitleDraft("");
      setContentDraft("");
    },
    [contentDraft, storageKey, titleDraft]
  );

  const handleDelete = useCallback((id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const remaining = MAX_CONTENT_LENGTH - contentDraft.length;
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(lang === "es" ? "es-ES" : "en-US", {
        dateStyle: "full",
        timeStyle: "short",
      }),
    [lang]
  );

  const containerInitial = reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 };
  const containerTransition = reduceMotion
    ? { duration: 0 }
    : ({ duration: 0.4, ease: "easeOut" } as const);

  return (
    <motion.div
      initial={containerInitial}
      animate={{ opacity: 1, y: 0 }}
      transition={containerTransition}
      className="mt-12 space-y-6"
    >
      <header className="rounded-3xl border border-white/70 bg-white/60 px-6 py-6 text-center shadow-[0_12px_48px_rgba(20,73,63,0.1)] backdrop-blur-xl sm:text-left">
        <h1 className="text-2xl font-semibold text-teal-950 sm:text-3xl">{copy.title}</h1>
        <p className="mt-2 text-sm text-teal-700/80 sm:text-base">
          {copy.subtitle}
          {userName ? ` (${userName})` : ""}
        </p>
      </header>

      {!isReady ? (
        <div className="rounded-3xl border border-white/70 bg-white/55 px-6 py-8 text-center text-teal-800 shadow-[0_12px_48px_rgba(20,73,63,0.1)]">
          <p className="text-sm sm:text-base">{copy.loginPrompt}</p>
        </div>
      ) : (
        <>
          <section className="rounded-3xl border border-white/70 bg-white/60 px-6 py-6 shadow-[0_12px_48px_rgba(20,73,63,0.08)]">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="journal-title"
                  className="block text-xs font-semibold uppercase tracking-[0.16em] text-teal-700/80"
                >
                  {copy.titleLabel}
                </label>
                <input
                  id="journal-title"
                  name="journal-title"
                  value={titleDraft}
                  onChange={(event) => setTitleDraft(event.currentTarget.value)}
                  placeholder={copy.titlePlaceholder}
                  maxLength={120}
                  className="mt-2 w-full rounded-2xl border border-teal-200/70 bg-white/85 px-4 py-2.5 text-sm text-teal-950 shadow-inner shadow-teal-900/5 placeholder:text-teal-700/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition"
                />
              </div>

              <div>
                <label
                  htmlFor="journal-content"
                  className="block text-xs font-semibold uppercase tracking-[0.16em] text-teal-700/80"
                >
                  {copy.contentLabel}
                </label>
                <textarea
                  id="journal-content"
                  name="journal-content"
                  value={contentDraft}
                  onChange={(event) => setContentDraft(event.currentTarget.value)}
                  maxLength={MAX_CONTENT_LENGTH}
                  rows={6}
                  placeholder={copy.contentPlaceholder}
                  className="mt-2 w-full rounded-2xl border border-teal-200/70 bg-white/85 px-4 py-3 text-sm text-teal-950 shadow-inner shadow-teal-900/5 placeholder:text-teal-700/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition"
                />
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-teal-700/65">
                  <span>{copy.contentHint}</span>
                  <span className={remaining <= 40 ? "font-semibold text-teal-800" : ""}>
                    {remaining}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={!contentDraft.trim()}
                className="inline-flex items-center justify-center rounded-full bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-900/15 transition-all duration-200 hover:bg-teal-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {copy.submit}
              </button>
            </form>
          </section>

          <section className="space-y-4">
            {entries.length === 0 ? (
              <div className="rounded-3xl border border-white/70 bg-white/55 px-6 py-7 text-center text-teal-800 shadow-[0_12px_48px_rgba(20,73,63,0.1)]">
                <p className="text-sm sm:text-base">{copy.empty}</p>
              </div>
            ) : (
              entries.map((entry) => (
                <article
                  key={entry.id}
                  className="rounded-3xl border border-white/70 bg-white/70 px-6 py-5 shadow-[0_12px_48px_rgba(20,73,63,0.08)]"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      {entry.title && (
                        <h2 className="text-lg font-semibold text-teal-950 sm:text-xl">
                          {entry.title}
                        </h2>
                      )}
                      <p className="text-sm text-teal-700/80 whitespace-pre-line">
                        {entry.content}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      className="inline-flex items-center justify-center self-start rounded-full border border-transparent bg-rose-500/90 px-3 py-[4px] text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-sm transition hover:bg-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    >
                      {copy.delete}
                    </button>
                  </div>
                  <p className="mt-4 text-xs uppercase tracking-[0.22em] text-teal-600/70">
                    {copy.timestampPrefix} {dateFormatter.format(new Date(entry.createdAt))}
                  </p>
                </article>
              ))
            )}
          </section>
        </>
      )}
    </motion.div>
  );
}
