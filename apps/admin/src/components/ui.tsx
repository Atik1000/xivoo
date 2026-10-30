'use client';

import { animate, motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { OrderStatus } from '@xivoo/shared';

export function PageHead({ title, blurb, children }: { title: string; blurb?: string; children?: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-wrap items-end justify-between gap-4"
    >
      <div>
        <h1 className="font-display text-[32px] font-semibold tracking-[-0.02em]">{title}</h1>
        {blurb && <p className="mt-1 text-[15px] text-muted">{blurb}</p>}
      </div>
      {children}
    </motion.div>
  );
}

export function Card({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-[20px] border border-line bg-white p-[22px] ${className}`}
    >
      {children}
    </motion.section>
  );
}

/** Animated count-up for stat tiles. */
export function CountUp({ value, format }: { value: number; format?: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value]);

  return <span ref={ref}>{format ? format(display) : display.toLocaleString('en-IN')}</span>;
}

export function StatCard({
  label,
  value,
  format,
  hint,
  delay = 0,
}: {
  label: string;
  value: number;
  format?: (n: number) => string;
  hint?: string;
  delay?: number;
}) {
  return (
    <Card delay={delay}>
      <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">{label}</p>
      <p className="mt-2 font-display text-[34px] font-semibold tracking-[-0.02em] text-ink">
        <CountUp value={value} format={format} />
      </p>
      {hint && <p className="mt-1 text-[13px] text-muted-2">{hint}</p>}
    </Card>
  );
}

/** Status colors double as labels — never color alone. */
export const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
  Pending: { bg: '#FFF4D6', fg: '#8A6400' },
  Confirmed: { bg: '#FFEDE0', fg: '#FF6A00' },
  Processing: { bg: '#dae5ec', fg: '#26344d' },
  'Ready for Dispatch': { bg: '#e5e4ea', fg: '#3A3F45' },
  Shipped: { bg: '#eee5d3', fg: '#8A6400' },
  Delivered: { bg: '#FF6A00', fg: '#ffffff' },
  Cancelled: { bg: '#FDE9E9', fg: '#E02D2D' },
  'Return Requested': { bg: '#FDE9E9', fg: '#E02D2D' },
  Returned: { bg: '#EFEFEF', fg: '#6B7076' },
  Refunded: { bg: '#EFEFEF', fg: '#6B7076' },
};

export function StatusPill({ status }: { status: OrderStatus | string }) {
  const s = STATUS_STYLE[status] ?? { bg: '#EFEFEF', fg: '#6B7076' };
  return (
    <span
      className="inline-block whitespace-nowrap rounded-full px-3 py-1 text-[12px] font-bold"
      style={{ background: s.bg, color: s.fg }}
    >
      {status}
    </span>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse-soft rounded-xl bg-surface-2 ${className}`} />;
}

export function ApiDown({ error }: { error: string }) {
  return (
    <Card className="border-sale/30">
      <h2 className="text-[17px] font-bold text-sale">Can&apos;t reach the API</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">
        {error}. Start it with <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px]">pnpm dev:api</code>{' '}
        (serves http://localhost:4000), then reload this page.
      </p>
    </Card>
  );
}
