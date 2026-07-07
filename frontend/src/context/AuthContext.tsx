'use client';

// ── Imports ──

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { api } from '@/lib/api';

// ── Types ──

// Drives the shape of global auth state consumed across the app
interface User {
  id: string;
  email: string;
  mobile: string;
  name: string;
  role: string;
}

// Contract that AuthProvider fulfills; any component can call useAuth() to access this
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;                     // true while restoring a session from localStorage on mount
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; mobile: string; password: string; name: string }) => Promise<void>;
  logout: () => void;
}

// ── Context ──

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ──

export function AuthProvider({ children }: { children: ReactNode }) {
  // ── State ──
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Session Restore ──
  // On mount, check localStorage for a persisted token and validate it via /auth/me.
  // Avoids forcing the user to re-login on every page refresh or tab close.
  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) {
      setToken(t);
      api.get<{ user: User }>('/auth/me')
        .then((data) => setUser(data.user))
        .catch(() => localStorage.removeItem('token'))   // Token expired or tampered with – clean up silently
        .finally(() => setLoading(false));
    } else {
      setLoading(false);                                 // No saved session – skip the API call
    }
  }, []);

  // ── Login ──
  // Credentials are exchanged for a JWT; we persist the token so the session survives refreshes.
  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  // ── Register ──
  // Creates a new account and immediately logs the user in with the returned token.
  const register = useCallback(async (regData: { email: string; mobile: string; password: string; name: string }) => {
    const data = await api.post<{ token: string; user: User }>('/auth/register', regData);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  // ── Logout ──
  // Clears local state and persistent storage so the user is fully de-authenticated.
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  // ── Render ──
  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──
// Safely exposes the auth context; throws if called outside the provider tree.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
