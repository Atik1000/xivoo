'use client';

/* eslint-disable @next/next/no-img-element */
import { fmt, type Campaign, type Coupon } from '@xivoo/shared';
import { ApiDown, Card, PageHead, Skeleton } from '@/components/ui';
import { useApi } from '@/lib/api';

export default function MarketingPage() {
  const campaigns = useApi<Campaign[]>('/campaigns');
  const coupons = useApi<Coupon[]>('/coupons');

  if (campaigns.error) {
    return (
      <>
        <PageHead title="Marketing" />
        <div className="mt-8"><ApiDown error={campaigns.error} /></div>
      </>
    );
  }

  return (
    <>
      <PageHead title="Marketing" blurb="Seasonal campaigns drive the storefront's Seasonal menu and homepage; coupons apply at checkout." />

      <h2 className="mt-8 text-[15px] font-bold">Active campaigns</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {campaigns.data
          ? campaigns.data.map((c, i) => (
              <Card key={c.key} delay={i * 0.07} className="flex gap-5 p-5">
                <img src={c.img} alt="" className="h-28 w-24 shrink-0 rounded-xl object-cover" loading="lazy" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-display text-xl font-semibold tracking-[-0.02em]">{c.title}</h3>
                    <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-bold text-brand">Live</span>
                  </div>
                  <p className="mt-0.5 text-[12px] font-bold uppercase tracking-[0.06em] text-muted">{c.when}</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">{c.line}</p>
                  <p className="mt-2 font-mono text-[12px] text-muted-2">season key: {c.key}</p>
                </div>
              </Card>
            ))
          : Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-[150px]" />)}
      </div>

      <h2 className="mt-10 text-[15px] font-bold">Coupons</h2>
      <p className="text-[13px] text-muted">One code per order, no stacking. Percentage discounts floor and cap server-side.</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {coupons.data
          ? coupons.data.map((c, i) => (
              <Card key={c.code} delay={i * 0.07}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-lg bg-ink px-3 py-1.5 font-mono text-[15px] font-bold tracking-wide text-amber">
                    {c.code}
                  </span>
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand">
                    {c.active ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold">{c.label}</p>
                <dl className="mt-3 grid grid-cols-3 gap-3 text-[13px]">
                  <div>
                    <dt className="text-muted">Type</dt>
                    <dd className="font-bold">{c.type === 'pct' ? `${c.value}% off` : `${fmt(c.value)} off`}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Minimum</dt>
                    <dd className="font-bold">{fmt(c.min)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">{c.max ? 'Cap' : 'Valid until'}</dt>
                    <dd className="font-bold">{c.max ? fmt(c.max) : c.until}</dd>
                  </div>
                </dl>
                {c.max && <p className="mt-2 text-[12px] text-muted">Valid until {c.until}</p>}
              </Card>
            ))
          : Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-[170px]" />)}
      </div>
    </>
  );
}
