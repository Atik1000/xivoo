'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { fmt, type DeliveryZone } from '@xivoo/shared';
import { useAuth } from '@/components/auth';
import Modal, { Field, inputCls } from '@/components/modal';
import { ApiDown, Card, PageHead, Skeleton } from '@/components/ui';
import { patch, useApi } from '@/lib/api';

export default function DeliveryPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'owner' || user?.role === 'manager';
  const zones = useApi<DeliveryZone[]>('/zones');
  const [editing, setEditing] = useState<DeliveryZone | null>(null);
  const [form, setForm] = useState({ fee: '', eta: '', enabled: true });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [err, setErr] = useState('');

  const openEdit = (z: DeliveryZone) => {
    setForm({ fee: String(z.fee ?? ''), eta: z.eta ?? '', enabled: !z.disabled });
    setErr('');
    setEditing(z);
  };

  const save = async () => {
    if (!editing || busy) return;
    setBusy(true);
    setErr('');
    try {
      await patch(`/zones/${editing.key}`, {
        fee: Number(form.fee),
        eta: form.eta,
        disabled: !form.enabled,
      });
      zones.reload();
      setNotice(`${editing.label} updated — new orders use the new fee immediately.`);
      setEditing(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not update the zone.');
    } finally {
      setBusy(false);
    }
  };

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
      <PageHead title="Delivery zones" blurb="Fees and ETAs shown at checkout; orders re-check the fee server-side when placed." />

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

      <div className="mt-7 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))]">
        {zones.data
          ? zones.data.map((z, i) => (
              <Card key={z.key} delay={i * 0.07} className={z.disabled ? 'opacity-70' : ''}>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-[17px] font-bold">{z.label}</h2>
                  <span className="flex items-center gap-2">
                    <span
                      className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                      style={z.disabled ? { background: '#EFEFEF', color: '#6B7076' } : { background: '#FFEDE0', color: '#C2410C' }}
                    >
                      {z.disabled ? 'Disabled' : 'Active'}
                    </span>
                    {canEdit && (
                      <button
                        aria-label={`Edit ${z.label}`}
                        onClick={() => openEdit(z)}
                        className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink-2 transition-colors hover:border-brand hover:text-brand"
                      >
                        <Pencil size={15} />
                      </button>
                    )}
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

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing ? `Edit — ${editing.label}` : ''}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Delivery fee (৳)">
            <input className={inputCls} type="number" min={0} value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} />
          </Field>
          <Field label="ETA label">
            <input className={inputCls} value={form.eta} onChange={(e) => setForm({ ...form, eta: e.target.value })} placeholder="e.g. 3–5 days" />
          </Field>
          <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
              className="h-4 w-4 accent-[#FF6A00]"
            />
            Zone is active (customers can choose it at checkout)
          </label>
        </div>
        {err && <p className="mt-4 text-[13px] font-semibold text-sale">{err}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => setEditing(null)} className="rounded-full border border-line px-5 py-2.5 text-sm font-bold text-ink-2 hover:border-ink">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={busy}
            className="rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-dark disabled:cursor-wait disabled:opacity-70"
          >
            {busy ? 'Saving…' : 'Save zone'}
          </button>
        </div>
      </Modal>
    </>
  );
}
