'use client';

import { motion } from 'framer-motion';
import PImg from '@/components/pimg';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { ORDER_STATUSES, fmt, type Order } from '@xivoo/shared';
import { track } from '@/components/analytics';
import { fetchOrder } from '@/lib/client-api';

const STEPS = ORDER_STATUSES.filter((s) => s !== 'Ready for Dispatch');

export default function OrderPage({ params }: { params: Promise<{ no: string }> }) {
  const { no } = use(params);
  const [order, setOrder] = useState<Order | null | 'missing'>(null);

  useEffect(() => {
    let alive = true;
    fetchOrder(no).then((o) => {
      if (!alive) return;
      if (o) {
        setOrder(o);
        try {
          if (!sessionStorage.getItem(`xiv_tracked_${o.no}`)) {
            sessionStorage.setItem(`xiv_tracked_${o.no}`, '1');
            track('Purchase', { value: o.total, currency: 'BDT', transaction_id: o.no });
          }
        } catch { /* ignore */ }
        return;
      }
      try {
        const cached = sessionStorage.getItem(`xiv_order_${no}`);
        setOrder(cached ? (JSON.parse(cached) as Order) : 'missing');
      } catch {
        setOrder('missing');
      }
    });
    return () => {
      alive = false;
    };
  }, [no]);

  if (order === null) {
    return <div className="mx-auto max-w-[760px] px-6 py-20 text-center text-sm text-muted">Looking up your order…</div>;
  }
  if (order === 'missing') {
    return (
      <div className="mx-auto max-w-[760px] px-6 py-20 text-center">
        <h1 className="font-display text-3xl font-semibold">We can&apos;t find that order.</h1>
        <p className="mt-3 text-[15px] text-muted">
          Check the order number, or <Link href="/contact" className="font-semibold text-brand hover:underline">contact support</Link>.
        </p>
      </div>
    );
  }

  const first = order.customer.name.split(' ')[0];
  const activeIdx = Math.max(0, STEPS.indexOf(order.status as (typeof STEPS)[number]));

  return (
    <div className="mx-auto max-w-[760px] px-6 pb-18 pt-12">
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 20 }}
        className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand text-white"
      >
        <Check size={30} strokeWidth={2.4} />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}>
        <h1 className="mt-5 text-center font-display text-[clamp(28px,4vw,38px)] font-semibold tracking-[-0.02em]">
          Thank you, {first}. Your order is placed.
        </h1>
        <p className="mt-2 text-center text-[15px] text-muted">
          <span className="font-mono font-bold text-ink">{order.no}</span>
          {' · '}
          {new Date(order.placedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </p>
      </motion.div>

      {/* Status bar */}
      <div className="mt-9 flex items-start">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <span className={`h-[3px] flex-1 rounded ${i === 0 ? 'opacity-0' : i <= activeIdx ? 'bg-brand' : 'bg-line'}`} />
              <motion.span
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                className={`grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold ${
                  i < activeIdx ? 'bg-brand text-white' : i === activeIdx ? 'bg-brand text-white ring-4 ring-brand-50' : 'bg-surface-2 text-muted-2'
                }`}
              >
                {i < activeIdx ? <Check size={13} strokeWidth={3} /> : i + 1}
              </motion.span>
              <span className={`h-[3px] flex-1 rounded ${i === STEPS.length - 1 ? 'opacity-0' : i < activeIdx ? 'bg-brand' : 'bg-line'}`} />
            </div>
            <span className={`mt-2 text-center text-[11px] font-semibold ${i === activeIdx ? 'text-brand' : 'text-muted-2'}`}>{s}</span>
          </div>
        ))}
      </div>
      {order.meta?.trackingId ? (
        <p className="mt-4 text-center text-[13px] text-muted">
          Shipped via <strong className="text-ink">{order.meta.courier}</strong> · tracking{' '}
          <span className="font-mono font-bold text-ink">{order.meta.trackingId}</span>
        </p>
      ) : (
        <p className="mt-4 text-center text-[13px] text-muted">
          We&apos;ll confirm by phone. Tracking appears here once your parcel is handed to the courier.
        </p>
      )}

      {/* Items */}
      <div className="mt-9 rounded-[20px] border border-line bg-white p-[22px]">
        <h2 className="text-[15px] font-bold">Items</h2>
        <ul className="mt-4 space-y-3.5">
          {order.items.map((it) => (
            <li key={it.sku} className="flex items-center gap-3.5">
              <span className="relative block h-16 w-[52px] shrink-0 overflow-hidden rounded-lg bg-surface-2">
                <PImg src={it.img} alt="" fill sizes="52px" className="object-cover" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{it.name}</span>
                <span className="block font-mono text-[12px] text-muted">{it.sku} · {it.variant}</span>
              </span>
              <span className="text-[13px] text-muted">×{it.qty}</span>
              <span className="w-20 text-right text-sm font-bold">{fmt(it.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="font-semibold">{fmt(order.subtotal)}</dd></div>
          {order.discount > 0 && (
            <div className="flex justify-between"><dt className="text-muted">Discount ({order.couponCode})</dt><dd className="font-semibold text-brand">−{fmt(order.discount)}</dd></div>
          )}
          <div className="flex justify-between"><dt className="text-muted">Delivery ({order.delivery.zoneLabel})</dt><dd className="font-semibold">{fmt(order.delivery.fee)}</dd></div>
          <div className="flex justify-between border-t border-line pt-3 text-base"><dt className="font-bold">Due on delivery</dt><dd className="font-bold">{fmt(order.total)}</dd></div>
        </dl>
      </div>

      {/* Address + payment */}
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div className="rounded-[20px] border border-line bg-white p-[22px]">
          <h2 className="text-[15px] font-bold">Delivering to</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            {order.customer.name}
            <br />
            {order.delivery.address}, {order.delivery.area}
            <br />
            {order.delivery.zoneLabel} · {order.customer.phone}
          </p>
        </div>
        <div className="rounded-[20px] border border-line bg-white p-[22px]">
          <h2 className="text-[15px] font-bold">Payment</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            {order.payment}. Please keep {fmt(order.total)} ready for the rider.
          </p>
        </div>
      </div>

      <p className="mt-8 text-center">
        <Link href="/" className="rounded-full bg-brand px-6 py-3 text-[15px] font-bold text-white transition-colors hover:bg-dark">
          Continue shopping
        </Link>
      </p>
    </div>
  );
}
