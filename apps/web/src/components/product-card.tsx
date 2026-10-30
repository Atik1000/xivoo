'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { COLOR_SWATCHES, TONES, fmt, type Product } from '@xivoo/shared';
import type { ProductVM } from '@/lib/api';
import { HeartIcon } from './icons';
import { useStore } from './store';

function badgeOf(p: Product): { label: string; bg: string; fg: string } | null {
  if (p.cat === 'combos') return { label: 'Combo', bg: '#16181A', fg: '#ffffff' };
  if (p.was && p.was > p.price) return { label: 'Sale', bg: '#FFB133', fg: '#16181A' };
  if (p.isNew) return { label: 'New', bg: '#FF6A00', fg: '#ffffff' };
  return null;
}

export default function ProductCard({ product: p }: { product: ProductVM }) {
  const { wish, toggleWish } = useStore();
  const saved = wish.includes(p.id);
  const badge = badgeOf(p);
  const soldOut = p.totalStock === 0;
  const off = p.was ? Math.round((1 - p.price / p.was) * 100) : 0;

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 320, damping: 24 }} className="group flex min-w-0 flex-col gap-3">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[14px]" style={{ background: TONES[p.tone] }}>
        <div className="tone-hatch absolute inset-0" />
        <Link href={`/p/${p.id}`} aria-label={p.name} className="absolute inset-0">
          <Image
            src={p.img}
            alt={p.name}
            fill
            sizes="(max-width: 768px) 50vw, 280px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          />
        </Link>
        {badge && (
          <span
            className="pointer-events-none absolute left-2.5 top-2.5 rounded-full px-[9px] py-1 text-[11px] font-bold tracking-[0.02em]"
            style={{ background: badge.bg, color: badge.fg }}
          >
            {badge.label}
          </span>
        )}
        {soldOut && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-[rgba(248,246,240,.55)]">
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-muted">Out of stock</span>
          </div>
        )}
        <motion.button
          whileTap={{ scale: 0.82 }}
          onClick={(e) => {
            e.preventDefault();
            toggleWish(p.id, p.name);
          }}
          aria-label={saved ? `Remove ${p.name} from wishlist` : `Add ${p.name} to wishlist`}
          className="absolute right-2.5 top-2.5 grid h-[38px] w-[38px] place-items-center rounded-full bg-white/95 text-brand"
        >
          <HeartIcon width={18} height={18} filled={saved} />
        </motion.button>
      </div>

      <Link href={`/p/${p.id}`} className="flex flex-col gap-[5px]">
        <span className="text-xs text-muted">{p.sub}</span>
        <span className="text-[15px] font-semibold leading-[1.3] [text-wrap:pretty]">{p.name}</span>
        <span className="flex flex-wrap items-baseline gap-2">
          <span className="text-[15px] font-bold">{fmt(p.price)}</span>
          {p.was && p.was > p.price && (
            <>
              <span className="text-[13px] text-muted line-through">{fmt(p.was)}</span>
              <span className="text-[13px] font-semibold text-sale">−{off}%</span>
            </>
          )}
        </span>
        <span className="flex min-h-[14px] items-center gap-1.5">
          {p.colors.map((c) => (
            <span
              key={c}
              className="h-3 w-3 rounded-full border border-black/15"
              style={{ background: COLOR_SWATCHES[c]?.[1] }}
              title={COLOR_SWATCHES[c]?.[0]}
            />
          ))}
          <span className="text-xs text-muted">{p.warranty ? `${p.warranty} warranty` : ''}</span>
        </span>
      </Link>
    </motion.div>
  );
}
