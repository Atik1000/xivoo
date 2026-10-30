'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ProductVM } from '@/lib/api';
import ProductCard from './product-card';

interface Tab {
  label: string;
  products: ProductVM[];
}

/** HH:MM:SS to local midnight — "today's deals" style countdown. */
function Countdown() {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      setLeft(Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000)));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  if (left === null) return null;
  const parts = [Math.floor(left / 3600), Math.floor((left % 3600) / 60), left % 60];
  return (
    <span className="flex items-center gap-1" aria-label="Deals refresh at midnight">
      <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-muted">Ends in</span>
      {parts.map((n, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="grid min-w-[30px] place-items-center rounded-md bg-dark px-1 py-1 font-display text-[13px] font-bold text-white">
            {String(n).padStart(2, '0')}
          </span>
          {i < 2 && <span className="font-bold text-muted">:</span>}
        </span>
      ))}
    </span>
  );
}

/**
 * Dazzle-style product section: left title (+optional countdown), tabs,
 * "See All" on the right, product grid below.
 */
export default function ProductTabs({
  title,
  accent,
  tabs,
  seeAllHref,
  countdown,
  limit = 8,
}: {
  title: string;
  accent?: boolean;
  tabs: Tab[];
  seeAllHref: string;
  countdown?: boolean;
  limit?: number;
}) {
  const [active, setActive] = useState(0);
  const products = (tabs[active]?.products ?? []).slice(0, limit);

  return (
    <section className="mx-auto mt-12 max-w-[1280px] px-4 sm:px-6">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b-2 border-line pb-3">
        <h3 className={`font-display text-[20px] font-bold tracking-[-0.01em] ${accent ? 'text-sale' : 'text-ink'}`}>
          {title}
        </h3>
        {countdown && <Countdown />}
        {tabs.length > 1 && (
          <div className="flex gap-1.5">
            {tabs.map((t, i) => (
              <button
                key={t.label}
                onClick={() => setActive(i)}
                className={`relative rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition-colors ${
                  active === i ? 'text-white' : 'bg-surface-2 text-ink-2 hover:text-ink'
                }`}
              >
                {active === i && (
                  <motion.span
                    layoutId={`tab-${title}`}
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-dark"
                  />
                )}
                <span className="relative">{t.label}</span>
              </button>
            ))}
          </div>
        )}
        <Link href={seeAllHref} className="ml-auto text-[13px] font-bold text-brand hover:underline">
          See All →
        </Link>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]"
        >
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
