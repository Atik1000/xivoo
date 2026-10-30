'use client';

import { AnimatePresence, motion } from 'framer-motion';
import PImg from './pimg';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { COLOR_SWATCHES, TONES, fmt, hasCrops, sizedImg, skuOf, type Product } from '@xivoo/shared';
import type { ProductVM } from '@/lib/api';
import { track } from './analytics';
import { HeartIcon } from './icons';
import { useStore } from './store';

type PDP = ProductVM & { bundleItems: ProductVM[] };

export default function PurchasePanel({ product: p }: { product: PDP }) {
  const router = useRouter();
  const { wish, toggleWish, addToCart, say } = useStore();
  const sizes = Object.keys(p.stock);
  const firstInStock = sizes.find((z) => p.stock[z] > 0) ?? sizes[0];

  const [color, setColor] = useState(p.colors[0] ?? null);
  const [size, setSize] = useState(firstInStock);
  const [qty, setQty] = useState(1);
  const [img, setImg] = useState(0);

  useEffect(() => {
    track('ViewContent', { content_ids: [p.id], content_name: p.name, value: p.price, currency: 'BDT' });
  }, [p.id, p.name, p.price]);

  const left = p.stock[size] ?? 0;
  const off = p.was ? Math.round((1 - p.price / p.was) * 100) : 0;
  const saved = wish.includes(p.id);
  const views = ['entropy', 'top', 'bottom', 'left'];
  const crops = hasCrops(p.id);

  const stockPill =
    left === 0
      ? { text: 'Out of stock in this option', bg: 'var(--color-surface-2)', fg: 'var(--color-muted)' }
      : left <= 3
        ? { text: `Only ${left} left`, bg: 'var(--color-amber-tint)', fg: 'var(--color-amber-ink)' }
        : { text: 'In stock', bg: 'var(--color-brand-50)', fg: 'var(--color-stock)' };

  const bumpQty = (d: number) => {
    const next = qty + d;
    if (next < 1) return;
    if (next > left) {
      say(`Only ${left} in stock for this option.`);
      return;
    }
    setQty(next);
  };

  return (
    <div className="grid gap-[clamp(28px,4vw,56px)] [grid-template-columns:repeat(auto-fit,minmax(min(100%,440px),1fr))]">
      {/* Gallery */}
      <div>
        <motion.div
          key={img}
          initial={{ opacity: 0.4, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="relative aspect-[4/5] overflow-hidden rounded-[20px]"
          style={{ background: TONES[p.tone] }}
        >
          <div className="tone-hatch absolute inset-0" />
          <PImg
            src={crops ? sizedImg(p, 800, 1000, views[img]) : p.img}
            alt={p.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 560px"
            className="object-cover"
          />
        </motion.div>
        <div className="mt-3 grid grid-cols-4 gap-3">
          {crops && views.map((v, i) => (
            <button
              key={v}
              onClick={() => setImg(i)}
              aria-label={`View ${i + 1}`}
              className="relative aspect-[4/5] overflow-hidden rounded-[10px] transition-all"
              style={{ boxShadow: img === i ? 'inset 0 0 0 2px #FF6A00' : 'inset 0 0 0 1px #E4E4E4', background: TONES[p.tone] }}
            >
              <PImg src={sizedImg(p, 160, 200, v)} alt="" fill sizes="120px" className="object-cover" style={{ opacity: img === i ? 1 : 0.85 }} />
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div>
        <p className="text-sm text-muted">{p.sub}</p>
        <h1 className="mt-1 font-display text-[clamp(30px,3.4vw,40px)] font-semibold leading-[1.08] tracking-[-0.02em] [text-wrap:balance]">
          {p.name}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-[26px] font-bold">{fmt(p.price)}</span>
          {p.was && p.was > p.price && (
            <>
              <span className="text-[17px] text-muted line-through">{fmt(p.was)}</span>
              <span className="rounded-full bg-sale-tint px-3 py-1 text-[13px] font-bold text-sale">−{off}%</span>
            </>
          )}
          <span className="rounded-full px-3 py-1 text-[13px] font-semibold" style={{ background: stockPill.bg, color: stockPill.fg }}>
            {stockPill.text}
          </span>
        </div>
        <p className="mt-5 max-w-[520px] text-[16px] leading-relaxed text-ink-2">{p.desc}</p>

        {p.bundleItems.length > 0 && (
          <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
            <h3 className="text-sm font-bold">In this bundle</h3>
            <ul className="mt-3 space-y-3">
              {p.bundleItems.map((b) => (
                <li key={b.id}>
                  <Link href={`/p/${b.id}`} className="flex items-center gap-3 hover:text-brand">
                    <span className="relative block h-12 w-10 overflow-hidden rounded-lg bg-surface-2">
                      <PImg src={sizedImg(b, 80, 100)} alt="" fill sizes="40px" className="object-cover" />
                    </span>
                    <span className="flex-1 text-sm font-semibold">{b.name}</span>
                    <span className="text-sm font-bold">{fmt(b.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[13px] text-muted">
              Separately {fmt(p.was ?? p.price)} · bundle saves <strong className="text-brand">{fmt((p.was ?? p.price) - p.price)}</strong>
            </p>
          </div>
        )}

        {p.colors.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-semibold">
              Colour: <span className="font-normal text-muted">{COLOR_SWATCHES[color ?? '']?.[0]}</span>
            </p>
            <div className="mt-3 flex gap-3">
              {p.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  aria-label={COLOR_SWATCHES[c]?.[0]}
                  className="grid h-11 w-11 place-items-center rounded-full transition-shadow"
                  style={{ boxShadow: color === c ? '0 0 0 2px #fff, 0 0 0 4px #FF6A00' : '0 0 0 1px rgba(0,0,0,.12)' }}
                >
                  <span className="h-8 w-8 rounded-full" style={{ background: COLOR_SWATCHES[c]?.[1] }} />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <p className="text-sm font-semibold">{sizes.length > 1 || sizes[0] !== 'One size' ? 'Variant' : 'One size'}</p>
          {(sizes.length > 1 || sizes[0] !== 'One size') && (
            <div className="mt-3 flex flex-wrap gap-2.5">
              {sizes.map((z) => {
                const out = (p.stock[z] ?? 0) === 0;
                const active = size === z;
                return (
                  <button
                    key={z}
                    disabled={out}
                    onClick={() => {
                      setSize(z);
                      setQty(1);
                    }}
                    className="min-h-[44px] min-w-[52px] rounded-[10px] border px-3.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed"
                    style={{
                      background: out ? 'var(--color-surface-2)' : active ? 'var(--color-dark)' : 'var(--color-surface)',
                      color: out ? 'var(--color-disabled)' : active ? 'var(--color-surface)' : 'var(--color-dark)',
                      borderColor: active ? 'var(--color-dark)' : 'var(--color-input)',
                      textDecoration: out ? 'line-through' : 'none',
                    }}
                  >
                    {z}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Qty + actions */}
        <div className="mt-7 flex flex-wrap items-center gap-3" style={{ opacity: left === 0 ? 0.4 : 1 }}>
          <div className="flex items-center rounded-full border border-input">
            <button onClick={() => bumpQty(-1)} aria-label="Decrease quantity" className="h-11 w-11 text-lg font-semibold">−</button>
            <AnimatePresence mode="popLayout">
              <motion.span
                key={qty}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="w-8 text-center text-[15px] font-bold"
              >
                {qty}
              </motion.span>
            </AnimatePresence>
            <button onClick={() => bumpQty(1)} aria-label="Increase quantity" className="h-11 w-11 text-lg font-semibold">+</button>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={left === 0}
            onClick={() => { addToCart({ productId: p.id, variant: size, color: color ?? undefined, qty }, p.name); track('AddToCart', { content_ids: [p.id], value: p.price * qty, currency: 'BDT' }); }}
            className="rounded-full bg-brand px-7 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-dark disabled:cursor-not-allowed"
          >
            Add to cart
          </motion.button>
          <button
            disabled={left === 0}
            onClick={() => {
              addToCart({ productId: p.id, variant: size, color: color ?? undefined, qty }, p.name);
              router.push('/checkout');
            }}
            className="rounded-full border border-ink px-7 py-3.5 text-[15px] font-bold text-ink transition-colors hover:bg-ink hover:text-white disabled:cursor-not-allowed"
          >
            Buy now
          </button>
          <button
            onClick={() => toggleWish(p.id, p.name)}
            aria-label="Add to wishlist"
            className="grid h-12 w-12 place-items-center rounded-full border border-input text-brand transition-colors hover:border-brand"
          >
            <HeartIcon filled={saved} />
          </button>
        </div>

        {/* Info box */}
        <div className="mt-8 space-y-4 rounded-2xl bg-surface-2 p-5 text-sm leading-relaxed text-ink-2">
          <p><strong className="text-ink">Delivery:</strong> Dhaka City ৳60 (1–2 days) · suburbs ৳100 (2–3 days) · other districts ৳130 (3–5 days).</p>
          <p><strong className="text-ink">Returns &amp; refund:</strong> 7 days, unused with intact packaging. <Link href="/returns" className="font-semibold text-brand hover:underline">Read the policy</Link></p>
          {p.warranty && <p><strong className="text-ink">Warranty:</strong> {p.warranty} official warranty, claimed through Xivoo support.</p>}
          <ul className="list-disc space-y-1 pl-5">
            {p.details.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
          <p className="font-mono text-[13px] text-muted">SKU {skuOf(p as Product, color ?? undefined, size)}</p>
        </div>
      </div>
    </div>
  );
}
