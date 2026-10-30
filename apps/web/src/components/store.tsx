'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

const KEY = 'xivoo_web_v1';

export interface CartLine {
  productId: string;
  variant: string;
  color?: string;
  qty: number;
}

export const lineKey = (l: Pick<CartLine, 'productId' | 'variant' | 'color'>) =>
  `${l.productId}|${l.variant}|${l.color ?? ''}`;

interface StoreCtx {
  wish: string[];
  cart: CartLine[];
  coupon: string | null;
  toggleWish: (id: string, name: string) => void;
  addToCart: (line: CartLine, name: string) => void;
  setLineQty: (key: string, qty: number) => void;
  removeLine: (key: string) => void;
  clearCart: () => void;
  setCoupon: (code: string | null) => void;
  say: (msg: string) => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore outside provider');
  return ctx;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [wish, setWish] = useState<string[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [coupon, setCouponState] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) ?? '{}');
      if (Array.isArray(v.wish)) setWish(v.wish);
      if (Array.isArray(v.cart)) setCart(v.cart);
      if (typeof v.coupon === 'string') setCouponState(v.coupon);
    } catch {
      /* fresh visitor */
    }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ wish, cart, coupon }));
    } catch {
      /* private mode */
    }
  }, [wish, cart, coupon]);

  const say = useCallback((msg: string) => {
    setToast(msg);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(''), 2600);
  }, []);

  const toggleWish = useCallback(
    (id: string, name: string) => {
      setWish((prev) => {
        const has = prev.includes(id);
        say(has ? `Removed ${name} from your wishlist.` : `Saved ${name} to your wishlist.`);
        return has ? prev.filter((x) => x !== id) : [...prev, id];
      });
    },
    [say],
  );

  const addToCart = useCallback(
    (line: CartLine, name: string) => {
      setCart((prev) => {
        const key = lineKey(line);
        const idx = prev.findIndex((l) => lineKey(l) === key);
        return idx >= 0
          ? prev.map((l, i) => (i === idx ? { ...l, qty: l.qty + line.qty } : l))
          : [...prev, line];
      });
      say(`Added ${name} to your cart.`);
    },
    [say],
  );

  const setLineQty = useCallback((key: string, qty: number) => {
    setCart((prev) => prev.map((l) => (lineKey(l) === key ? { ...l, qty } : l)));
  }, []);

  const removeLine = useCallback((key: string) => {
    setCart((prev) => prev.filter((l) => lineKey(l) !== key));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setCouponState(null);
  }, []);

  const setCoupon = useCallback((code: string | null) => setCouponState(code), []);

  return (
    <Ctx.Provider
      value={{ wish, cart, coupon, toggleWish, addToCart, setLineQty, removeLine, clearCart, setCoupon, say }}
    >
      {children}
      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="fixed bottom-6 left-1/2 z-[60] max-w-[calc(100vw-32px)] -translate-x-1/2 rounded-[10px] bg-dark px-5 py-3.5 text-sm font-semibold text-white shadow-[0_16px_32px_-12px_rgba(0,0,0,.4)]"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}
