'use client';

import { useEffect, useState } from 'react';
import {
  PRODUCTS,
  ZONES,
  totalStock,
  type CreateOrderInput,
  type DeliveryZone,
  type Order,
} from '@xivoo/shared';
import type { ProductVM } from './api';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

const seedProducts = (): ProductVM[] => PRODUCTS.map((p) => ({ ...p, totalStock: totalStock(p) }));

/** Client-side catalog with live stock; falls back to the bundled seed if the API is down. */
export function useCatalog(): { products: ProductVM[] | null; live: boolean } {
  const [state, setState] = useState<{ products: ProductVM[] | null; live: boolean }>({
    products: null,
    live: true,
  });
  useEffect(() => {
    let alive = true;
    fetch(`${API}/products`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => alive && setState({ products: json, live: true }))
      .catch(() => alive && setState({ products: seedProducts(), live: false }));
    return () => {
      alive = false;
    };
  }, []);
  return state;
}

export function useZones(): DeliveryZone[] | null {
  const [zones, setZones] = useState<DeliveryZone[] | null>(null);
  useEffect(() => {
    let alive = true;
    fetch(`${API}/zones`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => alive && setZones(json))
      .catch(() => alive && setZones(ZONES));
    return () => {
      alive = false;
    };
  }, []);
  return zones;
}

export interface CouponResult {
  valid: boolean;
  code?: string;
  discount: number;
  message: string;
}

export async function validateCoupon(code: string, subtotal: number): Promise<CouponResult> {
  const res = await fetch(`${API}/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, subtotal }),
  });
  if (!res.ok) throw new Error('Coupon service unavailable');
  return res.json();
}

export type PlaceOrderResult =
  | { ok: true; order: Order }
  | { ok: false; message: string; errors?: Record<string, string> };

export async function placeOrder(input: CreateOrderInput): Promise<PlaceOrderResult> {
  let res: Response;
  try {
    res = await fetch(`${API}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  } catch {
    return { ok: false, message: 'The order service is unreachable. Start the API and try again.' };
  }
  const json = await res.json();
  if (!res.ok) return { ok: false, message: json?.message ?? 'Could not place the order.', errors: json?.errors };
  return { ok: true, order: json };
}

export async function fetchOrder(no: string): Promise<Order | null> {
  try {
    const res = await fetch(`${API}/orders/${encodeURIComponent(no)}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
