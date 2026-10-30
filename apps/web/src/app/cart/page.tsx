'use client';

import { AnimatePresence, motion } from 'framer-motion';
import PImg from '@/components/pimg';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { COLOR_SWATCHES, fmt, sizedImg } from '@xivoo/shared';
import { Reveal } from '@/components/reveal';
import { lineKey, useStore } from '@/components/store';
import { useCatalog, validateCoupon, type CouponResult } from '@/lib/client-api';

const DHAKA_FEE = 60;

export default function CartPage() {
  const { cart, coupon, setCoupon, setLineQty, removeLine, say } = useStore();
  const { products, live } = useCatalog();
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<CouponResult | null>(null);
  const [discount, setDiscount] = useState(0);

  const lines = useMemo(() => {
    if (!products) return null;
    return cart
      .map((l) => {
        const p = products.find((x) => x.id === l.productId);
        if (!p) return null;
        const stock = p.stock[l.variant] ?? 0;
        return { ...l, key: lineKey(l), p, stock, over: l.qty > stock };
      })
      .filter((x): x is NonNullable<typeof x> => !!x);
  }, [cart, products]);

  const subtotal = useMemo(
    () => (lines ?? []).reduce((a, l) => a + l.p.price * l.qty, 0),
    [lines],
  );
  const hasStockIssue = (lines ?? []).some((l) => l.over);

  // Re-evaluate the applied coupon whenever the cart changes (invalidate below minimum).
  useEffect(() => {
    let alive = true;
    if (!coupon || subtotal === 0) {
      setDiscount(0);
      if (!coupon) setCouponMsg(null);
      return;
    }
    validateCoupon(coupon, subtotal)
      .then((r) => {
        if (!alive) return;
        setCouponMsg(r);
        setDiscount(r.valid ? r.discount : 0);
      })
      .catch(() => {
        if (!alive) return;
        setCouponMsg({ valid: false, discount: 0, message: 'Could not check the coupon — the API is offline.' });
        setDiscount(0);
      });
    return () => {
      alive = false;
    };
  }, [coupon, subtotal]);

  const apply = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    try {
      const r = await validateCoupon(code, subtotal);
      setCouponMsg(r);
      if (r.valid) {
        setCoupon(code);
        setCouponInput('');
      }
    } catch {
      setCouponMsg({ valid: false, discount: 0, message: 'Could not check the coupon — the API is offline.' });
    }
  };

  const total = subtotal - discount + (lines?.length ? DHAKA_FEE : 0);

  if (lines && lines.length === 0) {
    return (
      <div className="mx-auto max-w-[1180px] px-6 pb-18 pt-8">
        <h1 className="font-display text-[40px] font-semibold leading-[1.08] tracking-[-0.02em]">Your cart</h1>
        <Reveal className="mt-8">
          <div className="rounded-[20px] border border-line bg-white p-12 text-center">
            <p className="font-display text-2xl font-semibold">Your cart is empty.</p>
            <p className="mt-2 text-[15px] text-muted">Fill it with something that makes every day smarter.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
              {[['Shop all', '/c/all'], ['Offers', '/c/offers'], ['Combo deals', '/c/combos']].map(([l, h]) => (
                <Link key={h} href={h} className="rounded-full border border-input bg-white px-4 py-2 text-[13px] font-semibold hover:border-brand">
                  {l}
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1180px] px-6 pb-18 pt-8">
      <h1 className="font-display text-[40px] font-semibold leading-[1.08] tracking-[-0.02em]">Your cart</h1>
      {!live && (
        <p className="mt-3 rounded-xl bg-amber-tint px-4 py-2.5 text-[13px] font-semibold text-amber-ink">
          The API is offline — stock shown is the seed catalog and checkout is unavailable.
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-start gap-6">
        {/* Lines */}
        <div className="min-w-0 flex-[999_1_560px] rounded-[20px] border border-line bg-white">
          {!lines
            ? <div className="p-8 text-sm text-muted">Loading your cart…</div>
            : (
              <AnimatePresence initial={false}>
                {lines.map((l, i) => (
                  <motion.div
                    key={l.key}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className={`flex flex-wrap items-center gap-4 p-5 ${i > 0 ? 'border-t border-line-2' : ''}`}
                  >
                    <Link href={`/p/${l.p.id}`} className="relative block h-[110px] w-[88px] shrink-0 overflow-hidden rounded-xl bg-surface-2">
                      <PImg src={sizedImg(l.p, 176, 220)} alt={l.p.name} fill sizes="88px" className="object-cover" />
                    </Link>
                    <div className="min-w-[160px] flex-1">
                      <Link href={`/p/${l.p.id}`} className="text-[15px] font-semibold hover:text-brand">{l.p.name}</Link>
                      <p className="mt-0.5 text-[13px] text-muted">
                        {[l.color ? COLOR_SWATCHES[l.color]?.[0] : null, l.variant].filter(Boolean).join(' · ')}
                      </p>
                      <p className="mt-1 text-[13px] text-muted">{fmt(l.p.price)} each</p>
                      {l.over && (
                        <p className="mt-1.5 text-[13px] font-semibold text-sale">
                          Only {l.stock} left — reduce the quantity to check out.
                        </p>
                      )}
                    </div>
                    <div className="flex items-center rounded-full border border-input">
                      <button
                        onClick={() => (l.qty > 1 ? setLineQty(l.key, l.qty - 1) : removeLine(l.key))}
                        aria-label="Decrease quantity"
                        className="h-10 w-10 text-lg font-semibold"
                      >−</button>
                      <span className="w-7 text-center text-[15px] font-bold">{l.qty}</span>
                      <button
                        onClick={() => (l.qty < l.stock ? setLineQty(l.key, l.qty + 1) : say(`Only ${l.stock} in stock for this option.`))}
                        aria-label="Increase quantity"
                        className="h-10 w-10 text-lg font-semibold"
                      >+</button>
                    </div>
                    <span className="w-24 text-right text-[15px] font-bold">{fmt(l.p.price * l.qty)}</span>
                    <button
                      onClick={() => removeLine(l.key)}
                      className="text-[13px] font-semibold text-muted underline-offset-2 hover:text-sale hover:underline"
                    >
                      Remove
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
        </div>

        {/* Summary */}
        <aside className="sticky top-[96px] w-full flex-[1_1_300px] rounded-[20px] border border-line bg-white p-[22px] lg:max-w-[360px]">
          <h2 className="text-[17px] font-bold">Summary</h2>

          {coupon ? (
            <div className="mt-4 flex items-center justify-between gap-2 rounded-xl bg-brand-50 px-3.5 py-2.5">
              <span className="font-mono text-sm font-bold text-dark">{coupon}</span>
              <button
                onClick={() => { setCoupon(null); setCouponMsg(null); }}
                className="text-[13px] font-semibold text-brand underline-offset-2 hover:underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="mt-4 flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && apply()}
                placeholder="Coupon code"
                aria-label="Coupon code"
                className="min-w-0 flex-1 rounded-xl border border-input px-3.5 py-2.5 font-mono text-sm uppercase outline-none focus:border-brand"
              />
              <button onClick={apply} className="rounded-full bg-ink px-4 py-2.5 text-[13px] font-bold text-white hover:bg-dark">
                Apply
              </button>
            </div>
          )}
          {couponMsg && (
            <p className={`mt-2 text-[13px] font-semibold ${couponMsg.valid ? 'text-brand' : 'text-sale'}`}>
              {couponMsg.message}
            </p>
          )}

          <dl className="mt-5 space-y-2.5 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="font-semibold">{fmt(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Discount</dt><dd className="font-semibold text-brand">{discount ? `−${fmt(discount)}` : '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Delivery (Dhaka City)</dt><dd className="font-semibold">{fmt(DHAKA_FEE)}</dd></div>
            <div className="flex justify-between border-t border-line pt-3 text-[17px]"><dt className="font-bold">Total</dt><dd className="font-bold">{fmt(total)}</dd></div>
          </dl>

          {hasStockIssue || !live ? (
            <span className="mt-5 block cursor-not-allowed rounded-full bg-surface-2 px-6 py-3.5 text-center text-[15px] font-bold text-disabled">
              Proceed to checkout
            </span>
          ) : (
            <Link
              href="/checkout"
              className="mt-5 block rounded-full bg-brand px-6 py-3.5 text-center text-[15px] font-bold text-white transition-colors hover:bg-dark"
            >
              Proceed to checkout
            </Link>
          )}
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Delivery charge depends on your area and is confirmed at checkout. Prices, stock and coupons are
            re-checked when you place the order.
          </p>
        </aside>
      </div>
    </div>
  );
}
