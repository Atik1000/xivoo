'use client';

import { useCallback, useEffect, useState } from 'react';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

const AUTH_KEY = 'xiv_admin_auth_v1';

const authHeaders = (): Record<string, string> => {
  try {
    const token = (JSON.parse(localStorage.getItem(AUTH_KEY) ?? '{}') as { token?: string }).token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
};

const handleUnauthorized = (status: number) => {
  if (status === 401) window.dispatchEvent(new Event('xiv:unauthorized'));
};

interface Fetched<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  reload: () => void;
}

/** Minimal client-side data hook; attaches the admin session token when present. */
export function useApi<T>(path: string): Fetched<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(`${API_URL}${path}`, { headers: authHeaders() })
      .then(async (res) => {
        if (!res.ok) {
          handleUnauthorized(res.status);
          throw new Error(`API ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        if (alive) {
          setData(json);
          setError(null);
        }
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'Failed to reach the API'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [path, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, loading, reload };
}

export class ApiError extends Error {
  constructor(
    message: string,
    public errors?: Record<string, string>,
  ) {
    super(message);
  }
}

async function send<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    handleUnauthorized(res.status);
    throw new ApiError(json?.message ?? `API ${res.status}`, json?.errors);
  }
  return json as T;
}

export const patch = <T,>(path: string, body: unknown): Promise<T> => send('PATCH', path, body);
export const post = <T,>(path: string, body: unknown): Promise<T> => send('POST', path, body);
export const del = <T,>(path: string): Promise<T> => send('DELETE', path);
