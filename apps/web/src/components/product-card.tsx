'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { TONES, fmt, type Product } from '@xivoo/shared';
import type { ProductVM } from '@/lib/api';
import { track } from './analytics';
import { BagIcon, HeartIcon } from './icons';
import PImg from './pimg';
import { useStore } from './store';

function badgeOf(p: Product): { label: string; bg: string; fg: string } | null {
  if (p.cat === 'combos') return { label: 'Combo', bg: '#16181A', fg: '#ffffff' };
  if (p.was && p.was > p.price) {
    const off = Math.round((1 - p.price / p.was) * 100);
    return { label: `-${off}%`, bg: '#E02D2D', fg: '#ffffff' };
  }
  if (p.isNew) return { label: 'New', bg: '#FF6A00', fg: '#ffffff' };
  return null;
}

export default function ProductCard({ product: p }: { product: ProductVM }) {
  const { wish, toggleWish, addToCart } = useStore();
  const saved = wish.includes(p.id);
  const badge = badgeOf(p);
  const soldOut = p.totalStock === 0;
  const low = !soldOut && p.totalStock <= 3;

  const quickAdd = () => {
    const variant = Object.keys(p.stock).find((v) => p.stock[v] > 0);
    if (!variant) return;
    addToCart({ productId: p.id, variant, color: p.colors[0], qty: 1 }, p.name);
    track('AddToCart', { content_ids: [p.id], value: p.price, currency: 'BDT' });
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-white transition-shadow hover:border-brand/40 hover:shadow-[0_16px_36px_-18px_rgba(17,19,21,.25)]"
    >
      <div className="relative aspect-square overflow-hidden" style={{ background: TONES[p.tone] }}>
        <div className="tone-hatch absolute inset-0" />
        <Link href={`/p/${p.id}`} aria-label={p.name} className="absolute inset-0">
          <PImg
            src={p.img}
            alt={p.name}
            fill
            sizes="(max-width: 768px) 50vw, 260px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          />
        </Link>
        {badge && (
          <span
            className="pointer-events-none absolute left-2.5 top-2.5 rounded-md px-2 py-1 font-display text-[11px] font-bold tracking-[0.02em]"
            style={{ background: badge.bg, color: badge.fg }}
          >
            {badge.label}
          </span>
        )}
        {soldOut && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-white/55">
            <span className="rounded-full bg-dark px-3 py-1.5 text-xs font-semibold text-white">Out of Stock</span>
          </div>
        )}
        <motion.button
          whileTap={{ scale: 0.82 }}
          onClick={(e) => {
            e.preventDefault();
            toggleWish(p.id, p.name);
          }}
          aria-label={saved ? `Remove ${p.name} from wishlist` : `Add ${p.name} to wishlist`}
          className="absolute right-2.5 top-2.5 grid h-[36px] w-[36px] place-items-center rounded-full bg-white/95 text-brand shadow-sm"
        >
          <HeartIcon width={17} height={17} filled={saved} />
        </motion.button>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <span className="text-[11.5px] text-muted">{p.sub}</span>
        <Link href={`/p/${p.id}`} className="line-clamp-2 min-h-[2.5em] text-[14px] font-semibold leading-[1.25] hover:text-brand">
          {p.name}
        </Link>
        <span className={`text-[11.5px] font-semibold ${soldOut ? 'text-sale' : low ? 'text-amber-ink' : 'text-[#1E8E3E]'}`}>
          {soldOut ? 'Out of stock' : low ? `Only ${p.totalStock} left` : 'In stock'}
        </span>
        <span className="flex flex-wrap items-baseline gap-2">
          <span className="text-[16px] font-bold text-brand">{fmt(p.price)}</span>
          {p.was && p.was > p.price && <span className="text-[12.5px] text-muted line-through">{fmt(p.was)}</span>}
        </span>
        <motion.button
          whileTap={{ scale: soldOut ? 1 : 0.96 }}
          disabled={soldOut}
          onClick={quickAdd}
          className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-dark py-2.5 text-[12.5px] font-bold text-white transition-colors hover:bg-brand disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-disabled"
        >
          <BagIcon width={14} height={14} /> Add to Cart
        </motion.button>
      </div>
    </motion.div>
  );
}
