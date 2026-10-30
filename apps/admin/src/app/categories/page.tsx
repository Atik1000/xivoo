'use client';

/* eslint-disable @next/next/no-img-element */
import { AnimatePresence, motion } from 'framer-motion';
import { Lock, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import type { Category } from '@xivoo/shared';
import { useAuth } from '@/components/auth';
import ImagePicker from '@/components/image-picker';
import Modal, { Field, inputCls } from '@/components/modal';
import { ApiDown, Card, PageHead, Skeleton } from '@/components/ui';
import { ApiError, del, patch, post, useApi } from '@/lib/api';

export default function CategoriesPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'owner' || user?.role === 'manager';
  const categories = useApi<Category[]>('/categories');
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState<Category | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [form, setForm] = useState({ title: '', crumb: '', blurb: '', img: '' });
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [subDraft, setSubDraft] = useState<Record<string, string>>({});

  const openForm = (c: Category | null) => {
    setForm(c ? { title: c.title, crumb: c.crumb, blurb: c.blurb, img: c.img ?? '' } : { title: '', crumb: '', blurb: '', img: '' });
    setErr('');
    setFieldErr({});
    if (c) setEditing(c);
    else setAdding(true);
  };

  const closeForm = () => {
    setEditing(null);
    setAdding(false);
  };

  const save = async () => {
    if (busy) return;
    setBusy(true);
    setErr('');
    setFieldErr({});
    try {
      if (editing) {
        await patch(`/categories/${editing.key}`, form);
        setNotice(`${form.title} updated.`);
      } else {
        await post('/categories', form);
        setNotice(`${form.title} created — it is live in the storefront nav.`);
      }
      closeForm();
      categories.reload();
    } catch (e) {
      if (e instanceof ApiError) {
        setErr(e.errors ? '' : e.message);
        setFieldErr(e.errors ?? {});
      } else setErr('Could not save.');
    } finally {
      setBusy(false);
    }
  };

  const saveSubs = async (c: Category, subs: string[]) => {
    try {
      await patch(`/categories/${c.key}`, { subs });
      categories.reload();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not update subcategories.');
    }
  };

  const addSub = (c: Category) => {
    const v = (subDraft[c.key] ?? '').trim();
    if (!v) return;
    setSubDraft({ ...subDraft, [c.key]: '' });
    saveSubs(c, [...(c.subs ?? []), v]);
  };

  const confirmDelete = async () => {
    if (!deleting || busy) return;
    setBusy(true);
    try {
      await del(`/categories/${deleting.key}`);
      setNotice(`${deleting.title} deleted.`);
      setDeleting(null);
      categories.reload();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not delete.');
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  };

  if (categories.error) {
    return (
      <>
        <PageHead title="Categories" />
        <div className="mt-8"><ApiDown error={categories.error} /></div>
      </>
    );
  }

  return (
    <>
      <PageHead title="Categories" blurb="Categories and their subcategories drive the storefront nav, filters and the product form.">
        {canEdit && (
          <button
            onClick={() => openForm(null)}
            className="flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-dark"
          >
            <Plus size={16} /> Add category
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

      <div className="mt-7 grid gap-4 md:grid-cols-2">
        {categories.data
          ? categories.data.map((c, i) => (
              <Card key={c.key} delay={i * 0.05} className="flex gap-5 p-5">
                <span className="block h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                  {c.img && <img src={c.img} alt="" className="h-full w-full object-cover" loading="lazy" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="flex items-center gap-2 font-display text-[18px] font-semibold tracking-[-0.01em]">
                        {c.title}
                        {c.system && (
                          <span title="System category — cannot be deleted" className="flex items-center gap-1 rounded-md bg-surface-2 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-muted">
                            <Lock size={10} /> system
                          </span>
                        )}
                      </h2>
                      <p className="font-mono text-[11px] text-muted-2">/c/{c.key} · {c.count} products</p>
                    </div>
                    {canEdit && (
                      <span className="flex gap-1.5">
                        <button
                          aria-label={`Edit ${c.title}`}
                          onClick={() => openForm(c)}
                          className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink-2 transition-colors hover:border-brand hover:text-brand"
                        >
                          <Pencil size={14} />
                        </button>
                        {!c.system && (
                          <button
                            aria-label={`Delete ${c.title}`}
                            onClick={() => setDeleting(c)}
                            className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink-2 transition-colors hover:border-sale hover:text-sale"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted">{c.blurb}</p>

                  {/* Subcategories */}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {(c.subs ?? []).map((sub) => (
                      <span key={sub} className="flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-[12px] font-semibold text-ink-2">
                        {sub}
                        {canEdit && (
                          <button
                            aria-label={`Remove ${sub}`}
                            onClick={() => saveSubs(c, (c.subs ?? []).filter((x) => x !== sub))}
                            className="grid h-4 w-4 place-items-center rounded-full text-muted hover:bg-sale hover:text-white"
                          >
                            <X size={10} />
                          </button>
                        )}
                      </span>
                    ))}
                    {canEdit && c.key !== 'seasonal' && (
                      <span className="flex items-center gap-1">
                        <input
                          value={subDraft[c.key] ?? ''}
                          onChange={(e) => setSubDraft({ ...subDraft, [c.key]: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && addSub(c)}
                          placeholder="New subcategory"
                          className="w-36 rounded-full border border-input bg-white px-3 py-1 text-[12px] outline-none focus:border-brand"
                        />
                        <button
                          aria-label={`Add subcategory to ${c.title}`}
                          onClick={() => addSub(c)}
                          className="grid h-6 w-6 place-items-center rounded-full bg-dark text-white hover:bg-brand"
                        >
                          <Plus size={12} />
                        </button>
                      </span>
                    )}
                    {c.key === 'seasonal' && (
                      <span className="text-[12px] text-muted-2">Driven by Marketing → Campaigns</span>
                    )}
                  </div>
                </div>
              </Card>
            ))
          : Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[150px]" />)}
      </div>

      {/* Add / Edit modal */}
      <Modal open={adding || !!editing} onClose={closeForm} title={editing ? `Edit — ${editing.title}` : 'Add category'}>
        <div className="grid gap-4">
          <Field label="Title" error={fieldErr.title}>
            <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Gaming Gear" />
          </Field>
          <Field label="Short name (nav & breadcrumbs)" error={fieldErr.crumb}>
            <input className={inputCls} value={form.crumb} onChange={(e) => setForm({ ...form, crumb: e.target.value })} placeholder="e.g. Gaming" />
          </Field>
          <Field label="Blurb (shown on the category page)" error={fieldErr.blurb}>
            <textarea className={inputCls} rows={2} value={form.blurb} onChange={(e) => setForm({ ...form, blurb: e.target.value })} />
          </Field>
          <Field label="Category image" error={fieldErr.img}>
            <ImagePicker value={form.img} onChange={(img) => setForm({ ...form, img })} />
          </Field>
        </div>
        {err && <p className="mt-4 text-[13px] font-semibold text-sale">{err}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={closeForm} className="rounded-full border border-line px-5 py-2.5 text-sm font-bold text-ink-2 hover:border-ink">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={busy}
            className="rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-dark disabled:cursor-wait disabled:opacity-70"
          >
            {busy ? 'Saving…' : editing ? 'Save changes' : 'Create category'}
          </button>
        </div>
      </Modal>

      {/* Delete modal */}
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete category?">
        {deleting && (
          <>
            <p className="text-sm leading-relaxed text-ink-2">
              <strong>{deleting.title}</strong> will be removed from the storefront nav.
              {deleting.count ? ` It still has ${deleting.count} product(s) — the API will refuse until they are moved.` : ' It has no products.'}
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
