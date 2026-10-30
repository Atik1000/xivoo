'use client';

/* eslint-disable @next/next/no-img-element */
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { fmt, type Campaign, type Coupon } from '@xivoo/shared';
import { useAuth } from '@/components/auth';
import Modal, { Field, inputCls } from '@/components/modal';
import { ApiDown, Card, PageHead, Skeleton } from '@/components/ui';
import { ApiError, del, patch, post, useApi } from '@/lib/api';

function Toggle({ on, onChange, disabled, label }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-40 ${on ? 'bg-brand' : 'bg-line'}`}
    >
      <motion.span
        animate={{ x: on ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className="absolute top-1 h-5 w-5 rounded-full bg-white shadow"
      />
    </button>
  );
}

export default function MarketingPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'owner' || user?.role === 'manager';
  const campaigns = useApi<Campaign[]>('/campaigns/all');
  const coupons = useApi<Coupon[]>('/coupons');
  const [notice, setNotice] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [deleting, setDeleting] = useState<Coupon | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ code: '', type: 'pct', value: '', min: '', max: '', until: '' });

  const say = (m: string) => setNotice(m);

  const toggleCampaign = async (c: Campaign, active: boolean) => {
    try {
      await patch(`/campaigns/${c.key}`, { active });
      campaigns.reload();
      say(`${c.title} is now ${active ? 'live on the storefront' : 'hidden'}.`);
    } catch (e) {
      say(e instanceof Error ? e.message : 'Could not update the campaign.');
    }
  };

  const toggleCoupon = async (c: Coupon, active: boolean) => {
    try {
      await patch(`/coupons/${c.code}`, { active });
      coupons.reload();
      say(`${c.code} ${active ? 'activated' : 'disabled'}.`);
    } catch (e) {
      say(e instanceof Error ? e.message : 'Could not update the coupon.');
    }
  };

  const createCoupon = async () => {
    if (busy) return;
    setBusy(true);
    setErr('');
    setFieldErr({});
    try {
      await post('/coupons', {
        code: form.code,
        type: form.type,
        value: Number(form.value),
        min: Number(form.min || 0),
        max: form.type === 'pct' ? Number(form.max) : undefined,
        until: form.until,
      });
      setAddOpen(false);
      setForm({ code: '', type: 'pct', value: '', min: '', max: '', until: '' });
      coupons.reload();
      say('Coupon created.');
    } catch (e) {
      if (e instanceof ApiError) {
        setErr(e.errors ? '' : e.message);
        setFieldErr(e.errors ?? {});
      } else setErr('Could not create the coupon.');
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting || busy) return;
    setBusy(true);
    try {
      await del(`/coupons/${deleting.code}`);
      setDeleting(null);
      coupons.reload();
      say('Coupon deleted.');
    } catch (e) {
      say(e instanceof Error ? e.message : 'Could not delete.');
    } finally {
      setBusy(false);
    }
  };

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
      <PageHead title="Marketing" blurb="Campaigns drive the storefront's Campaigns menu and homepage; coupons apply at checkout.">
        {canEdit && (
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-dark"
          >
            <Plus size={16} /> New coupon
          </button>
        )}
      </PageHead>

      <AnimatePresence>
        {notice && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-5 rounded-xl bg-brand-50 px-4 py-2.5 text-sm font-semibold text-ink"
          >
            {notice}
          </motion.p>
        )}
      </AnimatePresence>

      <h2 className="mt-8 text-[15px] font-bold">Campaigns</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {campaigns.data
          ? campaigns.data.map((c, i) => (
              <Card key={c.key} delay={i * 0.07} className="flex gap-5 p-5">
                <img src={c.img} alt="" className="h-28 w-24 shrink-0 rounded-xl object-cover" loading="lazy" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-xl font-semibold tracking-[-0.01em]">{c.title}</h3>
                    <Toggle on={c.active} disabled={!canEdit} onChange={(v) => toggleCampaign(c, v)} label={`Toggle ${c.title}`} />
                  </div>
                  <p className="mt-0.5 text-[12px] font-bold uppercase tracking-[0.06em] text-muted">{c.when}</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">{c.line}</p>
                  <p className="mt-2 font-mono text-[12px] text-muted-2">
                    season key: {c.key} · {c.active ? 'live' : 'hidden'}
                  </p>
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
                  <span className="flex items-center gap-2">
                    <Toggle on={c.active} disabled={!canEdit} onChange={(v) => toggleCoupon(c, v)} label={`Toggle ${c.code}`} />
                    {canEdit && (
                      <button
                        aria-label={`Delete ${c.code}`}
                        onClick={() => setDeleting(c)}
                        className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink-2 transition-colors hover:border-sale hover:text-sale"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
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

      {/* Create coupon modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New coupon">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Code" error={fieldErr.code}>
            <input className={`${inputCls} font-mono uppercase`} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="EIDTECH20" />
          </Field>
          <Field label="Type" error={fieldErr.type}>
            <select className={inputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="pct">Percentage (%)</option>
              <option value="fixed">Fixed amount (৳)</option>
            </select>
          </Field>
          <Field label={form.type === 'pct' ? 'Percent off' : 'Taka off'} error={fieldErr.value}>
            <input className={inputCls} type="number" min={1} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
          </Field>
          <Field label="Minimum order (৳)" error={fieldErr.min}>
            <input className={inputCls} type="number" min={0} value={form.min} onChange={(e) => setForm({ ...form, min: e.target.value })} />
          </Field>
          {form.type === 'pct' && (
            <Field label="Max discount cap (৳)" error={fieldErr.max}>
              <input className={inputCls} type="number" min={1} value={form.max} onChange={(e) => setForm({ ...form, max: e.target.value })} />
            </Field>
          )}
          <Field label="Valid until" error={fieldErr.until}>
            <input className={inputCls} value={form.until} onChange={(e) => setForm({ ...form, until: e.target.value })} placeholder="31 Dec 2027" />
          </Field>
        </div>
        {err && <p className="mt-4 text-[13px] font-semibold text-sale">{err}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => setAddOpen(false)} className="rounded-full border border-line px-5 py-2.5 text-sm font-bold text-ink-2 hover:border-ink">
            Cancel
          </button>
          <button
            onClick={createCoupon}
            disabled={busy}
            className="rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-dark disabled:cursor-wait disabled:opacity-70"
          >
            {busy ? 'Creating…' : 'Create coupon'}
          </button>
        </div>
      </Modal>

      {/* Delete coupon modal */}
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete coupon?">
        {deleting && (
          <>
            <p className="text-sm leading-relaxed text-ink-2">
              <strong className="font-mono">{deleting.code}</strong> will stop working at checkout immediately.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeleting(null)} className="rounded-full border border-line px-5 py-2.5 text-sm font-bold text-ink-2 hover:border-ink">
                Keep it
              </button>
              <button
                onClick={confirmDelete}
                disabled={busy}
                className="rounded-full bg-sale px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
              >
                {busy ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
