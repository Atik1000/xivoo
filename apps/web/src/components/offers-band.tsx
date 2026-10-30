'use client';

import { motion } from 'framer-motion';
import type { Coupon } from '@xivoo/shared';
import { useStore } from './store';

/** Dashed coupon cards (dark-surface styling) — embeddable in any band. */
export function CouponCards({ coupons }: { coupons: Coupon[] }) {
  const { say } = useStore();

  const useCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      say(`Code ${code} copied — apply it in your cart.`);
    } catch {
      say(`Code ${code} ready — apply it in your cart.`);
    }
  };

  return (
    <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr))]">
      {coupons.map((c, i) => (
        <motion.div
          key={c.code}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[20px] border border-dashed border-white/25 bg-white/[0.04] p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-display text-xl font-bold tracking-[0.06em] text-brand">{c.code}</span>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => useCode(c.code)}
              className="rounded-full bg-white px-4 py-2 font-display text-[12px] font-bold uppercase tracking-[0.06em] text-ink transition-colors hover:bg-brand hover:text-white"
            >
              Use code
            </motion.button>
          </div>
          <p className="mt-3 text-[15px] text-white/85">{c.label}</p>
          <p className="mt-2 text-[13px] text-white/50">Valid until {c.until} · one code per order</p>
        </motion.div>
      ))}
    </div>
  );
}
