'use client';

/* eslint-disable @next/next/no-img-element */
import { motion } from 'framer-motion';
import Link from 'next/link';
import { fmt, type Order, type StatsSummary } from '@xivoo/shared';
import { CategoryBars, RevenueChart } from '@/components/charts';
import { ApiDown, Card, PageHead, Skeleton, StatCard, StatusPill, STATUS_STYLE } from '@/components/ui';
import { useApi } from '@/lib/api';

const PIPELINE = ['Pending', 'Confirmed', 'Processing', 'Ready for Dispatch', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];

export default function Dashboard() {
  const stats = useApi<StatsSummary>('/stats/summary');
  const orders = useApi<Order[]>('/orders');

  if (stats.error) {
    return (
      <>
        <PageHead title="Dashboard" blurb="Sales, orders and stock at a glance." />
        <div className="mt-8"><ApiDown error={stats.error} /></div>
      </>
    );
  }

  const s = stats.data;
  const maxStatus = s ? Math.max(...s.byStatus.map((x) => x.count), 1) : 1;
  const statusRows = s
    ? [...s.byStatus].sort((a, b) => PIPELINE.indexOf(a.status) - PIPELINE.indexOf(b.status))
    : [];

  return (
    <>
      <PageHead
        title="Dashboard"
        blurb={`Last 30 days · ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}`}
      >
        <Link
          href="/orders"
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-dark"
        >
          Review orders
        </Link>
      </PageHead>

      {/* Stat tiles */}
      <div className="mt-7 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr))]">
        {s ? (
          <>
            <StatCard label="Revenue" value={s.revenue} format={fmt} hint="Confirmed & delivered orders" />
            <StatCard label="Orders" value={s.orders} hint={`${s.pendingOrders} pending review`} delay={0.05} />
            <StatCard label="Avg order value" value={s.avgOrder} format={fmt} hint="Including delivery" delay={0.1} />
            <StatCard label="Items sold" value={s.itemsSold} hint="Across all categories" delay={0.15} />
          </>
        ) : (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[130px]" />)
        )}
      </div>

      {/* Revenue + status */}
      <div className="mt-5 grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <Card delay={0.1}>
          <h2 className="text-[15px] font-bold">Revenue by day</h2>
          <p className="text-[13px] text-muted">Taka collected per day, last 30 days</p>
          <div className="mt-4">{s ? <RevenueChart data={s.revenueByDay} /> : <Skeleton className="h-[260px]" />}</div>
        </Card>
        <Card delay={0.15}>
          <h2 className="text-[15px] font-bold">Orders by status</h2>
          <p className="text-[13px] text-muted">Everything currently in the system</p>
          <div className="mt-5 space-y-3.5">
            {s
              ? statusRows.map((row, i) => {
                  const style = STATUS_STYLE[row.status] ?? { bg: '#EFEFEF', fg: '#6B7076' };
                  return (
                    <div key={row.status} className="flex items-center gap-3">
                      <span className="w-[128px] shrink-0 text-[13px] font-semibold text-ink-2">{row.status}</span>
                      <div className="h-[18px] flex-1 overflow-hidden rounded-full bg-surface-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(row.count / maxStatus) * 100}%` }}
                          transition={{ duration: 0.7, delay: 0.2 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full rounded-full"
                          style={{ background: style.fg === '#ffffff' ? style.bg : style.fg, opacity: 0.85 }}
                        />
                      </div>
                      <span className="w-7 text-right text-[13px] font-bold">{row.count}</span>
                    </div>
                  );
                })
              : Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-[20px]" />)}
          </div>
        </Card>
      </div>

      {/* Category + top products + low stock */}
      <div className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr]">
        <Card delay={0.2}>
          <h2 className="text-[15px] font-bold">Revenue by category</h2>
          <p className="text-[13px] text-muted">Where the money comes from</p>
          <div className="mt-4">{s ? <CategoryBars data={s.byCategory} /> : <Skeleton className="h-[240px]" />}</div>
        </Card>

        <Card delay={0.25}>
          <h2 className="text-[15px] font-bold">Bestsellers</h2>
          <p className="text-[13px] text-muted">Ranked by real units sold</p>
          <ul className="mt-4 space-y-3">
            {s
              ? s.topProducts.map((p, i) => (
                  <li key={p.id} className="flex items-center gap-3">
                    <span className="w-4 text-[13px] font-bold text-muted-2">{i + 1}</span>
                    <img src={p.img} alt="" className="h-11 w-9 rounded-lg object-cover" loading="lazy" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold">{p.name}</span>
                      <span className="block text-[12px] text-muted">{p.units} sold · {fmt(p.revenue)}</span>
                    </span>
                  </li>
                ))
              : Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[44px]" />)}
          </ul>
        </Card>

        <Card delay={0.3}>
          <h2 className="text-[15px] font-bold">Low stock</h2>
          <p className="text-[13px] text-muted">3 or fewer left per variant</p>
          <ul className="mt-4 space-y-3">
            {s
              ? s.lowStock.slice(0, 6).map((l) => (
                  <li key={`${l.id}-${l.variant}`} className="flex items-center gap-3">
                    <img src={l.img} alt="" className="h-11 w-9 rounded-lg object-cover" loading="lazy" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold">{l.name}</span>
                      <span className="block text-[12px] text-muted">{l.variant}</span>
                    </span>
                    <span
                      className="rounded-full px-2.5 py-1 text-[12px] font-bold"
                      style={l.left === 0 ? { background: '#FDE9E9', color: '#E02D2D' } : { background: '#FFF4D6', color: '#8A6400' }}
                    >
                      {l.left === 0 ? 'Out' : `${l.left} left`}
                    </span>
                  </li>
                ))
              : Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[44px]" />)}
          </ul>
        </Card>
      </div>

      {/* Recent orders */}
      <Card delay={0.35} className="mt-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-bold">Recent orders</h2>
            <p className="text-[13px] text-muted">The latest eight</p>
          </div>
          <Link href="/orders" className="text-sm font-semibold text-brand hover:underline">
            All orders →
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[12px] font-bold uppercase tracking-[0.06em] text-muted">
                <th className="py-2.5 pr-4">Order</th>
                <th className="py-2.5 pr-4">Customer</th>
                <th className="py-2.5 pr-4">Placed</th>
                <th className="py-2.5 pr-4">Items</th>
                <th className="py-2.5 pr-4">Total</th>
                <th className="py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {(orders.data ?? []).slice(0, 8).map((o) => (
                <tr key={o.no} className="border-b border-line-2 transition-colors hover:bg-brand-25">
                  <td className="py-3 pr-4 font-mono text-[13px] font-semibold">{o.no}</td>
                  <td className="py-3 pr-4 font-semibold">{o.customer.name}</td>
                  <td className="py-3 pr-4 text-muted">
                    {new Date(o.placedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="py-3 pr-4 text-muted">{o.items.reduce((a, it) => a + it.qty, 0)}</td>
                  <td className="py-3 pr-4 font-bold">{fmt(o.total)}</td>
                  <td className="py-3"><StatusPill status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!orders.data && <Skeleton className="mt-3 h-[220px]" />}
        </div>
      </Card>
    </>
  );
}
