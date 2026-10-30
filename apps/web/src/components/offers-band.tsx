'use client';

import { motion } from 'framer-motion';
import type { Coupon } from '@xivoo/shared';
import { useStore } from './store';

export default function OffersBand({ coupons }: { coupons: Coupon[] }) {
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
    <section className="mt-16 bg-ink py-14 text-white">
      <div className="mx-auto max-w-[1280px] px-6">
        <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-amber">Special offers</p>
        <h2 className="mt-2 font-display text-[32px] font-semibold tracking-[-0.02em]">
          Codes worth keeping
        </h2>
        <div className="mt-8 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr))]">
          {coupons.map((c, i) => (
            <motion.div
              key={c.code}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-[20px] border border-dashed border-white/30 p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-xl font-bold tracking-wide text-amber">{c.code}</span>
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={() => useCode(c.code)}
                  className="rounded-full bg-white px-4 py-2 text-[13px] font-bold text-ink transition-colors hover:bg-amber"
                >
                  Use code
                </motion.button>
              </div>
              <p className="mt-3 text-[15px] text-white/85">{c.label}</p>
              <p className="mt-2 text-[13px] text-white/55">Valid until {c.until} · one code per order</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
