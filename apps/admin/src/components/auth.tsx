'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { API_URL } from '@/lib/api';

export interface AdminUser {
  email: string;
  name: string;
  role: 'owner' | 'manager' | 'support';
}

const KEY = 'xiv_admin_auth_v1';

export interface AuthFail {
  message: string;
  errors?: Record<string, string>;
}

interface AuthCtx {
  user: AdminUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (name: string, email: string, password: string) => Promise<AuthFail | null>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth outside provider');
  return ctx;
}

export const getToken = (): string | null => {
  try {
    return (JSON.parse(localStorage.getItem(KEY) ?? '{}') as { token?: string }).token ?? null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) ?? '{}');
      if (v.user && v.token) setUser(v.user);
    } catch {
      /* signed out */
    }
    setReady(true);

    const onUnauthorized = () => {
      localStorage.removeItem(KEY);
      setUser(null);
    };
    window.addEventListener('xiv:unauthorized', onUnauthorized);
    return () => window.removeEventListener('xiv:unauthorized', onUnauthorized);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    let res: Response;
    try {
      res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
    } catch {
      return 'The API is unreachable — start it with pnpm dev:api.';
    }
    const json = await res.json();
    if (!res.ok) return json?.message ?? 'Sign-in failed.';
    localStorage.setItem(KEY, JSON.stringify(json));
    setUser(json.user);
    return null;
  }, []);

  const signup = useCallback(
    async (name: string, email: string, password: string): Promise<AuthFail | null> => {
      let res: Response;
      try {
        res = await fetch(`${API_URL}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
      } catch {
        return { message: 'The API is unreachable — start it with pnpm dev:api.' };
      }
      const json = await res.json();
      if (!res.ok) return { message: json?.message ?? 'Sign-up failed.', errors: json?.errors };
      localStorage.setItem(KEY, JSON.stringify(json));
      setUser(json.user);
      return null;
    },
    [],
  );

  const logout = useCallback(() => {
    const token = getToken();
    if (token) {
      fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => undefined);
    }
    localStorage.removeItem(KEY);
    setUser(null);
  }, []);

  return <Ctx.Provider value={{ user, ready, login, signup, logout }}>{children}</Ctx.Provider>;
}

