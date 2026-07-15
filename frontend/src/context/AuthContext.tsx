'use client';

// ── Imports ──

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { api } from '@/lib/api';

// ── Types ──

interface User {
  id: string;
  email: string;
  mobile: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, mobile: string, password: string) => Promise<void>;
  logout: () => void;
}

// ── Context ──

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ──

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Session Restore ──
  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) {
      setToken(t);
      api.get<{ user: User }>('/auth/me')
        .then((data) => setUser(data.user))
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // ── Login ──
  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<{ token: string; refreshToken: string; user: User }>('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    setToken(data.token);
    setUser(data.user);
  }, []);

  // ── Register ──
  const register = useCallback(async (name: string, email: string, mobile: string, password: string) => {
    await api.post('/auth/register', { name, email, mobile, password });
  }, []);

  // ── Logout ──
  const logout = useCallback(async () => {
    try { await api.post('/auth/logout', {}); } catch { /* ignore */ }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
