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
  email?: string;
  name: string;
  premium: boolean;
  favorites: FavoriteQuote[];
  focusMode: boolean;
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterResult = {
  verificationRequired: boolean;
};

type SubmitFeedbackPayload = {
  message: string;
  email?: string;
};

type SubmitFeedbackResult = {
  success: boolean;
  error?: unknown;
};

type UserContextValue = {
  user: User | null;
  loading: boolean;
  register: (payload: RegisterPayload) => Promise<RegisterResult>;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  togglePremium: () => Promise<void>;
  toggleFavorite: (favorite: FavoriteQuote) => Promise<void>;
  setFocusMode: (active: boolean) => Promise<void>;
  submitFeedback: (payload: SubmitFeedbackPayload) => Promise<SubmitFeedbackResult>;
};

const PROFILE_CACHE_KEY = "mq_profile_cache_v1";
const SUPABASE_ENABLED = Boolean(supabase);

type CachedProfile = {
  id?: string;
  name: string;
  email?: string;
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

  const hydrateFromSupabase = useCallback(
    async (profileId: string, email?: string) => {
      if (!SUPABASE_ENABLED) return null;
      try {
        const { data, error } = await supabase!
          .from("profiles")
          .select("id,username,premium,focus_mode")
          .eq("id", profileId)
          .maybeSingle();
        if (error) throw error;
        if (!data) {
          setUser(null);
          saveCachedProfile(null);
          return null;
        }

        const { data: favRows, error: favError } = await supabase!
          .from("favorites")
          .select("text,author,category,lang")
          .eq("profile_id", data.id)
          .order("created_at", { ascending: true });
        if (favError) throw favError;

        const favorites =
          favRows?.map(
            (fav: {
              text: string;
              author: string | null;
              category: string;
              lang: string;
            }) => ({
              id: createFavoriteId(
                fav.text,
                fav.author ?? undefined,
                fav.lang as Lang
              ),
              text: fav.text,
              author: fav.author ?? undefined,
              category: fav.category as QuoteCategory,
              lang: fav.lang as Lang,
            })
          ) ?? [];

        const profile: User = {
          id: data.id,
          email,
          name: data.username,
          premium: Boolean(data.premium),
          focusMode: Boolean(data.focus_mode),
          favorites,
        };

        setUser(profile);
        saveCachedProfile({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          premium: profile.premium,
          focusMode: profile.focusMode,
        });
        return profile;
      } catch (error: unknown) {
        console.error("[UserProvider] hydrateFromSupabase failed:", error);
        setUser(null);
        saveCachedProfile(null);
        return null;
      }
    },
    []
  );

  const hydrateFromCache = useCallback(async () => {
    const cached = loadCachedProfile();
    if (!cached) {
      setLoading(false);
      return;
    }

    if (SUPABASE_ENABLED && cached.id) {
      const profile = await hydrateFromSupabase(cached.id, cached.email);
      if (profile) {
        setLoading(false);
        return;
      }
    }

    const favorites = loadLocalFavorites(cached.name);
    setUser({
      id: cached.id,
      email: cached.email,
      name: cached.name,
      premium: Boolean(cached.premium),
      focusMode: Boolean(cached.focusMode),
      favorites,
    });
    setLoading(false);
  }, [hydrateFromSupabase]);

  useEffect(() => {
    if (!SUPABASE_ENABLED) {
      void hydrateFromCache();
      return;
    }

    const bootstrap = async () => {
      setLoading(true);
      try {
        const {
          data: { session },
          error,
        } = await supabase!.auth.getSession();
        if (error) throw error;
        if (session?.user) {
          await hydrateFromSupabase(
            session.user.id,
            session.user.email ?? undefined
          );
        } else {
          await hydrateFromCache();
        }
      } catch (error: unknown) {
        console.error("[UserProvider] session bootstrap failed:", error);
        await hydrateFromCache();
      } finally {
        setLoading(false);
      }
    };

    void bootstrap();

    const {
      data: { subscription },
    } = supabase!.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        void hydrateFromSupabase(
          session.user.id,
          session.user.email ?? undefined
        );
      } else {
        setUser(null);
        saveCachedProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [hydrateFromCache, hydrateFromSupabase]);

  const register = useCallback(
    async ({ name, email, password }: RegisterPayload) => {
      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanName || !cleanEmail || !password) {
        return { verificationRequired: false };
      }

      if (!SUPABASE_ENABLED) {
        const favorites = loadLocalFavorites(cleanName);
        const focusMode = false;
        const id = crypto.randomUUID();
        const profile: User = {
          id,
          email: cleanEmail,
          name: cleanName,
          premium: false,
          focusMode,
          favorites,
        };
        setUser(profile);
        saveCachedProfile({
          id,
          name: cleanName,
          email: cleanEmail,
          premium: false,
          focusMode,
        });
        return { verificationRequired: false };
      }

      setLoading(true);
      try {
        const { data, error } = await supabase!.auth.signUp({
          email: cleanEmail,
          password,
        });
        if (error) throw error;

        const authUser = data.user;
        if (!authUser?.id) {
          throw new Error("Supabase signup returned an invalid user");
        }

        const { error: profileError } = await supabase!
          .from("profiles")
          .upsert(
            {
              id: authUser.id,
              username: cleanName,
              premium: false,
              focus_mode: false,
            },
            { onConflict: "id" }
          );
        if (profileError) throw profileError;

        if (data.session?.user) {
          await hydrateFromSupabase(
            authUser.id,
            data.session.user.email ?? authUser.email ?? undefined
          );
          return { verificationRequired: false };
        } else {
          // Email confirmation required; keep user logged out until verified.
          setUser(null);
          saveCachedProfile(null);
          return { verificationRequired: true };
        }
      } catch (error: unknown) {
        console.error("[UserProvider] register failed:", error);
        throw error;
      } finally {
        setLoading(false);
      }
      return { verificationRequired: false };
    },
    [hydrateFromSupabase]
  );

  const login = useCallback(
    async ({ email, password }: LoginPayload) => {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !password) return;

      if (!SUPABASE_ENABLED) {
        const cached = loadCachedProfile();
        if (cached && cached.email === cleanEmail) {
          const favorites = loadLocalFavorites(cached.name);
          setUser({
            id: cached.id,
            email: cached.email,
            name: cached.name,
            premium: Boolean(cached.premium),
            focusMode: Boolean(cached.focusMode),
            favorites,
          });
        }
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase!.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (error) throw error;

        const authUser = data.user;
        if (!authUser?.id) {
          throw new Error("Supabase login returned an invalid user");
        }

        await hydrateFromSupabase(
          authUser.id,
          authUser.email ?? undefined
        );
      } catch (error: unknown) {
        console.error("[UserProvider] login failed:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [hydrateFromSupabase]
  );

  const logout = useCallback(async () => {
    if (SUPABASE_ENABLED) {
      try {
        await supabase!.auth.signOut();
      } catch (error: unknown) {
        console.error("[UserProvider] logout failed:", error);
      }
    }
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
        email: prev.email,
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
        email: prev.email,
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

  const submitFeedback = useCallback(
    async ({ message, email }: SubmitFeedbackPayload): Promise<SubmitFeedbackResult> => {
      const trimmed = message.trim();
      if (!trimmed) {
        return { success: false };
      }

      const sanitizedEmail = email?.trim() || user?.email || undefined;

      if (!SUPABASE_ENABLED) {
        console.info(
          "[UserProvider] submitFeedback skipped: Supabase not configured. Message:",
          trimmed
        );
        return { success: true };
      }

      try {
        const { error } = await supabase!
          .from("feedback")
          .insert({
            message: trimmed,
            email: sanitizedEmail ?? null,
            profile_id: user?.id ?? null,
          });
        if (error) throw error;
        return { success: true };
      } catch (error: unknown) {
        console.error("[UserProvider] submitFeedback failed:", error);
        return { success: false, error };
      }
    },
    [user?.email, user?.id]
  );

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      loading,
      register,
      login,
      logout,
      togglePremium,
      toggleFavorite,
      setFocusMode,
      submitFeedback,
    }),
    [
      loading,
      login,
      logout,
      register,
      setFocusMode,
      submitFeedback,
      toggleFavorite,
      togglePremium,
      user,
    ]
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
