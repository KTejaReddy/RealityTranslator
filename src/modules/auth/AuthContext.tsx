import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AuthLoginInput, AuthRole, AuthSession } from "./authTypes";
import { clearSessionFromStorage, loadSessionFromStorage, login, saveSessionToStorage } from "./authApi";

type AuthContextValue = {
  loading: boolean;
  session: AuthSession | null;
  role: AuthRole | null;
  login: (input: AuthLoginInput) => Promise<AuthSession>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    const existing = loadSessionFromStorage();
    setSession(existing);
    setLoading(false);
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      loading,
      session,
      role: session?.role ?? null,
      login: async (input: AuthLoginInput) => {
        const nextSession = await login(input);
        setSession(nextSession);
        saveSessionToStorage(nextSession);
        return nextSession;
      },
      logout: () => {
        clearSessionFromStorage();
        setSession(null);
      },
    };
  }, [loading, session]);

  if (loading) return <>{children}</>;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

