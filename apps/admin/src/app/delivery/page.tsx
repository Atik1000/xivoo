'use client';

import { fmt, type DeliveryZone } from '@xivoo/shared';
import { ApiDown, Card, PageHead, Skeleton } from '@/components/ui';
import { useApi } from '@/lib/api';

export default function DeliveryPage() {
  const zones = useApi<DeliveryZone[]>('/zones');

  if (zones.error) {
    return (
      <>
        <PageHead title="Delivery" />
        <div className="mt-8"><ApiDown error={zones.error} /></div>
      </>
    );
  }

  return (
    <>
      <PageHead
        title="Delivery zones"
        blurb="Fees and ETAs shown at checkout. Values are placeholders until confirmed with the business."
      />
      <div className="mt-7 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))]">
        {zones.data
          ? zones.data.map((z, i) => (
              <Card key={z.key} delay={i * 0.07} className={z.disabled ? 'opacity-70' : ''}>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-[17px] font-bold">{z.label}</h2>
                  <span
                    className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                    style={z.disabled ? { background: '#EFEFEF', color: '#6B7076' } : { background: '#FFEDE0', color: '#FF6A00' }}
                  >
                    {z.disabled ? 'Coming soon' : 'Active'}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-muted">{z.hint}</p>
                {!z.disabled && (
                  <dl className="mt-4 flex gap-8 text-sm">
                    <div>
                      <dt className="text-muted">Fee</dt>
                      <dd className="font-display text-[22px] font-semibold">{fmt(z.fee!)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">ETA</dt>
                      <dd className="font-display text-[22px] font-semibold">{z.eta}</dd>
                    </div>
                  </dl>
                )}
              </Card>
            ))
          : Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[150px]" />)}
      </div>
      <p className="mt-6 max-w-[620px] text-[13px] leading-relaxed text-muted">
        Orders re-check the zone fee server-side when they are placed, so edits here (once zone editing ships) apply
        to new orders only. Nationwide delivery stays disabled until a courier partner is confirmed.
      </p>
    </>
  );
}
