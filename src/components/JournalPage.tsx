import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import type { JournalPageCopy, Lang } from "../i18n/copy";

const MAX_CONTENT_LENGTH = 800;
const SUPABASE_ENABLED = Boolean(supabase);

type JournalEntry = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

type JournalPageProps = {
  copy: JournalPageCopy;
  storageKey: string;
  reduceMotion?: boolean;
  lang: Lang;
  userName?: string;
  userId?: string | null;
  cloudSyncAllowed: boolean;
  upgradeHint?: string;
};

function loadLocalEntries(key: string): JournalEntry[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as JournalEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry) => typeof entry?.id === "string" && typeof entry?.content === "string")
      .map((entry) => ({
        id: entry.id,
        title: typeof entry.title === "string" ? entry.title : "",
        content: entry.content,
        createdAt:
          typeof entry.createdAt === "string" ? entry.createdAt : new Date().toISOString(),
      }))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  } catch (error) {
    console.warn("[JournalPage] Failed to load local entries", error);
    return [];
  }
}

function mapSupabaseEntry(entry: {
  id: string;
  title: string | null;
  content: string;
  created_at: string;
}): JournalEntry {
  return {
    id: entry.id,
    title: entry.title ?? "",
    content: entry.content,
    createdAt: entry.created_at ?? new Date().toISOString(),
  };
}

export default function JournalPage({
  copy,
  storageKey,
  reduceMotion = false,
  lang,
  userName,
  userId,
  cloudSyncAllowed,
  upgradeHint,
}: JournalPageProps) {
  const [titleDraft, setTitleDraft] = useState("");
  const [contentDraft, setContentDraft] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>(() => loadLocalEntries(storageKey));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mode = SUPABASE_ENABLED && cloudSyncAllowed && userId ? "cloud" : "local";

  useEffect(() => {
    setEntries(loadLocalEntries(storageKey));
  }, [storageKey]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(entries));
  }, [entries, storageKey]);

  useEffect(() => {
    if (mode !== "cloud" || !userId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchEntries = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase!
          .from("journal_entries")
          .select("id,title,content,created_at")
          .eq("profile_id", userId)
          .order("created_at", { ascending: false });
        if (fetchError) throw fetchError;

        let supEntries = (data ?? []).map(mapSupabaseEntry);

        const localEntries = loadLocalEntries(storageKey);
        if (localEntries.length) {
          const payload = localEntries.map((entry) => ({
            profile_id: userId,
            title: entry.title || null,
            content: entry.content,
            created_at: entry.createdAt,
          }));
          const { data: inserted, error: insertError } = await supabase!
            .from("journal_entries")
            .insert(payload)
            .select("id,title,content,created_at");
          if (insertError) {
            console.error("[JournalPage] Failed to import local entries", insertError);
          } else if (inserted?.length) {
            supEntries = [...inserted.map(mapSupabaseEntry), ...supEntries];
          }
          window.localStorage.removeItem(storageKey);
        }

        supEntries.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

        if (!cancelled) {
          setEntries(supEntries);
        }
      } catch (err) {
        console.error("[JournalPage] Supabase fetch failed", err);
        if (!cancelled) {
          setError(copy.syncError);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchEntries();

    return () => {
      cancelled = true;
    };
  }, [copy.syncError, mode, storageKey, userId]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      const cleanContent = contentDraft.trim();
      if (!cleanContent) return;
      const cleanTitle = titleDraft.trim();

      if (mode === "cloud" && userId) {
        setSaving(true);
        try {
          const { data, error: insertError } = await supabase!
            .from("journal_entries")
            .insert({
              profile_id: userId,
              title: cleanTitle || null,
              content: cleanContent,
            })
            .select("id,title,content,created_at")
            .single();
          if (insertError) throw insertError;
          if (data) {
            const mapped = mapSupabaseEntry(data);
            setEntries((prev) => [mapped, ...prev]);
            setTitleDraft("");
            setContentDraft("");
          }
        } catch (err) {
          console.error("[JournalPage] Supabase insert failed", err);
          setError(copy.saveError);
        } finally {
          setSaving(false);
        }
        return;
      }

      const entry: JournalEntry = {
        id: crypto.randomUUID(),
        title: cleanTitle,
        content: cleanContent,
        createdAt: new Date().toISOString(),
      };
      setEntries((prev) => [entry, ...prev]);
      setTitleDraft("");
      setContentDraft("");
    },
    [contentDraft, copy.saveError, mode, titleDraft, userId]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setError(null);
      if (mode === "cloud" && userId) {
        try {
          const { error: deleteError } = await supabase!
            .from("journal_entries")
            .delete()
            .eq("id", id)
            .eq("profile_id", userId);
          if (deleteError) throw deleteError;
          setEntries((prev) => prev.filter((entry) => entry.id !== id));
        } catch (err) {
          console.error("[JournalPage] Supabase delete failed", err);
          setError(copy.deleteError);
        }
        return;
      }

      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    },
    [copy.deleteError, mode, userId]
  );
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

  const infoMessage = mode === "cloud" ? copy.cloudNotice : copy.localNotice;
  const shouldEncourageLogin =
    mode === "local" && SUPABASE_ENABLED && !userId && cloudSyncAllowed;
  const shouldShowUpgradeBanner =
    Boolean(userId && !cloudSyncAllowed && upgradeHint);

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

      <div className="space-y-3">
        <div className="rounded-2xl border border-teal-200/60 bg-white/70 px-4 py-3 text-xs text-teal-700/80 shadow-sm">
          {infoMessage}
        </div>
        {shouldEncourageLogin && (
          <div className="rounded-2xl border border-amber-200/70 bg-amber-50/90 px-4 py-3 text-xs text-amber-800 shadow-sm">
            {copy.loginPrompt}
          </div>
        )}
        {shouldShowUpgradeBanner && (
          <div className="rounded-2xl border border-amber-200/70 bg-amber-50/90 px-4 py-3 text-xs text-amber-800 shadow-sm">
            {upgradeHint}
          </div>
        )}
        {(loading || saving) && (
          <div className="rounded-2xl border border-teal-200/70 bg-teal-50/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-teal-700/80">
            {copy.syncing}
          </div>
        )}
        {error && (
          <div className="rounded-2xl border border-rose-200/70 bg-rose-50/90 px-4 py-3 text-sm text-rose-700 shadow-inner">
            {error}
          </div>
        )}
      </div>

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
            disabled={!contentDraft.trim() || saving}
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
                  onClick={() => {
                    void handleDelete(entry.id);
                  }}
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
    </motion.div>
  );
}
