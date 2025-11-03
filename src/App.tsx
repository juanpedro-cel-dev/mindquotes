import { useEffect, useMemo, useState } from "react";
import ZenShell from "./components/ZenShell";
import AdBox from "./components/AdBox";

import quotesES from "./data/quotes.es.json";
import quotesEN from "./data/quotes.en.json";

type Quote = { text: string; author?: string };
type Lang = "es" | "en";

export default function App() {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("mq_lang");
    return saved === "en" || saved === "es" ? saved : "es";
  });
  const [current, setCurrent] = useState<Quote | null>(null);
  const [lastText, setLastText] = useState<string | null>(null);
  const [fading, setFading] = useState(false);
  const [langFading, setLangFading] = useState(false);

  const quotes: Quote[] = useMemo(
    () => (lang === "es" ? quotesES : quotesEN),
    [lang]
  );

  useEffect(() => {
    if (quotes.length) {
      const q = pickRandom(quotes, lastText);
      setCurrent(q);
      setLastText(q.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem("mq_lang", lang);
    if (quotes.length) {
      const q = pickRandom(quotes, lastText);
      setCurrent(q);
      setLastText(q.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const nextQuote = () => {
    if (!quotes.length) return;
    setFading(true);
    setTimeout(() => {
      const q = pickRandom(quotes, lastText);
      setCurrent(q);
      setLastText(q.text);
      setFading(false);
    }, 180);
  };

  const toggleLang = () => {
    setLangFading(true);
    setTimeout(() => {
      setLang((l) => (l === "es" ? "en" : "es"));
      setTimeout(() => setLangFading(false), 180);
    }, 140);
  };

  return (
    <ZenShell>
      <div className="relative mt-12 sm:mt-16 rounded-3xl border border-white/70 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0_0_0_/_0.06)] p-8">
        <section
          className={[
            "relative flex flex-col items-center text-center gap-6 transition-opacity duration-200",
            langFading ? "opacity-0" : "opacity-100",
          ].join(" ")}
        >
          {/* Logo dentro de la tarjeta */}
          <img
            src="/logo-symbol.png"
            alt="MindQuotes symbol"
            className="w-24 sm:w-28 opacity-90 select-none"
          />

          <p className="max-w-prose text-sm text-teal-700/80 mt-2">
          {lang === "es"
             ? "Un momento de calma para seguir creando."
              : "A moment of calm to keep creating."}
          </p>


          {current && (
            <blockquote
              className={[
                "mt-1 text-teal-950 text-xl sm:text-2xl leading-relaxed transition-opacity duration-200",
                fading ? "opacity-0" : "opacity-100",
              ].join(" ")}
            >
              “{current.text}”
              {current.author && (
                <footer className="mt-3 text-teal-700/80 text-base">
                  — {current.author}
                </footer>
              )}
            </blockquote>
          )}

          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={nextQuote}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-teal-600 text-white font-medium shadow-md hover:shadow-lg hover:bg-teal-700 active:scale-95 transition"
            >
              {lang === "es" ? "Nueva frase" : "New quote"}
            </button>

            <button
              onClick={toggleLang}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full border border-teal-300/70 bg-white/70 text-teal-800 hover:bg-white/90 shadow-sm transition"
              title={lang === "es" ? "Cambiar a inglés" : "Switch to Spanish"}
            >
              {lang === "es" ? "Idioma: ES" : "Language: EN"}
            </button>
          </div>

          <p className="mt-5 text-xs text-teal-700/70">
            Beta — centrado en calma, diseño y monetización sin prisa.
          </p>
        </section>
      </div>

      <AdBox />
    </ZenShell>
  );
}

function pickRandom(list: Quote[], last?: string | null): Quote {
  if (list.length <= 1) return list[0]!;
  let q: Quote;
  do {
    q = list[Math.floor(Math.random() * list.length)];
  } while (q.text === last);
  return q;
}
