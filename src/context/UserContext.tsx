import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type User = {
  name: string;
  premium: boolean;
};

type UserContextValue = {
  user: User | null;
  login: (name: string, premium?: boolean) => void;
  logout: () => void;
  togglePremium: () => void;
};

const STORAGE_KEY = "mq_user";

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored) as User;
      if (!parsed?.name) return null;
      return { name: parsed.name, premium: Boolean(parsed.premium) };
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!user) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }, [user]);

  const login = useCallback((name: string, premium = false) => {
    const cleanName = name.trim();
    if (!cleanName) return;
    setUser({ name: cleanName, premium });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const togglePremium = useCallback(() => {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, premium: !prev.premium };
    });
  }, []);

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      login,
      logout,
      togglePremium,
    }),
    [login, logout, togglePremium, user]
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
