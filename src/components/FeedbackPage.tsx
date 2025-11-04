import { useEffect, useMemo, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import type { FeedbackCopy } from "../i18n/copy";

const MESSAGE_LIMIT = 600;
const MIN_MESSAGE_LENGTH = 10;

type SubmitPayload = {
  message: string;
  email?: string;
};

type FeedbackPageProps = {
  copy: FeedbackCopy;
  onSubmit: (payload: SubmitPayload) => Promise<{ success: boolean; error?: unknown }>;
  onBack: () => void;
  reduceMotion?: boolean;
  userName?: string;
  userEmail?: string;
};

export default function FeedbackPage({
  copy,
  onSubmit,
  onBack,
  reduceMotion = false,
  userName,
  userEmail,
}: FeedbackPageProps) {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(userEmail ?? "");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEmail(userEmail ?? "");
  }, [userEmail]);

  const trimmedMessage = message.trim();
  const trimmedEmail = email.trim();
  const remaining = useMemo(
    () => Math.max(0, MESSAGE_LIMIT - message.length),
    [message.length]
  );
  const isSubmitDisabled =
    status === "loading" ||
    trimmedMessage.length < MIN_MESSAGE_LENGTH ||
    message.length > MESSAGE_LIMIT;

  const initialMotion = reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 };
  const transition = reduceMotion
    ? { duration: 0 }
    : ({ duration: 0.4, ease: "easeOut" } as const);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitDisabled) return;
    setStatus("loading");
    setError(null);
    try {
      const result = await onSubmit({
        message: trimmedMessage,
        email: trimmedEmail ? trimmedEmail : undefined,
      });
      if (result.success) {
        setStatus("success");
        setMessage("");
      } else {
        setStatus("error");
        setError(copy.error);
      }
    } catch {
      setStatus("error");
      setError(copy.error);
    }
  };

  return (
    <motion.div
      initial={initialMotion}
      animate={{ opacity: 1, y: 0 }}
      transition={transition}
      className="mt-12 sm:mt-16"
    >
      <div className="rounded-3xl border border-white/70 bg-white/65 px-6 py-8 shadow-[0_12px_48px_rgba(20,73,63,0.12)] backdrop-blur-xl">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-teal-950 sm:text-3xl">
            {copy.title}
          </h1>
          <p className="text-sm text-teal-700/80 sm:text-base">
            {copy.subtitle}
            {userName ? ` (${userName})` : ""}
          </p>
        </div>

        {status === "success" && (
          <div className="mt-6 rounded-2xl border border-teal-200/70 bg-teal-50/80 px-4 py-3 text-sm text-teal-800 shadow-inner">
            <p className="font-semibold">{copy.successTitle}</p>
            <p className="mt-1 text-teal-700/80">{copy.successDescription}</p>
          </div>
        )}

        {status === "error" && error && (
          <div className="mt-6 rounded-2xl border border-rose-200/70 bg-rose-50/90 px-4 py-3 text-sm text-rose-700 shadow-inner">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="feedback-message"
              className="block text-xs font-semibold uppercase tracking-[0.16em] text-teal-700/80"
            >
              {copy.messageLabel}
            </label>
            <textarea
              id="feedback-message"
              name="feedback-message"
              value={message}
              onChange={(event) => setMessage(event.currentTarget.value)}
              maxLength={MESSAGE_LIMIT}
              rows={6}
              placeholder={copy.messagePlaceholder}
              className="mt-3 w-full rounded-2xl border border-teal-200/70 bg-white/85 px-4 py-3 text-sm text-teal-950 shadow-inner shadow-teal-900/5 placeholder:text-teal-700/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition"
              aria-describedby="feedback-message-hint feedback-message-remaining"
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-teal-700/65">
              <span id="feedback-message-hint">{copy.messageHint}</span>
              <span
                id="feedback-message-remaining"
                className={remaining <= 40 ? "font-semibold text-teal-800" : ""}
              >
                {message.length}/{MESSAGE_LIMIT}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="feedback-email"
              className="block text-xs font-semibold uppercase tracking-[0.16em] text-teal-700/80"
            >
              {copy.emailLabel}
            </label>
            <input
              id="feedback-email"
              name="feedback-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              placeholder="tu@email.com"
              className="w-full rounded-2xl border border-teal-200/70 bg-white/85 px-4 py-2.5 text-sm text-teal-950 shadow-inner shadow-teal-900/5 placeholder:text-teal-700/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition"
            />
            <p className="text-xs text-teal-700/60">{copy.emailOptional}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="inline-flex items-center justify-center rounded-full bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-900/15 transition-all duration-200 hover:bg-teal-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "loading" ? copy.loading : copy.submit}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="text-sm font-semibold text-teal-700/80 underline-offset-4 hover:underline"
            >
              {copy.back}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
