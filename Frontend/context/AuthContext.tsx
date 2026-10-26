"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from "react";
import { sessionStore } from "@/lib/auth-store";
import { authApi } from "@/lib/endpoints";
import { useHydrated } from "@/lib/hooks";
import type { User } from "@/lib/types";

interface AuthValue {
  user: User | null;
  token: string | null;
  /** False until localStorage has been read on the client. */
  ready: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = sessionStore.useValue();
  const ready = useHydrated();
  const token = session?.token ?? null;

  // Re-validate a stored token once; the api layer clears it on a token 401.
  useEffect(() => {
    if (!token) return;
    authApi
      .me()
      .then(({ user }) => {
        const current = sessionStore.get();
        if (current?.token === token) sessionStore.set({ token, user });
      })
      .catch(() => {});
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    sessionStore.set({ token: res.token, user: res.data });
    return res.data;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await authApi.register(name, email, password);
    sessionStore.set({ token: res.token, user: res.data });
    return res.data;
  }, []);

  const logout = useCallback(() => sessionStore.set(null), []);

  const value = useMemo<AuthValue>(
    () => ({ user: session?.user ?? null, token, ready, login, register, logout }),
    [session, token, ready, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
