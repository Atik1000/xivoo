'use client';

/* eslint-disable @next/next/no-img-element */
import { AnimatePresence, motion } from 'framer-motion';
import { Fragment, useMemo, useState } from 'react';
import { fmt, type Order, type OrderStatus } from '@xivoo/shared';
import { useAuth } from '@/components/auth';
import { ApiDown, Card, PageHead, Skeleton, StatusPill } from '@/components/ui';
import { patch, useApi } from '@/lib/api';

const FILTERS = ['All', 'Pending', 'Confirmed', 'Processing', 'Ready for Dispatch', 'Shipped', 'Delivered', 'Cancelled'];

export default function OrdersPage() {
  const { user } = useAuth();
  const readOnly = user?.role === 'support';
  const orders = useApi<Order[]>('/orders');
  const transitions = useApi<{ transitions: Record<string, OrderStatus[]> }>('/orders/statuses');
  const [filter, setFilter] = useState('All');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  const rows = useMemo(() => {
    let out = orders.data ?? [];
    if (filter !== 'All') out = out.filter((o) => o.status === filter);
    if (q.trim()) {
      const needle = q.toLowerCase();
      out = out.filter(
        (o) =>
          o.no.toLowerCase().includes(needle) ||
          o.customer.name.toLowerCase().includes(needle) ||
          o.customer.phone.includes(needle),
      );
    }
    return out;
  }, [orders.data, filter, q]);

  const move = async (o: Order, status: OrderStatus) => {
    setBusy(o.no);
    setNotice('');
    try {
      await patch(`/orders/${o.no}/status`, { status });
      orders.reload();
      setNotice(`${o.no} moved to ${status}.`);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not update the order.');
    } finally {
      setBusy(null);
    }
  };

  if (orders.error) {
    return (
      <>
        <PageHead title="Orders" />
        <div className="mt-8"><ApiDown error={orders.error} /></div>
      </>
    );
  }

  return (
    <>
      <PageHead title="Orders" blurb="Click a row for items, address and the next step in the pipeline." />

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
              filter === f ? 'border-brand bg-brand text-white' : 'border-input bg-white hover:border-brand'
            }`}
          >
            {f}
          </button>
        ))}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Order no, name or phone…"
          aria-label="Search orders"
          className="ml-auto w-[240px] max-w-full rounded-full border border-input bg-white px-4 py-2 text-sm outline-none focus:border-brand"
        />
      </div>

      <AnimatePresence>
        {notice && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 rounded-xl bg-brand-50 px-4 py-2.5 text-sm font-semibold text-dark"
          >
            {notice}
          </motion.p>
        )}
      </AnimatePresence>

      <Card className="mt-5 overflow-x-auto p-0">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-2 text-[12px] font-bold uppercase tracking-[0.06em] text-muted">
              <th className="px-5 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Placed</th>
              <th className="px-4 py-3">Zone</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => {
              const expanded = open === o.no;
              const nexts = transitions.data?.transitions[o.status] ?? [];
              return (
                <Fragment key={o.no}>
                  <tr
                    onClick={() => setOpen(expanded ? null : o.no)}
                    className={`cursor-pointer border-b align-middle transition-colors ${expanded ? 'border-transparent bg-brand-25' : 'border-line-2 hover:bg-brand-25'}`}
                  >
                    <td className="px-5 py-3 font-mono text-[13px] font-semibold">{o.no}</td>
                    <td className="px-4 py-3">
                      <span className="block font-semibold">{o.customer.name}</span>
                      <span className="block text-[12px] text-muted">{o.customer.phone}</span>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {new Date(o.placedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-4 py-3 text-muted">{o.delivery.zoneLabel}</td>
                    <td className="px-4 py-3 text-muted">{o.items.reduce((a, it) => a + it.qty, 0)}</td>
                    <td className="px-4 py-3 font-bold">{fmt(o.total)}</td>
                    <td className="px-5 py-3"><StatusPill status={o.status} /></td>
                  </tr>
                  <AnimatePresence>
                    {expanded && (
                      <tr className="border-b border-line-2 bg-brand-25/60">
                        <td colSpan={7} className="px-5">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="grid gap-6 py-5 md:grid-cols-[1.4fr_1fr_1fr]">
                              <div>
                                <h3 className="text-[12px] font-bold uppercase tracking-[0.06em] text-muted">Items</h3>
                                <ul className="mt-3 space-y-2.5">
                                  {o.items.map((it) => (
                                    <li key={it.sku} className="flex items-center gap-3">
                                      <img src={it.img} alt="" className="h-11 w-9 rounded-lg object-cover" loading="lazy" />
                                      <span className="min-w-0 flex-1">
                                        <span className="block truncate text-[13px] font-semibold">{it.name}</span>
                                        <span className="block font-mono text-[11px] text-muted">{it.sku} · {it.variant}{it.color ? ` · ${it.color}` : ''}</span>
                                      </span>
                                      <span className="text-[13px] text-muted">×{it.qty}</span>
                                      <span className="w-20 text-right text-[13px] font-bold">{fmt(it.lineTotal)}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h3 className="text-[12px] font-bold uppercase tracking-[0.06em] text-muted">Delivery</h3>
                                <p className="mt-3 text-[13px] leading-relaxed text-ink-2">
                                  {o.delivery.address}, {o.delivery.area}
                                  <br />
                                  {o.delivery.zoneLabel} · fee {fmt(o.delivery.fee)}
                                  {o.delivery.note && (
                                    <>
                                      <br />
                                      <em className="text-muted">“{o.delivery.note}”</em>
                                    </>
                                  )}
                                </p>
                                <p className="mt-3 text-[13px] text-ink-2">
                                  Subtotal {fmt(o.subtotal)}
                                  {o.discount > 0 && <> · Coupon {o.couponCode} −{fmt(o.discount)}</>}
                                  <br />
                                  <strong>Due on delivery: {fmt(o.total)}</strong>
                                </p>
                              </div>
                              <div>
                                <h3 className="text-[12px] font-bold uppercase tracking-[0.06em] text-muted">Move to</h3>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {readOnly ? (
                                    <p className="text-[13px] text-muted">
                                      Your role ({user?.role}) is read-only — a manager or the owner moves orders.
                                    </p>
                                  ) : nexts.length ? (
                                    nexts.map((n) => (
                                      <button
                                        key={n}
                                        disabled={busy === o.no}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          move(o, n);
                                        }}
                                        className={`rounded-full px-4 py-2 text-[13px] font-bold transition-colors disabled:opacity-50 ${
                                          n === 'Cancelled'
                                            ? 'border border-sale text-sale hover:bg-sale-tint'
                                            : 'bg-brand text-white hover:bg-dark'
                                        }`}
                                      >
                                        {busy === o.no ? '…' : n}
                                      </button>
                                    ))
                                  ) : (
                                    <p className="text-[13px] text-muted">Final state — nothing further.</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </Fragment>
              );
            })}
          </tbody>
        </table>
        {!orders.data && (
          <div className="space-y-2 p-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-[52px]" />
            ))}
          </div>
        )}
        {orders.data && rows.length === 0 && (
          <p className="p-8 text-center text-sm text-muted">No orders match that filter.</p>
        )}
      </Card>
    </>
  );
}
