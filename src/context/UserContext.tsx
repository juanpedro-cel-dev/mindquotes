import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../lib/supabaseClient";
import { type Lang, type QuoteCategory } from "../i18n/copy";

export type FavoriteQuote = {
  id: string;
  text: string;
  author?: string;
  category: QuoteCategory;
  lang: Lang;
};

type User = {
  id?: string;
  name: string;
  premium: boolean;
  favorites: FavoriteQuote[];
  focusMode: boolean;
};

type UserContextValue = {
  user: User | null;
  loading: boolean;
  login: (name: string, premium?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  togglePremium: () => Promise<void>;
  toggleFavorite: (favorite: FavoriteQuote) => Promise<void>;
  setFocusMode: (active: boolean) => Promise<void>;
};

const PROFILE_CACHE_KEY = "mq_profile_cache_v1";
const SUPABASE_ENABLED = Boolean(supabase);

type CachedProfile = {
  id?: string;
  name: string;
  premium?: boolean;
  focusMode?: boolean;
};

const favoritesStorageKey = (name: string) =>
  `mq_favorites_${name.trim().toLowerCase().replace(/\s+/g, "_")}`;

const loadLocalFavorites = (name: string): FavoriteQuote[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(favoritesStorageKey(name));
    if (!stored) return [];
    const parsed = JSON.parse(stored) as FavoriteQuote[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (fav) =>
        typeof fav?.id === "string" &&
        typeof fav?.text === "string" &&
        (fav.author === undefined || typeof fav.author === "string") &&
        typeof fav?.category === "string" &&
        typeof fav?.lang === "string"
    );
  } catch {
    return [];
  }
};

const saveLocalFavorites = (name: string, favorites: FavoriteQuote[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    favoritesStorageKey(name),
    JSON.stringify(favorites)
  );
};

const loadCachedProfile = (): CachedProfile | null => {
  if (typeof window === "undefined") return null;
  try {
    const cached = window.localStorage.getItem(PROFILE_CACHE_KEY);
    if (!cached) return null;
    return JSON.parse(cached) as CachedProfile;
  } catch {
    return null;
  }
};

const saveCachedProfile = (profile: CachedProfile | null) => {
  if (typeof window === "undefined") return;
  if (!profile) {
    window.localStorage.removeItem(PROFILE_CACHE_KEY);
    return;
  }
  window.localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
};

export const createFavoriteId = (
  text: string,
  author: string | undefined,
  lang: Lang
) => `${lang}::${text}::${author ?? ""}`.toLowerCase();

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrateFromCache = useCallback(async () => {
    const cached = loadCachedProfile();
    if (!cached) {
      setLoading(false);
      return;
    }

    if (SUPABASE_ENABLED && cached.id) {
      try {
        const { data, error } = await supabase!
          .from("profiles")
          .select("id,username,premium,focus_mode")
          .eq("id", cached.id)
          .maybeSingle();
        if (error) throw error;
        if (!data) {
          saveCachedProfile(null);
          setLoading(false);
          return;
        }
        const { data: favs } = await supabase!
          .from("favorites")
          .select("text,author,category,lang")
          .eq("profile_id", data.id)
          .order("created_at", { ascending: true });

        const favorites =
          favs?.map((fav: { text: string; author: string | null; category: string; lang: string }) => ({
            id: createFavoriteId(
              fav.text,
              fav.author ?? undefined,
              fav.lang as Lang
            ),
            text: fav.text,
            author: fav.author ?? undefined,
            category: fav.category as QuoteCategory,
            lang: fav.lang as Lang,
          })) ?? [];

        setUser({
          id: data.id,
          name: data.username,
          premium: Boolean(data.premium),
          focusMode: Boolean(data.focus_mode),
          favorites,
        });
        setLoading(false);
        return;
      } catch (error: unknown) {
        console.warn("[UserProvider] Supabase fetch failed:", error);
      }
    }

    // Local fallback
    const favorites = loadLocalFavorites(cached.name);
    setUser({
      id: cached.id,
      name: cached.name,
      premium: Boolean(cached.premium),
      focusMode: Boolean(cached.focusMode),
      favorites,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    hydrateFromCache();
  }, [hydrateFromCache]);

  const login = useCallback(
    async (name: string, premium = false) => {
      const cleanName = name.trim();
      if (!cleanName) return;

      if (!SUPABASE_ENABLED) {
        const favorites = loadLocalFavorites(cleanName);
        const focusMode = false;
        setUser({
          id: crypto.randomUUID(),
          name: cleanName,
          premium,
          focusMode,
          favorites,
        });
        saveCachedProfile({
          id: undefined,
          name: cleanName,
          premium,
          focusMode,
        });
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase!
          .from("profiles")
          .upsert(
            { username: cleanName, premium },
            { onConflict: "username" }
          )
          .select("id,username,premium,focus_mode")
          .single();
        if (error) throw error;

        const { data: favs, error: favError } = await supabase!
          .from("favorites")
          .select("text,author,category,lang")
          .eq("profile_id", data.id)
          .order("created_at", { ascending: true });
        if (favError) throw favError;

        const favorites: FavoriteQuote[] =
          favs?.map((fav: { text: string; author: string | null; category: string; lang: string }) => ({
            id: createFavoriteId(
              fav.text,
              fav.author ?? undefined,
              fav.lang as Lang
            ),
            text: fav.text,
            author: fav.author ?? undefined,
            category: fav.category as QuoteCategory,
            lang: fav.lang as Lang,
          })) ?? [];

        const focusMode = Boolean(data.focus_mode);
        setUser({
          id: data.id,
          name: data.username,
          premium: Boolean(data.premium),
          focusMode,
          favorites,
        });
        saveCachedProfile({
          id: data.id,
          name: data.username,
          premium: Boolean(data.premium),
          focusMode,
        });
        setLoading(false);
      } catch (error: unknown) {
        console.error("[UserProvider] login failed:", error);
        setLoading(false);
        throw error;
      }
    },
    []
  );

  const logout = useCallback(async () => {
    setUser(null);
    saveCachedProfile(null);
  }, []);

  const togglePremium = useCallback(async () => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, premium: !prev.premium };
      saveCachedProfile({
        id: prev.id,
        name: prev.name,
        premium: next.premium,
        focusMode: next.focusMode,
      });
      if (!SUPABASE_ENABLED || !prev.id) {
        return next;
      }
      (async () => {
        try {
          await supabase!
            .from("profiles")
            .update({ premium: next.premium })
            .eq("id", prev.id);
        } catch (error: unknown) {
          console.error("[UserProvider] togglePremium error:", error);
        }
      })();
      return next;
    });
  }, []);

  const toggleFavorite = useCallback(
    async (favorite: FavoriteQuote) => {
      setUser((prev) => {
        if (!prev) return prev;
        const exists = prev.favorites.some((fav) => fav.id === favorite.id);
        const updated = exists
          ? prev.favorites.filter((fav) => fav.id !== favorite.id)
          : [...prev.favorites, favorite];
        saveLocalFavorites(prev.name, updated);

        if (SUPABASE_ENABLED && prev.id) {
          (async () => {
            try {
              if (exists) {
                await supabase!
                  .from("favorites")
                  .delete()
                  .match({
                    profile_id: prev.id,
                    text: favorite.text,
                    lang: favorite.lang,
                  });
              } else {
                await supabase!
                  .from("favorites")
                  .insert({
                    profile_id: prev.id,
                    text: favorite.text,
                    author: favorite.author ?? null,
                    category: favorite.category,
                    lang: favorite.lang,
                  });
              }
            } catch (error: unknown) {
              console.error("[UserProvider] toggleFavorite error:", error);
            }
          })();
        }

        return { ...prev, favorites: updated };
      });
    },
    []
  );

  const setFocusMode = useCallback(async (active: boolean) => {
    setUser((prev) => {
      if (!prev) return prev;
      saveCachedProfile({
        id: prev.id,
        name: prev.name,
        premium: prev.premium,
        focusMode: active,
      });
      if (SUPABASE_ENABLED && prev.id) {
        (async () => {
          try {
            await supabase!
              .from("profiles")
              .update({ focus_mode: active })
              .eq("id", prev.id);
          } catch (error: unknown) {
            console.error("[UserProvider] setFocusMode error:", error);
          }
        })();
      }
      return { ...prev, focusMode: active };
    });
  }, []);

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      loading,
      login,
      logout,
      togglePremium,
      toggleFavorite,
      setFocusMode,
    }),
    [loading, login, logout, setFocusMode, toggleFavorite, togglePremium, user]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return ctx;
}













